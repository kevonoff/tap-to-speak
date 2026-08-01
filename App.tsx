import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AACCard, VoiceSettings, ActiveScreen } from './src/types';
import {
  getStoredCards,
  saveStoredCards,
  resetCardsToDefault,
  getVoiceSettings,
  saveVoiceSettings,
  DEFAULT_SETTINGS,
} from './src/utils/storage';
import { Header } from './src/components/Header';
import { WorkspaceGrid } from './src/components/WorkspaceGrid';
import { SettingsScreen } from './src/components/SettingsScreen';

export default function App() {
  const [cards, setCards] = useState<AACCard[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('workspace');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStoredCards(), getVoiceSettings()]).then(([loadedCards, loadedSettings]) => {
      setCards(loadedCards);
      setVoiceSettings(loadedSettings);
      setIsLoading(false);
    });
  }, []);

  const handleUpdateCard = (updatedCard: AACCard) => {
    const newCards = cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
    setCards(newCards);
    saveStoredCards(newCards);
  };

  const handleUpdateSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    saveVoiceSettings(newSettings);
  };

  const handleResetCards = async () => {
    const defaultCards = await resetCardsToDefault();
    setCards(defaultCards);
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingScreen}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading AAC Workspace...</Text>
          <StatusBar style="light" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.app}>
        <Header activeScreen={activeScreen} onNavigate={setActiveScreen} />

        <View style={styles.main}>
          {activeScreen === 'workspace' && (
            <WorkspaceGrid
              cards={cards}
              voiceSettings={voiceSettings}
              highContrast={voiceSettings.highContrastMode}
            />
          )}

          {activeScreen === 'settings' && (
            <SettingsScreen
              cards={cards}
              onUpdateCard={handleUpdateCard}
              voiceSettings={voiceSettings}
              onUpdateSettings={handleUpdateSettings}
              onResetCards={handleResetCards}
              onBack={() => setActiveScreen('workspace')}
            />
          )}
        </View>

        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#FDFCFB',
  },
  main: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#CBD5E1',
    fontWeight: '600',
    fontSize: 13,
  },
});
