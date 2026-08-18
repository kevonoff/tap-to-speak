import { File } from 'expo-file-system';
import { supabase } from '../../lib/supabase';
import { CardMedia, TileCard } from '../models/TileCard';
import { saveStoredCards } from './storage';
import { uploadCardImageIfDevice, uploadCardAudioIfDevice } from './cardStorage';

const TILES_TABLE = 'tiles';
const TILES_CONFLICT_KEY = 'user_id,position';
const TILE_ROW_COLUMNS = 'position, image_url, audio_url, tts_text, label, bg_color, updated_at';

interface TileRow {
  position: number;
  image_url: string | null;
  audio_url: string | null;
  tts_text: string | null;
  label: string | null;
  bg_color: string | null;
  updated_at: string;
}

function cardToTileRow(card: TileCard, userId: string) {
  return {
    user_id: userId,
    position: card.position,
    image_url: card.imageUri || null,
    audio_url: card.audioUri,
    tts_text: card.spokenText || null,
    label: card.label || null,
    bg_color: card.bgColor,
  };
}

function localFileStillExists(media: CardMedia | null): boolean {
  if (!media || media.kind !== 'device') return false;
  try {
    return new File(media.uri).exists;
  } catch {
    return false;
  }
}

/**
 * Picks which media to use for an image/audio field when merging a remote
 * tile down onto this device. When trustLocal is true (nothing has changed
 * on this tile since this device last synced it) and this device still has
 * the file, keep using that — it's instant and needs no network. Otherwise
 * (a genuine remote change, a different device, a fresh install, or a
 * cleared cache) fall back to the remote value.
 */
function pickMedia(remote: CardMedia | null, local: CardMedia | null, trustLocal: boolean): CardMedia | null {
  if (trustLocal && localFileStillExists(local)) {
    return local;
  }
  return remote ?? local;
}

function tileRowToCard(row: TileRow, fallback: TileCard): TileCard {
  // If this row hasn't changed since the last time this device synced it,
  // its local files (if any) are still known-current and worth keeping for
  // speed. If updated_at has moved on, something changed elsewhere (or this
  // device has never seen this row before) — don't trust stale local files.
  const trustLocal = fallback.lastSyncedUpdatedAt === row.updated_at;

  // Anything read back from the tiles table is by definition already
  // portable — this app never pushes a device-only URI up, only signed
  // Storage URLs or built-in data: URIs — so it's always 'hosted' media.
  const remoteImage = row.image_url ? TileCard.hosted(row.image_url) : null;
  const remoteAudio = row.audio_url ? TileCard.hosted(row.audio_url) : null;

  return fallback.with({
    position: row.position,
    label: row.label ?? fallback.label,
    spokenText: row.tts_text ?? fallback.spokenText,
    image: pickMedia(remoteImage, fallback.image, trustLocal) ?? fallback.image,
    audio: pickMedia(remoteAudio, fallback.audio, trustLocal),
    bgColor: row.bg_color ?? fallback.bgColor,
    lastSyncedUpdatedAt: row.updated_at,
  });
}

/**
 * Uploads a card's image/audio to Supabase Storage first if they're still on
 * this device, swapping in the resulting hosted media. Built-in symbols and
 * anything already uploaded pass through untouched. Only the object returned
 * here — not the caller's original card — should be pushed remotely; local
 * state keeps the original device media, since it's still the fastest option
 * on this device.
 */
async function prepareCardForRemote(userId: string, card: TileCard): Promise<TileCard> {
  const [image, audio] = await Promise.all([
    uploadCardImageIfDevice(userId, card.position, card.image).catch((err) => {
      console.warn('Failed to upload card image, keeping local media:', err);
      return card.image;
    }),
    uploadCardAudioIfDevice(userId, card.position, card.audio).catch((err) => {
      console.warn('Failed to upload card audio, keeping local media:', err);
      return card.audio;
    }),
  ]);
  return card.with({ image, audio });
}

