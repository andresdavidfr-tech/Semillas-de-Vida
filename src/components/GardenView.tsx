import React, { useState } from 'react';
import { ArrowLeft, Volume2, Sprout, X, Star } from 'lucide-react';
import { VERSE_LEVELS, VerseLevel } from '../data/verses';
import { getCharacterById } from '../data/characters';
import { SaveData, getCompletedCount, getTotalStars } from '../utils/storage';
import { RewardEmblem } from './RewardEmblem';
import { CharacterAvatar } from './CharacterAvatar';
import { sound } from '../utils/audio';

interface GardenViewProps {
  save: SaveData;
  onBack: () => void;
  onPlayLevel: (level: VerseLevel) => void;
}

function getTreeStage(count: number): { name: string; message: string } {
  if (count === 0) {
    return {
      name: 'Semilla Plantada',
      message: 'Completa tu primer versículo para ver brotar tu Árbol de la Vida.',
    };
  }
  if (count <= 3) {
    return {
      name: 'Brote Tierno',
      message: '¡Tu pequeño brote está recibiendo la luz de la Palabra!',
    };
  }
  if (count <= 6) {
    return {
      name: 'Árbol Joven',
      message: 'Tus raíces crecen fuertes junto al río de agua de vida.',
    };
  }
  if (count <= 11) {
    return {
      name: 'Árbol Frondoso',
      message: '¡Qué hermoso crece tu jardín! Ya casi das todos los frutos.',
    };
  }
  return {
    name: 'Árbol de Vida Pleno',
    message: '¡Felicidades! Has atesorado los 12 versículos bíblicos.',
  };
}

