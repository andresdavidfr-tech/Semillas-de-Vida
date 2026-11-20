import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Music,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Pause,
  Play,
} from 'lucide-react';
import { AgeGroup, VerseLevel, parseVerseWords } from '../data/verses';
import { CharacterId, getCharacterById } from '../data/characters';
import { CharacterAvatar, AvatarMood } from './CharacterAvatar';
import { sound } from '../utils/audio';

type StagePhase = 'INTRO_READ' | 'STEP_1_BLANKS' | 'STEP_2_ORDER' | 'STEP_3_MEMORY';

interface BankTile {
  uid: string;
  text: string;
  used: boolean;
}

interface GameplayViewProps {
  level: VerseLevel;
  ageGroup: AgeGroup;
  characterId: CharacterId;
  muted: boolean;
  onToggleMute: () => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onExitToMap: () => void;
  onLevelComplete: (stars: number, seedsEarned: number, accuracy: number) => void;
}

function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickBlankWordIndices(
  parsedWords: ReturnType<typeof parseVerseWords>,
  targetWords: string[],
  maxBlanks: number
): number[] {
  const chosen: number[] = [];
  for (const target of targetWords) {
    if (chosen.length >= maxBlanks) break;
    const match = parsedWords.find(
      (pw) =>
        !chosen.includes(pw.index) &&
        pw.clean.toLowerCase() === target.toLowerCase()
    );
    if (match) {
      chosen.push(match.index);
    }
  }
  return chosen.sort((a, b) => a - b);
}

