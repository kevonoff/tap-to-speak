import React from 'react';
import { Settings, Volume2, Sparkles } from 'lucide-react';
import { ActiveScreen } from '../types';

interface HeaderProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  isSpeaking: boolean;
  activeCardText?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onNavigate,
  isSpeaking,
  activeCardText,
}) => {
  return (
    <header className="bg-white text-gray-800 shadow-sm border-b border-gray-100 px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between transition-colors">
      {/* App Branding & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('workspace')}
          className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity focus:outline-none group"
          title="Workspace"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl leading-tight tracking-tight text-gray-800">
              Tap to Speak
            </h1>
          </div>
        </button>
      </div>

      {/* Speaking Indicator Feedback */}
      {isSpeaking && (
        <div className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-sm">
          <Volume2 className="w-4 h-4 text-indigo-600 animate-bounce" />
          <span className="truncate max-w-[200px]">"{activeCardText}"</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {activeScreen === 'workspace' && (
          <button
            onClick={() => onNavigate('settings')}
            className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all border border-gray-200 shadow-xs flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="Open Settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="text-xs font-bold hidden sm:inline">Settings</span>
          </button>
        )}
      </div>
    </header>
  );
};
