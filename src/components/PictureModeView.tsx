import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  Volume2,
  VolumeX,
  Music,
  Star,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Layers,
} from 'lucide-react';
import { CharacterId, getCharacterById } from '../data/characters';
import { PICTURE_LEVELS, PictureLevel, PictureScene, SceneIconKey } from '../data/pictureLevels';
import { SaveData, getPictureCompletedCount } from '../utils/storage';
import { CharacterAvatar, AvatarMood } from './CharacterAvatar';
import { SceneIllustration } from './SceneIllustration';
import { sound } from '../utils/audio';

type PicturePhase = 'MAP' | 'LISTEN_SCENES' | 'MATCH_PICTURE' | 'ORDER_SCENES' | 'VICTORY';

interface PictureModeViewProps {
  save: SaveData;
  characterId: CharacterId;
  muted: boolean;
  onToggleMute: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onBackToMenu: () => void;
  onCompletePictureLevel: (levelId: string, stars: number, seedsEarned: number) => void;
}

interface PictureTile {
  uid: string;
  scene: PictureScene;
  used: boolean;
}

interface MatchOption {
  uid: string;
  iconKey: SceneIconKey;
  isTarget: boolean;
}

interface SceneWindow {
  id: string;
  index: number;
  startFrac: number;
  endFrac: number;
}

const SPOKEN_NUMBER_WORDS: Record<string, string> = {
  '1': 'uno',
  '3': 'tres',
  '4': 'cuatro',
  '6': 'seis',
  '8': 'ocho',
  '14': 'catorce',
  '16': 'dieciséis',
  '23': 'veintitrés',
  '105': 'ciento cinco',
  '119': 'ciento diecinueve',
};

function computeSpokenWeight(text: string): number {
  const expanded = text.replace(/\b\d+\b/g, (num) => SPOKEN_NUMBER_WORDS[num] ?? num.repeat(3));
  const commas = (expanded.match(/[,;:]/g) ?? []).length;
  const stops = (expanded.match(/[.!?]/g) ?? []).length;
  return expanded.length + commas * 4 + stops * 7;
}

