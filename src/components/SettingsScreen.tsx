import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Switch, StyleSheet, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { AACCard, VoiceSettings } from '../types';
import { getAvailableVoices, speakTextTTS } from '../utils/audio';
import { CardImage } from './CardImage';
import { CardEditorModal } from './CardEditorModal';
import type { Voice } from 'expo-speech';
import { useAuth } from '../context/AuthContext';

interface SettingsScreenProps {
  cards: AACCard[];
  onUpdateCard: (updatedCard: AACCard) => void;
  voiceSettings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
  onResetCards: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  cards,
  onUpdateCard,
  voiceSettings,
  onUpdateSettings,
  onResetCards,
  onBack,
}) => {
  const [settings, setSettings] = useState<VoiceSettings>(voiceSettings);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<AACCard | null>(null);
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  useEffect(() => {
    getAvailableVoices().then(setVoices);
  }, []);

  const handleChange = <K extends keyof VoiceSettings>(key: K, value: VoiceSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    onUpdateSettings(updated);
  };

  const handleTestVoice = () => {
    speakTextTTS('Hello! This is a test of your AAC voice settings.', settings);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Cards?',
      'Reset all 18 communication cards to their original factory defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: onResetCards },
      ]
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* 18 COMMUNICATION CARDS SETTINGS SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="grid-outline" size={18} color="#4F46E5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Communication Card Settings</Text>
            <Text style={styles.sectionSubtitle}>
              Tap any of the 18 card slots to customize its picture and voice
            </Text>
          </View>
        </View>

        <View style={styles.tileGrid}>
          {cards.map((card) => (
            <Pressable
              key={card.id}
              onPress={() => setSelectedCardForEdit(card)}
              style={styles.tile}
            >
              <View style={styles.tileHeader}>
                <Text style={styles.tilePosition}>#{card.position}</Text>
                <View style={[styles.tileBadge, card.audioUri ? styles.tileBadgeAmber : styles.tileBadgeIndigo]}>
                  <Ionicons
                    name={card.audioUri ? 'mic' : 'volume-high'}
                    size={10}
                    color={card.audioUri ? '#92400E' : '#3730A3'}
                  />
                  <Text style={[styles.tileBadgeText, { color: card.audioUri ? '#92400E' : '#3730A3' }]}>
                    {card.audioUri ? 'Voice' : 'TTS'}
                  </Text>
                </View>
              </View>

              <View style={styles.tileImageWrap}>
                <CardImage uri={card.imageUri} />
              </View>

              <Text style={styles.tileLabel} numberOfLines={1}>
                {card.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* SPEECH & VOICE SETTINGS */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRowSimple}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="volume-high-outline" size={18} color="#4F46E5" />
            <Text style={styles.sectionTitleSmall}>Auto-Voice & Speech Synthesis</Text>
          </View>
          <Pressable onPress={handleTestVoice} style={styles.testBtn}>
            <Ionicons name="play" size={13} color="#4338CA" />
            <Text style={styles.testBtnText}>Test Voice</Text>
          </Pressable>
        </View>

        <View style={styles.sliderRow}>
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderLabel}>Speech Speed (Rate)</Text>
            <Text style={styles.sliderValue}>{settings.rate.toFixed(2)}x</Text>
          </View>
          <Slider
            minimumValue={0.5}
            maximumValue={1.3}
            step={0.05}
            value={settings.rate}
            onValueChange={(v) => handleChange('rate', v)}
            minimumTrackTintColor="#4F46E5"
            maximumTrackTintColor="#E5E7EB"
          />
        </View>

        <View style={styles.sliderRow}>
          <View style={styles.sliderLabelRow}>
            <Text style={styles.sliderLabel}>Voice Pitch</Text>
            <Text style={styles.sliderValue}>{settings.pitch.toFixed(2)}x</Text>
          </View>
          <Slider
            minimumValue={0.5}
            maximumValue={1.5}
            step={0.05}
            value={settings.pitch}
            onValueChange={(v) => handleChange('pitch', v)}
            minimumTrackTintColor="#4F46E5"
            maximumTrackTintColor="#E5E7EB"
          />
        </View>

        {voices.length > 0 && (
          <View style={styles.voiceList}>
            <Text style={styles.sliderLabel}>Select TTS System Voice</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              <Pressable
                onPress={() => handleChange('selectedVoiceURI', undefined)}
                style={[styles.voiceChip, !settings.selectedVoiceURI && styles.voiceChipActive]}
              >
                <Text style={[styles.voiceChipText, !settings.selectedVoiceURI && styles.voiceChipTextActive]}>
                  Default
                </Text>
              </Pressable>
              {voices.map((v) => (
                <Pressable
                  key={v.identifier}
                  onPress={() => handleChange('selectedVoiceURI', v.identifier)}
                  style={[
                    styles.voiceChip,
                    settings.selectedVoiceURI === v.identifier && styles.voiceChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.voiceChipText,
                      settings.selectedVoiceURI === v.identifier && styles.voiceChipTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {v.name} ({v.language})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* DISPLAY PREFERENCES */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="eye-outline" size={18} color="#4F46E5" />
          <Text style={styles.sectionTitleSmall}>Display Preferences</Text>
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.toggleTitle}>Show Card Labels</Text>
            <Text style={styles.toggleSubtitle}>
              Show or hide the text labels underneath the icons on the main workspace
            </Text>
          </View>
          <Switch
            value={settings.showCardLabels !== false}
            onValueChange={(v) => handleChange('showCardLabels', v)}
            trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={styles.toggleTitle}>High Contrast Mode</Text>
            <Text style={styles.toggleSubtitle}>
              Use bold black borders and text for maximum visibility
            </Text>
          </View>
          <Switch
            value={settings.highContrastMode}
            onValueChange={(v) => handleChange('highContrastMode', v)}
            trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* ACCOUNT */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="person-circle-outline" size={18} color="#4F46E5" />
          <Text style={styles.sectionTitleSmall}>Account</Text>
        </View>

        {user?.email && <Text style={styles.toggleSubtitle}>Signed in as {user.email}</Text>}

        <Pressable onPress={handleSignOut} style={styles.resetBtn}>
          <Ionicons name="log-out-outline" size={16} color="#DC2626" />
          <Text style={styles.resetBtnText}>Sign Out</Text>
        </Pressable>
      </View>

      {/* RESET & BACK */}
      <View style={styles.footerRow}>
        <Pressable onPress={handleReset} style={styles.resetBtn}>
          <Ionicons name="refresh" size={16} color="#DC2626" />
          <Text style={styles.resetBtnText}>Reset All Cards</Text>
        </Pressable>

        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back to Workspace</Text>
        </Pressable>
      </View>

      {selectedCardForEdit && (
        <CardEditorModal
          card={selectedCardForEdit}
          isOpen={!!selectedCardForEdit}
          onClose={() => setSelectedCardForEdit(null)}
          onSave={(updatedCard) => {
            onUpdateCard(updatedCard);
            setSelectedCardForEdit(null);
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FDFCFB' },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    padding: 16,
    gap: 14,
  },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionHeaderRowSimple: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  sectionSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  sectionTitleSmall: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  testBtnText: { fontSize: 11, fontWeight: '700', color: '#4338CA' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 8,
    gap: 6,
  },
  tileHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tilePosition: {
    fontSize: 9,
    fontWeight: '800',
    color: '#374151',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  tileBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 1 },
  tileBadgeIndigo: { backgroundColor: '#EEF2FF' },
  tileBadgeAmber: { backgroundColor: '#FFFBEB' },
  tileBadgeText: { fontSize: 8, fontWeight: '700' },
  tileImageWrap: { height: 60, alignItems: 'center', justifyContent: 'center' },
  tileLabel: { fontSize: 10, fontWeight: '800', color: '#1F2937', textAlign: 'center', textTransform: 'uppercase' },
  sliderRow: { gap: 4 },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sliderLabel: { fontSize: 12, fontWeight: '700', color: '#374151' },
  sliderValue: { fontSize: 12, fontWeight: '700', color: '#4F46E5' },
  voiceList: { marginTop: 4 },
  voiceChip: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    maxWidth: 200,
  },
  voiceChipActive: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  voiceChipText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  voiceChipTextActive: { color: '#fff' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
  },
  toggleTitle: { fontSize: 12, fontWeight: '800', color: '#1F2937' },
  toggleSubtitle: { fontSize: 10, color: '#6B7280', marginTop: 2 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resetBtnText: { fontSize: 11, fontWeight: '700', color: '#DC2626' },
  backBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  backBtnText: { fontSize: 12, fontWeight: '800', color: '#fff' },
});
