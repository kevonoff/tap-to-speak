import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { BaseSettings } from '../types';

let currentPlayer: AudioPlayer | null = null;

function stopCurrent() {
  if (currentPlayer) {
    try {
      currentPlayer.pause();
      currentPlayer.remove();
    } catch {
      // Ignore if already released
    }
    currentPlayer = null;
  }
  Speech.stop();
}

export function speakAACCard(
  spokenText: string,
  audioUri: string | null | undefined,
  settings?: BaseSettings,
  onStart?: () => void,
  onEnd?: () => void
) {
  stopCurrent();

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
    // Ignore if not supported
  });

  // Priority 1: If user recorded custom voice for this card, play recorded voice!
  if (audioUri) {
    try {
      const player = createAudioPlayer(audioUri);
      currentPlayer = player;
      onStart?.();

      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          subscription.remove();
          player.remove();
          if (currentPlayer === player) currentPlayer = null;
          onEnd?.();
        }
      });

      player.play();
      return;
    } catch (e) {
      console.warn('Playback error for custom audio, using TTS:', e);
      currentPlayer = null;
    }
  }

  // Priority 2: Use Speech Synthesis (TTS)
  speakTextTTS(spokenText, settings, onStart, onEnd);
}

export function speakTextTTS(
  text: string,
  settings?: BaseSettings,
  onStart?: () => void,
  onEnd?: () => void
) {
  Speech.stop();

  Speech.speak(text, {
    rate: settings?.rate ?? 0.85,
    pitch: settings?.pitch ?? 1.0,
    volume: settings?.volume ?? 1.0,
    voice: settings?.selectedVoiceURI,
    onStart: () => onStart?.(),
    onDone: () => onEnd?.(),
    onStopped: () => onEnd?.(),
    onError: () => onEnd?.(),
  });
}

export async function getAvailableVoices(): Promise<Speech.Voice[]> {
  try {
    return await Speech.getAvailableVoicesAsync();
  } catch {
    return [];
  }
}
