import React, { useEffect } from 'react';
import { Volume2, VolumeX, Music, Sprout, Play, BookOpen } from 'lucide-react';
import { AgeGroup } from '../data/verses';
import { CharacterId, GAME_CHARACTERS, getCharacterById } from '../data/characters';
import { CharacterAvatar } from './CharacterAvatar';

interface TitleScreenProps {
  ageGroup: AgeGroup;
  onChangeAgeGroup: (group: AgeGroup) => void;
  characterId: CharacterId;
  onChangeCharacter: (id: CharacterId) => void;
  muted: boolean;
  onToggleMute: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  totalStars: number;
  maxStars: number;
  completedCount: number;
  totalLevels: number;
  onStart: () => void;
  onOpenGarden: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  ageGroup,
  onChangeAgeGroup,
  characterId,
  onChangeCharacter,
  muted,
  onToggleMute,
  musicEnabled,
  onToggleMusic,
  totalStars,
  maxStars,
  completedCount,
  totalLevels,
  onStart,
  onOpenGarden,
}) => {
  const selectedCharacter = getCharacterById(characterId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const activeTag = document.activeElement?.tagName;
        if (activeTag !== 'BUTTON') {
          e.preventDefault();
          onStart();
        }
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart, onToggleMute]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex flex-col justify-between bg-[#F3EEDB]">
      {/* Atmospheric Storybook Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/title_garden_backdrop_1795122515452.jpg"
          alt="Valle soleado con arroyo cristalino y árbol de vida"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#FBF9F2]/96 via-[#FBF9F2]/85 to-[#FBF9F2]/20 md:via-[#FBF9F2]/75 md:to-transparent"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#1A2E22]/75 via-[#1A2E22]/30 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Top Minimal Floating Controls */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#1B4332]">
          <BookOpen className="w-4 h-4 text-amber-700" aria-hidden="true" />
          <span>Versión Recobro</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#1B4332]/75">Living Stream Ministry</span>
        </div>

        <div className="flex items-center gap-3">
          {completedCount > 0 && (
            <button
              type="button"
              onClick={onOpenGarden}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 hover:bg-white text-[#1B4332] font-semibold text-sm border border-[#1B4332]/15 shadow-sm transition-transform duration-150 active:scale-95 whitespace-nowrap cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Mi Jardín</span>
              <span className="font-mono tabular-nums text-amber-700">
                {completedCount}/{totalLevels}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={musicEnabled ? 'Pausar música ambiental' : 'Activar música ambiental'}
            title={musicEnabled ? 'Música ambiental activa' : 'Música ambiental pausada'}
            className={`h-11 px-3 rounded-xl border shadow-sm flex items-center gap-1.5 text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer ${
              musicEnabled && !muted
                ? 'bg-emerald-50 text-[#1B4332] border-emerald-300'
                : 'bg-white/90 text-[#1B4332]/60 border-[#1B4332]/15'
            }`}
          >
            <Music className="w-4 h-4" />
            <span className="hidden sm:inline">{musicEnabled && !muted ? 'Música' : 'Sin música'}</span>
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
            className="w-11 h-11 rounded-xl bg-white/90 hover:bg-white text-[#1B4332] border border-[#1B4332]/15 shadow-sm flex items-center justify-center transition-transform duration-150 active:scale-95 cursor-pointer"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Hero Lockup + Companion Selector */}
      <main className="relative z-10 flex-1 flex items-center px-6 sm:px-10 md:px-16 py-6">
        <div className="max-w-2xl w-full space-y-5">
          {/* Bespoke Inline SVG Title Lockup */}
          <div>
            <svg
              viewBox="0 0 460 112"
              className="w-full max-w-[390px] h-auto"
              role="img"
              aria-label="Semillas de Vida"
            >
              <g transform="translate(4, 10)">
                <path
                  d="M28 58 C28 32, 48 14, 62 12 C60 32, 48 52, 28 58 Z"
                  fill="#15803D"
                />
                <path
                  d="M28 58 C12 44, 6 26, 12 12 C24 18, 30 36, 28 58 Z"
                  fill="#22C55E"
                />
                <circle cx="34" cy="70" r="6" fill="#D97706" />
                <path
                  d="M28 56 L28 76"
                  stroke="#78350F"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>
              <text
                x="80"
                y="52"
                fill="#1B4332"
                fontFamily="Fraunces, Georgia, serif"
                fontWeight="700"
                fontSize="42"
                letterSpacing="-0.5"
              >
                Semillas de
              </text>
              <text
                x="80"
                y="96"
                fill="#B45309"
                fontFamily="Fraunces, Georgia, serif"
                fontWeight="700"
                fontSize="44"
                letterSpacing="-0.5"
              >
                Vida
              </text>
            </svg>
            <p className="text-base sm:text-lg text-[#1A2E22] font-medium leading-relaxed mt-1 max-w-lg text-balance">
              Elige a tu amigo de aventura para aprender, ordenar y atesorar versículos de la Biblia.
            </p>
          </div>

          {/* Character Companion Selector */}
          <div className="bg-white/90 rounded-2xl p-4 border border-[#1B4332]/15 shadow-sm max-w-xl">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold tracking-wide text-[#1B4332]">
                Elige tu personaje compañero
              </span>
              <span className="text-xs font-semibold text-amber-800">
                {selectedCharacter.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {GAME_CHARACTERS.map((char) => {
                const isSelected = char.id === characterId;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => onChangeCharacter(char.id)}
                    className={`p-2.5 rounded-xl border-2 flex flex-col items-center text-center gap-1.5 transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? `${char.bgTint} ${char.borderTint} shadow-sm scale-[1.02]`
                        : 'bg-[#FBF9F2] border-transparent hover:border-[#1B4332]/20'
                    }`}
                  >
                    <CharacterAvatar
                      characterId={char.id}
                      mood={isSelected ? 'cheering' : 'idle'}
                      size="sm"
                    />
                    <span className="text-xs font-extrabold text-[#1A2E22] leading-tight">
                      {char.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-[#1A2E22]/75 mt-3 font-medium">
              “{selectedCharacter.tagline}”
            </p>
          </div>

          {/* Age Mode Selector + Primary CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="inline-flex p-1.5 rounded-2xl bg-[#EAE4D2] border border-[#1B4332]/15 gap-1.5"
              role="group"
              aria-label="Selector de edad"
            >
              <button
                type="button"
                onClick={() => onChangeAgeGroup('young')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  ageGroup === 'young'
                    ? 'bg-white text-[#1B4332] shadow-sm'
                    : 'text-[#1B4332]/70 hover:text-[#1B4332]'
                }`}
              >
                Pequeños · 6–8 años
              </button>
              <button
                type="button"
                onClick={() => onChangeAgeGroup('explorer')}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  ageGroup === 'explorer'
                    ? 'bg-white text-[#1B4332] shadow-sm'
                    : 'text-[#1B4332]/70 hover:text-[#1B4332]'
                }`}
              >
                Exploradores · 9–11 años
              </button>
            </div>

            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#1B4332] hover:bg-[#143326] text-white text-lg font-extrabold shadow-[0_5px_0_#0E241B] active:translate-y-0.5 active:shadow-[0_3px_0_#0E241B] transition-all duration-150 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-current" aria-hidden="true" />
              <span>{completedCount > 0 ? 'Continuar Aventura' : '¡Comenzar a Jugar!'}</span>
            </button>

            {totalStars > 0 && (
              <div className="text-sm font-bold text-[#1B4332] font-mono tabular-nums">
                ★ {totalStars} / {maxStars} estrellas
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Single Flat Control-Hint Line */}
      <footer className="relative z-10 px-6 sm:px-10 pb-4 pt-2 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-medium text-white/95">
        <span>Toca las palabras · Enter Iniciar · H Pista · M Sonido</span>
        <span className="text-white/80">12 Niveles · 12 Tesoros por descubrir</span>
      </footer>
    </div>
  );
};
