import { VoiceSettings } from '../types';

let currentAudio: HTMLAudioElement | null = null;

export function speakAACCard(
  spokenText: string,
  audioDataUrl?: string | null,
  settings?: VoiceSettings,
  onStart?: () => void,
  onEnd?: () => void
) {
  // Stop any currently playing audio or speech
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  // Trigger haptic vibration feedback by default
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(40);
    } catch (e) {
      // Ignore if not supported
    }
  }

  // Priority 1: If user recorded custom voice for this card, play recorded voice!
  if (audioDataUrl) {
    try {
      onStart?.();
      const audio = new Audio(audioDataUrl);
      currentAudio = audio;
      audio.onended = () => {
        currentAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        currentAudio = null;
        // Fallback to TTS if custom audio fails
        speakTextTTS(spokenText, settings, onStart, onEnd);
      };
      audio.play().catch(() => {
        speakTextTTS(spokenText, settings, onStart, onEnd);
      });
      return;
    } catch (e) {
      console.warn('Playback error for custom audio, using TTS:', e);
    }
  }

  // Priority 2: Use Speech Synthesis (TTS)
  speakTextTTS(spokenText, settings, onStart, onEnd);
}

export function speakTextTTS(
  text: string,
  settings?: VoiceSettings,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const rate = settings?.rate ?? 0.85;
  const pitch = settings?.pitch ?? 1.0;
  const volume = settings?.volume ?? 1.0;

  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  // Try to find selected voice or clear English voice suitable for child AAC
  const voices = window.speechSynthesis.getVoices();
  if (settings?.selectedVoiceURI) {
    const matchedVoice = voices.find((v) => v.voiceURI === settings.selectedVoiceURI);
    if (matchedVoice) utterance.voice = matchedVoice;
  } else if (voices.length > 0) {
    // Prefer friendly English voice
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen'))
    ) || voices.find((v) => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
  }

  utterance.onstart = () => {
    onStart?.();
  };
  utterance.onend = () => {
    onEnd?.();
  };
  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.getVoices();
  }
  return [];
}
