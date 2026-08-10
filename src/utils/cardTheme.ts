export interface ColorTheme {
  bg: string;
  border: string;
  text: string;
}

// Maps a card's accent hex to a soft pastel theme, mirroring the original
// web app's color-family grouping. Shared by the Workspace grid and the
// Settings screen's tile previews so a color change looks consistent in both.
export function getColorTheme(bgColor?: string): ColorTheme {
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
