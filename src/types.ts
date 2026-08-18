export interface BaseSettings {
  rate: number; // 0.5 (slow) to 1.5 (fast), default 0.85
  pitch: number; // 0.5 to 1.5, default 1.0
  volume: number; // 0 to 1, default 1.0
  selectedVoiceURI?: string;
  showCardLabels: boolean;
  highContrastMode: boolean;
}

export type ActiveScreen = 'workspace' | 'settings';
