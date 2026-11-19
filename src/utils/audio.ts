import { CharacterId, getCharacterById } from '../data/characters';
import { AgeGroup } from '../data/verses';

export type MusicMood = 'menu' | 'play' | 'victory';

export interface SpeakOptions {
  characterId?: CharacterId;
  ageGroup?: AgeGroup;
  onLoading?: () => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
}

export interface SpanishVoiceOption {
  voiceURI: string;
  name: string;
  lang: string;
  isNatural: boolean;
}

const BOOK_SPOKEN_NAMES: Record<string, string> = {
  '1 Juan': 'Primera de Juan',
  '2 Timoteo': 'Segunda de Timoteo',
  '1 Corintios': 'Primera de Corintios',
  '1 Tesalonicenses': 'Primera de Tesalonicenses',
};

export function formatReferenceForSpeech(reference: string): string {
  const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
  if (!match) return reference;
  const rawBook = match[1].trim();
  const chapter = match[2];
  const verse = match[3];
  const book = BOOK_SPOKEN_NAMES[rawBook] ?? rawBook;
  return `${book}, capítulo ${chapter}, versículo ${verse}.`;
}

function scoreSpanishVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();
  let score = 0;

  if (lang.startsWith('es')) score += 50;
  if (lang.includes('419') || lang.includes('mx') || lang.includes('us') || lang.includes('es')) {
    score += 10;
  }
  if (/natural|neural|online/i.test(name)) score += 100;
  if (/google/i.test(name)) score += 65;
  if (/dalia|paulina|sabina|helena|luciana|monica|mónica|camila|sofia|sofía|valentina|elena|laura|paloma|salome|salomé/i.test(name)) {
    score += 45;
  }
  if (/enhanced|premium|siri/i.test(name)) score += 55;
  if (/espeak|mbrola/i.test(name)) score -= 80;
  if (!v.localService && /microsoft|google/i.test(name)) score += 20;

  return score;
}

// Peaceful uplifting progression in C Major / F Lydian warmth
const CHORD_BASS = [130.81, 110.0, 87.31, 98.0];

const CHORD_PADS: number[][] = [
  [261.63, 329.63, 392.0, 493.88],
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 261.63, 329.63, 440.0],
  [196.0, 293.66, 329.63, 493.88],
];

const MENU_ARPEGGIO: number[] = [
  523.25, 0, 659.25, 783.99, 659.25, 0, 987.77, 783.99,
  440.0, 0, 523.25, 659.25, 783.99, 0, 659.25, 523.25,
  349.23, 0, 440.0, 523.25, 659.25, 0, 880.0, 659.25,
  392.0, 0, 587.33, 659.25, 783.99, 0, 659.25, 587.33,
];

const PLAY_ARPEGGIO: number[] = [
  523.25, 659.25, 783.99, 659.25, 987.77, 783.99, 659.25, 783.99,
  440.0, 523.25, 659.25, 523.25, 783.99, 659.25, 523.25, 659.25,
  349.23, 440.0, 523.25, 659.25, 880.0, 659.25, 523.25, 659.25,
  392.0, 587.33, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33,
];

