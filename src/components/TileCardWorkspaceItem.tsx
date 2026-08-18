import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { TileCard } from '../models/TileCard';
import { CardImage } from './CardImage';
import { getColorTheme } from '../utils/cardTheme';

interface TileCardItemProps {
  card: TileCard;
  onSelect: (card: TileCard) => void;
  isSpeaking: boolean;
  highContrast?: boolean;
  showCardLabels?: boolean;
}

export const TileCardWorkspaceItem: React.FC<TileCardItemProps> = ({
  card,
  onSelect,
  isSpeaking,
  highContrast = false,
  showCardLabels = true,
}) => {
  const theme = getColorTheme(card.bgColor);
  const bg = isSpeaking ? '#E0E7FF' : highContrast ? '#FFFFFF' : theme.bg;
  const border = isSpeaking ? '#6366F1' : highContrast ? '#000000' : theme.border;
  const textColor = highContrast ? '#000000' : theme.text;

  return (
    <Pressable
      onPress={() => onSelect(card)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: bg, borderColor: border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <CardImage uri={card.imageUri} />
      </View>

      {showCardLabels && (
        <View style={styles.labelWrap}>
          <Text style={[styles.label, { color: textColor }]} numberOfLines={1}>
            {card.displayLabel}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 4,
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  imageWrap: {
    flex: 1,
    width: '100%',
    padding: 4,
  },
  labelWrap: {
    width: '100%',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  label: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
