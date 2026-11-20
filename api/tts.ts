import { GoogleGenAI } from '@google/genai';

interface TtsRequest {
  method?: string;
  body?: unknown;
}

interface TtsResponse {
  status: (code: number) => TtsResponse;
  json: (data: unknown) => unknown;
  setHeader?: (name: string, value: string) => void;
}

interface CharacterVoiceProfile {
  freeExpressiveVoice: string;
  googleLang: string;
  elevenVoiceId: string;
  geminiVoice: string;
  style: string;
}

const CHARACTER_VOICE_MAP: Record<string, CharacterVoiceProfile> = {
  lamb: {
    freeExpressiveVoice: 'es_mx_002', // Warm, gentle Latin American storyteller
    googleLang: 'es-419',
    elevenVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah
    geminiVoice: 'Puck',
    style:
      'Voz cálida, dulce y expresiva de cuentacuentos infantil en español latinoamericano neutro, clara y alegre para niños de 6 a 11 años.',
  },
  dove: {
    freeExpressiveVoice: 'es_female_f6', // Soft, serene Spanish narrator
    googleLang: 'es-US',
    elevenVoiceId: 'XrExE9yKIg1WjnnlVkGX', // Matilda
    geminiVoice: 'Zephyr',
    style:
      'Voz femenina suave, serena y cariñosa de narradora infantil en español latinoamericano neutro, con entonación natural y pausas amables.',
  },
  lion: {
    freeExpressiveVoice: 'es_002', // Clear upbeat encourager
    googleLang: 'es-419',
    elevenVoiceId: 'FGY2WhTYpPnrIDTdsKH5', // Laura
    geminiVoice: 'Kore',
    style:
      'Voz alegre, motivadora y muy natural en español latinoamericano neutro para animar a niños mientras aprenden versículos bíblicos.',
  },
  squirrel: {
    freeExpressiveVoice: 'es_mx_002', // Playful, friendly companion
    googleLang: 'es-US',
    elevenVoiceId: 'cgSgspJ2msm6clMCkdW9', // Jessica
    geminiVoice: 'Puck',
    style:
      'Voz juguetona, brillante y cercana de amigo de aventuras en español latinoamericano neutro, con dicción clara y cálida.',
  },
};

interface CachedAudio {
  audioBase64: string;
  mimeType: string;
  provider: string;
}

const ttsCache = new Map<string, CachedAudio>();

function splitIntoSpeakableChunks(text: string, maxLen: number): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLen) return [normalized];

  const sentences = normalized.split(/(?<=[.,;!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const part of sentences) {
    if (!part) continue;
    if ((current + ' ' + part).trim().length <= maxLen) {
      current = (current + ' ' + part).trim();
    } else {
      if (current) {
        chunks.push(current);
        current = '';
      }
      if (part.length <= maxLen) {
        current = part;
      } else {
        const words = part.split(' ');
        for (const w of words) {
          if ((current + ' ' + w).trim().length <= maxLen) {
            current = (current + ' ' + w).trim();
          } else {
            if (current) chunks.push(current);
            current = w;
          }
        }
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function synthesizeWithElevenLabs(
  apiKey: string,
  cleanText: string,
  voiceId: string
): Promise<string> {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.48,
          similarity_boost: 0.78,
          style: 0.32,
          use_speaker_boost: true,
        },
      }),
      signal: AbortSignal.timeout(9000),
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`ElevenLabs ${response.status}: ${errText.slice(0, 140)}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

async function synthesizeWithFreeExpressiveVoice(
  cleanText: string,
  voiceCode: string
): Promise<string> {
  const chunks = splitIntoSpeakableChunks(cleanText, 220);
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const res = await fetch('https://tiktok-tts.weilnet.workers.dev/api/generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: chunk,
        voice: voiceCode,
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Expressive TTS HTTP ${res.status}`);
    }
    const payload = (await res.json()) as {
      success?: boolean;
      data?: string;
      error?: string;
    };
    if (!payload.success || !payload.data) {
      throw new Error(payload.error || 'Sin datos de audio');
    }
    buffers.push(Buffer.from(payload.data, 'base64'));
  }

  return Buffer.concat(buffers).toString('base64');
}

async function synthesizeWithGoogleFreeTts(
  cleanText: string,
  langCode: string
): Promise<string> {
  const chunks = splitIntoSpeakableChunks(cleanText, 180);
  const buffers: Buffer[] = [];

  for (const chunk of chunks) {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
      langCode
    )}&q=${encodeURIComponent(chunk)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      throw new Error(`Google Free TTS HTTP ${res.status}`);
    }
    const arr = await res.arrayBuffer();
    if (!arr || arr.byteLength === 0) {
      throw new Error('Audio vacío de Google Free TTS');
    }
    buffers.push(Buffer.from(arr));
  }

  return Buffer.concat(buffers).toString('base64');
}