export const GameplayView: React.FC<GameplayViewProps> = ({
  level,
  ageGroup,
  characterId,
  muted,
  onToggleMute,
  musicEnabled,
  onToggleMusic,
  onExitToMap,
  onLevelComplete,
}) => {
  const character = getCharacterById(characterId);
  const [phase, setPhase] = useState<StagePhase>('INTRO_READ');
  const [paused, setPaused] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'try'; text: string } | null>(null);
  const [shakingTileId, setShakingTileId] = useState<string | null>(null);
  const [stageDone, setStageDone] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [justCheered, setJustCheered] = useState(false);

  const parsedWords = useMemo(() => parseVerseWords(level.verseText), [level.verseText]);

  const blankIndicesStep1 = useMemo(() => {
    const limit = ageGroup === 'young' ? 3 : level.blankWordsStep1.length;
    return pickBlankWordIndices(parsedWords, level.blankWordsStep1, limit);
  }, [parsedWords, level.blankWordsStep1, ageGroup]);

  const blankIndicesStep3 = useMemo(() => {
    const limit = ageGroup === 'young' ? 4 : level.blankWordsStep3.length;
    return pickBlankWordIndices(parsedWords, level.blankWordsStep3, limit);
  }, [parsedWords, level.blankWordsStep3, ageGroup]);

  const [filledBlanks, setFilledBlanks] = useState<Record<number, string>>({});
  const [blankBank, setBlankBank] = useState<BankTile[]>([]);

  const expectedOrderTokens = useMemo(() => {
    if (ageGroup === 'young') {
      return level.youngChunks;
    }
    return parsedWords.map((pw) => pw.raw);
  }, [ageGroup, level.youngChunks, parsedWords]);

  const [placedOrderTokens, setPlacedOrderTokens] = useState<string[]>([]);
  const [orderBank, setOrderBank] = useState<BankTile[]>([]);

  const triggerCheer = useCallback(() => {
    setJustCheered(true);
    setTimeout(() => setJustCheered(false), 900);
  }, []);

  const speakCurrentVerse = useCallback(() => {
    setSpeechError(null);
    void sound.speakVerse(level.reference, level.verseText, {
      characterId: character.id,
      ageGroup,
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
  }, [level.reference, level.verseText, character.id, ageGroup]);

  const initBlankStage = useCallback(
    (targetPhase: 'STEP_1_BLANKS' | 'STEP_3_MEMORY') => {
      const indices = targetPhase === 'STEP_1_BLANKS' ? blankIndicesStep1 : blankIndicesStep3;
      const correctTiles: BankTile[] = indices.map((wordIdx, i) => ({
        uid: `b-${wordIdx}-${i}`,
        text: parsedWords[wordIdx].clean,
        used: false,
      }));

      if (targetPhase === 'STEP_3_MEMORY') {
        const extraDistractors: BankTile[] = level.distractors.map((d, idx) => ({
          uid: `dist-${idx}`,
          text: d,
          used: false,
        }));
        setBlankBank(shuffleArray([...correctTiles, ...extraDistractors]));
      } else {
        setBlankBank(shuffleArray(correctTiles));
      }
      setFilledBlanks({});
      setStageDone(false);
      setFeedback(null);
      setPhase(targetPhase);
    },
    [blankIndicesStep1, blankIndicesStep3, parsedWords, level.distractors]
  );

  const initOrderStage = useCallback(() => {
    const tiles: BankTile[] = expectedOrderTokens.map((txt, idx) => ({
      uid: `ord-${idx}`,
      text: txt,
      used: false,
    }));
    setOrderBank(shuffleArray(tiles));
    setPlacedOrderTokens([]);
    setStageDone(false);
    setFeedback(null);
    setPhase('STEP_2_ORDER');
  }, [expectedOrderTokens]);

  useEffect(() => {
    setPhase('INTRO_READ');
    setPaused(false);
    setMistakes(0);
    setHintsUsed(0);
    setAttempts(0);
    setFeedback(null);
    setStageDone(false);
    setIsSpeaking(false);
    return () => sound.stopSpeech();
  }, [level.id]);

  const activeBlankIndices = phase === 'STEP_1_BLANKS' ? blankIndicesStep1 : blankIndicesStep3;
  const nextBlankWordIdx = activeBlankIndices.find((idx) => filledBlanks[idx] === undefined);

  const handleTapBlankTile = (tile: BankTile) => {
    if (paused || stageDone || tile.used || nextBlankWordIdx === undefined) return;
    const expectedWord = parsedWords[nextBlankWordIdx].clean;
    setAttempts((a) => a + 1);

    if (tile.text.toLowerCase() === expectedWord.toLowerCase()) {
      sound.playPop();
      triggerCheer();
      const updated = { ...filledBlanks, [nextBlankWordIdx]: expectedWord };
      setFilledBlanks(updated);
      setBlankBank((prev) => prev.map((t) => (t.uid === tile.uid ? { ...t, used: true } : t)));
      setFeedback({ type: 'ok', text: '¡Muy bien! Palabra correcta.' });

      const allFilled = activeBlankIndices.every((idx) => updated[idx] !== undefined);
      if (allFilled) {
        sound.playStageClear();
        setStageDone(true);
        setFeedback({
          type: 'ok',
          text:
            phase === 'STEP_1_BLANKS'
              ? '¡Excelente! Completaste el versículo.'
              : '¡Asombroso! Lo recordaste de memoria.',
        });
      }
    } else {
      sound.playError();
      setMistakes((m) => m + 1);
      setShakingTileId(tile.uid);
      setTimeout(() => setShakingTileId(null), 240);
      setFeedback({
        type: 'try',
        text: '¡Casi! Escucha o lee con calma e intenta otra palabra.',
      });
    }
  };

  const handleTapOrderTile = (tile: BankTile) => {
    if (paused || stageDone || tile.used) return;
    const nextExpected = expectedOrderTokens[placedOrderTokens.length];
    if (!nextExpected) return;

    setAttempts((a) => a + 1);
    if (tile.text === nextExpected) {
      sound.playPop();
      triggerCheer();
      const updatedPlaced = [...placedOrderTokens, tile.text];
      setPlacedOrderTokens(updatedPlaced);
      setOrderBank((prev) => prev.map((t) => (t.uid === tile.uid ? { ...t, used: true } : t)));
      setFeedback({ type: 'ok', text: '¡Exacto! Sigue construyendo el camino.' });

      if (updatedPlaced.length === expectedOrderTokens.length) {
        sound.playStageClear();
        setStageDone(true);
        setFeedback({ type: 'ok', text: '¡Ordenaste todo el versículo perfectamente!' });
      }
    } else {
      sound.playError();
      setMistakes((m) => m + 1);
      setShakingTileId(tile.uid);
      setTimeout(() => setShakingTileId(null), 240);
      setFeedback({
        type: 'try',
        text: 'Esa pieza va un poco más adelante. ¡Prueba otra!',
      });
    }
  };

  const handleHint = useCallback(() => {
    if (paused || stageDone || phase === 'INTRO_READ') return;
    setHintsUsed((h) => h + 1);
    sound.playTap();

    if (phase === 'STEP_1_BLANKS' || phase === 'STEP_3_MEMORY') {
      if (nextBlankWordIdx === undefined) return;
      const expectedWord = parsedWords[nextBlankWordIdx].clean;
      const matchingTile = blankBank.find(
        (t) => !t.used && t.text.toLowerCase() === expectedWord.toLowerCase()
      );
      if (matchingTile) {
        const updated = { ...filledBlanks, [nextBlankWordIdx]: expectedWord };
        setFilledBlanks(updated);
        setBlankBank((prev) =>
          prev.map((t) => (t.uid === matchingTile.uid ? { ...t, used: true } : t))
        );
        setFeedback({ type: 'ok', text: `Pista: la palabra era “${expectedWord}”.` });
        if (activeBlankIndices.every((idx) => updated[idx] !== undefined)) {
          sound.playStageClear();
          setStageDone(true);
        }
      }
    } else if (phase === 'STEP_2_ORDER') {
      const nextExpected = expectedOrderTokens[placedOrderTokens.length];
      if (!nextExpected) return;
      const matchingTile = orderBank.find((t) => !t.used && t.text === nextExpected);
      if (matchingTile) {
        const updatedPlaced = [...placedOrderTokens, matchingTile.text];
        setPlacedOrderTokens(updatedPlaced);
        setOrderBank((prev) =>
          prev.map((t) => (t.uid === matchingTile.uid ? { ...t, used: true } : t))
        );
        setFeedback({ type: 'ok', text: `Pista aplicada: “${matchingTile.text}”.` });
        if (updatedPlaced.length === expectedOrderTokens.length) {
          sound.playStageClear();
          setStageDone(true);
        }
      }
    }
  }, [
    paused,
    stageDone,
    phase,
    nextBlankWordIdx,
    parsedWords,
    blankBank,
    filledBlanks,
    activeBlankIndices,
    expectedOrderTokens,
    placedOrderTokens,
    orderBank,
  ]);

  const finishLevel = useCallback(() => {
    sound.stopSpeech();
    setIsSpeaking(false);
    sound.playLevelWin();
    const totalOps = Math.max(attempts, 1);
    const accuracy = Math.max(50, Math.round(((totalOps - mistakes) / totalOps) * 100));
    let stars = 3;
    if (mistakes + hintsUsed >= 5) {
      stars = 1;
    } else if (mistakes + hintsUsed >= 2) {
      stars = 2;
    }
    const seedsEarned = 15 + stars * 10;
    onLevelComplete(stars, seedsEarned, accuracy);
  }, [attempts, mistakes, hintsUsed, onLevelComplete]);

  const handleAdvancePhase = useCallback(() => {
    sound.stopSpeech();
    setIsSpeaking(false);
    sound.playTap();
    if (phase === 'INTRO_READ') {
      initBlankStage('STEP_1_BLANKS');
    } else if (phase === 'STEP_1_BLANKS' && stageDone) {
      initOrderStage();
    } else if (phase === 'STEP_2_ORDER' && stageDone) {
      initBlankStage('STEP_3_MEMORY');
    } else if (phase === 'STEP_3_MEMORY' && stageDone) {
      finishLevel();
    }
  }, [phase, stageDone, initBlankStage, initOrderStage, finishLevel]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPaused((p) => !p);
      } else if (e.key.toLowerCase() === 'm') {
        onToggleMute();
      } else if (e.key.toLowerCase() === 'h') {
        handleHint();
      } else if (e.key === 'Enter' && (phase === 'INTRO_READ' || stageDone) && !paused) {
        e.preventDefault();
        handleAdvancePhase();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onToggleMute, handleHint, phase, stageDone, paused, handleAdvancePhase]);

  const stepIndex =
    phase === 'INTRO_READ'
      ? 0
      : phase === 'STEP_1_BLANKS'
      ? 1
      : phase === 'STEP_2_ORDER'
      ? 2
      : 3;

  const avatarMood: AvatarMood = isSpeaking
    ? 'speaking'
    : stageDone || justCheered
    ? 'cheering'
    : feedback?.type === 'try'
    ? 'encouraging'
    : 'idle';

  const cheerMessage = useMemo(() => {
    if (isSpeaking) {
      return `Escucha con atención... ¡${level.reference} es un tesoro!`;
    }
    if (stageDone) {
      return `¡Hurra! ¡Lo lograste genial! Avanzamos al siguiente paso.`;
    }
    if (feedback?.type === 'try') {
      return `¡Ánimo! No pasa nada, inténtalo otra vez. ¡Tú puedes!`;
    }
    if (phase === 'INTRO_READ') {
      return `¡Hola! Soy ${character.name}. Leamos juntos este versículo antes de jugar.`;
    }
    if (phase === 'STEP_1_BLANKS') {
      const remaining = activeBlankIndices.filter((idx) => filledBlanks[idx] === undefined).length;
      return `¡Vamos muy bien! Solo faltan ${remaining} ${
        remaining === 1 ? 'palabra' : 'palabras'
      } para completar el paso 1.`;
    }
    if (phase === 'STEP_2_ORDER') {
      return `¡Construyamos el camino! Pieza ${placedOrderTokens.length + 1} de ${
        expectedOrderTokens.length
      }.`;
    }
    const remainingMem = activeBlankIndices.filter((idx) => filledBlanks[idx] === undefined).length;
    return `¡Último paso! Demuestra lo que guardaste en tu corazón (${remainingMem} por llenar).`;
  }, [
    isSpeaking,
    stageDone,
    feedback,
    phase,
    character.name,
    level.reference,
    activeBlankIndices,
    filledBlanks,
    placedOrderTokens.length,
    expectedOrderTokens.length,
  ]);

  const progressPercent = stageDone
    ? Math.min(100, ((stepIndex + 1) / 4) * 100)
    : Math.round((stepIndex / 4) * 100 + 10);

  return (
    <div className="min-h-screen bg-[#FBF9F2] text-[#1A2E22] flex flex-col">
      {/* Unobtrusive Top HUD */}
      <header className="bg-[#1B4332] text-white px-4 sm:px-8 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sound.stopSpeech();
                setIsSpeaking(false);
                onExitToMap();
              }}
              aria-label="Salir al mapa"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="text-xs font-mono text-amber-300 font-bold">
                Nivel {level.levelNumber} · {level.reference}
              </div>
              <div className="font-display text-base sm:text-lg font-bold leading-tight">
                {level.reward.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={speechLoading}
              onClick={speakCurrentVerse}
              aria-label={`Escuchar versículo con ${character.shortName}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-70 text-[#1A2E22] text-xs font-extrabold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Volume2 className="w-4 h-4" />
              <span>{speechLoading ? 'Cargando voz...' : isSpeaking ? 'Escuchando...' : 'Escuchar'}</span>
            </button>

            <button
              type="button"
              onClick={onToggleMusic}
              aria-label={musicEnabled ? 'Pausar música ambiental' : 'Activar música ambiental'}
              title={musicEnabled ? 'Música ambiental activa' : 'Música ambiental pausada'}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                musicEnabled && !muted
                  ? 'bg-emerald-500/25 text-amber-200 hover:bg-emerald-500/35'
                  : 'bg-white/10 text-white/55 hover:bg-white/20'
              }`}
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setPaused(true)}
              aria-label="Pausar juego"
              className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Playfield Container */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-8 pt-5 pb-8 max-w-4xl w-full mx-auto gap-5">
        {/* Companion Character Stage ABOVE every level, cheering and advancing step by step */}
        <section
          aria-label="Compañero animando el nivel"
          className={`w-full rounded-2xl border-2 p-3.5 sm:px-5 sm:py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 ${character.bgTint} ${character.borderTint}`}
        >
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <CharacterAvatar characterId={character.id} mood={avatarMood} size="sm" />
            <div className="flex-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#1B4332]/75">
                {character.name} · Nivel {level.levelNumber}
              </div>
              <p className="text-sm sm:text-base font-bold text-[#1A2E22] leading-snug">
                “{cheerMessage}”
              </p>
            </div>
          </div>

          {/* 4-Step Level Progress Bar with advancing indicator */}
          <div className="w-full sm:w-56 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#1B4332] mb-1.5">
              {['Lee', '1. Completa', '2. Ordena', '3. Memoria'].map((label, idx) => (
                <span
                  key={label}
                  className={
                    idx === stepIndex
                      ? 'text-[#1B4332] font-extrabold'
                      : idx < stepIndex
                      ? 'text-emerald-700'
                      : 'text-[#1A2E22]/45'
                  }
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="w-full h-3 rounded-full bg-white/90 border border-[#1B4332]/15 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {speechError && (
          <div className="w-full rounded-2xl bg-amber-50 border border-amber-300 px-4 py-3 flex items-center justify-between text-xs font-bold text-amber-950">
            <span>{speechError}</span>
          </div>
        )}

        {/* PHASE 0: INTRO READ */}
        {phase === 'INTRO_READ' && (
          <div className="w-full bg-white rounded-3xl border-2 border-[#1B4332]/15 shadow-sm overflow-hidden animate-gentle-pop">
            <div className="h-32 sm:h-40 w-full relative bg-[#EAE4D2]">
              <img
                src="/src/assets/images/bible_scroll_desk_1795122515274.jpg"
                alt="Biblia abierta sobre escritorio soleado con semillas doradas"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 flex items-baseline justify-between text-white">
                <span className="font-display text-2xl sm:text-3xl font-bold">
                  {level.reference}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-9 space-y-5 text-center">
              <blockquote className="font-display text-2xl sm:text-3xl font-bold text-[#1A2E22] leading-relaxed text-balance">
                “{level.verseText}”
              </blockquote>

              <p className="text-base text-[#1A2E22]/80 max-w-xl mx-auto leading-relaxed bg-[#FBF9F2] p-4 rounded-2xl border border-[#1B4332]/10">
                {level.kidNote}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  type="button"
                  disabled={speechLoading}
                  onClick={speakCurrentVerse}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#EFE9D8] hover:bg-[#E5DEC8] disabled:opacity-70 text-[#1B4332] font-bold text-base transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Volume2 className="w-5 h-5" />
                  <span>
                    {speechLoading
                      ? 'Preparando voz...'
                      : isSpeaking
                      ? `${character.shortName} está leyendo...`
                      : `Escuchar con ${character.shortName}`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleAdvancePhase}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#1B4332] hover:bg-[#143326] text-white font-extrabold text-base shadow-[0_4px_0_#0E241B] active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>¡Listo! Empezar a Memorizar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHASE 1 & PHASE 3: FILL IN THE BLANKS */}
        {(phase === 'STEP_1_BLANKS' || phase === 'STEP_3_MEMORY') && (
          <div className="w-full space-y-6 animate-gentle-pop">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1B4332]">
                  {phase === 'STEP_1_BLANKS'
                    ? 'Paso 1: Completa las palabras'
                    : 'Paso 3: ¡Desafío de Memoria!'}
                </h2>
                <p className="text-sm text-[#1A2E22]/75">
                  {phase === 'STEP_1_BLANKS'
                    ? 'Toca las palabras de abajo para llenar cada espacio brillante.'
                    : 'Cuidado: hay 2 palabras extra. ¡Elige solo las del versículo!'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleHint}
                disabled={stageDone}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-950 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <Lightbulb className="w-4 h-4 text-amber-700" />
                <span>Pista (H)</span>
              </button>
            </div>

            {/* Verse Board */}
            <div className="bg-white rounded-3xl border-2 border-[#1B4332]/15 p-6 sm:p-9 shadow-sm">
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-4 font-display text-xl sm:text-2xl leading-relaxed text-[#1A2E22]">
                {parsedWords.map((pw) => {
                  const isBlank = activeBlankIndices.includes(pw.index);
                  if (!isBlank) {
                    return <span key={pw.index}>{pw.raw}</span>;
                  }
                  const filled = filledBlanks[pw.index];
                  const isCurrentTarget = pw.index === nextBlankWordIdx;
                  return (
                    <span key={pw.index} className="inline-flex items-baseline gap-0.5">
                      {pw.leadingPunct && <span>{pw.leadingPunct}</span>}
                      <span
                        className={`inline-flex items-center justify-center min-w-[92px] px-3 py-1 rounded-xl font-sans font-extrabold text-lg sm:text-xl transition-all duration-150 ${
                          filled
                            ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-500 animate-gentle-pop'
                            : isCurrentTarget
                            ? 'bg-amber-50 text-amber-800 border-2 border-amber-500 ring-4 ring-amber-200/70'
                            : 'bg-stone-100 text-stone-400 border-2 border-dashed border-stone-300'
                        }`}
                      >
                        {filled ?? '______'}
                      </span>
                      {pw.trailingPunct && <span>{pw.trailingPunct}</span>}
                    </span>
                  );
                })}
              </div>
              <div className="mt-5 text-xs font-mono font-bold text-[#1B4332]/65">
                {level.reference}
              </div>
            </div>

            <div className="min-h-[28px] flex items-center justify-center">
              {feedback && (
                <p
                  className={`text-sm font-bold flex items-center gap-2 ${
                    feedback.type === 'ok' ? 'text-emerald-700' : 'text-amber-800'
                  }`}
                >
                  {feedback.type === 'ok' && <CheckCircle2 className="w-4 h-4" />}
                  <span>{feedback.text}</span>
                </p>
              )}
            </div>

            {!stageDone ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {blankBank.map((tile) => (
                  <button
                    key={tile.uid}
                    type="button"
                    disabled={tile.used}
                    onClick={() => handleTapBlankTile(tile)}
                    className={`min-h-[50px] px-5 py-3 rounded-2xl font-bold text-lg transition-all duration-150 ${
                      tile.used
                        ? 'opacity-25 bg-stone-200 text-stone-500 border-2 border-stone-300 scale-95 cursor-default'
                        : shakingTileId === tile.uid
                        ? 'bg-amber-100 text-amber-950 border-2 border-amber-500 animate-gentle-shake cursor-pointer'
                        : 'bg-white hover:bg-amber-50 text-[#1B4332] border-2 border-[#1B4332]/25 shadow-[0_4px_0_#D6D0BE] active:translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {tile.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleAdvancePhase}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-lg shadow-[0_4px_0_#064E3B] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {phase === 'STEP_1_BLANKS'
                      ? 'Ir al Paso 2: Ordenar'
                      : '¡Recibir mi Recompensa!'}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* PHASE 2: ORDER THE VERSE */}
        {phase === 'STEP_2_ORDER' && (
          <div className="w-full space-y-6 animate-gentle-pop">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1B4332]">
                  Paso 2: Ordena el Versículo
                </h2>
                <p className="text-sm text-[#1A2E22]/75">
                  Toca las piezas en el orden correcto desde el principio hasta el final.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={initOrderStage}
                  disabled={stageDone || placedOrderTokens.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-200/80 hover:bg-stone-200 disabled:opacity-40 text-stone-800 font-bold text-sm transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reiniciar</span>
                </button>
                <button
                  type="button"
                  onClick={handleHint}
                  disabled={stageDone}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-950 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Lightbulb className="w-4 h-4 text-amber-700" />
                  <span>Pista (H)</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border-2 border-[#1B4332]/15 p-6 sm:p-8 min-h-[145px] shadow-sm flex flex-col justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                {placedOrderTokens.map((txt, idx) => (
                  <span
                    key={`${txt}-${idx}`}
                    className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-950 border-2 border-emerald-500 font-bold text-base sm:text-lg animate-gentle-pop"
                  >
                    {txt}
                  </span>
                ))}
                {!stageDone && (
                  <span className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 border-2 border-dashed border-amber-400 font-bold text-base">
                    Siguiente pieza ({placedOrderTokens.length + 1}/{expectedOrderTokens.length})
                  </span>
                )}
              </div>
              <div className="mt-5 text-xs font-mono font-bold text-[#1B4332]/65">
                {level.reference}
              </div>
            </div>

            <div className="min-h-[28px] flex items-center justify-center">
              {feedback && (
                <p
                  className={`text-sm font-bold flex items-center gap-2 ${
                    feedback.type === 'ok' ? 'text-emerald-700' : 'text-amber-800'
                  }`}
                >
                  {feedback.type === 'ok' && <CheckCircle2 className="w-4 h-4" />}
                  <span>{feedback.text}</span>
                </p>
              )}
            </div>

            {!stageDone ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {orderBank.map((tile) => (
                  <button
                    key={tile.uid}
                    type="button"
                    disabled={tile.used}
                    onClick={() => handleTapOrderTile(tile)}
                    className={`min-h-[48px] px-4 py-2.5 rounded-2xl font-bold text-base sm:text-lg transition-all duration-150 ${
                      tile.used
                        ? 'opacity-20 bg-stone-200 text-stone-500 border-2 border-stone-300 scale-95 cursor-default'
                        : shakingTileId === tile.uid
                        ? 'bg-amber-100 text-amber-950 border-2 border-amber-500 animate-gentle-shake cursor-pointer'
                        : 'bg-white hover:bg-amber-50 text-[#1B4332] border-2 border-[#1B4332]/25 shadow-[0_4px_0_#D6D0BE] active:translate-y-0.5 cursor-pointer'
                    }`}
                  >
                    {tile.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleAdvancePhase}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-lg shadow-[0_4px_0_#064E3B] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Ir al Paso 3: ¡De Memoria!</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Pause Modal */}
      {paused && (
        <div
          className="fixed inset-0 z-50 bg-[#1A2E22]/65 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-title"
        >
          <div className="bg-[#FBF9F2] rounded-3xl max-w-sm w-full p-7 border-2 border-[#1B4332]/20 shadow-xl text-center space-y-5 animate-gentle-pop">
            <div className="flex justify-center">
              <CharacterAvatar characterId={character.id} mood="idle" size="md" />
            </div>
            <h2 id="pause-title" className="font-display text-2xl font-bold text-[#1B4332]">
              Juego en Pausa
            </h2>
            <p className="text-sm text-[#1A2E22]/75">
              Nivel {level.levelNumber} · {level.reference}
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setPaused(false)}
                className="w-full py-3.5 rounded-2xl bg-[#1B4332] text-white font-extrabold text-base cursor-pointer"
              >
                Continuar Jugando
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaused(false);
                  setPhase('INTRO_READ');
                  setMistakes(0);
                  setHintsUsed(0);
                }}
                className="w-full py-3 rounded-2xl bg-[#EFE9D8] text-[#1B4332] font-bold text-sm cursor-pointer"
              >
                Leer el Versículo de Nuevo
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.stopSpeech();
                  setIsSpeaking(false);
                  onExitToMap();
                }}
                className="w-full py-3 rounded-2xl border border-[#1B4332]/20 text-[#1A2E22] font-bold text-sm cursor-pointer"
              >
                Salir al Mapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
