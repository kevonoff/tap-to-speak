import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { BaseSettings } from '../types';
import type { EventSubscription } from 'expo-modules-core'; 

let currentPlayer: AudioPlayer | null = null;

export function playAudio(
  spokenText: string | null | undefined,
  audioUri: string | null | undefined,
  settings?: BaseSettings,
  onStart?: () => void,
  onEnd?: () => void
) {

  if (audioUri) {
    playRecordedAudio(audioUri, onStart, onEnd, () => saySpokenText(spokenText, settings, onStart, onEnd));
  } else {
    saySpokenText(spokenText, settings, onStart, onEnd);
  }
}

export function playRecordedAudio(
  audioUri: string | null | undefined,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
) {

  let subscription: EventSubscription | null = null;

  try {
    currentPlayer?.pause();
    currentPlayer?.remove();
    currentPlayer = null;
    Speech.stop();
    
    const player = createAudioPlayer(audioUri);
    currentPlayer = player;
    onStart?.();

    const sub = player.addListener('playbackStatusUpdate', (status) => {
      
      if (status.didJustFinish) {
        subscription?.remove();
        player?.pause();
        player?.remove();
        if (currentPlayer === player) currentPlayer = null;
        onEnd?.();
      }
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
      // Ignore if not supported (e.g., in iOS/Android simulators or unsupported hardware)
    });
    
    subscription = sub;

    player.play();
    return;
  } catch (e) {
    console.error('Playback error for custom audio', e);
    currentPlayer?.pause();
    currentPlayer?.remove();
    subscription?.remove();
    currentPlayer = null;
    onError?.();
  }
}

export function saySpokenText(
  text: string | null | undefined,
  settings?: BaseSettings,
  onStart?: () => void,
  onEnd?: () => void
) {

  currentPlayer?.pause();
  currentPlayer?.remove();
  currentPlayer = null;
  Speech.stop()
  Speech.speak(text ? text : "Please record your voice, or use the T.T.S feature.", {
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
