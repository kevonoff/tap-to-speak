export interface AACCard {
  id: string;
  position: number; // 1 to 18
  label: string; // Display label under image (e.g. "Water")
  imageUri: string; // data:image/svg+xml URI (built-in symbol) or file:// URI (user photo)
  spokenText: string; // Text to say via TTS if no recorded audio
  audioUri?: string | null; // Persisted recording file:// URI if user recorded voice
  category?: 'need' | 'feeling' | 'action' | 'person' | 'social';
  bgColor?: string; // High contrast background color code for card
  // Bookkeeping only, not user-facing: the tiles row's updated_at as of the
  // last successful sync, used to detect whether it changed on another
  // device since. See src/utils/tilesSync.ts.
  lastSyncedUpdatedAt?: string | null;
}

export interface BaseSettings {
  rate: number; // 0.5 (slow) to 1.5 (fast), default 0.85
  pitch: number; // 0.5 to 1.5, default 1.0
  volume: number; // 0 to 1, default 1.0
  selectedVoiceURI?: string;
  showCardLabels: boolean;
  highContrastMode: boolean;
}

export type ActiveScreen = 'workspace' | 'settings';