function computeSceneWindows(level: PictureLevel): {
  introEndFrac: number;
  windows: SceneWindow[];
} {
  const citationWeight = computeSpokenWeight(level.citation);
  const sceneWeights = level.scenes.map((s) => Math.max(8, computeSpokenWeight(s.spokenPhrase)));
  const totalWeight = citationWeight + sceneWeights.reduce((acc, w) => acc + w, 0);

  let cursor = citationWeight;
  const introEndFrac = citationWeight / totalWeight;
  const windows: SceneWindow[] = level.scenes.map((scene, index) => {
    const startFrac = cursor / totalWeight;
    cursor += sceneWeights[index];
    const endFrac = index === level.scenes.length - 1 ? 1 : cursor / totalWeight;
    return {
      id: scene.id,
      index,
      startFrac,
      endFrac,
    };
  });

  return { introEndFrac, windows };
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const PictureModeView: React.FC<PictureModeViewProps> = ({
  save,
  characterId,
  muted,
  onToggleMute,
  musicEnabled,
  onToggleMusic,
  onBackToMenu,
  onCompletePictureLevel,
}) => {
  const character = getCharacterById(characterId);
  const [phase, setPhase] = useState<PicturePhase>('MAP');
  const [activeLevel, setActiveLevel] = useState<PictureLevel>(PICTURE_LEVELS[0]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [recitingMode, setRecitingMode] = useState<'idle' | 'intro-help' | 'verse' | 'step-by-step' | 'single'>('idle');
  const [reciteStage, setReciteStage] = useState<'idle' | 'citation' | 'scene'>('idle');
  const [reciteProgress, setReciteProgress] = useState(0);
  const [passedSceneIdx, setPassedSceneIdx] = useState<number>(-1);

  const speechSeqRef = useRef(0);
  const stepTimerRef = useRef<number | null>(null);
  const hasShownInitialHelpRef = useRef(false);

  // Step 2: Visual Match
  const [matchOptions, setMatchOptions] = useState<MatchOption[]>([]);
  const [matchDone, setMatchDone] = useState(false);
  const [shakingUid, setShakingUid] = useState<string | null>(null);

  // Step 3: Order Pictures
  const [placedScenes, setPlacedScenes] = useState<PictureScene[]>([]);
  const [orderBank, setOrderBank] = useState<PictureTile[]>([]);
  const [mistakes, setMistakes] = useState(0);

  const completedCount = getPictureCompletedCount(save);

  const clearScheduledSpeech = useCallback(() => {
    speechSeqRef.current += 1;
    if (stepTimerRef.current !== null) {
      window.clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  const resetReciteVisuals = useCallback(() => {
    setActiveSceneId(null);
    setRecitingMode('idle');
    setReciteStage('idle');
    setReciteProgress(0);
    setPassedSceneIdx(-1);
  }, []);

  const speakPrompt = useCallback(
    (
      text: string,
      opts?: {
        syncLevel?: PictureLevel;
        mode?: 'intro-help' | 'verse' | 'step-by-step' | 'single';
        singleSceneId?: string;
        onDone?: () => void;
      }
    ) => {
      clearScheduledSpeech();
      const seq = speechSeqRef.current;
      const mode = opts?.mode ?? (opts?.syncLevel ? 'verse' : 'single');
      const syncData = opts?.syncLevel ? computeSceneWindows(opts.syncLevel) : null;

      setRecitingMode(mode);
      if (opts?.singleSceneId) {
        setActiveSceneId(opts.singleSceneId);
        setReciteStage('scene');
        setPassedSceneIdx(-1);
      } else if (opts?.syncLevel) {
        setActiveSceneId(null);
        setReciteStage('citation');
        setReciteProgress(0);
        setPassedSceneIdx(-1);
      } else {
        setActiveSceneId(null);
        setReciteStage('idle');
        setReciteProgress(0);
        setPassedSceneIdx(-1);
      }

      void sound.speakText(text, {
        characterId: character.id,
        onLoading: () => {
          if (speechSeqRef.current !== seq) return;
          setSpeechLoading(true);
        },
        onStart: () => {
          if (speechSeqRef.current !== seq) return;
          setSpeechLoading(false);
          setIsSpeaking(true);
        },
        onProgress: (currentTime, duration) => {
          if (speechSeqRef.current !== seq || !syncData || duration <= 0) return;
          const adjusted = Math.max(
            0,
            Math.min(1, (currentTime - 0.06) / Math.max(0.25, duration - 0.22))
          );
          setReciteProgress(adjusted);

          if (adjusted < syncData.introEndFrac) {
            setReciteStage('citation');
            setActiveSceneId(null);
            setPassedSceneIdx(-1);
            return;
          }

          const activeWin =
            syncData.windows.find(
              (w) => adjusted >= w.startFrac && adjusted <= w.endFrac
            ) ?? syncData.windows[syncData.windows.length - 1];

          if (activeWin) {
            setReciteStage('scene');
            setActiveSceneId(activeWin.id);
            setPassedSceneIdx(activeWin.index - 1);
          }
        },
        onEnd: () => {
          if (speechSeqRef.current !== seq) return;
          setSpeechLoading(false);
          setIsSpeaking(false);
          if (opts?.onDone) {
            opts.onDone();
          } else {
            resetReciteVisuals();
          }
        },
        onError: () => {
          if (speechSeqRef.current !== seq) return;
          setSpeechLoading(false);
          setIsSpeaking(false);
          resetReciteVisuals();
        },
      });
    },
    [character.id, clearScheduledSpeech, resetReciteVisuals]
  );

  const playSyncedVerse = useCallback(
    (level: PictureLevel, withInitialHelp: boolean = false) => {
      if (withInitialHelp) {
        speakPrompt(
          'Mira cómo brilla cada dibujo al escuchar sus palabras.',
          {
            mode: 'intro-help',
            onDone: () => {
              speakPrompt(level.fullSpokenVerse, {
                syncLevel: level,
                mode: 'verse',
              });
            },
          }
        );
        return;
      }

      speakPrompt(level.fullSpokenVerse, {
        syncLevel: level,
        mode: 'verse',
      });
    },
    [speakPrompt]
  );

  const playStepByStepGuide = useCallback(
    (level: PictureLevel) => {
      clearScheduledSpeech();
      const seq = speechSeqRef.current;

      const speakStep = (index: number) => {
        if (speechSeqRef.current !== seq) return;
        if (index >= level.scenes.length) {
          resetReciteVisuals();
          return;
        }
        const scene = level.scenes[index];
        setRecitingMode('step-by-step');
        setReciteStage('scene');
        setActiveSceneId(scene.id);
        setPassedSceneIdx(index - 1);
        setReciteProgress((index + 1) / level.scenes.length);

        void sound.speakText(scene.spokenPhrase, {
          characterId: character.id,
          onLoading: () => {
            if (speechSeqRef.current !== seq) return;
            setSpeechLoading(true);
          },
          onStart: () => {
            if (speechSeqRef.current !== seq) return;
            setSpeechLoading(false);
            setIsSpeaking(true);
          },
          onEnd: () => {
            if (speechSeqRef.current !== seq) return;
            setSpeechLoading(false);
            setIsSpeaking(false);
            setPassedSceneIdx(index);
            stepTimerRef.current = window.setTimeout(() => {
              speakStep(index + 1);
            }, 320);
          },
          onError: () => {
            if (speechSeqRef.current !== seq) return;
            setSpeechLoading(false);
            setIsSpeaking(false);
            resetReciteVisuals();
          },
        });
      };

      speakStep(0);
    },
    [character.id, clearScheduledSpeech, resetReciteVisuals]
  );

  useEffect(() => {
    return () => {
      clearScheduledSpeech();
      sound.stopSpeech();
    };
  }, [clearScheduledSpeech]);

  const startLevel = useCallback(
    (level: PictureLevel) => {
      sound.playTap();
      setActiveLevel(level);
      resetReciteVisuals();
      setMatchDone(false);
      setPlacedScenes([]);
      setMistakes(0);
      setPhase('LISTEN_SCENES');

      const showInitialHelp = !hasShownInitialHelpRef.current;
      hasShownInitialHelpRef.current = true;
      playSyncedVerse(level, showInitialHelp);
    },
    [playSyncedVerse, resetReciteVisuals]
  );

  const startMatchStep = useCallback(() => {
    sound.playTap();
    resetReciteVisuals();
    const targetScene =
      activeLevel.scenes.find((s) => s.id === activeLevel.targetSceneId) ?? activeLevel.scenes[0];
    const options: MatchOption[] = shuffle([
      { uid: 'target', iconKey: targetScene.iconKey, isTarget: true },
      ...activeLevel.distractorIcons.map((iconKey, idx) => ({
        uid: `dist-${idx}`,
        iconKey,
        isTarget: false,
      })),
    ]);
    setMatchOptions(options);
    setMatchDone(false);
    setShakingUid(null);
    setPhase('MATCH_PICTURE');
    speakPrompt(activeLevel.questionPrompt);
  }, [activeLevel, resetReciteVisuals, speakPrompt]);

  const startOrderStep = useCallback(() => {
    sound.playTap();
    resetReciteVisuals();
    const tiles: PictureTile[] = activeLevel.scenes.map((scene) => ({
      uid: scene.id,
      scene,
      used: false,
    }));
    setOrderBank(shuffle(tiles));
    setPlacedScenes([]);
    setShakingUid(null);
    setPhase('ORDER_SCENES');
    speakPrompt('¡Muy bien! Ahora toca los dibujos en orden desde el principio.');
  }, [activeLevel, resetReciteVisuals, speakPrompt]);

  const handleTapListenScene = (scene: PictureScene) => {
    sound.playPop();
    speakPrompt(scene.spokenPhrase, {
      mode: 'single',
      singleSceneId: scene.id,
    });
  };

  const handleTapMatchOption = (opt: MatchOption) => {
    if (matchDone) return;
    if (opt.isTarget) {
      sound.playStageClear();
      setMatchDone(true);
      speakPrompt('¡Bravo! Ese es el dibujo correcto.');
    } else {
      sound.playError();
      setMistakes((m) => m + 1);
      setShakingUid(opt.uid);
      setTimeout(() => setShakingUid(null), 260);
      speakPrompt('Prueba con otro dibujo.');
    }
  };

  const handleTapOrderTile = (tile: PictureTile) => {
    if (tile.used) return;
    const expected = activeLevel.scenes[placedScenes.length];
    if (!expected) return;

    if (tile.scene.id === expected.id) {
      sound.playPop();
      const nextPlaced = [...placedScenes, tile.scene];
      setPlacedScenes(nextPlaced);
      setOrderBank((prev) =>
        prev.map((t) => (t.uid === tile.uid ? { ...t, used: true } : t))
      );

      if (nextPlaced.length === activeLevel.scenes.length) {
        clearScheduledSpeech();
        const winSeq = speechSeqRef.current;
        sound.playLevelWin();
        const stars = mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1;
        onCompletePictureLevel(activeLevel.id, stars, 20);
        setPhase('VICTORY');
        stepTimerRef.current = window.setTimeout(() => {
          if (speechSeqRef.current !== winSeq) return;
          speakPrompt(`¡Excelente! ${activeLevel.fullSpokenVerse}`);
        }, 1100);
      } else {
        speakPrompt(tile.scene.spokenPhrase);
      }
    } else {
      sound.playError();
      setMistakes((m) => m + 1);
      setShakingUid(tile.uid);
      setTimeout(() => setShakingUid(null), 260);
    }
  };

  const avatarMood: AvatarMood = useMemo(() => {
    if (isSpeaking) return 'speaking';
    if (phase === 'VICTORY' || matchDone) return 'cheering';
    return 'idle';
  }, [isSpeaking, phase, matchDone]);

  const nextLevel = PICTURE_LEVELS.find(
    (lvl) => lvl.levelNumber === activeLevel.levelNumber + 1
  );

  const handleReplayCurrentPrompt = () => {
    if (phase === 'MAP') {
      speakPrompt('Toca cualquier dibujo para jugar con imágenes y voz.');
    } else if (phase === 'LISTEN_SCENES') {
      playSyncedVerse(activeLevel, false);
    } else if (phase === 'MATCH_PICTURE') {
      speakPrompt(activeLevel.questionPrompt);
    } else if (phase === 'ORDER_SCENES') {
      speakPrompt('Ordena los dibujos desde el principio hasta el final.');
    } else {
      speakPrompt(activeLevel.fullSpokenVerse);
    }
  };

  const activeScene = useMemo(
    () => activeLevel.scenes.find((s) => s.id === activeSceneId) ?? null,
    [activeLevel.scenes, activeSceneId]
  );

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#1A2E22] flex flex-col">
      {/* Kid-friendly Visual Top Bar */}
      <header className="bg-[#1B4332] text-white px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-2.5 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex items-center justify-between w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                clearScheduledSpeech();
                sound.stopSpeech();
                setIsSpeaking(false);
                resetReciteVisuals();
                if (phase === 'MAP') {
                  onBackToMenu();
                } else {
                  setPhase('MAP');
                }
              }}
              aria-label="Volver"
              className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-center md:hidden flex-1 px-2">
              <h1 className="font-display text-lg font-bold leading-tight">
                Aventura Solo Imágenes
              </h1>
              <p className="text-xs text-amber-200 font-semibold">
                Escucha y toca los dibujos · {completedCount}/{PICTURE_LEVELS.length}
              </p>
            </div>
            <div className="w-11 md:hidden" aria-hidden="true" />
          </div>

          <div className="hidden md:block text-center px-4">
            <h1 className="font-display text-xl font-bold leading-tight">
              Aventura Solo Imágenes
            </h1>
            <p className="text-xs text-amber-200 font-semibold">
              Escucha y toca los dibujos · {completedCount}/{PICTURE_LEVELS.length}
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2">
            <button
              type="button"
              disabled={speechLoading}
              onClick={handleReplayCurrentPrompt}
              aria-label="Escuchar voz"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#1A2E22] font-extrabold text-sm shadow-sm cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span className="hidden sm:inline">
                {speechLoading ? 'Cargando...' : isSpeaking ? 'Escuchando...' : 'Escuchar'}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleMusic}
              aria-label={musicEnabled ? 'Pausar música' : 'Activar música'}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${
                musicEnabled && !muted
                  ? 'bg-emerald-500/25 text-amber-200'
                  : 'bg-white/10 text-white/55'
              }`}
            >
              <Music className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6 flex flex-col">
        {/* Always-visible Companion Speaker Strip */}
        <section
          className={`rounded-3xl border-2 p-4 flex items-center justify-between gap-4 ${character.bgTint} ${character.borderTint}`}
        >
          <div className="flex items-center gap-4">
            <CharacterAvatar characterId={character.id} mood={avatarMood} size="sm" />
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => {
                const currentStep =
                  phase === 'LISTEN_SCENES'
                    ? 1
                    : phase === 'MATCH_PICTURE'
                    ? 2
                    : phase === 'ORDER_SCENES' || phase === 'VICTORY'
                    ? 3
                    : 0;
                return (
                  <div
                    key={step}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-extrabold text-sm border-2 ${
                      phase === 'MAP'
                        ? 'bg-white/70 border-[#1B4332]/15 text-[#1B4332]/60'
                        : step < currentStep || phase === 'VICTORY'
                        ? 'bg-emerald-600 border-emerald-700 text-white'
                        : step === currentStep
                        ? 'bg-amber-400 border-amber-700 text-[#1A2E22] scale-110'
                        : 'bg-white border-stone-300 text-stone-400'
                    }`}
                  >
                    {step}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            disabled={speechLoading}
            onClick={handleReplayCurrentPrompt}
            aria-label="Volver a escuchar"
            className="w-14 h-14 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-400 text-amber-700 flex items-center justify-center shadow-sm active:scale-95 transition-transform cursor-pointer shrink-0"
          >
            <Volume2 className={`w-7 h-7 ${isSpeaking ? 'animate-pulse text-emerald-700' : ''}`} />
          </button>
        </section>

        {/* PICTURE MAP */}
        {phase === 'MAP' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {PICTURE_LEVELS.map((lvl) => {
              const progress = save.completedPictureLevels[lvl.id];
              const stars = progress?.stars ?? 0;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => startLevel(lvl)}
                  aria-label={`Aventura ${lvl.levelNumber}`}
                  className={`rounded-3xl p-4 sm:p-5 border-2 flex flex-col items-center gap-3 transition-all duration-150 cursor-pointer hover:-translate-y-1 ${
                    progress
                      ? 'bg-white border-emerald-500 shadow-sm'
                      : 'bg-white border-amber-400 shadow-[0_5px_0_#D97706]'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-[#1B4332] text-white font-mono font-extrabold text-sm flex items-center justify-center">
                      {lvl.levelNumber}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((n) => (
                        <Star
                          key={n}
                          className={`w-4 h-4 ${
                            n <= stars ? 'text-amber-500 fill-amber-400' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <SceneIllustration iconKey={lvl.coverIcon} size="md" />
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 1: LISTEN & HIGHLIGHT SYNCED PICTURES */}
        {phase === 'LISTEN_SCENES' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-gentle-pop">
            {/* Initial Help & Live Spoken-Word Spotlight */}
            <div
              className={`w-full rounded-3xl border-2 px-5 py-4 flex flex-col items-center text-center gap-3.5 transition-all ${
                recitingMode === 'intro-help'
                  ? 'bg-amber-100 border-amber-500 shadow-sm'
                  : activeScene
                  ? 'bg-amber-50 border-amber-400 shadow-sm'
                  : reciteStage === 'citation'
                  ? 'bg-emerald-50 border-emerald-400'
                  : 'bg-white border-[#1B4332]/15'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeScene
                      ? 'bg-amber-400 text-[#1A2E22] animate-pulse'
                      : recitingMode === 'intro-help'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {reciteStage === 'citation' ? (
                    <BookOpen className="w-5 h-5" />
                  ) : activeScene ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 text-center">
                  {recitingMode === 'intro-help' ? (
                    <p className="font-bold text-sm sm:text-base text-[#1A2E22]">
                      Ayuda inicial: mira qué dibujo brilla mientras escuchas sus palabras.
                    </p>
                  ) : reciteStage === 'citation' ? (
                    <p className="font-bold text-sm sm:text-base text-emerald-950">
                      📖 {activeLevel.reference} — ¡Atentos, ya empieza!
                    </p>
                  ) : activeScene ? (
                    <p className="font-display font-extrabold text-lg sm:text-2xl text-[#1A2E22]">
                      “{activeScene.spokenPhrase}”
                    </p>
                  ) : (
                    <p className="font-semibold text-sm sm:text-base text-[#1B4332]/85">
                      Mira brillar cada dibujo al recitar, o toca uno para oír sus palabras.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => playSyncedVerse(activeLevel, false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-[#1A2E22] font-extrabold text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Versículo</span>
                </button>
                <button
                  type="button"
                  onClick={() => playStepByStepGuide(activeLevel)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#EFE9D8] hover:bg-[#E4DCC6] text-[#1B4332] font-extrabold text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>Dibujo por dibujo</span>
                </button>
              </div>
            </div>

            {/* Illustrated Scene Cards */}
            <div
              className={`grid grid-cols-2 ${
                activeLevel.scenes.length === 3 ? 'sm:grid-cols-3 max-w-4xl' : 'sm:grid-cols-4'
              } gap-4 w-full pt-2`}
            >
              {activeLevel.scenes.map((scene, idx) => {
                const isSelected = activeSceneId === scene.id;
                const isPassed = !isSelected && idx <= passedSceneIdx;
                const isDimmed =
                  (recitingMode === 'verse' || recitingMode === 'step-by-step') &&
                  activeSceneId !== null &&
                  !isSelected &&
                  !isPassed;

                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => handleTapListenScene(scene)}
                    aria-label={scene.spokenPhrase}
                    className={`relative rounded-3xl p-4 sm:p-5 border-4 flex flex-col items-center gap-3 transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-b from-amber-50 to-amber-100 border-amber-500 ring-4 ring-amber-300/90 scale-[1.06] shadow-[0_12px_28px_-6px_rgba(245,158,11,0.45)] z-10'
                        : isPassed
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
                        : isDimmed
                        ? 'bg-white/75 border-[#1B4332]/10 opacity-75'
                        : 'bg-white border-[#1B4332]/15 hover:border-amber-400 shadow-[0_5px_0_#E5DEC8]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white font-extrabold text-xs shadow-md animate-bounce whitespace-nowrap">
                        <ArrowDown className="w-3.5 h-3.5" />
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="w-full flex items-center justify-between">
                      <span
                        className={`w-8 h-8 rounded-full font-mono font-extrabold text-sm flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-white'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      {isSelected ? (
                        <Volume2 className="w-6 h-6 text-amber-600 animate-pulse" />
                      ) : isPassed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-amber-600/70" />
                      )}
                    </div>

                    <div className={`transition-transform duration-200 ${isSelected ? 'scale-105' : ''}`}>
                      <SceneIllustration iconKey={scene.iconKey} size="lg" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Smooth Recitation Progress Bar */}
            {(recitingMode === 'verse' || recitingMode === 'step-by-step') && (
              <div className="w-full max-w-md space-y-1.5">
                <div className="h-2.5 w-full rounded-full bg-[#EFE9D8] overflow-hidden border border-[#1B4332]/10">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-150"
                    style={{ width: `${Math.round(reciteProgress * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={startMatchStep}
              aria-label="Siguiente paso"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-3xl bg-[#1B4332] hover:bg-[#143326] text-white font-extrabold text-xl shadow-[0_6px_0_#0E241B] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
        )}

        {/* STEP 2: MATCH THE RIGHT PICTURE (ZERO TEXT CARDS) */}
        {phase === 'MATCH_PICTURE' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-gentle-pop">
            <button
              type="button"
              onClick={() => speakPrompt(activeLevel.questionPrompt)}
              aria-label="Escuchar pregunta"
              className="inline-flex items-center gap-3 px-7 py-4 rounded-3xl bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-[#1A2E22] font-extrabold text-lg shadow-sm cursor-pointer"
            >
              <Volume2 className="w-7 h-7 text-amber-700" />
              <span>🔊</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
              {matchOptions.map((opt) => {
                const isWinner = matchDone && opt.isTarget;
                const isShaking = shakingUid === opt.uid;
                return (
                  <button
                    key={opt.uid}
                    type="button"
                    onClick={() => handleTapMatchOption(opt)}
                    aria-label="Elegir dibujo"
                    className={`rounded-3xl p-6 border-4 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                      isWinner
                        ? 'bg-emerald-50 border-emerald-500 scale-105 shadow-lg'
                        : isShaking
                        ? 'bg-amber-50 border-amber-500 animate-gentle-shake'
                        : 'bg-white border-[#1B4332]/15 hover:border-amber-400 shadow-[0_6px_0_#E5DEC8] active:translate-y-0.5'
                    }`}
                  >
                    <SceneIllustration iconKey={opt.iconKey} size="lg" />
                    {isWinner && <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            {matchDone && (
              <button
                type="button"
                onClick={startOrderStep}
                aria-label="Siguiente paso"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-3xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xl shadow-[0_6px_0_#064E3B] active:translate-y-0.5 transition-all cursor-pointer animate-gentle-pop"
              >
                <ArrowRight className="w-8 h-8" />
              </button>
            )}
          </div>
        )}

        {/* STEP 3: ORDER THE STORY WITH PICTURES ONLY */}
        {phase === 'ORDER_SCENES' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-7 animate-gentle-pop">
            {/* Numbered Story Slots */}
            <div
              className={`grid grid-cols-2 ${
                activeLevel.scenes.length === 3 ? 'sm:grid-cols-3 max-w-4xl' : 'sm:grid-cols-4'
              } gap-4 w-full bg-white rounded-3xl border-2 border-[#1B4332]/15 p-5 shadow-sm`}
            >
              {activeLevel.scenes.map((slotScene, idx) => {
                const placed = placedScenes[idx];
                const isNext = idx === placedScenes.length;
                return (
                  <div
                    key={slotScene.id}
                    className={`rounded-2xl p-3 border-3 flex flex-col items-center justify-center min-h-[140px] transition-all ${
                      placed
                        ? 'bg-emerald-50 border-emerald-500 animate-gentle-pop'
                        : isNext
                        ? 'bg-amber-50 border-amber-500 border-dashed ring-4 ring-amber-200/70'
                        : 'bg-stone-100 border-stone-300 border-dashed'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-full bg-[#1B4332] text-white font-mono font-extrabold text-xs flex items-center justify-center mb-2">
                      {idx + 1}
                    </span>
                    {placed ? (
                      <SceneIllustration iconKey={placed.iconKey} size="md" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-white/60 flex items-center justify-center text-2xl font-extrabold text-amber-600">
                        ?
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Shuffled Picture Choices */}
            <div className="flex flex-wrap items-center justify-center gap-4 w-full">
              {orderBank.map((tile) => (
                <button
                  key={tile.uid}
                  type="button"
                  disabled={tile.used}
                  onClick={() => handleTapOrderTile(tile)}
                  aria-label="Colocar dibujo"
                  className={`rounded-3xl p-4 border-4 transition-all ${
                    tile.used
                      ? 'opacity-20 bg-stone-200 border-stone-300 scale-90 cursor-default'
                      : shakingUid === tile.uid
                      ? 'bg-amber-100 border-amber-500 animate-gentle-shake cursor-pointer'
                      : 'bg-white border-[#1B4332]/20 hover:border-amber-400 shadow-[0_6px_0_#D6D0BE] active:translate-y-0.5 cursor-pointer'
                  }`}
                >
                  <SceneIllustration iconKey={tile.scene.iconKey} size="md" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* VICTORY SCREEN */}
        {phase === 'VICTORY' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 bg-white rounded-3xl border-4 border-amber-400 p-8 shadow-xl animate-gentle-pop">
            <div className="flex items-center justify-center gap-6">
              <CharacterAvatar characterId={character.id} mood="cheering" size="lg" />
              <SceneIllustration iconKey={activeLevel.coverIcon} size="lg" />
            </div>

            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  className={`w-12 h-12 ${
                    n <= (mistakes <= 1 ? 3 : mistakes <= 3 ? 2 : 1)
                      ? 'text-amber-500 fill-amber-400'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-lg">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>+20 🌱</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => startLevel(activeLevel)}
                aria-label="Jugar de nuevo"
                className="w-16 h-16 rounded-2xl bg-[#EFE9D8] hover:bg-[#E4DCC6] text-[#1B4332] flex items-center justify-center cursor-pointer"
              >
                <RotateCcw className="w-7 h-7" />
              </button>

              {nextLevel ? (
                <button
                  type="button"
                  onClick={() => startLevel(nextLevel)}
                  aria-label="Siguiente aventura"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-3xl bg-[#1B4332] hover:bg-[#143326] text-white font-extrabold text-xl shadow-[0_6px_0_#0E241B] active:translate-y-0.5 cursor-pointer"
                >
                  <ArrowRight className="w-8 h-8" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhase('MAP')}
                  aria-label="Volver al mapa de dibujos"
                  className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-3xl bg-amber-500 hover:bg-amber-400 text-[#1A2E22] font-extrabold text-xl shadow-[0_6px_0_#B45309] active:translate-y-0.5 cursor-pointer"
                >
                  <ArrowLeft className="w-8 h-8" />
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
