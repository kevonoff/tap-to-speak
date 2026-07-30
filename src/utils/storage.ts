import { AACCard, VoiceSettings } from '../types';
import { INITIAL_18_CARDS } from '../data/defaultCards';

const CARDS_STORAGE_KEY = 'aac_express_cards_v1';
const SETTINGS_STORAGE_KEY = 'aac_express_voice_settings_v1';

export const DEFAULT_SETTINGS: VoiceSettings = {
  rate: 0.85, // Slower rate ideal for developing kids & speech development
  pitch: 1.0,
  volume: 1.0,
  autoClearSentence: true,
  hapticFeedback: true,
  highContrastMode: false,
  showCardLabels: true,
};

// IndexedDB database setup for large audio & image assets
const DB_NAME = 'AACExpressDB';
const STORE_NAME = 'cardsStore';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getStoredCards(): Promise<AACCard[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as AACCard[];
        if (results && results.length === 18) {
          // Sort by position 1 to 18
          results.sort((a, b) => a.position - b.position);
          resolve(results);
        } else {
          // Fallback to initial 18 cards
          saveStoredCards(INITIAL_18_CARDS);
          resolve(INITIAL_18_CARDS);
        }
      };
      req.onerror = () => {
        resolve(getCardsFromLocalStorage());
      };
    });
  } catch (e) {
    return getCardsFromLocalStorage();
  }
}

function getCardsFromLocalStorage(): AACCard[] {
  try {
    const json = localStorage.getItem(CARDS_STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json) as AACCard[];
      if (Array.isArray(parsed) && parsed.length === 18) {
        return parsed.sort((a, b) => a.position - b.position);
      }
    }
  } catch (e) {
    console.error('Error reading localStorage cards:', e);
  }
  return INITIAL_18_CARDS;
}

export async function saveStoredCards(cards: AACCard[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    cards.forEach((card) => store.put(card));
  } catch (e) {
    console.warn('IndexedDB write failed, falling back to localStorage', e);
  }

  try {
    // Strip heavy base64 for fallback localStorage if needed
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(cards));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

export async function resetCardsToDefault(): Promise<AACCard[]> {
  await saveStoredCards(INITIAL_18_CARDS);
  return INITIAL_18_CARDS;
}

export function getVoiceSettings(): VoiceSettings {
  try {
    const json = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
  } catch (e) {
    console.error('Error reading voice settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveVoiceSettings(settings: VoiceSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving voice settings:', e);
  }
}
