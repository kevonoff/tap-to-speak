import React, { useState, useEffect } from 'react';
import {
  Grid,
  Volume2,
  Sliders,
  RotateCcw,
  Check,
  Play,
  Sparkles,
  Smartphone,
  Info,
  Eye,
  Mic,
} from 'lucide-react';
import { AACCard, VoiceSettings } from '../types';
import { getAvailableVoices, speakTextTTS } from '../utils/audio';
import { CardEditorModal } from './CardEditorModal';

interface SettingsScreenProps {
  cards: AACCard[];
  onUpdateCard: (updatedCard: AACCard) => void;
  voiceSettings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
  onResetCards: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  cards,
  onUpdateCard,
  voiceSettings,
  onUpdateSettings,
  onResetCards,
  onBack,
}) => {
  const [settings, setSettings] = useState<VoiceSettings>(voiceSettings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedCardForEdit, setSelectedCardForEdit] = useState<AACCard | null>(null);

  useEffect(() => {
    const loadedVoices = getAvailableVoices();
    setVoices(loadedVoices);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
    }
  }, []);

  const handleChange = <K extends keyof VoiceSettings>(
    key: K,
    value: VoiceSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    onUpdateSettings(updated);
  };

  const handleTestVoice = () => {
    speakTextTTS('Hello! This is a test of your AAC voice settings.', settings);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#FDFCFB] text-gray-800 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* 18 COMMUNICATION CARDS SETTINGS SECTION (Inline in place of old banner) */}
      <div className="bg-white border-2 border-gray-100 rounded-[28px] p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Grid className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-gray-900">Communication Card Settings</h3>
              <p className="text-xs text-gray-500 font-medium">
                Customize any of the 18 card slots with custom pictures, AI generation, or voice recordings
              </p>
            </div>
          </div>
        </div>

        {/* 18 Tile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCardForEdit(card)}
              className="bg-gray-50/80 border border-gray-200/80 hover:border-indigo-400 hover:bg-white rounded-2xl p-2.5 flex flex-col justify-between space-y-2 transition-all shadow-2xs hover:shadow-md active:scale-98 text-left cursor-pointer group"
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 border-b border-gray-200/60 pb-1.5 w-full">
                <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-extrabold text-gray-700 border border-gray-200/60">
                  #{card.position}
                </span>
                {card.audioDataUrl ? (
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                    <Mic className="w-2.5 h-2.5 text-amber-600" />
                    Voice
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full font-bold">
                    <Volume2 className="w-2.5 h-2.5 text-indigo-600" />
                    TTS
                  </span>
                )}
              </div>

              {/* Image Preview */}
              <div className="w-full h-20 rounded-xl bg-white border border-gray-200/60 p-1.5 flex items-center justify-center overflow-hidden">
                <img
                  src={card.imageUrl}
                  alt={card.label}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain filter drop-shadow-2xs group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Title */}
              <div className="text-center py-0.5 w-full">
                <h4 className="font-extrabold text-xs text-gray-800 truncate uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                  {card.label}
                </h4>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* SPEECH & VOICE SETTINGS */}
      <div className="bg-white border-2 border-gray-100 rounded-[28px] p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-gray-800">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <span>Auto-Voice & Speech Synthesis</span>
          </div>

          <button
            onClick={handleTestVoice}
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Voice</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Speech Rate / Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-700">
              <span>Speech Speed (Rate)</span>
              <span className="text-indigo-600 font-mono">{settings.rate}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.3"
              step="0.05"
              value={settings.rate}
              onChange={(e) => handleChange('rate', parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Speech Pitch */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-gray-700">
              <span>Voice Pitch</span>
              <span className="text-indigo-600 font-mono">{settings.pitch}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.pitch}
              onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
              <span>Deep</span>
              <span>Natural</span>
              <span>Childlike</span>
            </div>
          </div>
        </div>

        {/* System Voice Selection */}
        {voices.length > 0 && (
          <div className="pt-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              Select TTS System Voice
            </label>
            <select
              value={settings.selectedVoiceURI || ''}
              onChange={(e) => handleChange('selectedVoiceURI', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 text-xs font-medium focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Default System Voice</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* DISPLAY PREFERENCES */}
      <div className="bg-white border-2 border-gray-100 rounded-[28px] p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-extrabold text-gray-800 border-b border-gray-100 pb-3">
          <Eye className="w-5 h-5 text-indigo-600" />
          <span>Display Preferences</span>
        </div>

        <div className="space-y-3">
          {/* Show Card Labels */}
          <label className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 cursor-pointer hover:bg-gray-100/80 transition-colors">
            <div>
              <span className="font-extrabold text-xs text-gray-800 block">
                Show Card Labels
              </span>
              <span className="text-[11px] text-gray-500 font-medium">
                Show or hide the text labels underneath the icons on all 18 communication cards on the main workspace
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.showCardLabels !== false}
              onChange={(e) => handleChange('showCardLabels', e.target.checked)}
              className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* RESET TO DEFAULTS & BACK */}
      <div className="pt-2 flex items-center justify-between pb-6">
        <button
          onClick={() => {
            if (confirm('Reset all 18 communication cards to their original factory defaults?')) {
              onResetCards();
            }
          }}
          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset All Cards to Factory Defaults</span>
        </button>

        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition-colors shadow-xs"
        >
          Back to Workspace
        </button>
      </div>

      {/* Modal for editing a card slot */}
      {selectedCardForEdit && (
        <CardEditorModal
          card={selectedCardForEdit}
          isOpen={!!selectedCardForEdit}
          onClose={() => setSelectedCardForEdit(null)}
          onSave={(updatedCard) => {
            onUpdateCard(updatedCard);
            setSelectedCardForEdit(null);
          }}
        />
      )}
    </div>
  );
};

