import { GameState, UserProfile } from '../types/game';

const SAVE_KEY_PREFIX = 'openbattle_save_';
const PROFILE_KEY = 'openbattle_profile';
const SETTINGS_KEY = 'openbattle_settings';

export interface SaveMetadata {
  id: string;
  saveName: string;
  countryName: string;
  countryNameFa: string;
  flagEmoji: string;
  date: string;
  realTimestamp: number;
}

export function getSavedGamesList(): SaveMetadata[] {
  const saves: SaveMetadata[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SAVE_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const state: GameState = JSON.parse(raw);
          const pCountry = state.countries[state.playerCountryId];
          saves.push({
            id: key.replace(SAVE_KEY_PREFIX, ''),
            saveName: state.saveName || 'Campaign',
            countryName: pCountry?.name || 'Unknown',
            countryNameFa: pCountry?.nameFa || 'نامشخص',
            flagEmoji: pCountry?.flagEmoji || '🌐',
            date: state.currentDate,
            realTimestamp: Number(key.replace(SAVE_KEY_PREFIX, '')) || Date.now(),
          });
        }
      }
    }
  } catch (e) {
    console.error('Error listing saves', e);
  }
  return saves.sort((a, b) => b.realTimestamp - a.realTimestamp);
}

export function saveGame(state: GameState, customSlotId?: string): string {
  const slotId = customSlotId || `${Date.now()}`;
  const key = `${SAVE_KEY_PREFIX}${slotId}`;
  localStorage.setItem(key, JSON.stringify(state));
  return slotId;
}

export function loadGame(slotId: string): GameState | null {
  try {
    const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${slotId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.campaignId || !parsed.countries || !parsed.playerCountryId) {
      throw new Error('Invalid save state format');
    }
    return parsed as GameState;
  } catch (e) {
    console.error('Failed to load save', e);
    return null;
  }
}

export function deleteSave(slotId: string): void {
  localStorage.removeItem(`${SAVE_KEY_PREFIX}${slotId}`);
}

export function exportSaveToJSON(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

export function validateAndImportSave(jsonString: string): GameState | null {
  try {
    const obj = JSON.parse(jsonString);
    if (!obj.campaignId || !obj.countries || !obj.playerCountryId || !obj.currentDate) {
      return null;
    }
    return obj as GameState;
  } catch {
    return null;
  }
}

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaultProfile: UserProfile = {
    id: `usr_${Math.floor(100000 + Math.random() * 900000)}`,
    displayName: 'Supreme Commander',
    isGuest: true,
    avatarSeed: 'eagle',
    rank: 'Brigadier Strategist',
    elo: 1200,
    matchesPlayed: 1,
    victories: 0,
    preferredLanguage: 'en',
    createdAt: new Date().toISOString(),
  };
  saveUserProfile(defaultProfile);
  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
