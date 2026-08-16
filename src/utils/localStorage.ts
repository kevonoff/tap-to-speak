import { File, Paths } from 'expo-file-system';

// Persists a picker/recording result into a stable per-card filename in the
// app's permanent document directory, so it survives cache clears and
// naturally overwrites any previous file for that card + kind.
function persistFileToLocalFilesystem(sourceUri: string, filenamePrefix: string): string {
  if (!sourceUri.startsWith('file://')) {
    // Not a local file to copy — e.g. a value carried over unchanged from a
    // previous save, or synced down from Supabase Storage on another login.
    // There's nothing to persist locally; use it as-is.
    return sourceUri;
  }

  const ext = sourceUri.split('.').pop()?.split('?')[0] || 'dat';
  const dest = new File(Paths.document, `${filenamePrefix}.${ext}`);

  const src = new File(sourceUri);
  if (src.uri === dest.uri) {
    return dest.uri;
  }
  if (dest.exists) {
    dest.delete();
  }
  src.copy(dest);
  return dest.uri;
}

export function persistCardImageToLocalFilesystem(sourceUri: string, position: number): string {
  return persistFileToLocalFilesystem(sourceUri, `card-${position}-image`);
}

export function persistCardAudioToLocalFilesystem(sourceUri: string, position: number): string {
  return persistFileToLocalFilesystem(sourceUri, `card-${position}-audio`);
}

export function deleteCardAudioFromLocalFilesystem(position: number, extHint?: string): void {
  const ext = extHint || 'm4a';
  const file = new File(Paths.document, `card-${position}-audio.${ext}`);
  if (file.exists) {
    file.delete();
  }
}