export const GardenView: React.FC<GardenViewProps> = ({ save, onBack, onPlayLevel }) => {
  const [selectedLevel, setSelectedLevel] = useState<VerseLevel | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const completedCount = getCompletedCount(save);
  const totalStars = getTotalStars(save);
  const stage = getTreeStage(completedCount);
  const character = getCharacterById(save.characterId);

  const handleSpeak = (lvl: VerseLevel) => {
    setSpeechError(null);
    void sound.speakVerse(lvl.reference, lvl.verseText, {
      characterId: character.id,
      onLoading: () => setSpeechLoading(true),
      onStart: () => {
        setSpeechLoading(false);
        setIsSpeaking(true);
      },
      onEnd: () => {
        setSpeechLoading(false);
        setIsSpeaking(false);
      },
      onError: (msg) => {
        setSpeechLoading(false);
        setIsSpeaking(false);
        setSpeechError(msg);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FBF9F2] text-[#1A2E22] flex flex-col">
      {/* Compact Header */}
      <header className="sticky top-0 z-20 bg-[#1B4332] text-white px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Volver al mapa"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold">
                Mi Jardín y Tesoros
              </h1>
              <p className="text-xs text-emerald-100/85">
                {completedCount} de {VERSE_LEVELS.length} frutos · ★ {totalStars} estrellas · {save.totalSeeds} semillas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            Volver al Mapa
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* Living Tree Hero Section with Companion */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-white rounded-3xl border border-[#1B4332]/15 overflow-hidden shadow-sm">
          <div className="lg:col-span-6 relative min-h-[260px] bg-emerald-50">
            <img
              src="/src/assets/images/tree_of_life_garden_1795122515371.jpg"
              alt="El Árbol de la Vida junto al río de agua viva"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-center gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                <Sprout className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Etapa de Crecimiento</span>
              </div>
              <CharacterAvatar
                characterId={character.id}
                mood={completedCount > 0 ? 'cheering' : 'idle'}
                size="sm"
              />
            </div>

            <h2 className="font-display text-3xl font-bold text-[#1B4332]">
              {stage.name}
            </h2>
            <p className="text-base text-[#1A2E22]/80 leading-relaxed">
              {stage.message}
            </p>

            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-bold font-mono tabular-nums text-[#1B4332] mb-2">
                <span>Frutos de la Palabra</span>
                <span>{completedCount} / {VERSE_LEVELS.length}</span>
              </div>
              <div className="w-full h-4 rounded-full bg-[#EFE9D8] overflow-hidden border border-[#1B4332]/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.round((completedCount / VERSE_LEVELS.length) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 12 Collectible Treasure Emblems */}
        <section>
          <div className="mb-5">
            <h2 className="font-display text-2xl font-bold text-[#1B4332]">
              Cofre de 12 Tesoros
            </h2>
            <p className="text-sm text-[#1A2E22]/75">
              Toca cualquier tesoro desbloqueado para leer o escuchar su versículo guardado.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {VERSE_LEVELS.map((level) => {
              const progress = save.completedLevels[level.id];
              const unlocked = Boolean(progress);

              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => {
                    sound.playTap();
                    setSelectedLevel(level);
                  }}
                  className={`p-5 rounded-2xl border-2 text-left flex flex-col items-center text-center gap-3 transition-all duration-150 cursor-pointer ${
                    unlocked
                      ? 'bg-white border-amber-300 hover:border-amber-500 hover:-translate-y-0.5 shadow-sm'
                      : 'bg-[#F3EFE2] border-[#1B4332]/10 opacity-75 hover:opacity-95'
                  }`}
                >
                  <RewardEmblem
                    iconKey={level.reward.iconKey}
                    unlocked={unlocked}
                    size="md"
                  />
                  <div>
                    <div className="text-xs font-mono font-bold text-[#1B4332]/65">
                      {level.reference}
                    </div>
                    <div className="font-display text-base font-bold text-[#1A2E22] mt-0.5">
                      {level.reward.name}
                    </div>
                  </div>
                  {unlocked ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((n) => (
                        <Star
                          key={n}
                          className={`w-3.5 h-3.5 ${
                            n <= (progress?.stars ?? 0)
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-[#1A2E22]/55">
                      Por descubrir
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Keepsake Card Modal */}
      {selectedLevel && (
        <div
          className="fixed inset-0 z-50 bg-[#1A2E22]/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="keepsake-title"
        >
          <div className="bg-[#FBF9F2] rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-amber-400 shadow-xl animate-gentle-pop relative">
            <button
              type="button"
              onClick={() => {
                sound.stopSpeech();
                setIsSpeaking(false);
                setSelectedLevel(null);
              }}
              aria-label="Cerrar tarjeta"
              className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-stone-200/70 hover:bg-stone-200 flex items-center justify-center cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex items-center gap-3">
                <RewardEmblem
                  iconKey={selectedLevel.reward.iconKey}
                  unlocked={Boolean(save.completedLevels[selectedLevel.id])}
                  size="lg"
                />
                <CharacterAvatar
                  characterId={character.id}
                  mood={isSpeaking ? 'speaking' : 'idle'}
                  size="md"
                />
              </div>

              <div>
                <div className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
                  {selectedLevel.reference}
                </div>
                <h3
                  id="keepsake-title"
                  className="font-display text-2xl font-bold text-[#1B4332] mt-1"
                >
                  {selectedLevel.reward.name}
                </h3>
              </div>

              {save.completedLevels[selectedLevel.id] ? (
                <>
                  <blockquote className="font-display text-xl text-[#1A2E22] leading-relaxed bg-white p-5 rounded-2xl border border-[#1B4332]/15">
                    “{selectedLevel.verseText}”
                  </blockquote>
                  <p className="text-sm text-[#1A2E22]/80 leading-relaxed">
                    {selectedLevel.kidNote}
                  </p>
                  {speechError && (
                    <div className="text-xs font-bold text-red-800 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                      <p>{speechError}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={speechLoading}
                      onClick={() => handleSpeak(selectedLevel)}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1B4332] hover:bg-[#143326] disabled:opacity-70 text-white font-bold text-sm cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>
                        {speechLoading
                          ? 'Preparando voz...'
                          : isSpeaking
                          ? `${character.shortName} leyendo...`
                          : `Escuchar con ${character.shortName}`}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.stopSpeech();
                        setIsSpeaking(false);
                        const lvl = selectedLevel;
                        setSelectedLevel(null);
                        onPlayLevel(lvl);
                      }}
                      className="px-5 py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-[#1A2E22] font-bold text-sm cursor-pointer"
                    >
                      Repasar Nivel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-[#1A2E22]/75 leading-relaxed">
                    Este tesoro se desbloqueará cuando memorices <strong>{selectedLevel.reference}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const lvl = selectedLevel;
                      setSelectedLevel(null);
                      onPlayLevel(lvl);
                    }}
                    className="px-6 py-3 rounded-xl bg-[#1B4332] text-white font-bold text-sm cursor-pointer"
                  >
                    Ir al Mapa
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