const BELL_ACCENTS: Record<number, number> = {
  0: 1046.5,
  8: 880.0,
  16: 1318.51,
  24: 1174.66,
};

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private muted: boolean = false;
  private musicEnabled: boolean = true;
  private musicMood: MusicMood = 'menu';
  private musicRunning: boolean = false;
  private musicDucked: boolean = false;
  private musicTimer: number | null = null;
  private stepIndex: number = 0;

  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>();
  private abortController: AbortController | null = null;
  private serverTtsAvailable: boolean | null = null;
  private preferredVoiceURI: string | undefined = undefined;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private speechSessionId = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const refresh = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
      refresh();
      window.speechSynthesis.addEventListener?.('voiceschanged', refresh);
    }
  }

  public setPreferredVoiceURI(uri?: string): void {
    this.preferredVoiceURI = uri;
  }

  public getSpanishVoices(): SpanishVoiceOption[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }
    const raw =
      this.cachedVoices.length > 0
        ? this.cachedVoices
        : window.speechSynthesis.getVoices();

    return raw
      .filter((v) => v.lang.toLowerCase().startsWith('es'))
      .sort((a, b) => scoreSpanishVoice(b) - scoreSpanishVoice(a))
      .map((v) => ({
        voiceURI: v.voiceURI,
        name: v.name.replace(/\s*\(Natural\)/i, ' (Natural)'),
        lang: v.lang,
        isNatural: /natural|neural|online|google|enhanced|premium/i.test(v.name),
      }));
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopSpeech();
      this.stopMusicLoop();
    } else if (this.musicEnabled && this.ctx) {
      this.startMusic();
    }
    this.updateMusicGain();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusicLoop();
    } else if (!this.muted) {
      this.startMusic();
    }
    this.updateMusicGain();
  }

  public setMusicMood(mood: MusicMood): void {
    this.musicMood = mood;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicDucked ? 0.16 : 0.72;
      this.musicGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private updateMusicGain(): void {
    if (!this.ctx || !this.musicGain) return;
    const target = this.muted || !this.musicEnabled ? 0.0001 : this.musicDucked ? 0.16 : 0.72;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(Math.max(this.musicGain.gain.value, 0.0001), now);
    this.musicGain.gain.linearRampToValueAtTime(target, now + 0.22);
  }

  private setMusicDucked(ducked: boolean): void {
    this.musicDucked = ducked;
    this.updateMusicGain();
  }

  public unlockAndStartMusic(): void {
    if (this.muted || !this.musicEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    this.startMusic();
  }

  private startMusic(): void {
    if (this.musicRunning || this.muted || !this.musicEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.musicRunning = true;
    this.updateMusicGain();

    const tick = () => {
      if (!this.musicRunning || this.muted || !this.musicEnabled) return;
      if (typeof document !== 'undefined' && document.hidden) {
        this.musicTimer = window.setTimeout(tick, 400);
        return;
      }

      this.playMusicStep(this.stepIndex);
      this.stepIndex = (this.stepIndex + 1) % 32;

      const stepMs = this.musicMood === 'play' ? 275 : this.musicMood === 'victory' ? 300 : 335;
      this.musicTimer = window.setTimeout(tick, stepMs);
    };

    tick();
  }

  private stopMusicLoop(): void {
    this.musicRunning = false;
    if (this.musicTimer !== null) {
      window.clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playMusicStep(step: number): void {
    const ctx = this.getContext();
    if (!ctx || !this.musicGain) return;
    const now = ctx.currentTime;
    const bar = Math.floor(step / 8);
    const beatInBar = step % 8;

    if (beatInBar === 0) {
      const padFreqs = CHORD_PADS[bar];
      const padDuration = this.musicMood === 'play' ? 2.15 : 2.6;
      this.playMusicVoice(CHORD_BASS[bar], 'sine', 0.055, 0.08, padDuration * 0.9, now);
      for (const freq of padFreqs) {
        this.playMusicVoice(freq, 'triangle', 0.015, 0.25, padDuration, now, 950);
      }
    }

    const pattern = this.musicMood === 'play' ? PLAY_ARPEGGIO : MENU_ARPEGGIO;
    const noteFreq = pattern[step];
    if (noteFreq > 0) {
      const vol = this.musicMood === 'play' ? 0.042 : 0.036;
      this.playMusicVoice(noteFreq, 'sine', vol, 0.01, 0.34, now);
      this.playMusicVoice(noteFreq * 2, 'sine', vol * 0.18, 0.006, 0.14, now);
    }

    const bellFreq = BELL_ACCENTS[step];
    if (bellFreq) {
      this.playMusicVoice(bellFreq, 'sine', 0.016, 0.01, 0.7, now);
    }

    if (this.musicMood === 'play' && (beatInBar === 2 || beatInBar === 6)) {
      this.playWoodTick(now);
    }
  }

  private playMusicVoice(
    freq: number,
    type: OscillatorType,
    peakGain: number,
    attack: number,
    duration: number,
    startTime: number,
    lowpassHz?: number
  ): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    if (lowpassHz) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(lowpassHz, startTime);
      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.musicGain);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.03);
  }

  private playWoodTick(startTime: number): void {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, startTime);
    osc.frequency.exponentialRampToValueAtTime(190, startTime + 0.045);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.024, startTime + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.06);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(startTime);
    osc.stop(startTime + 0.07);
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.12,
    delay: number = 0
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public playTap(): void {
    this.unlockAndStartMusic();
    this.playTone(520, 0.07, 'triangle', 0.08);
  }

  public playPop(): void {
    this.unlockAndStartMusic();
    this.playTone(660, 0.1, 'sine', 0.1);
    this.playTone(880, 0.12, 'sine', 0.08, 0.04);
  }

  public playError(): void {
    this.unlockAndStartMusic();
    this.playTone(240, 0.14, 'triangle', 0.09);
    this.playTone(195, 0.18, 'triangle', 0.08, 0.08);
  }

  public playStageClear(): void {
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.18, 'triangle', 0.11, idx * 0.08);
    });
  }

  public playLevelWin(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.28, 'triangle', 0.13, idx * 0.09);
    });
  }

  private async checkServerTtsAvailable(): Promise<boolean> {
    if (this.serverTtsAvailable !== null) {
      return this.serverTtsAvailable;
    }
    try {
      const res = await fetch('/api/tts', { method: 'GET' });
      if (!res.ok) {
        this.serverTtsAvailable = false;
        return false;
      }
      const data = (await res.json().catch(() => ({}))) as { available?: boolean };
      this.serverTtsAvailable = Boolean(data.available);
      return this.serverTtsAvailable;
    } catch {
      this.serverTtsAvailable = false;
      return false;
    }
  }

  public async speakVerse(
    reference: string,
    verseText: string,
    options?: SpeakOptions
  ): Promise<void> {
    if (this.muted || typeof window === 'undefined') {
      options?.onEnd?.();
      return;
    }

    this.unlockAndStartMusic();
    this.stopSpeech();

    const charId = options?.characterId ?? 'lamb';
    const ageGroup = options?.ageGroup ?? 'young';
    const spokenReference = formatReferenceForSpeech(reference);
    const fullText = `${spokenReference} ${verseText}`;
    const cacheKey = `${charId}:${ageGroup}:${fullText}`;

    // If user explicitly picked a local browser voice, use free browser natural voice directly
    if (this.preferredVoiceURI) {
      this.speakWithFreeNaturalVoice(reference, verseText, options);
      return;
    }

    const hasServerTts = await this.checkServerTtsAvailable();
    if (!hasServerTts) {
      // 100% Free zero-key path (ideal for Vercel without GEMINI_API_KEY)
      this.speakWithFreeNaturalVoice(reference, verseText, options);
      return;
    }

    const playDataUrl = async (dataUrl: string) => {
      const audio = new Audio(dataUrl);
      this.currentAudio = audio;
      audio.onplay = () => {
        this.setMusicDucked(true);
        options?.onStart?.();
      };
      audio.onended = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        this.setMusicDucked(false);
        options?.onEnd?.();
      };
      audio.onerror = () => {
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        this.setMusicDucked(false);
        this.speakWithFreeNaturalVoice(reference, verseText, options);
      };
      await audio.play();
    };

    const cachedUrl = this.audioCache.get(cacheKey);
    if (cachedUrl) {
      try {
        await playDataUrl(cachedUrl);
      } catch {
        this.setMusicDucked(false);
        this.speakWithFreeNaturalVoice(reference, verseText, options);
      }
      return;
    }

    const controller = new AbortController();
    this.abortController = controller;
    this.setMusicDucked(true);
    options?.onLoading?.();

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: fullText,
          characterId: charId,
          ageGroup,
        }),
        signal: controller.signal,
      });

      const payload = (await res.json().catch(() => ({}))) as {
        audioBase64?: string;
        mimeType?: string;
        available?: boolean;
      };

      if (!res.ok || !payload.audioBase64) {
        if (payload.available === false) {
          this.serverTtsAvailable = false;
        }
        throw new Error('Fallback to free voice');
      }

      const mimeType = payload.mimeType || 'audio/wav';
      const dataUrl = `data:${mimeType};base64,${payload.audioBase64}`;
      this.audioCache.set(cacheKey, dataUrl);

      if (controller.signal.aborted || this.muted) {
        this.setMusicDucked(false);
        options?.onEnd?.();
        return;
      }

      await playDataUrl(dataUrl);
    } catch (err: unknown) {
      this.setMusicDucked(false);
      if (err instanceof DOMException && err.name === 'AbortError') {
        options?.onEnd?.();
        return;
      }
      // Seamlessly use the free natural Spanish voice when server TTS isn't available
      this.speakWithFreeNaturalVoice(reference, verseText, options);
    } finally {
      if (this.abortController === controller) {
        this.abortController = null;
      }
    }
  }

  public speakWithFreeNaturalVoice(
    reference: string,
    verseText: string,
    options?: SpeakOptions
  ): boolean {
    if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      options?.onEnd?.();
      options?.onError?.('Tu navegador no tiene lectura de voz disponible.');
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      const session = ++this.speechSessionId;
      const voices =
        this.cachedVoices.length > 0
          ? this.cachedVoices
          : window.speechSynthesis.getVoices();

      const spanishVoices = voices
        .filter((v) => v.lang.toLowerCase().startsWith('es'))
        .sort((a, b) => scoreSpanishVoice(b) - scoreSpanishVoice(a));

      const chosenVoice =
        (this.preferredVoiceURI
          ? spanishVoices.find((v) => v.voiceURI === this.preferredVoiceURI)
          : undefined) || spanishVoices[0];

      const character = getCharacterById(options?.characterId ?? 'lamb');
      const isNaturalNeural = chosenVoice
        ? /natural|neural|online|google|siri/i.test(chosenVoice.name)
        : false;

      // Neural voices already sound bright; pitch ~1.04-1.08 keeps them natural without distortion
      const pitch = isNaturalNeural ? 1.05 : Math.min(character.voicePitch, 1.14);
      const rate = options?.ageGroup === 'young' ? 0.88 : 0.94;

      const spokenReference = formatReferenceForSpeech(reference);
      // Split verse into expressive natural clauses so browser TTS pauses naturally at punctuation
      const clauses = verseText
        .split(/(?<=[,;:.!?])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const segments = [spokenReference, ...clauses];

      this.setMusicDucked(true);
      options?.onStart?.();

      const speakNext = (idx: number) => {
        if (session !== this.speechSessionId || this.muted) {
          this.setMusicDucked(false);
          return;
        }
        if (idx >= segments.length) {
          this.setMusicDucked(false);
          options?.onEnd?.();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(segments[idx]);
        utterance.lang = chosenVoice?.lang || 'es-ES';
        if (chosenVoice) utterance.voice = chosenVoice;
        utterance.rate = idx === 0 ? Math.min(rate + 0.04, 1.0) : rate;
        utterance.pitch = pitch;

        utterance.onend = () => {
          if (session !== this.speechSessionId) return;
          window.setTimeout(() => speakNext(idx + 1), idx === 0 ? 220 : 120);
        };
        utterance.onerror = () => {
          if (session !== this.speechSessionId) return;
          this.setMusicDucked(false);
          options?.onEnd?.();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNext(0);
      return true;
    } catch {
      this.setMusicDucked(false);
      options?.onEnd?.();
      return false;
    }
  }

  public stopSpeech(): void {
    this.speechSessionId++;
    this.setMusicDucked(false);
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // ignore audio stop errors
      }
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore speech cancel errors
      }
    }
  }
}

export const sound = new SoundManager();
