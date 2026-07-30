import React from 'react';
import { Volume2 } from 'lucide-react';
import { AACCard } from '../types';

interface AACCardItemProps {
  card: AACCard;
  onSelect: (card: AACCard) => void;
  isSpeaking: boolean;
  highContrast?: boolean;
  showCardLabels?: boolean;
}

// Map color hex codes to Vibrant Palette tailwind classes (bg pastel tint, border color, label text color, shadow)
const getColorThemeClasses = (bgColor?: string) => {
  const hex = (bgColor || '#3B82F6').toUpperCase();

  if (hex.includes('EF4444') || hex.includes('DC2626') || hex.includes('F43F5E')) {
    return {
      bg: 'bg-red-50/90 hover:bg-red-100/90',
      border: 'border-red-200 hover:border-red-300',
      text: 'text-red-600',
      shadow: 'shadow-red-100/80',
    };
  }
  if (hex.includes('3B82F6') || hex.includes('0284C7') || hex.includes('2563EB')) {
    return {
      bg: 'bg-blue-50/90 hover:bg-blue-100/90',
      border: 'border-blue-200 hover:border-blue-300',
      text: 'text-blue-600',
      shadow: 'shadow-blue-100/80',
    };
  }
  if (hex.includes('F59E0B') || hex.includes('FBBF24')) {
    return {
      bg: 'bg-amber-50/90 hover:bg-amber-100/90',
      border: 'border-amber-200 hover:border-amber-300',
      text: 'text-amber-700',
      shadow: 'shadow-amber-100/80',
    };
  }
  if (hex.includes('10B981') || hex.includes('22C55E') || hex.includes('059669')) {
    return {
      bg: 'bg-emerald-50/90 hover:bg-emerald-100/90',
      border: 'border-emerald-200 hover:border-emerald-300',
      text: 'text-emerald-700',
      shadow: 'shadow-emerald-100/80',
    };
  }
  if (hex.includes('8B5CF6') || hex.includes('6366F1')) {
    return {
      bg: 'bg-purple-50/90 hover:bg-purple-100/90',
      border: 'border-purple-200 hover:border-purple-300',
      text: 'text-purple-700',
      shadow: 'shadow-purple-100/80',
    };
  }
  if (hex.includes('EC4899')) {
    return {
      bg: 'bg-pink-50/90 hover:bg-pink-100/90',
      border: 'border-pink-200 hover:border-pink-300',
      text: 'text-pink-600',
      shadow: 'shadow-pink-100/80',
    };
  }
  if (hex.includes('6B7280')) {
    return {
      bg: 'bg-slate-50/90 hover:bg-slate-100/90',
      border: 'border-slate-300 hover:border-slate-400',
      text: 'text-slate-700',
      shadow: 'shadow-slate-100',
    };
  }

  return {
    bg: 'bg-indigo-50/90 hover:bg-indigo-100/90',
    border: 'border-indigo-200 hover:border-indigo-300',
    text: 'text-indigo-700',
    shadow: 'shadow-indigo-100/80',
  };
};

export const AACCardItem: React.FC<AACCardItemProps> = ({
  card,
  onSelect,
  isSpeaking,
  highContrast = false,
  showCardLabels = true,
}) => {
  const theme = getColorThemeClasses(card.bgColor);

  return (
    <button
      onClick={() => onSelect(card)}
      className={`group relative flex flex-col items-center justify-between p-2.5 sm:p-3.5 rounded-[24px] sm:rounded-[28px] border-4 select-none cursor-pointer h-full w-full transition-all duration-200 transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-400/50 shadow-md hover:shadow-lg ${
        isSpeaking
          ? 'ring-4 ring-indigo-500 scale-102 bg-indigo-100/90 border-indigo-400 shadow-xl'
          : highContrast
          ? 'bg-white border-black text-black font-black'
          : `${theme.bg} ${theme.border} ${theme.shadow}`
      }`}
    >
      {/* Image Container */}
      <div className="relative flex-1 w-full flex items-center justify-center p-1.5 overflow-hidden my-auto">
        <img
          src={card.imageUrl}
          alt={card.label}
          referrerPolicy="no-referrer"
          className="max-h-full max-w-full object-contain filter drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
        />

        {/* Speaking Overlay Glow */}
        {isSpeaking && (
          <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
            <div className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg animate-bounce">
              <Volume2 className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* Label Text */}
      {showCardLabels && (
        <div className="w-full text-center mt-1 pt-1 border-t border-black/5">
          <span
            className={`block truncate text-xs sm:text-sm md:text-base font-black uppercase tracking-wider ${
              highContrast ? 'text-black' : theme.text
            }`}
          >
            {card.label}
          </span>
        </div>
      )}
    </button>
  );
};
