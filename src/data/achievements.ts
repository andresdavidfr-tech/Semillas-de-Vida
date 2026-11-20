import { VERSE_LEVELS, WORLDS } from './verses';
import { SaveData } from '../utils/storage';

export type MedalTier = 'bronze' | 'silver' | 'gold';

export type AchievementIconKey =
  | 'sprout'
  | 'silver-medal'
  | 'compass'
  | 'gold-crown'
  | 'stars'
  | 'bullseye'
  | 'seeds'
  | 'palette';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  tier: MedalTier;
  iconKey: AchievementIconKey;
  getProgress: (save: SaveData) => { current: number; target: number };
}

function getCompletedWorldsCount(save: SaveData): number {
  let count = 0;
  for (const world of WORLDS) {
    const worldLevels = VERSE_LEVELS.filter((l) => l.worldId === world.id);
    if (worldLevels.length > 0 && worldLevels.every((l) => Boolean(save.completedLevels[l.id]))) {
      count++;
    }
  }
  return count;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-seed',
    title: 'Primer Brote',
    description: 'Memoriza tu primer versículo de la Biblia.',
    tier: 'bronze',
    iconKey: 'sprout',
    getProgress: (save) => ({
      current: Math.min(1, Object.keys(save.completedLevels).length),
      target: 1,
    }),
  },
  {
    id: 'avid-explorer',
    title: 'Explorador Ávido',
    description: 'Completa todos los niveles de un Mundo completo.',
    tier: 'gold',
    iconKey: 'compass',
    getProgress: (save) => ({
      current: Math.min(1, getCompletedWorldsCount(save)),
      target: 1,
    }),
  },
  {
    id: 'silver-memorizer',
    title: 'Memorizador de Plata',
    description: 'Memoriza 5 versículos completos en tu aventura.',
    tier: 'silver',
    iconKey: 'silver-medal',
    getProgress: (save) => ({
      current: Math.min(5, Object.keys(save.completedLevels).length),
      target: 5,
    }),
  },
  {
    id: 'perfect-star',
    title: 'Estrella Brillante',
    description: 'Gana 3 estrellas en 3 niveles distintos.',
    tier: 'silver',
    iconKey: 'stars',
    getProgress: (save) => {
      const threeStarCount = Object.values(save.completedLevels).filter((p) => p.stars >= 3).length;
      return {
        current: Math.min(3, threeStarCount),
        target: 3,
      };
    },
  },
  {
    id: 'faithful-memory',
    title: 'Memoria Fiel',
    description: 'Termina un nivel con 100% de precisión.',
    tier: 'bronze',
    iconKey: 'bullseye',
    getProgress: (save) => {
      const has100 = Object.values(save.completedLevels).some((p) => p.bestAccuracy >= 100);
      return {
        current: has100 ? 1 : 0,
        target: 1,
      };
    },
  },
  {
    id: 'picture-eyes',
    title: 'Ojos de Fe',
    description: 'Completa 3 aventuras en el módulo Solo Imágenes.',
    tier: 'bronze',
    iconKey: 'palette',
    getProgress: (save) => ({
      current: Math.min(3, Object.keys(save.completedPictureLevels).length),
      target: 3,
    }),
  },
  {
    id: 'seed-collector',
    title: 'Sembrador Fiel',
    description: 'Reúne 150 semillas doradas en tu jardín.',
    tier: 'silver',
    iconKey: 'seeds',
    getProgress: (save) => ({
      current: Math.min(150, save.totalSeeds),
      target: 150,
    }),
  },
  {
    id: 'gold-master',
    title: 'Maestro de Oro',
    description: 'Completa los 12 versículos de todo el jardín.',
    tier: 'gold',
    iconKey: 'gold-crown',
    getProgress: (save) => ({
      current: Math.min(VERSE_LEVELS.length, Object.keys(save.completedLevels).length),
      target: VERSE_LEVELS.length,
    }),
  },
];

export function isAchievementUnlocked(ach: AchievementDefinition, save: SaveData): boolean {
  const { current, target } = ach.getProgress(save);
  return current >= target;
}

export function getUnlockedAchievements(save: SaveData): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((ach) => isAchievementUnlocked(ach, save));
}
