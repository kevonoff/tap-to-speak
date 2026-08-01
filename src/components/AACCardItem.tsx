import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { AACCard } from '../types';
import { CardImage } from './CardImage';

interface AACCardItemProps {
  card: AACCard;
  onSelect: (card: AACCard) => void;
  isSpeaking: boolean;
  highContrast?: boolean;
  showCardLabels?: boolean;
}

interface ColorTheme {
  bg: string;
  border: string;
  text: string;
}

// Maps a card's accent hex to a soft pastel theme, mirroring the original
// web app's color-family grouping.
function getColorTheme(bgColor?: string): ColorTheme {
  const hex = (bgColor || '#3B82F6').toUpperCase();

  if (['EF4444', 'DC2626', 'F43F5E'].some((c) => hex.includes(c))) {
    return { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' };
  }
  if (['3B82F6', '0284C7', '2563EB'].some((c) => hex.includes(c))) {
    return { bg: '#EFF6FF', border: '#BFDBFE', text: '#2563EB' };
  }
  if (['F59E0B', 'FBBF24'].some((c) => hex.includes(c))) {
    return { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309' };
  }
  if (['10B981', '22C55E', '059669'].some((c) => hex.includes(c))) {
    return { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857' };
  }
  if (['8B5CF6', '6366F1'].some((c) => hex.includes(c))) {
    return { bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' };
  }
  if (hex.includes('EC4899')) {
    return { bg: '#FDF2F8', border: '#FBCFE8', text: '#DB2777' };
  }
  if (hex.includes('6B7280')) {
    return { bg: '#F3F4F6', border: '#D1D5DB', text: '#374151' };
  }
  return { bg: '#EEF2FF', border: '#C7D2FE', text: '#4338CA' };
}

export const AACCardItem: React.FC<AACCardItemProps> = ({
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
            {card.label}
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