async function synthesizeWithGemini(
  apiKey: string,
  cleanText: string,
  voiceName: string,
  stylePrompt: string
): Promise<string | undefined> {
  const aiBeta = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const ttsConfig = {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName },
      },
    },
  };

  try {
    const response = await aiBeta.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: { style: stylePrompt },
            },
          ],
        },
      ],
      config: ttsConfig,
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch {
    const plainBetaResponse = await aiBeta.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Lee con tono cálido y natural para niños en español: ${cleanText}`,
            },
          ],
        },
      ],
      config: ttsConfig,
    });
    return plainBetaResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }
}

export default async function handler(req: TtsRequest, res: TtsResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      available: true,
      provider: process.env.ELEVENLABS_API_KEY
        ? 'elevenlabs'
        : process.env.GEMINI_API_KEY
        ? 'gemini-or-neural'
        : 'free-neural',
    });
  }

  if (req.method && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const parsedBody =
      typeof req.body === 'string'
        ? (JSON.parse(req.body) as Record<string, unknown>)
        : ((req.body ?? {}) as Record<string, unknown>);

    const text = parsedBody.text;
    const characterId = parsedBody.characterId;
    const ageGroup = parsedBody.ageGroup;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Texto requerido para narración.' });
    }

    const cleanText = text.trim().slice(0, 600);
    const charKey =
      typeof characterId === 'string' && CHARACTER_VOICE_MAP[characterId]
        ? characterId
        : 'lamb';
    const isYoung = ageGroup === 'young';

    const cacheKey = `${charKey}:${isYoung ? 'young' : 'explorer'}:${cleanText}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const voiceProfile = CHARACTER_VOICE_MAP[charKey];
    let result: CachedAudio | null = null;

    // 1. Optional ElevenLabs (Free-tier API key if configured on Vercel)
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (elevenLabsKey) {
      try {
        const audioBase64 = await synthesizeWithElevenLabs(
          elevenLabsKey,
          cleanText,
          voiceProfile.elevenVoiceId
        );
        result = {
          audioBase64,
          mimeType: 'audio/mpeg',
          provider: 'elevenlabs',
        };
      } catch (err) {
        console.warn('ElevenLabs TTS fallback:', err);
      }
    }

    // 2. Optional Gemini TTS if GEMINI_API_KEY is configured
    if (!result && process.env.GEMINI_API_KEY) {
      try {
        const paceNote = isYoung
          ? 'Habla un poco más despacio, articulando cada palabra con ternura para niños de 6 a 8 años.'
          : 'Habla a un ritmo natural, claro y expresivo para niños de 9 a 11 años.';
        const audioBase64 = await synthesizeWithGemini(
          process.env.GEMINI_API_KEY,
          cleanText,
          voiceProfile.geminiVoice,
          `${voiceProfile.style} ${paceNote}`
        );
        if (audioBase64) {
          result = {
            audioBase64,
            mimeType: 'audio/wav',
            provider: 'gemini',
          };
        }
      } catch (err) {
        console.warn('Gemini TTS fallback to free neural voice:', err);
      }
    }

    // 3. 100% Free zero-key expressive Latin American Spanish voice (works out of the box on Vercel!)
    if (!result) {
      const candidateVoices = [voiceProfile.freeExpressiveVoice, 'es_mx_002'];
      for (const candidate of candidateVoices) {
        try {
          const audioBase64 = await synthesizeWithFreeExpressiveVoice(cleanText, candidate);
          result = {
            audioBase64,
            mimeType: 'audio/mpeg',
            provider: 'free-expressive-es',
          };
          break;
        } catch (err) {
          console.warn(`Free Expressive TTS (${candidate}) retry:`, err);
        }
      }
    }

    // 4. 100% Free zero-key Google Spanish TTS backup
    if (!result) {
      try {
        const audioBase64 = await synthesizeWithGoogleFreeTts(
          cleanText,
          voiceProfile.googleLang
        );
        result = {
          audioBase64,
          mimeType: 'audio/mpeg',
          provider: 'google-free-es',
        };
      } catch (err) {
        console.warn('Google Free TTS fallback failed:', err);
      }
    }

    if (!result) {
      return res.status(502).json({
        error: 'No se pudo generar el audio en este momento.',
      });
    }

    if (ttsCache.size > 120) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, result);

    return res.status(200).json(result);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Error al generar la voz natural.';
    console.error('TTS error:', message);
    return res.status(500).json({
      error: `No se pudo generar la voz natural: ${message}`,
    });
  }
}
