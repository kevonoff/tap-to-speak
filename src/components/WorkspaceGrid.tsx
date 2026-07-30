import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { AACCard, VoiceSettings } from '../types';
import { AACCardItem } from './AACCardItem';
import { speakAACCard } from '../utils/audio';

interface WorkspaceGridProps {
  cards: AACCard[];
  voiceSettings: VoiceSettings;
  onOpenSettings: () => void;
  highContrast?: boolean;
}

export const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({
  cards,
  voiceSettings,
  onOpenSettings,
  highContrast = false,
}) => {
  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);
  const [activeCardText, setActiveCardText] = useState<string | null>(null);

  const handleCardTap = (card: AACCard) => {
    // Play out loud audio immediately (Recorded Voice OR TTS)
    setSpeakingCardId(card.id);
    setActiveCardText(card.spokenText || card.label);

    speakAACCard(
      card.spokenText || card.label,
      card.audioDataUrl,
      voiceSettings,
      () => {
        setSpeakingCardId(card.id);
      },
      () => {
        setSpeakingCardId(null);
        setActiveCardText(null);
      }
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FDFCFB] text-gray-800 overflow-hidden relative select-none">
      {/* Main Bare Workspace 3x6 Grid (18 Tiles) */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto min-h-0 flex items-center justify-center bg-[#FDFCFB]">
        <div className="w-full h-full max-w-7xl mx-auto grid grid-cols-3 sm:grid-cols-6 grid-rows-6 sm:grid-rows-3 gap-3 sm:gap-4 md:gap-5 auto-rows-fr">
          {cards.map((card) => (
            <AACCardItem
              key={card.id}
              card={card}
              onSelect={handleCardTap}
              isSpeaking={speakingCardId === card.id}
              highContrast={highContrast}
              showCardLabels={voiceSettings.showCardLabels !== false}
            />
          ))}
        </div>
      </div>

      {/* Speech Audio Feedback Toast / Bar */}
      {activeCardText && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-xl z-40 flex items-center gap-3 border border-indigo-400/40 animate-bounce">
          <Volume2 className="w-5 h-5 text-white animate-pulse" />
          <span className="font-extrabold text-sm sm:text-base tracking-wide">
            "{activeCardText}"
          </span>
        </div>
      )}
    </div>
  );
};
