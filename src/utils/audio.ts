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

function base64ToBlobUrl(base64: string, mimeType: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

// Peaceful uplifting progression in C Major / F Lydian warmth (4 bars x 8 eighth-notes = 32 steps)
const CHORD_BASS = [130.81, 110.0, 87.31, 98.0]; // C3, A2, F2, G2

const CHORD_PADS: number[][] = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 261.63, 329.63, 440.0], // Fmaj7
  [196.0, 293.66, 329.63, 493.88], // G6
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

const VICTORY_ARPEGGIO: number[] = [
  523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 659.25, 783.99,
  440.0, 523.25, 659.25, 880.0, 783.99, 659.25, 523.25, 659.25,
  349.23, 440.0, 523.25, 880.0, 783.99, 659.25, 523.25, 659.25,
  392.0, 587.33, 783.99, 987.77, 1046.5, 987.77, 783.99, 659.25,
];

const BELL_ACCENTS: Record<number, number> = {
  0: 1046.5,
  8: 880.0,
  16: 1318.51,
  24: 1174.66,
};

function scheduleOfflineVoice(
  offline: OfflineAudioContext,
  destination: AudioNode,
  freq: number,
  type: OscillatorType,
  peakGain: number,
  attack: number,
  duration: number,
  startTime: number,
  panValue: number = 0,
  lowpassHz?: number
): void {
  const osc = offline.createOscillator();
  const gain = offline.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  let tailNode: AudioNode = gain;

  if (lowpassHz) {
    const filter = offline.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(lowpassHz, startTime);
    osc.connect(filter);
    filter.connect(gain);
  } else {
    osc.connect(gain);
  }

  if (typeof offline.createStereoPanner === 'function' && panValue !== 0) {
    const pan = offline.createStereoPanner();
    pan.pan.setValueAtTime(panValue, startTime);
    gain.connect(pan);
    tailNode = pan;
  }

  tailNode.connect(destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.04);
}

function scheduleOfflineWoodTick(
  offline: OfflineAudioContext,
  destination: AudioNode,
  startTime: number
): void {
  const osc = offline.createOscillator();
  const gain = offline.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(430, startTime);
  osc.frequency.exponentialRampToValueAtTime(195, startTime + 0.045);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(0.028, startTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.065);

  osc.connect(gain);
  gain.connect(destination);
  osc.start(startTime);
  osc.stop(startTime + 0.08);
}

