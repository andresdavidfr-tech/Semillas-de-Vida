import { VERSE_LEVELS } from '../data/verses';
import { CharacterId } from '../data/characters';

export interface LevelProgress {
  stars: number;
  bestAccuracy: number;
  completedAt: number;
}

export interface SaveData {
  characterId: CharacterId;
  muted: boolean;
  musicEnabled: boolean;
  totalSeeds: number;
  completedLevels: Record<string, LevelProgress>;
  unlockedAllPractice: boolean;
}

const STORAGE_KEY = 'semillas_de_vida_save_v2';

const DEFAULT_SAVE: SaveData = {
  characterId: 'lamb',
  muted: false,
  musicEnabled: true,
  totalSeeds: 0,
  completedLevels: {},
  unlockedAllPractice: false,
};

const VALID_CHARACTERS: CharacterId[] = ['lamb', 'dove', 'lion', 'squirrel'];

export function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('semillas_de_vida_save_v1');
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const charId =
      parsed.characterId && VALID_CHARACTERS.includes(parsed.characterId)
        ? parsed.characterId
        : 'lamb';
    return {
      characterId: charId,
      muted: Boolean(parsed.muted),
      musicEnabled: parsed.musicEnabled !== false,
      totalSeeds: typeof parsed.totalSeeds === 'number' ? parsed.totalSeeds : 0,
      completedLevels:
        parsed.completedLevels && typeof parsed.completedLevels === 'object'
          ? parsed.completedLevels
          : {},
      unlockedAllPractice: Boolean(parsed.unlockedAllPractice),
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function persistSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore storage quota failures
  }
}

export function isLevelUnlocked(levelNumber: number, save: SaveData): boolean {
  if (save.unlockedAllPractice || levelNumber === 1) return true;
  const previousLevel = VERSE_LEVELS.find((lvl) => lvl.levelNumber === levelNumber - 1);
  if (!previousLevel) return false;
  return Boolean(save.completedLevels[previousLevel.id]);
}

export function getTotalStars(save: SaveData): number {
  return Object.values(save.completedLevels).reduce((acc, item) => acc + item.stars, 0);
}

export function getCompletedCount(save: SaveData): number {
  return Object.keys(save.completedLevels).length;
}

export function getCurrentFrontierLevelNumber(save: SaveData): number {
  for (const lvl of VERSE_LEVELS) {
    if (!save.completedLevels[lvl.id]) {
      return lvl.levelNumber;
    }
  }
  return VERSE_LEVELS.length;
}