/**
 * One-time sync run right after sign-in:
 * - If the signed-in user has no tiles in Supabase yet, this is effectively
 *   their first login anywhere — push this device's local cards up as the
 *   initial seed (uploading any local photos/recordings first).
 * - If they already have tiles remotely (from this device or another one),
 *   pull those down for the label/message/color fields (cheap, always
 *   fresh), but keep this device's local image/audio files wherever they
 *   still exist instead of switching to the remote URL — see pickMedia.
 *
 * Ongoing edits after login are pushed individually via pushCardToSupabase /
 * pushCardsToSupabase (see App.tsx), which upload local media the same way.
 */
export async function syncTilesOnLogin(userId: string, localCards: TileCard[]): Promise<TileCard[]> {
  const { data: existingTiles, error: fetchError } = await supabase
    .from(TILES_TABLE)
    .select(TILE_ROW_COLUMNS)
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (fetchError) {
    console.warn('Failed to fetch tiles for sync, keeping local cards:', fetchError);
    return localCards;
  }

  if (!existingTiles || existingTiles.length === 0) {
    const remoteReadyCards = await Promise.all(
      localCards.map((card) => prepareCardForRemote(userId, card))
    );
    const rows = remoteReadyCards.map((card) => cardToTileRow(card, userId));
    const { data: insertedRows, error: insertError } = await supabase
      .from(TILES_TABLE)
      .insert(rows)
      .select('position, updated_at');

    if (insertError) {
      console.warn('Failed to seed tiles from local cards:', insertError);
      return localCards;
    }

    // Stamp each card with the row's actual updated_at so this device's next
    // login recognizes its own local files as still current.
    const updatedAtByPosition = new Map((insertedRows ?? []).map((r) => [r.position, r.updated_at]));
    const stampedCards = localCards.map((card) =>
      card.with({ lastSyncedUpdatedAt: updatedAtByPosition.get(card.position) ?? null })
    );
    await saveStoredCards(stampedCards);
    return stampedCards;
  }

  const byPosition = new Map(existingTiles.map((row) => [row.position, row as TileRow]));
  const mergedCards = localCards.map((fallback) => {
    const row = byPosition.get(fallback.position);
    return row ? tileRowToCard(row, fallback) : fallback;
  });

  await saveStoredCards(mergedCards);
  return mergedCards;
}

/**
 * Pushes one edited card up to Supabase, upserting on (user_id, position) so
 * it overwrites whatever was previously stored in that slot. Returns the
 * row's new updated_at so the caller can stamp it onto local state — without
 * that, this same device's next login would mistake its own edit for a
 * remote change and needlessly re-fetch the asset it just uploaded.
 */
export async function pushCardToSupabase(userId: string, card: TileCard): Promise<string | null> {
  const remoteCard = await prepareCardForRemote(userId, card);
  const { data, error } = await supabase
    .from(TILES_TABLE)
    .upsert(cardToTileRow(remoteCard, userId), { onConflict: TILES_CONFLICT_KEY })
    .select('updated_at')
    .single();

  if (error) {
    console.warn('Failed to push tile update to Supabase:', error);
    throw error;
  }

  return data?.updated_at ?? null;
}

/**
 * Same as pushCardToSupabase, but for a full set of cards (e.g. after a
 * reset-to-default). Returns each row's new updated_at keyed by position,
 * for the same local-stamping reason.
 */
export async function pushCardsToSupabase(userId: string, cards: TileCard[]): Promise<Map<number, string>> {
  const remoteCards = await Promise.all(cards.map((card) => prepareCardForRemote(userId, card)));
  const rows = remoteCards.map((card) => cardToTileRow(card, userId));
  const { data, error } = await supabase
    .from(TILES_TABLE)
    .upsert(rows, { onConflict: TILES_CONFLICT_KEY })
    .select('position, updated_at');

  if (error) {
    console.warn('Failed to push tiles update to Supabase:', error);
    throw error;
  }

  return new Map((data ?? []).map((row) => [row.position, row.updated_at]));
}
