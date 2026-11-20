import React from 'react';
import { ArrowLeft, Lock, Sprout, Star, Volume2, VolumeX, Music, Unlock, Play } from 'lucide-react';
import { VERSE_LEVELS, WORLDS, VerseLevel } from '../data/verses';
import { CharacterId, GAME_CHARACTERS, getCharacterById } from '../data/characters';
import {
  SaveData,
  getCompletedCount,
  getCurrentFrontierLevelNumber,
  getTotalStars,
  isLevelUnlocked,
} from '../utils/storage';
import { RewardEmblem } from './RewardEmblem';
import { CharacterAvatar } from './CharacterAvatar';

interface WorldMapProps {
  save: SaveData;
  onSelectLevel: (level: VerseLevel) => void;
  onOpenGarden: () => void;
  onBackTitle: () => void;
  onChangeCharacter: (id: CharacterId) => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onTogglePracticeAll: () => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  save,
  onSelectLevel,
  onOpenGarden,
  onBackTitle,
  onChangeCharacter,
  onToggleMute,
  onToggleMusic,
  onTogglePracticeAll,
}) => {
  const totalStars = getTotalStars(save);
  const completedCount = getCompletedCount(save);
  const maxStars = VERSE_LEVELS.length * 3;
  const frontierLevelNumber = getCurrentFrontierLevelNumber(save);
  const character = getCharacterById(save.characterId);
  const allCompleted = completedCount === VERSE_LEVELS.length;

  return (
    <div className="min-h-screen bg-[#FBF9F2] text-[#1A2E22] flex flex-col">
      {/* Compact Game HUD Header */}
      <header className="sticky top-0 z-20 bg-[#1B4332] text-white px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackTitle}
              aria-label="Volver al inicio"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold leading-tight">
                Mapa de Versículos
              </h1>
              <p className="text-xs text-emerald-100/85">
                {completedCount} de {VERSE_LEVELS.length} versículos memorizados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">

            <div className="flex items-center gap-4 text-sm font-bold font-mono tabular-nums px-2">
              <span className="inline-flex items-center gap-1.5 text-amber-300">
                <Star className="w-4 h-4 fill-amber-300" aria-hidden="true" />
                {totalStars}/{maxStars}
              </span>
              <span className="text-emerald-200">{save.totalSeeds} Semillas</span>
            </div>

            <button
              type="button"
              onClick={onOpenGarden}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#1A2E22] font-extrabold text-xs sm:text-sm shadow-[0_3px_0_#B45309] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sprout className="w-4 h-4" aria-hidden="true" />
              <span>Mi Jardín</span>
            </button>

            <button
              type="button"
              onClick={onToggleMusic}
              aria-label={save.musicEnabled ? 'Pausar música ambiental' : 'Activar música ambiental'}
              title={save.musicEnabled ? 'Música ambiental activa' : 'Música ambiental pausada'}
              className={`h-10 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                save.musicEnabled && !save.muted
                  ? 'bg-emerald-500/25 text-amber-200 hover:bg-emerald-500/35'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">{save.musicEnabled && !save.muted ? 'Música' : 'Off'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={save.muted ? 'Activar sonido' : 'Silenciar sonido'}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              {save.muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-7 space-y-9">
        {/* Character Adventure Trail: Always shows selected companion advancing with progress */}
        <section
          aria-label="Camino de avance del personaje"
          className="bg-white rounded-3xl border-2 border-[#1B4332]/15 p-5 sm:p-6 shadow-sm space-y-5"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <CharacterAvatar
                characterId={character.id}
                mood={allCompleted ? 'cheering' : 'idle'}
                size="md"
              />
              <div>
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Tu Compañero · {character.name}
                </div>
                <p className="font-display text-lg sm:text-xl font-bold text-[#1B4332]">
                  {allCompleted
                    ? '¡Llegamos al final del camino! Memorizaste los 12 versículos.'
                    : `¡Vamos en el Nivel ${frontierLevelNumber}! Completa el versículo para avanzar.`}
                </p>
              </div>
            </div>

            {/* Quick companion switch */}
            <div className="flex items-center gap-2" role="group" aria-label="Cambiar personaje">
              {GAME_CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => onChangeCharacter(char.id)}
                  title={char.name}
                  aria-label={`Elegir a ${char.name}`}
                  className={`p-1 rounded-xl border-2 transition-all cursor-pointer ${
                    char.id === character.id
                      ? `${char.bgTint} ${char.borderTint} scale-105`
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <CharacterAvatar characterId={char.id} mood="idle" size="xs" />
                </button>
              ))}
            </div>
          </div>

          {/* 12-Milestone Path where character physically advances */}
          <div className="relative pt-8 pb-2 overflow-x-auto">
            <div className="min-w-[600px] relative px-4">
              {/* Connecting Track */}
              <div className="h-2.5 bg-[#EFE9D8] rounded-full w-full relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-500"
                  style={{
                    width: `${
                      allCompleted
                        ? 100
                        : Math.round(((frontierLevelNumber - 1) / (VERSE_LEVELS.length - 1)) * 100)
                    }%`,
                  }}
                />
              </div>

              {/* 12 Nodes */}
              <div className="flex items-center justify-between -mt-5 relative">
                {VERSE_LEVELS.map((lvl) => {
                  const done = Boolean(save.completedLevels[lvl.id]);
                  const isHere = !allCompleted && lvl.levelNumber === frontierLevelNumber;
                  const isFinalHere = allCompleted && lvl.levelNumber === VERSE_LEVELS.length;
                  const unlocked = isLevelUnlocked(lvl.levelNumber, save);

                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => unlocked && onSelectLevel(lvl)}
                      title={`Nivel ${lvl.levelNumber}: ${lvl.reference}`}
                      className={`relative flex flex-col items-center group ${
                        unlocked ? 'cursor-pointer' : 'cursor-not-allowed'
                      }`}
                    >
                      {/* Character standing above current node */}
                      {(isHere || isFinalHere) && (
                        <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                          <CharacterAvatar
                            characterId={character.id}
                            mood={allCompleted ? 'cheering' : 'idle'}
                            size="xs"
                          />
                        </div>
                      )}

                      <span
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-transform ${
                          done
                            ? 'bg-emerald-600 border-emerald-700 text-white'
                            : isHere
                            ? 'bg-amber-400 border-amber-700 text-[#1A2E22] ring-4 ring-amber-200'
                            : 'bg-white border-stone-300 text-stone-400'
                        } ${unlocked ? 'group-hover:scale-110' : ''}`}
                      >
                        {lvl.levelNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Practice Mode Helper Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left gap-4 pb-3 border-b border-[#1B4332]/10">
          <div className="text-sm text-[#1A2E22]/80">
            Completa cada nivel para que {character.shortName} avance por todo el jardín.
          </div>
          <button
            type="button"
            onClick={onTogglePracticeAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#1B4332]/20 bg-white hover:bg-emerald-50 text-xs font-bold text-[#1B4332] transition-colors cursor-pointer whitespace-nowrap"
          >
            {save.unlockedAllPractice ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Práctica Libre Activa (Todos abiertos)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                <span>Abrir todos los niveles para practicar</span>
              </>
            )}
          </button>
        </div>

        {/* 4 Worlds */}
        {WORLDS.map((world) => {
          const levels = VERSE_LEVELS.filter((lvl) => lvl.worldId === world.id);
          return (
            <section key={world.id} aria-labelledby={`world-${world.id}`}>
              <div className="flex flex-col items-center text-center gap-1 mb-5">
                <span className="font-mono text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Mundo 0{world.id}
                </span>
                <h2
                  id={`world-${world.id}`}
                  className="font-display text-2xl sm:text-3xl font-bold text-[#1B4332]"
                >
                  {world.title}
                </h2>
                <span className="text-sm text-[#1A2E22]/65">
                  {world.subtitle}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {levels.map((level) => {
                  const progress = save.completedLevels[level.id];
                  const unlocked = isLevelUnlocked(level.levelNumber, save);
                  const stars = progress?.stars ?? 0;
                  const isFrontier = !allCompleted && level.levelNumber === frontierLevelNumber;

                  return (
                    <button
                      key={level.id}
                      type="button"
                      disabled={!unlocked}
                      onClick={() => unlocked && onSelectLevel(level)}
                      className={`group text-center rounded-2xl p-5 border-2 transition-all duration-150 flex flex-col items-center justify-between gap-4 min-h-[200px] ${
                        unlocked
                          ? progress
                            ? 'bg-white border-emerald-600/35 hover:border-emerald-600 shadow-sm hover:-translate-y-0.5 cursor-pointer'
                            : 'bg-white border-amber-500 shadow-[0_4px_0_#D97706] hover:-translate-y-0.5 cursor-pointer'
                          : 'bg-[#F2EFE4] border-[#1B4332]/10 opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2.5 w-full">
                        {isFrontier ? (
                          <CharacterAvatar characterId={character.id} mood="cheering" size="sm" />
                        ) : (
                          <RewardEmblem
                            iconKey={level.reward.iconKey}
                            unlocked={Boolean(progress)}
                            size="sm"
                          />
                        )}

                        <div>
                          <div className="text-xs font-bold text-[#1B4332]/65 font-mono tabular-nums">
                            Nivel {level.levelNumber} · {level.reference}
                          </div>
                          <h3 className="font-display text-xl font-bold text-[#1A2E22] mt-1">
                            {level.reward.name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-sm text-[#1A2E22]/75 line-clamp-2 leading-snug text-center">
                        {unlocked
                          ? `“${level.verseText}”`
                          : 'Completa el nivel anterior para descubrir este versículo.'}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1B4332]/10 w-full">
                        <div className="flex items-center gap-1" aria-label={`${stars} de 3 estrellas`}>
                          {[1, 2, 3].map((n) => (
                            <Star
                              key={n}
                              className={`w-4 h-4 ${
                                n <= stars
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1B4332]">
                          {unlocked ? (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                              {progress ? 'Practicar' : '¡Jugar!'}
                            </>
                          ) : (
                            <>
                              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                              Bloqueado
                            </>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};
