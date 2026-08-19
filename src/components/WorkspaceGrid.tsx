import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { BaseSettings } from '../types';
import { TileCard } from '../models/TileCard';
import { TileCardWorkspaceItem } from './TileCardWorkspaceItem';

interface WorkspaceGridProps {
  cards: TileCard[];
  baseSettings: BaseSettings;
  highContrast?: boolean;
}

export const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({
  cards,
  baseSettings,
  highContrast = false,
}) => {
  const { width, height } = useWindowDimensions();
  // Landscape tablets get a wide 6x3 layout; portrait phones get 3x6, same
  // responsive swap the original web grid used. Both totals are always 18 —
  // spelled out directly rather than derived (18 / columns) so the two
  // layouts are legible without doing the division in your head.
  const isLandscape = width > height;
  const columns = isLandscape ? 6 : 3;
  const rows = isLandscape ? 3 : 6;

  const [speakingPosition, setSpeakingPosition] = useState<number | null>(null);
  const [spokenWordsModalText, setSpokenWordsModalText] = useState<string | null>(null);

  const handleCardTap = (card: TileCard) => {
    setSpeakingPosition(card.position);
    // Only show the caption toast for TTS playback — a pre-recorded voice
    // message doesn't need its text echoed on screen.
    setSpokenWordsModalText(card.hasRecording ? null : card.displaySpokenText);

    card.PlayAudio(
      baseSettings,
      () => setSpeakingPosition(card.position),
      () => {
        setSpeakingPosition(null);
        setSpokenWordsModalText(null);
      }
    
    );
  };

  const rowsData: TileCard[][] = [];
  for (let r = 0; r < rows; r++) {
    rowsData.push(cards.slice(r * columns, r * columns + columns));
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {rowsData.map((rowCards, i) => (
          <View key={i} style={styles.row}>
            {rowCards.map((card) => (
              <View key={card.position} style={styles.cell}>
                <TileCardWorkspaceItem
                  card={card}
                  onSelect={handleCardTap}
                  isSpeaking={speakingPosition === card.position}
                  highContrast={highContrast}
                  showCardLabels={baseSettings.showCardLabels !== false}
                />
              </View>
            ))}
          </View>
        ))}
      </View>

      {spokenWordsModalText && (
        <View style={styles.toast}>
          <Text style={styles.toastText} numberOfLines={1}>
            &quot;{spokenWordsModalText}&quot;
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
