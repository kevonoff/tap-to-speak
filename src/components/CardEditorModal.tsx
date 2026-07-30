import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Mic,
  Volume2,
  Square,
  Play,
  RotateCcw,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { AACCard } from '../types';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { speakTextTTS } from '../utils/audio';

interface CardEditorModalProps {
  card: AACCard;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: AACCard) => void;
}

export const CardEditorModal: React.FC<CardEditorModalProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
}) => {
  const [label, setLabel] = useState(card.label);
  const [spokenText, setSpokenText] = useState(card.spokenText || card.label);
  const [imageUrl, setImageUrl] = useState(card.imageUrl);
  const [category, setCategory] = useState(card.category || 'need');
  const [bgColor, setBgColor] = useState(card.bgColor || '#3B82F6');

  // AI Image Generation states
  const [aiPrompt, setAiPrompt] = useState(card.label);
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Audio mode choice: 'tts' or 'recorded'
  const [audioMode, setAudioMode] = useState<'tts' | 'recorded'>(
    card.audioDataUrl ? 'recorded' : 'tts'
  );

  // Custom Audio Recorder hook
  const {
    isRecording,
    recordingTime,
    audioDataUrl,
    setAudioDataUrl,
    error: recorderError,
    startRecording,
    stopRecording,
    clearRecording,
    playPreview,
  } = useAudioRecorder();

  // Initialize form state when card changes
  useEffect(() => {
    if (isOpen) {
      setLabel(card.label);
      setSpokenText(card.spokenText || card.label);
      setImageUrl(card.imageUrl);
      setCategory(card.category || 'need');
      setBgColor(card.bgColor || '#3B82F6');
      setAiPrompt(card.label);
      setAudioDataUrl(card.audioDataUrl || null);
      setAudioMode(card.audioDataUrl ? 'recorded' : 'tts');
      setAiError(null);
    }
  }, [card, isOpen, setAudioDataUrl]);

  if (!isOpen) return null;

  // Handler to generate image using Gemini backend API
  const handleGenerateAiImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAiImage(true);
    setAiError(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, label }),
      });

      const data = await res.json();
      if (!res.ok && !data.imageUrl) {
        throw new Error(data.message || 'Failed to generate image');
      }

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        if (data.warning) {
          setAiError(data.warning);
        }
      } else {
        throw new Error('No image returned');
      }
    } catch (err: any) {
      console.error('AI image generation error:', err);
      setAiError(
        err.message || 'Could not generate image. Check your Gemini API Key.'
      );
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  // Handler for file upload from phone / device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Test Auto-generated TTS voice playback
  const handleTestTTS = () => {
    speakTextTTS(spokenText || label);
  };

  // Save handler
  const handleSave = () => {
    const updatedCard: AACCard = {
      ...card,
      label: label.trim() || 'Custom Card',
      spokenText: spokenText.trim() || label.trim() || 'Custom Card',
      imageUrl,
      audioDataUrl: audioMode === 'recorded' ? audioDataUrl : null,
      category,
      bgColor,
    };
    onSave(updatedCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#FDFCFB] border-2 border-gray-100 text-gray-800 rounded-[32px] max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              #{card.position}
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                Edit Card Position #{card.position}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Customize image and speech output
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Card Title Label */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
              Card Display Title / Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                if (!spokenText || spokenText === label) {
                  setSpokenText(e.target.value);
                }
              }}
              placeholder="e.g. Water, Apple, Hug, Toilet"
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-900 font-extrabold text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-xs"
            />
          </div>

          {/* SECTION 1: IMAGE CHOICE */}
          <div className="space-y-3 bg-white p-4.5 rounded-[24px] border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                Select or Generate Image
              </label>
            </div>

            {/* Current Image Preview */}
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-200/60">
              <div className="w-20 h-20 rounded-2xl bg-white border-2 border-indigo-200 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Card Preview"
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-extrabold text-gray-800">Current Symbol</p>
                <p className="text-gray-500 text-[11px] font-medium">
                  You can generate a new AI picture or pick a picture from your device files.
                </p>
              </div>
            </div>

            {/* Image Source Options Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Option 1: AI Image Generation */}
              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-800">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Ask AI to Generate Image
                </div>

                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe image (e.g. A red glass of water)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-indigo-200 text-gray-800 focus:border-indigo-500 focus:outline-none"
                />

                <button
                  onClick={handleGenerateAiImage}
                  disabled={isGeneratingAiImage || !aiPrompt.trim()}
                  className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  {isGeneratingAiImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Image...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>

                {aiError && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {aiError}
                  </p>
                )}
              </div>

              {/* Option 2: Select from Phone / Gallery */}
              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 mb-1">
                    <Upload className="w-4 h-4 text-amber-600" />
                    Select from Device Storage
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">
                    Upload a custom picture or photograph from your device.
                  </p>
                </div>

                <label className="w-full py-2 px-3 bg-white hover:bg-amber-100/50 border border-amber-200 text-amber-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Browse Device Files...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 2: VOICE OUTPUT CHOICE */}
          <div className="space-y-3 bg-white p-4.5 rounded-[24px] border border-gray-200/80 shadow-xs">
            <label className="text-xs font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />
              Speech & Sound Response Mode
            </label>

            {/* Selector between Recorded Voice vs Auto-generated Voice */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl border border-gray-200/60">
              <button
                onClick={() => setAudioMode('tts')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  audioMode === 'tts'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Auto Voice (TTS)</span>
              </button>

              <button
                onClick={() => setAudioMode('recorded')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  audioMode === 'recorded'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Record Voice</span>
              </button>
            </div>

            {/* Mode 1: Auto-generated Voice text */}
            {audioMode === 'tts' && (
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Type what the auto-generated voice should say out loud when tapped:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={spokenText}
                    onChange={(e) => setSpokenText(e.target.value)}
                    placeholder="e.g. I want to drink a cup of water please"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-800 text-sm font-medium focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={handleTestTTS}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Test</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Record Voice from Microphone */}
            {audioMode === 'recorded' && (
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3">
                <p className="text-xs text-gray-600 font-medium">
                  Record a parent, teacher, or child's voice for custom familiar speech playback!
                </p>

                {recorderError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-xl font-medium">
                    {recorderError}
                  </p>
                )}

                <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-200/80">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isRecording
                          ? 'bg-red-600 text-white animate-ping'
                          : audioDataUrl
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </div>

                    <div>
                      <span className="font-extrabold text-xs text-gray-800 block">
                        {isRecording
                          ? `Recording... (${recordingTime}s)`
                          : audioDataUrl
                          ? 'Voice Audio Recorded!'
                          : 'No Voice Recorded Yet'}
                      </span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {isRecording
                          ? 'Speak clearly into your microphone'
                          : audioDataUrl
                          ? 'Ready to use on card tap'
                          : 'Press record to capture voice'}
                      </span>
                    </div>
                  </div>

                  {/* Recording Action Controls */}
                  <div className="flex items-center gap-2">
                    {isRecording ? (
                      <button
                        onClick={stopRecording}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 animate-bounce"
                      >
                        <Square className="w-4 h-4 fill-current" />
                        <span>Stop</span>
                      </button>
                    ) : (
                      <button
                        onClick={startRecording}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Mic className="w-4 h-4" />
                        <span>{audioDataUrl ? 'Re-record' : 'Record Voice'}</span>
                      </button>
                    )}

                    {audioDataUrl && !isRecording && (
                      <>
                        <button
                          onClick={playPreview}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl"
                          title="Listen to Recording"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={clearRecording}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-red-600 rounded-xl"
                          title="Delete Recording"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Color Coding Accent */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-500 mb-1.5">
              Card Category Color Theme
            </label>
            <div className="flex items-center gap-2.5">
              {[
                { name: 'Red (Needs/Food)', color: '#EF4444' },
                { name: 'Blue (Drinks/Water)', color: '#3B82F6' },
                { name: 'Yellow (Toilet/Urgent)', color: '#F59E0B' },
                { name: 'Green (Social/Yes)', color: '#10B981' },
                { name: 'Purple (Actions/Help)', color: '#8B5CF6' },
                { name: 'Pink (Love/Sleep)', color: '#EC4899' },
              ].map((item) => (
                <button
                  key={item.color}
                  onClick={() => setBgColor(item.color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform shadow-xs ${
                    bgColor === item.color
                      ? 'scale-110 border-gray-900 ring-2 ring-indigo-400'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: item.color }}
                  title={item.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-md shadow-indigo-200 flex items-center gap-2 transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
