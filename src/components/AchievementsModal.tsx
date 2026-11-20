import React from 'react';
import { Award, CheckCircle2, Lock, X } from 'lucide-react';
import { ACHIEVEMENTS, isAchievementUnlocked } from '../data/achievements';
import { SaveData } from '../utils/storage';
import { AchievementBadge } from './AchievementBadge';

interface AchievementsModalProps {
  save: SaveData;
  onClose: () => void;
}

const TIER_LABEL: Record<string, string> = {
  bronze: 'Bronce',
  silver: 'Plata',
  gold: 'Oro',
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ save, onClose }) => {
  const unlockedCount = ACHIEVEMENTS.filter((a) => isAchievementUnlocked(a, save)).length;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#1A2E22]/65 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-modal-title"
    >
      <div className="bg-[#FBF9F2] text-[#1A2E22] rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col border-2 border-amber-400 shadow-2xl overflow-hidden animate-gentle-pop">
        {/* Header */}
        <div className="bg-[#1B4332] text-white px-6 py-5 grid grid-cols-[40px_1fr_40px] items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#1A2E22] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-center">
            <h2 id="achievements-modal-title" className="font-display text-xl sm:text-2xl font-bold">
              Mis Logros y Medallas
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90">
              {unlockedCount} de {ACHIEVEMENTS.length} medallas desbloqueadas
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar logros"
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Medal Grid */}
        <div className="p-5 sm:p-7 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((ach) => {
            const { current, target } = ach.getProgress(save);
            const unlocked = current >= target;
            const pct = Math.min(100, Math.round((current / target) * 100));

            return (
              <div
                key={ach.id}
                className={`rounded-2xl border-2 p-5 flex flex-col items-center text-center gap-3 transition-all ${
                  unlocked
                    ? 'bg-white border-amber-400 shadow-sm'
                    : 'bg-[#F3EFE2] border-[#1B4332]/10'
                }`}
              >
                <AchievementBadge
                  iconKey={ach.iconKey}
                  tier={ach.tier}
                  unlocked={unlocked}
                  size="md"
                />
                <div className="w-full min-w-0">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Medalla {TIER_LABEL[ach.tier]}
                    </span>
                    <span aria-hidden="true" className="text-stone-300">·</span>
                    {unlocked ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Lograda
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500">
                        <Lock className="w-3 h-3" />
                        {current}/{target}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#1B4332] mt-1">
                    {ach.title}
                  </h3>
                  <p className="text-xs text-[#1A2E22]/75 leading-snug mt-1">
                    {ach.description}
                  </p>
                  <div className="w-full h-2 rounded-full bg-stone-200/80 overflow-hidden mt-3">
                    <div
                      className={`h-full transition-all duration-300 ${
                        unlocked ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
