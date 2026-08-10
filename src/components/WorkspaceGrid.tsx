import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { AACCard, VoiceSettings } from '../types';
import { AACCardItem } from './AACCardItem';
import { speakAACCard } from '../utils/audio';

interface WorkspaceGridProps {
  cards: AACCard[];
  voiceSettings: VoiceSettings;
  highContrast?: boolean;
}

export const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({
  cards,
  voiceSettings,
  highContrast = false,
}) => {
  const { width, height } = useWindowDimensions();
  // Landscape tablets get a wide 6x3 layout; portrait phones get 3x6, same
  // responsive swap the original web grid used.
  const columns = width > height ? 6 : 3;
  const rows = 18 / columns;

  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [activeCardText, setActiveCardText] = useState<string | null>(null);

  const handleCardTap = (card: AACCard) => {
    setSpeakingCardId(card.id);
    // Only show the caption toast for TTS playback — a pre-recorded voice
    // message doesn't need its text echoed on screen.
    setActiveCardText(card.audioUri ? null : card.spokenText || card.label);

    speakAACCard(
      card.spokenText || card.label,
      card.audioUri,
      voiceSettings,
      () => setSpeakingCardId(card.id),
      () => {
        setSpeakingCardId(null);
        setActiveCardText(null);
      }
    );
  };

  const rowsData: AACCard[][] = [];
  for (let r = 0; r < rows; r++) {
    rowsData.push(cards.slice(r * columns, r * columns + columns));
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {rowsData.map((rowCards, i) => (
          <View key={i} style={styles.row}>
            {rowCards.map((card) => (
              <View key={card.id} style={styles.cell}>
                <AACCardItem
                  card={card}
                  onSelect={handleCardTap}
                  isSpeaking={speakingCardId === card.id}
                  highContrast={highContrast}
                  showCardLabels={voiceSettings.showCardLabels !== false}
                />
              </View>
            ))}
          </View>
        ))}
      </View>

      {activeCardText && (
        <View style={styles.toast}>
          <Text style={styles.toastText} numberOfLines={1}>
            "{activeCardText}"
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFB',
  },
  grid: {
    flex: 1,
    padding: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    padding: 5,
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    maxWidth: '90%',
  },
  toastText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
});