async function renderAmbientLoopBuffer(
  sampleRate: number,
  mood: MusicMood
): Promise<AudioBuffer | null> {
  if (typeof window === 'undefined' || typeof OfflineAudioContext === 'undefined') {
    return null;
  }

  const stepSec = mood === 'play' ? 0.28 : mood === 'victory' ? 0.30 : 0.34;
  const totalSteps = 32;
  const loopDuration = stepSec * totalSteps;
  const tailOverlapSec = 2.0; // Extra render tail wrapped back into start for seamless loop
  const renderLength = Math.ceil((loopDuration + tailOverlapSec) * sampleRate);
  const loopSamples = Math.round(loopDuration * sampleRate);

  const offline = new OfflineAudioContext(2, renderLength, sampleRate);
  const master = offline.createGain();
  master.gain.value = 0.92;
  master.connect(offline.destination);

  const pattern =
    mood === 'play' ? PLAY_ARPEGGIO : mood === 'victory' ? VICTORY_ARPEGGIO : MENU_ARPEGGIO;

  for (let step = 0; step < totalSteps; step++) {
    const t = step * stepSec;
    const bar = Math.floor(step / 8);
    const beatInBar = step % 8;

    if (beatInBar === 0) {
      const padFreqs = CHORD_PADS[bar];
      const padDuration = stepSec * 8 * 0.96;
      scheduleOfflineVoice(offline, master, CHORD_BASS[bar], 'sine', 0.09, 0.12, padDuration, t, 0);
      padFreqs.forEach((freq, idx) => {
        const pan = idx % 2 === 0 ? -0.22 : 0.22;
        scheduleOfflineVoice(offline, master, freq, 'triangle', 0.024, 0.32, padDuration, t, pan, 900);
      });
    }

    const noteFreq = pattern[step];
    if (noteFreq > 0) {
      const vol = mood === 'play' ? 0.068 : 0.056;
      const pan = ((step % 4) - 1.5) * 0.16;
      // Kalimba / felt marimba primary pluck
      scheduleOfflineVoice(offline, master, noteFreq, 'sine', vol, 0.012, 0.42, t, pan);
      // Warm harmonic shimmer
      scheduleOfflineVoice(offline, master, noteFreq * 2, 'sine', vol * 0.2, 0.008, 0.18, t, -pan);
      // Soft echo repeat one dotted-eighth later
      scheduleOfflineVoice(
        offline,
        master,
        noteFreq,
        'sine',
        vol * 0.26,
        0.015,
        0.34,
        t + stepSec * 1.5,
        -pan * 0.8
      );
    }

    const bellFreq = BELL_ACCENTS[step];
    if (bellFreq) {
      scheduleOfflineVoice(offline, master, bellFreq, 'sine', 0.025, 0.014, 0.85, t, 0.15);
    }

    if (mood === 'play' && (beatInBar === 2 || beatInBar === 6)) {
      scheduleOfflineWoodTick(offline, master, t);
    }
  }

  const rendered = await offline.startRendering();

  // Fold the reverb/chord tail beyond loopDuration back onto the beginning so the loop never clicks
  const cleanLoop = new AudioBuffer({
    numberOfChannels: 2,
    length: loopSamples,
    sampleRate,
  });

  const extraSamples = Math.min(rendered.length - loopSamples, loopSamples);
  for (let ch = 0; ch < 2; ch++) {
    const src = rendered.getChannelData(ch);
    const dst = cleanLoop.getChannelData(ch);
    dst.set(src.subarray(0, loopSamples));
    for (let i = 0; i < extraSamples; i++) {
      dst[i] = Math.max(-0.98, Math.min(0.98, dst[i] + src[loopSamples + i]));
    }
  }

  return cleanLoop;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private musicSource: AudioBufferSourceNode | null = null;
  private loopBuffers = new Map<MusicMood, AudioBuffer>();
  private renderingMoods = new Set<MusicMood>();

  private muted: boolean = false;
  private musicEnabled: boolean = true;
  private musicMood: MusicMood = 'menu';
  private musicRunning: boolean = false;
  private musicDucked: boolean = false;

  private currentAudio: HTMLAudioElement | null = null;
  private audioCache = new Map<string, string>();
  private abortController: AbortController | null = null;
  private preferredVoiceURI: string | undefined = undefined;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private speechSessionId = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        const refresh = () => {
          this.cachedVoices = window.speechSynthesis.getVoices();
        };
        refresh();
        window.speechSynthesis.addEventListener?.('voiceschanged', refresh);
      }

      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.musicRunning && this.ctx?.state === 'suspended' && !this.muted) {
          void this.ctx.resume();
        }
      });
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
      void this.startMusic();
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
      void this.startMusic();
    }
    this.updateMusicGain();
  }

  public setMusicMood(mood: MusicMood): void {
    if (this.musicMood === mood) return;
    this.musicMood = mood;
    if (this.musicRunning && this.musicEnabled && !this.muted) {
      void this.swapMoodBuffer(mood);
    }
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
    if (!this.compressor) {
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.value = -16;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 3;
      this.compressor.connect(this.ctx.destination);
    }
    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicDucked ? 0.16 : 0.7;
      this.musicGain.connect(this.compressor);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private updateMusicGain(): void {
    if (!this.ctx || !this.musicGain) return;
    const target = this.muted || !this.musicEnabled ? 0.0001 : this.musicDucked ? 0.16 : 0.7;
    const now = this.ctx.currentTime;
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(Math.max(this.musicGain.gain.value, 0.0001), now);
    this.musicGain.gain.linearRampToValueAtTime(target, now + 0.25);
  }

  private setMusicDucked(ducked: boolean): void {
    this.musicDucked = ducked;
    this.updateMusicGain();
  }

  public unlockAndStartMusic(): void {
    if (this.muted || !this.musicEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    if (!this.musicRunning) {
      void this.startMusic();
    }
  }

  private async ensureLoopBuffer(mood: MusicMood, sampleRate: number): Promise<AudioBuffer | null> {
    const existing = this.loopBuffers.get(mood);
    if (existing) return existing;
    if (this.renderingMoods.has(mood)) return null;

    this.renderingMoods.add(mood);
    try {
      const rendered = await renderAmbientLoopBuffer(sampleRate, mood);
      if (rendered) {
        this.loopBuffers.set(mood, rendered);
      }
      return rendered;
    } finally {
      this.renderingMoods.delete(mood);
    }
  }

  private async startMusic(): Promise<void> {
    if (this.musicRunning || this.muted || !this.musicEnabled) return;
    const ctx = this.getContext();
    if (!ctx || !this.musicGain) return;

    this.musicRunning = true;
    const activeMood = this.musicMood;
    const buffer = await this.ensureLoopBuffer(activeMood, ctx.sampleRate);
    if (!buffer || !this.musicRunning || this.muted || !this.musicEnabled || !this.musicGain) {
      this.musicRunning = false;
      return;
    }

    // Pre-warm alternate moods in idle time so transitions are instant
    const otherMoods: MusicMood[] = (['menu', 'play', 'victory'] as MusicMood[]).filter(
      (m) => m !== activeMood && !this.loopBuffers.has(m)
    );
    otherMoods.forEach((m) => {
      void this.ensureLoopBuffer(m, ctx.sampleRate);
    });

    this.startBufferLoop(ctx, buffer);
  }

  private async swapMoodBuffer(mood: MusicMood): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return;
    const buffer = await this.ensureLoopBuffer(mood, ctx.sampleRate);
    if (!buffer || !this.musicRunning || this.muted || !this.musicEnabled || this.musicMood !== mood) {
      return;
    }
    this.startBufferLoop(ctx, buffer);
  }

  private startBufferLoop(ctx: AudioContext, buffer: AudioBuffer): void {
    if (!this.musicGain) return;
    if (this.musicSource) {
      try {
        this.musicSource.stop();
        this.musicSource.disconnect();
      } catch {
        // ignore previous source stop
      }
      this.musicSource = null;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(this.musicGain);
    this.musicSource = src;
    this.updateMusicGain();
    src.start(0);
  }

  private stopMusicLoop(): void {
    this.musicRunning = false;
    if (this.musicSource) {
      try {
        this.musicSource.stop();
        this.musicSource.disconnect();
      } catch {
        // ignore stop errors
      }
      this.musicSource = null;
    }
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
    gain.connect(this.compressor ?? ctx.destination);

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

    // Only use local device speechSynthesis if user explicitly chose a specific device voice URI
    if (this.preferredVoiceURI) {
      this.speakWithFreeNaturalVoice(reference, verseText, options);
      return;
    }

    const playAudioUrl = async (url: string) => {
      const audio = new Audio(url);
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
        await playAudioUrl(cachedUrl);
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
      };

      if (!res.ok || !payload.audioBase64) {
        throw new Error('Server TTS unavailable');
      }

      const mimeType = payload.mimeType || 'audio/mpeg';
      const blobUrl = base64ToBlobUrl(payload.audioBase64, mimeType);
      if (this.audioCache.size > 40) {
        const oldestKey = this.audioCache.keys().next().value;
        if (oldestKey) {
          const oldUrl = this.audioCache.get(oldestKey);
          if (oldUrl) URL.revokeObjectURL(oldUrl);
          this.audioCache.delete(oldestKey);
        }
      }
      this.audioCache.set(cacheKey, blobUrl);

      if (controller.signal.aborted || this.muted) {
        this.setMusicDucked(false);
        options?.onEnd?.();
        return;
      }

      await playAudioUrl(blobUrl);
    } catch (err: unknown) {
      this.setMusicDucked(false);
      if (err instanceof DOMException && err.name === 'AbortError') {
        options?.onEnd?.();
        return;
      }
      // Emergency offline safety net if there is no internet access
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

      const pitch = isNaturalNeural ? 1.05 : Math.min(character.voicePitch, 1.12);
      const rate = options?.ageGroup === 'young' ? 0.88 : 0.94;

      const spokenReference = formatReferenceForSpeech(reference);
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
