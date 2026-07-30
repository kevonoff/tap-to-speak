import React, { useState, useEffect } from 'react';
import { AACCard, VoiceSettings, ActiveScreen } from './types';
import {
  getStoredCards,
  saveStoredCards,
  resetCardsToDefault,
  getVoiceSettings,
  saveVoiceSettings,
} from './utils/storage';
import { Header } from './components/Header';
import { WorkspaceGrid } from './components/WorkspaceGrid';
import { SettingsScreen } from './components/SettingsScreen';

export default function App() {
  const [cards, setCards] = useState<AACCard[]>([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(getVoiceSettings());
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('workspace');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load persistent cards on initial mount
  useEffect(() => {
    getStoredCards().then((loadedCards) => {
      setCards(loadedCards);
      setIsLoading(false);
    });
  }, []);

  // Handler to update an individual card
  const handleUpdateCard = (updatedCard: AACCard) => {
    const newCards = cards.map((c) => (c.id === updatedCard.id ? updatedCard : c));
    setCards(newCards);
    saveStoredCards(newCards);
  };

  // Handler to update voice settings
  const handleUpdateSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    saveVoiceSettings(newSettings);
  };

  // Reset cards to default 18
  const handleResetCards = async () => {
    const defaultCards = await resetCardsToDefault();
    setCards(defaultCards);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-semibold text-sm text-slate-300">Loading AAC Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#FDFCFB] flex flex-col">
      {/* Top Header Bar */}
      <Header
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
        isSpeaking={false}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1 overflow-hidden relative flex flex-col bg-slate-950">
        {activeScreen === 'workspace' && (
          <WorkspaceGrid
            cards={cards}
            voiceSettings={voiceSettings}
            onOpenSettings={() => setActiveScreen('settings')}
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
      </main>
    </div>
  );
}
