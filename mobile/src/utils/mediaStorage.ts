import { File, Paths } from 'expo-file-system';

// Persists a picker/recording result into a stable per-card filename in the
// app's permanent document directory, so it survives cache clears and
// naturally overwrites any previous file for that card + kind.
function persistFile(sourceUri: string, filenamePrefix: string): string {
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

export function persistCardImage(sourceUri: string, position: number): string {
  return persistFile(sourceUri, `card-${position}-image`);
}

export function persistCardAudio(sourceUri: string, position: number): string {
  return persistFile(sourceUri, `card-${position}-audio`);
}

export function deleteCardAudio(position: number, extHint?: string): void {
  const ext = extHint || 'm4a';
  const file = new File(Paths.document, `card-${position}-audio.${ext}`);
  if (file.exists) {
    file.delete();
  }
}
