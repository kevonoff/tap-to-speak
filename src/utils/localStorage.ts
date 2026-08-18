import { File, Paths } from 'expo-file-system';

// Persists a freshly picked/recorded file into a stable per-card filename in
// the app's permanent document directory, so it survives cache clears and
// naturally overwrites any previous file for that card + kind. Callers only
// ever pass a genuinely fresh local file here (see persistCardImage /
// persistCardAudio below) — there's no other kind of source to handle.
function persistFileToLocalFilesystem(sourceUri: string, filenamePrefix: string): string {
  const src = new File(sourceUri);
  const dest = new File(Paths.document, `${filenamePrefix}${src.extension}`);

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
