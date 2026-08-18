import { File } from 'expo-file-system';
import { supabase } from '../../lib/supabase';
import { CardMedia, TileCard } from '../models/TileCard';

const IMAGE_BUCKET = 'card-images';
const AUDIO_BUCKET = 'card-audio';

// Buckets are private; a signed URL is what actually grants access. This app
// has no periodic re-signing step, so the expiry is set effectively
// permanent (~10 years) rather than something that needs refreshing later.
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 365 * 10;

async function uploadDeviceMedia(
  bucket: typeof IMAGE_BUCKET | typeof AUDIO_BUCKET,
  userId: string,
  position: number,
  media: CardMedia,
  contentType: string
): Promise<CardMedia> {
  const file = new File(media.uri);
  const path = `${userId}/${position}${file.extension}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { data, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);
  if (signError) throw signError;

  return TileCard.hosted(data.signedUrl);
}

/**
 * Uploads a card's image to Supabase Storage if it's still on this device,
 * returning a long-lived signed URL in its place. Already-hosted media (a
 * built-in symbol, or a prior upload) passes through unchanged.
 */
export function uploadCardImageIfDevice(userId: string, position: number, image: CardMedia): Promise<CardMedia> {
  if (image.kind !== 'device') return Promise.resolve(image);
  return uploadDeviceMedia(IMAGE_BUCKET, userId, position, image, 'image/jpeg');
}

/** Same idea as uploadCardImageIfDevice, but for a recorded voice clip. */
export function uploadCardAudioIfDevice(
  userId: string,
  position: number,
  audio: CardMedia | null
): Promise<CardMedia | null> {
  if (!audio || audio.kind !== 'device') return Promise.resolve(audio);
  return uploadDeviceMedia(AUDIO_BUCKET, userId, position, audio, 'audio/m4a');
}
