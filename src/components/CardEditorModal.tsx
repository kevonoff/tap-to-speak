import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AACCard } from '../types';
import { INITIAL_18_CARDS } from '../data/defaultCards';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { speakTextTTS } from '../utils/audio';
import { persistCardImageToLocalFilesystem, persistCardAudioToLocalFilesystem as persistCardAudioToLocalFilesystem } from '../utils/localStorage';
import { CardImage } from './CardImage';
import { ImagePickerMenu } from './ImagePickerMenu'

interface CardEditorModalProps {
  card: AACCard;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: AACCard) => void;
}

const COLOR_OPTIONS = [
  { name: 'Red (Needs/Food)', color: '#EF4444' },
  { name: 'Blue (Drinks/Water)', color: '#3B82F6' },
  { name: 'Yellow (Toilet/Urgent)', color: '#F59E0B' },
  { name: 'Green (Social/Yes)', color: '#10B981' },
  { name: 'Purple (Actions/Help)', color: '#8B5CF6' },
  { name: 'Pink (Love/Sleep)', color: '#EC4899' },
];

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
}) => {
  const [label, setLabel] = useState(card.label);
  const [spokenText, setSpokenText] = useState(card.spokenText || card.label);
  const [imageUri, setImageUri] = useState(card.imageUri);
  const [bgColor, setBgColor] = useState(card.bgColor || '#3B82F6');
  const [audioMode, setAudioMode] = useState<'tts' | 'recorded'>(card.audioUri ? 'recorded' : 'tts');
  const insets = useSafeAreaInsets();

  const {
    isRecording,
    recordingTime,
    audioUri,
    error: recorderError,
    startRecording,
    stopRecording,
    clearRecording,
    playPreview,
  } = useAudioRecorder(card.audioUri || null);

  // Every edit auto-saves as it happens — there's no separate Save button.
  // Callers pass only the field(s) that just changed; everything else falls
  // back to current state. Text fields pass an override synchronously from
  // the event itself (not from state) to avoid acting on a stale value from
  // before this render's setState took effect.
  const commitCard = (
    overrides: Partial<Pick<AACCard, 'label' | 'spokenText' | 'imageUri' | 'audioUri' | 'bgColor'>> = {}
  ) => {
    const finalLabel = overrides.label ?? label;
    const finalSpokenText = overrides.spokenText ?? spokenText;
    const updatedCard: AACCard = {
      ...card,
      label: finalLabel.trim() || 'Custom Card',
      spokenText: finalSpokenText.trim() || finalLabel.trim() || 'Custom Card',
      imageUri: overrides.imageUri ?? imageUri,
      audioUri: 'audioUri' in overrides ? overrides.audioUri ?? null : audioMode === 'recorded' ? audioUri : null,
      bgColor: overrides.bgColor ?? bgColor,
    };
    onSave(updatedCard);
  };

  // Safety net for the two text fields: onBlur covers the normal case, but
  // this catches an edit that never blurred (e.g. closing mid-edit). Skipped
  // when neither text field actually changed, so just opening and closing a
  // card without editing anything doesn't trigger a save.
  const handleClose = () => {
    if (label !== card.label || spokenText !== (card.spokenText || card.label)) {
      commitCard();
    }
    onClose();
  };

  const handlePickPhoto = async (uri: string) => {
    if (uri) {
      try {
        const persisted = persistCardImageToLocalFilesystem(uri, card.position);
        setImageUri(persisted);
        commitCard({ imageUri: persisted });
      } catch (err) {
        console.warn('Failed to save picked photo:', err);
        Alert.alert('Could not use that photo', 'Please try picking the photo again.');
      }
    }
  };

  const handleTestTTS = () => {
    speakTextTTS(spokenText || label);
  };

  const handleStopRecording = async () => {
    const uri = await stopRecording();
    if (uri) {
      const persisted = persistCardAudioToLocalFilesystem(uri, card.position);
      commitCard({ audioUri: persisted });
    }
  };

  const handleClearRecording = () => {
    clearRecording();
    commitCard({ audioUri: null });
  };

  return (
    <Modal visible={isOpen} animationType="slide" onRequestClose={handleClose} presentationStyle="pageSheet">
      <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
        <View style={styles.modalHeaderLeft}>
          <View style={styles.posBadge}>
            <Text style={styles.posBadgeText}>#{card.position}</Text>
          </View>
          <View>
            <Text style={styles.modalTitle}>Edit Card #{card.position}</Text>
            <Text style={styles.modalSubtitle}>Customize image and speech output</Text>
          </View>
        </View>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Ionicons name="close" size={24} color="#9CA3AF" />
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: 40 }}>
        <View>
          <Text style={styles.fieldLabel}>Card Display Title / Label</Text>
          <TextInput
            value={label}
            onChangeText={(text) => {
              setLabel(text);
              if (!spokenText || spokenText === label) setSpokenText(text);
            }}
            onBlur={() => commitCard()}
            placeholder="e.g. Water, Apple, Hug, Toilet"
            style={styles.input}
          />
        </View>

        {/* IMAGE SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="image-outline" size={16} color="#4F46E5" />
            <Text style={styles.cardHeaderText}>Select Image</Text>
          </View>

          <View style={styles.imagePreviewRow}>
            <View style={[styles.imagePreviewBox, { borderColor: bgColor }]}>
              <CardImage uri={imageUri} />
            </View>
            <Text style={styles.imagePreviewHint}>
              Pick a photo from your device, or choose one of the built-in symbols below.
            </Text>
          </View>

          <ImagePickerMenu onSelectPicture={(uri: string) => { handlePickPhoto(uri)}}></ImagePickerMenu>

          <Text style={styles.fieldLabel}>Or Choose a Built-in Symbol</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {INITIAL_18_CARDS.map((preset) => (
              <Pressable
                key={preset.id}
                onPress={() => {
                  setImageUri(preset.imageUri);
                  commitCard({ imageUri: preset.imageUri });
                }}
                style={[
                  styles.presetThumb,
                  imageUri === preset.imageUri && styles.presetThumbActive,
                ]}
              >
                <CardImage uri={preset.imageUri} />
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* VOICE SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="volume-high-outline" size={16} color="#059669" />
            <Text style={[styles.cardHeaderText, { color: '#059669' }]}>Speech & Sound Response</Text>
          </View>

          <View style={styles.modeSwitchRow}>
            <Pressable
              onPress={() => setAudioMode('tts')}
              style={[styles.modeBtn, audioMode === 'tts' && styles.modeBtnActiveIndigo]}
            >
              <Ionicons name="volume-high" size={14} color={audioMode === 'tts' ? '#fff' : '#6B7280'} />
              <Text style={[styles.modeBtnText, audioMode === 'tts' && styles.modeBtnTextActive]}>
                Auto Voice (TTS)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setAudioMode('recorded')}
              style={[styles.modeBtn, audioMode === 'recorded' && styles.modeBtnActiveAmber]}
            >
              <Ionicons name="mic" size={14} color={audioMode === 'recorded' ? '#fff' : '#6B7280'} />
              <Text style={[styles.modeBtnText, audioMode === 'recorded' && styles.modeBtnTextActive]}>
                Record Voice
              </Text>
            </Pressable>
          </View>

          {audioMode === 'tts' && (
            <View style={styles.ttsBox}>
              <Text style={styles.fieldLabelSmall}>
                Type what the auto-generated voice should say when tapped:
              </Text>
              <View style={styles.ttsInputRow}>
                <TextInput
                  value={spokenText}
                  onChangeText={setSpokenText}
                  onBlur={() => commitCard()}
                  placeholder="e.g. I want to drink a cup of water please"
                  style={[styles.input, { flex: 1 }]}
                />
                <Pressable onPress={handleTestTTS} style={styles.testBtn}>
                  <Ionicons name="play" size={13} color="#4338CA" />
                  <Text style={styles.testBtnText}>Test</Text>
                </Pressable>
              </View>
            </View>
          )}

          {audioMode === 'recorded' && (
            <View style={styles.ttsBox}>
              <Text style={styles.fieldLabelSmall}>
                Record a parent, teacher, or child&apos;s voice for familiar speech playback.
              </Text>

              {recorderError && <Text style={styles.errorText}>{recorderError}</Text>}

              <View style={styles.recordRow}>
                <View style={styles.recordStatusRow}>
                  <View
                    style={[
                      styles.micCircle,
                      isRecording
                        ? { backgroundColor: '#DC2626' }
                        : audioUri
                        ? { backgroundColor: '#059669' }
                        : { backgroundColor: '#E5E7EB' },
                    ]}
                  >
                    <Ionicons name="mic" size={18} color={isRecording || audioUri ? '#fff' : '#9CA3AF'} />
                  </View>
                  <View>
                    <Text style={styles.recordStatusTitle}>
                      {isRecording
                        ? `Recording... (${recordingTime}s)`
                        : audioUri
                        ? 'Recorded'
                        : 'No Voice Recorded Yet'}
                    </Text>
                    {!(audioUri && !isRecording) && (
                      <Text style={styles.recordStatusSubtitle}>
                        {isRecording ? 'Speak clearly into your microphone' : 'Press record to capture voice'}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.recordActions}>
                  {isRecording ? (
                    <Pressable onPress={handleStopRecording} style={styles.stopBtn}>
                      <Ionicons name="square" size={14} color="#fff" />
                      <Text style={styles.stopBtnText}>Stop</Text>
                    </Pressable>
                  ) : (
                    <Pressable onPress={startRecording} style={styles.recordBtn}>
                      <Ionicons name="mic" size={14} color="#fff" />
                      <Text style={styles.recordBtnText}>{audioUri ? 'Re-record' : 'Record Voice'}</Text>
                    </Pressable>
                  )}
                  {audioUri && !isRecording && (
                    <>
                      <Pressable onPress={playPreview} style={styles.iconBtn}>
                        <Ionicons name="play" size={16} color="#059669" />
                      </Pressable>
                      <Pressable onPress={handleClearRecording} style={styles.iconBtn}>
                        <Ionicons name="trash-outline" size={16} color="#6B7280" />
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* CATEGORY COLOR */}
        <View>
          <Text style={styles.fieldLabel}>Card Category Color Theme</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map((item) => (
              <Pressable
                key={item.color}
                onPress={() => {
                  setBgColor(item.color);
                  commitCard({ bgColor: item.color });
                }}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: item.color },
                  bgColor === item.color && styles.colorSwatchActive,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  posBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posBadgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: '#111827' },
  modalSubtitle: { fontSize: 11, color: '#6B7280' },
  body: { flex: 1, backgroundColor: '#FDFCFB' },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  fieldLabelSmall: { fontSize: 12, fontWeight: '600', color: '#374151' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 14,
    gap: 12,
  },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardHeaderText: { fontSize: 12, fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase' },
  imagePreviewRow: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: '#F9FAFB', padding: 10, borderRadius: 14 },
  imagePreviewBox: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    padding: 4,
  },
  imagePreviewHint: { flex: 1, fontSize: 11, color: '#6B7280' },
  presetThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 8,
    padding: 4,
  },
  presetThumbActive: { borderColor: '#4F46E5' },
  modeSwitchRow: { flexDirection: 'row', gap: 8, backgroundColor: '#F3F4F6', borderRadius: 14, padding: 4 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10 },
  modeBtnActiveIndigo: { backgroundColor: '#4F46E5' },
  modeBtnActiveAmber: { backgroundColor: '#D97706' },
  modeBtnText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  modeBtnTextActive: { color: '#fff' },
  ttsBox: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 12, gap: 8 },
  ttsInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  testBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EEF2FF', borderWidth: 1, borderColor: '#C7D2FE', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  testBtnText: { fontSize: 11, fontWeight: '700', color: '#4338CA' },
  errorText: { fontSize: 11, color: '#DC2626', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', padding: 8, borderRadius: 10 },
  recordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 12, gap: 8 },
  recordStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  micCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  recordStatusTitle: { fontSize: 11, fontWeight: '800', color: '#1F2937' },
  recordStatusSubtitle: { fontSize: 10, color: '#6B7280' },
  recordActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stopBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#DC2626', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  stopBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  recordBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#D97706', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  recordBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  iconBtn: { padding: 9, backgroundColor: '#F3F4F6', borderRadius: 12 },
  colorRow: { flexDirection: 'row', gap: 10 },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'transparent' },
  colorSwatchActive: { borderColor: '#111827', transform: [{ scale: 1.15 }] },
});
