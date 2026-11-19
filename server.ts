import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const aiBeta = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1beta',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const aiAlpha = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  apiVersion: 'v1alpha',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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

// In-memory cache of generated WAV audio (base64) so repeated replays are instant
const ttsCache = new Map<string, string>();

async function synthesizeWithGemini(
  cleanText: string,
  voiceName: string,
  stylePrompt: string
): Promise<string | undefined> {
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
    // If speechMetadata is only on v1alpha or rejected on v1beta, try v1alpha then v1beta without speechMetadata
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

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/tts', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error:
            'Falta configurar GEMINI_API_KEY en el servidor para reproducir la voz natural.',
        });
      }

      const { text, characterId, ageGroup } = req.body as {
        text?: string;
        characterId?: string;
        ageGroup?: string;
      };

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Texto requerido para narración.' });
      }

      const cleanText = text.trim().slice(0, 500);
      const charKey =
        characterId && CHARACTER_VOICE_MAP[characterId] ? characterId : 'lamb';
      const paceNote =
        ageGroup === 'young'
          ? 'Habla un poco más despacio, articulando cada palabra con ternura para niños de 6 a 8 años.'
          : 'Habla a un ritmo natural, claro y expresivo para niños de 9 a 11 años.';

      const cacheKey = `${charKey}:${ageGroup === 'young' ? 'young' : 'explorer'}:${cleanText}`;
      const cached = ttsCache.get(cacheKey);
      if (cached) {
        return res.json({ audioBase64: cached, mimeType: 'audio/wav' });
      }

      const voicePreset = CHARACTER_VOICE_MAP[charKey];
      const base64Audio = await synthesizeWithGemini(
        cleanText,
        voicePreset.voiceName,
        `${voicePreset.style} ${paceNote}`
      );

      if (!base64Audio) {
        return res.status(502).json({
          error: 'No se recibió audio del servicio de narración.',
        });
      }

      // Limit cache size to avoid unbounded memory growth
      if (ttsCache.size > 100) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, base64Audio);

      return res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al generar la voz natural.';
      console.error('TTS error:', message);
      return res.status(500).json({
        error: `No se pudo generar la voz natural: ${message}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

void createServer();
