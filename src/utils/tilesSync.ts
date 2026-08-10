import { File } from 'expo-file-system';
import { supabase } from '../../lib/supabase';
import { AACCard } from '../types';
import { saveStoredCards } from './storage';
import { uploadCardImageIfLocal, uploadCardAudioIfLocal } from './cardStorage';

interface TileRow {
  position: number;
  image_url: string | null;
  audio_url: string | null;
  tts_text: string | null;
  label: string | null;
  bg_color: string | null;
  updated_at: string;
}

function cardToTileRow(card: AACCard, userId: string) {
  return {
    user_id: userId,
    position: card.position,
    image_url: card.imageUri ?? null,
    audio_url: card.audioUri ?? null,
    tts_text: card.spokenText ?? null,
    label: card.label ?? null,
    bg_color: card.bgColor ?? null,
  };
}

function localFileStillExists(uri: string | null | undefined): boolean {
  if (!uri || !uri.startsWith('file://')) return false;
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}

/**
 * Picks which URI to use for an image/audio field when merging a remote
 * tile down onto this device. When trustLocal is true (nothing has changed
 * on this tile since this device last synced it) and a local file still
 * exists, keep using that — it's instant and needs no network. Otherwise
 * (a genuine remote change, a different device, a fresh install, or a
 * cleared cache) fall back to the remote value.
 */
function pickAssetUri(remoteUri: string | null, localUri: string | null | undefined, trustLocal: boolean): string | null {
  if (trustLocal && localFileStillExists(localUri)) {
    return localUri as string;
  }
  return remoteUri ?? localUri ?? null;
}

function tileRowToCard(row: TileRow, fallback: AACCard): AACCard {
  // If this row hasn't changed since the last time this device synced it,
  // its local files (if any) are still known-current and worth keeping for
  // speed. If updated_at has moved on, something changed elsewhere (or this
  // device has never seen this row before) — don't trust stale local files.
  const trustLocal = fallback.lastSyncedUpdatedAt === row.updated_at;

  return {
    ...fallback,
    position: row.position,
    label: row.label ?? fallback.label,
    spokenText: row.tts_text ?? fallback.spokenText,
    imageUri: pickAssetUri(row.image_url, fallback.imageUri, trustLocal) ?? fallback.imageUri,
    audioUri: pickAssetUri(row.audio_url, fallback.audioUri, trustLocal),
    bgColor: row.bg_color ?? fallback.bgColor,
    lastSyncedUpdatedAt: row.updated_at,
  };
}

/**
 * Uploads a card's image/audio to Supabase Storage first if they're still
 * local file:// URIs (a device photo or a recording), swapping in the
 * resulting signed URLs. Built-in symbol cards (data: URIs) and anything
 * already uploaded (https:// URIs) pass through untouched. Only the object
 * returned here — not the caller's original card — should be pushed remotely;
 * local state keeps the original local URIs, since they're still the fastest
 * option on this device.
 */
async function prepareCardForRemote(userId: string, card: AACCard): Promise<AACCard> {
  const [imageUri, audioUri] = await Promise.all([
    uploadCardImageIfLocal(userId, card.position, card.imageUri).catch((err) => {
      console.warn('Failed to upload card image, keeping local URI:', err);
      return card.imageUri;
    }),
    uploadCardAudioIfLocal(userId, card.position, card.audioUri ?? null).catch((err) => {
      console.warn('Failed to upload card audio, keeping local URI:', err);
      return card.audioUri ?? null;
    }),
  ]);
  return { ...card, imageUri, audioUri };
}

/**
 * One-time sync run right after sign-in:
 * - If the signed-in user has no tiles in Supabase yet, this is effectively
 *   their first login anywhere — push this device's local cards up as the
 *   initial seed (uploading any local photos/recordings first).
 * - If they already have tiles remotely (from this device or another one),
 *   pull those down for the label/message/color fields (cheap, always
 *   fresh), but keep this device's local image/audio files wherever they
 *   still exist instead of switching to the remote URL — see pickAssetUri.
 *
 * Ongoing edits after login are pushed individually via pushCardToSupabase /
 * pushCardsToSupabase (see App.tsx), which upload local media the same way.
 */
export async function syncTilesOnLogin(userId: string, localCards: AACCard[]): Promise<AACCard[]> {
  const { data: existingTiles, error: fetchError } = await supabase
    .from('tiles')
    .select('position, image_url, audio_url, tts_text, label, bg_color, updated_at')
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
      .from('tiles')
      .insert(rows)
      .select('position, updated_at');

    if (insertError) {
      console.warn('Failed to seed tiles from local cards:', insertError);
      return localCards;
    }

    // Stamp each card with the row's actual updated_at so this device's next
    // login recognizes its own local files as still current.
    const updatedAtByPosition = new Map((insertedRows ?? []).map((r) => [r.position, r.updated_at]));
    const stampedCards = localCards.map((card) => ({
      ...card,
      lastSyncedUpdatedAt: updatedAtByPosition.get(card.position) ?? null,
    }));
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
export async function pushCardToSupabase(userId: string, card: AACCard): Promise<string | null> {
  const remoteCard = await prepareCardForRemote(userId, card);
  const { data, error } = await supabase
    .from('tiles')
    .upsert(cardToTileRow(remoteCard, userId), { onConflict: 'user_id,position' })
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
export async function pushCardsToSupabase(userId: string, cards: AACCard[]): Promise<Map<number, string>> {
  const remoteCards = await Promise.all(cards.map((card) => prepareCardForRemote(userId, card)));
  const rows = remoteCards.map((card) => cardToTileRow(card, userId));
  const { data, error } = await supabase
    .from('tiles')
    .upsert(rows, { onConflict: 'user_id,position' })
    .select('position, updated_at');

  if (error) {
    console.warn('Failed to push tiles update to Supabase:', error);
    throw error;
  }

  return new Map((data ?? []).map((row) => [row.position, row.updated_at]));
}
