export interface AACCard {
  id: string;
  position: number; // 1 to 18
  label: string; // Display label under image (e.g. "Water")
  showLabel?: boolean; // Whether to display the label text on the card on the main display (default: true)
  imageUrl: string; // Data URL, SVG, or image URL
  spokenText: string; // Text to say via TTS if no recorded audio
  audioDataUrl?: string | null; // Base64 voice recording if user recorded voice
  category?: 'need' | 'feeling' | 'action' | 'person' | 'social';
  bgColor?: string; // High contrast background color code for card
}

export interface VoiceSettings {
  rate: number; // 0.5 (slow) to 1.5 (fast), default 0.85
  pitch: number; // 0.5 to 1.5, default 1.0
  volume: number; // 0 to 1, default 1.0
  selectedVoiceURI?: string;
  autoClearSentence: boolean;
  hapticFeedback: boolean;
  highContrastMode: boolean;
  showCardLabels: boolean;
}

export type ActiveScreen = 'workspace' | 'settings';

export interface PresetAACSymbol {
  id: string;
  title: string;
  spokenText: string;
  category: 'need' | 'feeling' | 'action' | 'person' | 'social';
  bgColor: string;
  svgIcon: string;
}
