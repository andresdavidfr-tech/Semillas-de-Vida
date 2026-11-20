import React from 'react';
import { Star, ArrowRight, RotateCcw, Sprout, Map, Award } from 'lucide-react';
import { VerseLevel } from '../data/verses';
import { CharacterId, getCharacterById } from '../data/characters';
import { AchievementDefinition } from '../data/achievements';
import { RewardEmblem } from './RewardEmblem';
import { CharacterAvatar } from './CharacterAvatar';
import { AchievementBadge } from './AchievementBadge';

interface RoundSummaryModalProps {
  level: VerseLevel;
  characterId: CharacterId;
  stars: number;
  seedsEarned: number;
  accuracy: number;
  isNewUnlock: boolean;
  newlyUnlockedAchievements: AchievementDefinition[];
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenGarden: () => void;
  onBackToMap: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  level,
  characterId,
  stars,
  seedsEarned,
  accuracy,
  isNewUnlock,
  newlyUnlockedAchievements,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onOpenGarden,
  onBackToMap,
}) => {
  const character = getCharacterById(characterId);

  return (
    <div
      className="min-h-screen bg-[#1B4332] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-heading"
    >
      <div className="bg-[#FBF9F2] text-[#1A2E22] rounded-3xl max-w-xl w-full p-6 sm:p-10 border-4 border-amber-400 shadow-2xl text-center space-y-6 animate-gentle-pop">
        {/* Companion + Unlocked Emblem & Stars */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-5">
            <CharacterAvatar characterId={character.id} mood="cheering" size="lg" />
            <div className="animate-float-slow">
              <RewardEmblem iconKey={level.reward.iconKey} unlocked size="lg" />
            </div>
          </div>

          <div
            className="flex items-center justify-center gap-2"
            aria-label={`Ganaste ${stars} de 3 estrellas`}
          >
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={`w-10 h-10 transition-transform ${
                  n <= stars
                    ? 'text-amber-500 fill-amber-400 scale-105'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            {isNewUnlock
              ? `¡${character.shortName} celebra un Nuevo Tesoro!`
              : `¡${character.shortName} celebra tu repaso!`}
          </p>
          <h1
            id="victory-heading"
            className="font-display text-3xl sm:text-4xl font-bold text-[#1B4332] mt-1"
          >
            {level.reward.name}
          </h1>
          <p className="text-sm text-[#1A2E22]/75 mt-1">{level.reward.description}</p>
        </div>

        {/* Newly Unlocked Medals Banner */}
        {newlyUnlockedAchievements.length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 rounded-2xl p-4 space-y-3 text-left">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-900">
              <Award className="w-4 h-4 text-amber-600" />
              <span>
                {newlyUnlockedAchievements.length === 1
                  ? '¡Nueva Medalla Desbloqueada!'
                  : '¡Nuevas Medallas Desbloqueadas!'}
              </span>
            </div>
            <div className="space-y-2">
              {newlyUnlockedAchievements.map((ach) => (
                <div key={ach.id} className="flex items-center gap-3">
                  <AchievementBadge
                    iconKey={ach.iconKey}
                    tier={ach.tier}
                    unlocked
                    size="sm"
                  />
                  <div>
                    <div className="font-display text-base font-bold text-[#1B4332]">
                      {ach.title}
                    </div>
                    <div className="text-xs text-[#1A2E22]/75">{ach.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memorized Verse Keepsake */}
        <div className="bg-white rounded-2xl p-5 border border-[#1B4332]/15 space-y-2">
          <div className="text-xs font-mono font-bold text-amber-800">{level.reference}</div>
          <p className="font-display text-xl font-bold text-[#1A2E22] leading-relaxed">
            “{level.verseText}”
          </p>
        </div>

        {/* Tabular Stats Strip */}
        <div className="flex items-center justify-center gap-6 text-sm font-bold font-mono tabular-nums text-[#1B4332]">
          <span>+{seedsEarned} Semillas</span>
          <span aria-hidden="true">·</span>
          <span>Precisión: {accuracy}%</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {hasNextLevel ? (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-[#1B4332] hover:bg-[#143326] text-white font-extrabold text-base shadow-[0_4px_0_#0E241B] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Siguiente Nivel</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenGarden}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-[#1A2E22] font-extrabold text-base shadow-[0_4px_0_#B45309] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sprout className="w-5 h-5" />
              <span>Ver mi Árbol Completo</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenGarden}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-[#EFE9D8] hover:bg-[#E4DCC6] text-[#1B4332] font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sprout className="w-4 h-4" />
            <span>Mi Jardín</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-5 text-xs font-bold text-[#1B4332]/75">
          <button
            type="button"
            onClick={onReplay}
            className="inline-flex items-center gap-1.5 hover:text-[#1B4332] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Jugar de Nuevo</span>
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            onClick={onBackToMap}
            className="inline-flex items-center gap-1.5 hover:text-[#1B4332] cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Mapa de Niveles</span>
          </button>
        </div>
      </div>
    </div>
  );
};
