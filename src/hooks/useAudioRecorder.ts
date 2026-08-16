import { useState, useCallback } from 'react';
import {
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioModule,
  setAudioModeAsync,
  createAudioPlayer,
} from 'expo-audio';

export function useAudioRecorder(initialUri: string | null = null) {
  const recorder = useExpoAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);

  const [audioUri, setAudioUri] = useState<string | null>(initialUri);
  const [error, setError] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission denied');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err: any) {
      console.error('Microphone recording error:', err);
      setError(err?.message || 'Could not access microphone');
    }
  }, [recorder]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      await recorder.stop();
      if (recorder.uri) {
        setAudioUri(recorder.uri);
        return recorder.uri;
      }
      return null;
    } catch (err: any) {
      console.error('Error stopping recording:', err);
      setError(err?.message || 'Could not stop recording');
      return null;
    }
  }, [recorder]);

  const clearRecording = useCallback(() => {
    setAudioUri(null);
    setError(null);
  }, []);

  const playPreview = useCallback(() => {
    if (!audioUri) return;
    try {
      const player = createAudioPlayer(audioUri);
      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          subscription.remove();
          player.remove();
        }
      });
      player.play();
    } catch (e) {
      console.error('Audio preview play error:', e);
    }
  }, [audioUri]);

  return {
    isRecording: recorderState.isRecording,
    recordingTime: Math.floor((recorderState.durationMillis ?? 0) / 1000),
    audioUri,
    setAudioUri,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    playPreview,
  };
}
