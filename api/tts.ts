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

const CHARACTER_VOICE_MAP: Record<
  string,
  { voiceName: string; style: string }
> = {
  lamb: {
    voiceName: 'Puck',
    style:
      'Voz cálida, dulce y expresiva de cuentacuentos infantil en español latinoamericano neutro, clara y alegre para niños de 6 a 11 años.',
  },
  dove: {
    voiceName: 'Zephyr',
    style:
      'Voz femenina suave, serena y cariñosa de narradora infantil en español latinoamericano neutro, con entonación natural y pausas amables.',
  },
  lion: {
    voiceName: 'Kore',
    style:
      'Voz alegre, motivadora y muy natural en español latinoamericano neutro para animar a niños mientras aprenden versículos bíblicos.',
  },
  squirrel: {
    voiceName: 'Puck',
    style:
      'Voz juguetona, brillante y cercana de amigo de aventuras en español latinoamericano neutro, con dicción clara y cálida.',
  },
};

// In-memory warm-instance cache of generated WAV audio (base64)
const ttsCache = new Map<string, string>();

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

  const aiAlpha = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1alpha',
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('speechMetadata') || msg.includes('400')) {
      try {
        const alphaResponse = await aiAlpha.models.generateContent({
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
        return alphaResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
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
    throw err;
  }
}

export default async function handler(req: TtsRequest, res: TtsResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      available: Boolean(process.env.GEMINI_API_KEY),
    });
  }

  if (req.method && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        available: false,
        error: 'No hay clave de servidor configurada; usando voz gratuita del navegador.',
      });
    }

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

    const cleanText = text.trim().slice(0, 500);
    const charKey =
      typeof characterId === 'string' && CHARACTER_VOICE_MAP[characterId]
        ? characterId
        : 'lamb';
    const paceNote =
      ageGroup === 'young'
        ? 'Habla un poco más despacio, articulando cada palabra con ternura para niños de 6 a 8 años.'
        : 'Habla a un ritmo natural, claro y expresivo para niños de 9 a 11 años.';

    const cacheKey = `${charKey}:${ageGroup === 'young' ? 'young' : 'explorer'}:${cleanText}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ audioBase64: cached, mimeType: 'audio/wav' });
    }

    const voicePreset = CHARACTER_VOICE_MAP[charKey];
    const base64Audio = await synthesizeWithGemini(
      apiKey,
      cleanText,
      voicePreset.voiceName,
      `${voicePreset.style} ${paceNote}`
    );

    if (!base64Audio) {
      return res.status(502).json({
        error: 'No se recibió audio del servicio de narración.',
      });
    }

    if (ttsCache.size > 100) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, base64Audio);

    return res.status(200).json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Error al generar la voz natural.';
    console.error('TTS error:', message);
    return res.status(500).json({
      error: `No se pudo generar la voz natural: ${message}`,
    });
  }
}
