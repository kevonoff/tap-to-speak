import React, { useState, useEffect, useRef } from 'react';
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
import { syncTilesOnLogin, pushCardToSupabase, pushCardsToSupabase } from './src/utils/tilesSync';
import { Header } from './src/components/Header';
import { WorkspaceGrid } from './src/components/WorkspaceGrid';
import { SettingsScreen } from './src/components/SettingsScreen';
import { AuthScreen } from './src/components/AuthScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

function AppContent() {
  const [cards, setCards] = useState<AACCard[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('workspace');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingTiles, setIsSyncingTiles] = useState(false);
  const { session, user, isLoading: isAuthLoading } = useAuth();
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    Promise.all([getStoredCards(), getVoiceSettings()]).then(([loadedCards, loadedSettings]) => {
      setCards(loadedCards);
      setVoiceSettings(loadedSettings);
      setIsLoading(false);
    });
  }, []);

  // Runs once per sign-in: seeds Supabase from this device on a first login,
  // or pulls existing tiles down to replace local state on a returning one.
  useEffect(() => {
    if (isLoading || !user || syncedUserIdRef.current === user.id) return;
    syncedUserIdRef.current = user.id;
    setIsSyncingTiles(true);
    syncTilesOnLogin(user.id, cards)
      .then(setCards)
      .catch((err) => console.warn('Tile sync failed:', err))
      .finally(() => setIsSyncingTiles(false));
  }, [isLoading, user, cards]);

  const handleUpdateCard = (updatedCard: AACCard) => {
    const newCards = cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
    setCards(newCards);
    saveStoredCards(newCards);
    if (user) {
      pushCardToSupabase(user.id, updatedCard)
        .then((updatedAt) => {
          if (!updatedAt) return;
          // Stamp the row's new updated_at locally so this device's next
          // login recognizes this as its own edit, not a remote change, and
          // keeps trusting its local file instead of needlessly re-fetching it.
          setCards((prev) => {
            const stamped = prev.map((c) =>
              c.position === updatedCard.position ? { ...c, lastSyncedUpdatedAt: updatedAt } : c
            );
            saveStoredCards(stamped);
            return stamped;
          });
        })
        .catch(() => {
          // Already logged in pushCardToSupabase; local save above already succeeded either way.
        });
    }
  };

  const handleUpdateSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    saveVoiceSettings(newSettings);
  };

  const handleResetCards = async () => {
    const defaultCards = await resetCardsToDefault();
    setCards(defaultCards);
    if (user) {
      pushCardsToSupabase(user.id, defaultCards)
        .then((updatedAtByPosition) => {
          setCards((prev) => {
            const stamped = prev.map((c) => ({
              ...c,
              lastSyncedUpdatedAt: updatedAtByPosition.get(c.position) ?? c.lastSyncedUpdatedAt,
            }));
            saveStoredCards(stamped);
            return stamped;
          });
        })
        .catch(() => {
          // Already logged in pushCardsToSupabase; local reset above already succeeded either way.
        });
    }
  };

  if (isLoading || isAuthLoading || isSyncingTiles) {
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

  if (!session) {
    return (
      <SafeAreaProvider>
        <AuthScreen />
        <StatusBar style="light" />
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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
