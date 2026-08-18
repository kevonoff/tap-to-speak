import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseSettings } from '../types';
import { TileCard, TileCardProps } from '../models/TileCard';
import { INITIAL_18_CARDS } from '../data/defaultCards';

const CARDS_STORAGE_KEY = 'Tap_To_Speak_Cards_v1';
const SETTINGS_STORAGE_KEY = 'Tap_To_Speak_Base_Settings_v1';

export const DEFAULT_SETTINGS: BaseSettings = {
  rate: 0.85, // Slower rate ideal for developing kids & speech development
  pitch: 1.0,
  volume: 1.0,
  showCardLabels: true,
  highContrastMode: false,
};

export async function getStoredCards(): Promise<TileCard[]> {
  try {
    const json = await AsyncStorage.getItem(CARDS_STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json) as TileCardProps[];
      if (Array.isArray(parsed) && parsed.length === 18) {
        return parsed.map((props) => new TileCard(props)).sort((a, b) => a.position - b.position);
      }
    }
  } catch (e) {
    console.warn('Error reading stored cards:', e);
  }
  await saveStoredCards(INITIAL_18_CARDS);
  return INITIAL_18_CARDS;
}

export async function saveStoredCards(cards: TileCard[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.warn('Error saving cards:', e);
  }
}

export async function resetCardsToDefault(): Promise<TileCard[]> {
  await saveStoredCards(INITIAL_18_CARDS);
  return INITIAL_18_CARDS;
}

export async function getBaseSettings(): Promise<BaseSettings> {
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

export async function saveBaseSettings(settings: BaseSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Error saving voice settings:', e);
  }
}
