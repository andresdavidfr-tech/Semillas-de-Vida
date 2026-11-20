import { CharacterId } from '../data/characters';

export type MusicMood = 'menu' | 'play' | 'victory';

export interface SpeakOptions {
  characterId?: CharacterId;
  onLoading?: () => void;
  onStart?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
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

function base64ToBlobUrl(base64: string, mimeType: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

// Sunny, cheerful & slow progression in C Major (8 bars x 8 eighth-notes = 64 steps)
// Pure major & add9 chords: C - G - F - C - F - C - G - C
const CHORD_BASS = [
  130.81, // C3
  98.0,   // G2
  87.31,  // F2
  130.81, // C3
  87.31,  // F2
  130.81, // C3
  98.0,   // G2
  130.81, // C3
];

const CHORD_PADS: number[][] = [
  [261.63, 329.63, 392.0, 587.33], // Cadd9
  [196.0, 246.94, 293.66, 392.0],  // G
  [174.61, 220.0, 261.63, 392.0],  // Fadd9
  [261.63, 329.63, 392.0, 523.25], // C
  [174.61, 220.0, 261.63, 329.63], // Fmaj7 (bright warmth)
  [261.63, 329.63, 392.0, 587.33], // Cadd9
  [196.0, 246.94, 293.66, 329.63], // G6
  [261.63, 329.63, 392.0, 523.25], // C
];

const MENU_MELODY: number[] = [
  // Bar 1 (C): alegre y suave
  523.25, 0, 659.25, 783.99, 1046.5, 0, 783.99, 659.25,
  // Bar 2 (G)
  587.33, 0, 783.99, 987.77, 783.99, 0, 659.25, 587.33,
  // Bar 3 (F)
  523.25, 0, 698.46, 880.0, 783.99, 0, 698.46, 659.25,
  // Bar 4 (C): respiro dulce
  783.99, 0, 659.25, 0, 523.25, 0, 659.25, 0,
  // Bar 5 (F)
  698.46, 0, 880.0, 1046.5, 880.0, 0, 698.46, 659.25,
  // Bar 6 (C)
  783.99, 0, 659.25, 783.99, 1046.5, 0, 783.99, 659.25,
  // Bar 7 (G)
  587.33, 0, 783.99, 880.0, 987.77, 0, 783.99, 587.33,
  // Bar 8 (C): cierre feliz y tranquilo
  659.25, 0, 783.99, 0, 523.25, 0, 0, 0,
];

const PLAY_MELODY: number[] = [
  // Bar 1 (C): juguetona pero lenta y amable
  523.25, 659.25, 783.99, 0, 1046.5, 783.99, 659.25, 783.99,
  // Bar 2 (G)
  587.33, 783.99, 987.77, 0, 783.99, 659.25, 587.33, 659.25,
  // Bar 3 (F)
  523.25, 698.46, 880.0, 0, 783.99, 698.46, 659.25, 587.33,
  // Bar 4 (C)
  659.25, 783.99, 523.25, 0, 659.25, 783.99, 659.25, 0,
  // Bar 5 (F)
  698.46, 880.0, 1046.5, 0, 880.0, 783.99, 698.46, 659.25,
  // Bar 6 (C)
  783.99, 659.25, 1046.5, 0, 783.99, 659.25, 523.25, 659.25,
  // Bar 7 (G)
  587.33, 783.99, 987.77, 0, 880.0, 783.99, 659.25, 587.33,
  // Bar 8 (C)
  523.25, 659.25, 783.99, 0, 1046.5, 0, 783.99, 0,
];

const VICTORY_MELODY: number[] = [
  // Celebración alegre, cálida y serena
  523.25, 659.25, 783.99, 1046.5, 987.77, 783.99, 1046.5, 0,
  587.33, 783.99, 987.77, 1174.66, 987.77, 783.99, 659.25, 0,
  523.25, 698.46, 880.0, 1046.5, 880.0, 698.46, 659.25, 0,
  783.99, 1046.5, 1318.51, 0, 1046.5, 783.99, 659.25, 0,
  698.46, 880.0, 1046.5, 1318.51, 1046.5, 880.0, 698.46, 0,
  523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 0,
  587.33, 783.99, 987.77, 1174.66, 987.77, 783.99, 659.25, 587.33,
  523.25, 659.25, 783.99, 1046.5, 0, 783.99, 523.25, 0,
];

const BELL_ACCENTS: Record<number, number> = {
  0: 1046.5,
  16: 1396.91,
  32: 1760.0,
  48: 1567.98,
  56: 1046.5,
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

async function renderAmbientLoopBuffer(
  sampleRate: number,
  mood: MusicMood
): Promise<AudioBuffer | null> {
  if (typeof window === 'undefined' || typeof OfflineAudioContext === 'undefined') {
    return null;
  }

  // Slower, relaxed and gentle cheerful tempo (~65-72 BPM)
  const stepSec = mood === 'play' ? 0.42 : mood === 'victory' ? 0.40 : 0.46;
  const totalSteps = 64;
  const loopDuration = stepSec * totalSteps;
  const tailOverlapSec = 2.4;
  const renderLength = Math.ceil((loopDuration + tailOverlapSec) * sampleRate);
  const loopSamples = Math.round(loopDuration * sampleRate);

  const offline = new OfflineAudioContext(2, renderLength, sampleRate);
  const master = offline.createGain();
  master.gain.value = 0.92;
  master.connect(offline.destination);

  const pattern =
    mood === 'play' ? PLAY_MELODY : mood === 'victory' ? VICTORY_MELODY : MENU_MELODY;

  for (let step = 0; step < totalSteps; step++) {
    const t = step * stepSec;
    const bar = Math.floor(step / 8);
    const beatInBar = step % 8;

    // Warm, velvety chord pad + bass at the start of every bar
    if (beatInBar === 0) {
      const padFreqs = CHORD_PADS[bar];
      const padDuration = stepSec * 8 * 0.98;
      scheduleOfflineVoice(offline, master, CHORD_BASS[bar], 'sine', 0.085, 0.18, padDuration, t, 0);
      padFreqs.forEach((freq, idx) => {
        const pan = idx % 2 === 0 ? -0.24 : 0.24;
        scheduleOfflineVoice(offline, master, freq, 'triangle', 0.022, 0.45, padDuration, t, pan, 780);
      });
    }

    // Gentle sunny harp/pizzicato harmonic pulse on beat 5 of each bar
    if (beatInBar === 4) {
      const fifthFreq = CHORD_PADS[bar][2];
      scheduleOfflineVoice(offline, master, fifthFreq, 'sine', 0.024, 0.025, 0.65, t, -0.18);
    }

    // Main cheerful marimba / celesta melody with soft echo
    const noteFreq = pattern[step];
    if (noteFreq > 0) {
      const vol = mood === 'play' ? 0.062 : 0.056;
      const pan = ((step % 4) - 1.5) * 0.14;
      scheduleOfflineVoice(offline, master, noteFreq, 'sine', vol, 0.018, 0.68, t, pan);
      scheduleOfflineVoice(offline, master, noteFreq * 2, 'sine', vol * 0.18, 0.012, 0.28, t, -pan);
      scheduleOfflineVoice(
        offline,
        master,
        noteFreq,
        'sine',
        vol * 0.22,
        0.02,
        0.48,
        t + stepSec * 1.5,
        -pan * 0.75
      );
    }

    // Bright celesta bell twinkle
    const bellFreq = BELL_ACCENTS[step];
    if (bellFreq) {
      scheduleOfflineVoice(offline, master, bellFreq, 'sine', 0.022, 0.018, 1.15, t, 0.16);
    }
  }

  const rendered = await offline.startRendering();
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
  private speechSessionId = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.musicRunning && this.ctx?.state === 'suspended' && !this.muted) {
          void this.ctx.resume();
        }
      });
    }
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
    const spokenReference = formatReferenceForSpeech(reference);
    await this.speakText(`${spokenReference} ${verseText}`, options);
  }

  public async speakText(
    text: string,
    options?: SpeakOptions
  ): Promise<void> {
    if (this.muted || typeof window === 'undefined' || !text.trim()) {
      options?.onEnd?.();
      return;
    }

    this.unlockAndStartMusic();
    this.stopSpeech();

    const charId = options?.characterId ?? 'lamb';
    const fullText = text.trim();
    const cacheKey = `${charId}:${fullText}`;

    const playAudioUrl = async (url: string) => {
      const audio = new Audio(url);
      this.currentAudio = audio;
      let progressTimer: number | null = null;

      const emitProgress = () => {
        if (this.currentAudio !== audio) return;
        if (audio.duration && Number.isFinite(audio.duration) && audio.duration > 0) {
          options?.onProgress?.(audio.currentTime, audio.duration);
        }
      };

      const stopTimer = () => {
        if (progressTimer !== null) {
          window.clearInterval(progressTimer);
          progressTimer = null;
        }
      };

      audio.onplay = () => {
        this.setMusicDucked(true);
        options?.onStart?.();
        emitProgress();
        stopTimer();
        if (options?.onProgress) {
          progressTimer = window.setInterval(emitProgress, 75);
        }
      };
      audio.ontimeupdate = emitProgress;
      audio.onended = () => {
        stopTimer();
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        this.setMusicDucked(false);
        options?.onEnd?.();
      };
      audio.onerror = () => {
        stopTimer();
        if (this.currentAudio === audio) {
          this.currentAudio = null;
        }
        this.setMusicDucked(false);
        options?.onError?.('No se pudo reproducir el audio.');
        options?.onEnd?.();
      };
      await audio.play();
    };

    const cachedUrl = this.audioCache.get(cacheKey);
    if (cachedUrl) {
      try {
        await playAudioUrl(cachedUrl);
      } catch {
        this.setMusicDucked(false);
        options?.onError?.('No se pudo reproducir el audio en caché.');
        options?.onEnd?.();
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
        }),
        signal: controller.signal,
      });

      const payload = (await res.json().catch(() => ({}))) as {
        audioBase64?: string;
        mimeType?: string;
      };

      if (!res.ok || !payload.audioBase64) {
        throw new Error('No se pudo obtener la narración natural del servidor.');
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
      const msg = err instanceof Error ? err.message : 'Error al obtener narración natural.';
      options?.onError?.(msg);
      options?.onEnd?.();
    } finally {
      if (this.abortController === controller) {
        this.abortController = null;
      }
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
  }
}

export const sound = new SoundManager();
