export type CharacterId = 'lamb' | 'dove' | 'lion' | 'squirrel';

export interface GameCharacter {
  id: CharacterId;
  name: string;
  shortName: string;
  tagline: string;
  voicePitch: number;
  voiceRate: number;
  bgTint: string;
  borderTint: string;
  accentColor: string;
}

export const GAME_CHARACTERS: GameCharacter[] = [
  {
    id: 'lamb',
    name: 'Corderito Lucas',
    shortName: 'Lucas',
    tagline: '¡El Buen Pastor nos guía en cada versículo!',
    voicePitch: 1.2,
    voiceRate: 0.88,
    bgTint: 'bg-emerald-50',
    borderTint: 'border-emerald-500',
    accentColor: '#15803D',
  },
  {
    id: 'dove',
    name: 'Palomita Paz',
    shortName: 'Paz',
    tagline: '¡Volemos juntos aprendiendo la Palabra!',
    voicePitch: 1.26,
    voiceRate: 0.89,
    bgTint: 'bg-sky-50',
    borderTint: 'border-sky-500',
    accentColor: '#0284C7',
  },
  {
    id: 'lion',
    name: 'Leoncito Valiente',
    shortName: 'Valiente',
    tagline: '¡Con valentía y gozo memorizamos hoy!',
    voicePitch: 1.12,
    voiceRate: 0.9,
    bgTint: 'bg-amber-50',
    borderTint: 'border-amber-500',
    accentColor: '#D97706',
  },
  {
    id: 'squirrel',
    name: 'Ardillita Semilla',
    shortName: 'Semilla',
    tagline: '¡Atesoremos cada palabra en el corazón!',
    voicePitch: 1.24,
    voiceRate: 0.9,
    bgTint: 'bg-orange-50',
    borderTint: 'border-orange-500',
    accentColor: '#EA580C',
  },
];

export function getCharacterById(id: CharacterId): GameCharacter {
  return GAME_CHARACTERS.find((c) => c.id === id) ?? GAME_CHARACTERS[0];
}
