import { File } from 'expo-file-system';
import { supabase } from '../../lib/supabase';

// Buckets are private; a signed URL is what actually grants access. This app
// has no periodic re-signing step, so the expiry is set effectively
// permanent (~10 years) rather than something that needs refreshing later.
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 365 * 10;

function extensionFromUri(uri: string, fallback: string): string {
  const ext = uri.split('?')[0].split('.').pop();
  return ext && ext.length <= 5 ? ext.toLowerCase() : fallback;
}

async function uploadLocalFile(
  bucket: 'card-images' | 'card-audio',
  userId: string,
  position: number,
  localUri: string,
  fallbackExt: string,
  contentType: string
): Promise<string> {
  const ext = extensionFromUri(localUri, fallbackExt);
  const path = `${userId}/${position}.${ext}`;
  const bytes = await new File(localUri).arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType, upsert: true });
  if (uploadError) throw uploadError;

  const { data, error: signError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);
  if (signError) throw signError;

  return data.signedUrl;
}

/**
 * Built-in symbol cards use portable data: URIs and are returned unchanged —
 * no upload needed. A user-picked device photo is a local file:// URI; those
 * get uploaded to the private card-images bucket, returning a long-lived
 * signed URL so the image resolves on any device, not just the one it was
 * picked on. An already-remote (https://) URI is also passed through as-is.
 */
export function uploadCardImageIfLocal(userId: string, position: number, uri: string): Promise<string> {
  if (!uri.startsWith('file://')) return Promise.resolve(uri);
  return uploadLocalFile('card-images', userId, position, uri, 'jpg', 'image/jpeg');
}

/** Same idea as uploadCardImageIfLocal, but for a recorded voice clip. */
export function uploadCardAudioIfLocal(
  userId: string,
  position: number,
  uri: string | null
): Promise<string | null> {
  if (!uri) return Promise.resolve(null);
  if (!uri.startsWith('file://')) return Promise.resolve(uri);
  return uploadLocalFile('card-audio', userId, position, uri, 'm4a', 'audio/m4a');
}
