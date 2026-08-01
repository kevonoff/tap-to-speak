import AsyncStorage from '@react-native-async-storage/async-storage';
import { AACCard, VoiceSettings } from '../types';
import { INITIAL_18_CARDS } from '../data/defaultCards';

const CARDS_STORAGE_KEY = 'aac_express_cards_v1';
const SETTINGS_STORAGE_KEY = 'aac_express_voice_settings_v1';

export const DEFAULT_SETTINGS: VoiceSettings = {
  rate: 0.85, // Slower rate ideal for developing kids & speech development
  pitch: 1.0,
  volume: 1.0,
  showCardLabels: true,
  highContrastMode: false,
};

export async function getStoredCards(): Promise<AACCard[]> {
  try {
    const json = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json) as AACCard[];
      if (Array.isArray(parsed) && parsed.length === 18) {
        return parsed.sort((a, b) => a.position - b.position);
      }
    }
  } catch (e) {
    console.warn('Error reading stored cards:', e);
  }
  await saveStoredCards(INITIAL_18_CARDS);
  return INITIAL_18_CARDS;
}

export async function saveStoredCards(cards: AACCard[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.warn('Error saving cards:', e);
  }
}

export async function resetCardsToDefault(): Promise<AACCard[]> {
  await saveStoredCards(INITIAL_18_CARDS);
  return INITIAL_18_CARDS;
}

export async function getVoiceSettings(): Promise<VoiceSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
  } catch (e) {
    console.warn('Error reading voice settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveVoiceSettings(settings: VoiceSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving voice settings:', e);
  }
}
