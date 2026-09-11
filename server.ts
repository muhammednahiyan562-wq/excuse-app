import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeExcuseLocally, validateExcuseInput } from './src/utils/excuseJudge';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const SYSTEM_INSTRUCTION = `You are ExcuseCheck, a playful and funny excuse judge.

Analyze the user's excuse.

Return ONLY valid JSON.

Required format:
{
  "weirdness": 0,
  "believability": 0,
  "creativity": 0,
  "comedy": 0,
  "overall": 0,
  "category": "",
  "verdict": ""
}

Rules:
All scores must be numbers from 0 to 10 (can use 1 decimal place or whole numbers like 8.5 or 9).
Weirdness measures how unusual or absurd the excuse is (0 to 10).
Believability measures how believable the excuse sounds (0 to 10).
Creativity measures how original or imaginative the excuse is (0 to 10).
Comedy measures how funny the excuse is (0 to 10).
Overall should represent the overall entertainment/weirdness rating on a 0 to 10 scale.

Category must be exactly one of:
Completely Normal (overall 0 - 2)
Slightly Suspicious (overall 2.1 - 4)
Getting Weird (overall 4.1 - 6)
Definitely Questionable (overall 6.1 - 8)
Extremely Weird (overall 8.1 - 9.5)
Absolutely Unhinged (overall 9.6 - 10)

Verdict must be one short, funny sentence.
Be playful rather than cruel.
Do not use hateful, discriminatory, sexually explicit, threatening or abusive content.
Judge the excuse, not the person.
If the input is just a greeting (e.g. "hi", "hello"), single random word, gibberish, or not an excuse at all, give all scores 0 (overall 0), category "Completely Normal", and a verdict explaining that a greeting is not an excuse.
Return ONLY JSON.`;

const VALID_CATEGORIES = [
  'Completely Normal',
  'Slightly Suspicious',
  'Getting Weird',
  'Definitely Questionable',
  'Extremely Weird',
  'Absolutely Unhinged',
] as const;

function normalizeCategory(cat: string, overall: number): typeof VALID_CATEGORIES[number] {
  if (VALID_CATEGORIES.includes(cat as any)) {
    return cat as typeof VALID_CATEGORIES[number];
  }
  // Fallback to score mapping on a 1-10 scale
  const norm = overall > 10 ? overall / 10 : overall;
  if (norm <= 2.0) return 'Completely Normal';
  if (norm <= 4.0) return 'Slightly Suspicious';
  if (norm <= 6.0) return 'Getting Weird';
  if (norm <= 8.0) return 'Definitely Questionable';
  if (norm <= 9.5) return 'Extremely Weird';
  return 'Absolutely Unhinged';
}

function clampScore(val: any, fallback = 5): number {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return fallback;
  // If model returned on 0-100 scale by accident, normalize down
  const scaled = num > 10 ? num / 10 : num;
  const clamped = Math.max(0, Math.min(10, scaled));
  return Math.round(clamped * 10) / 10;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Check if API key is configured
app.get('/api/config-status', (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  res.json({
    configured: Boolean(key && key.trim().length > 0 && key !== 'MY_GEMINI_API_KEY'),
  });
});

// Primary rate excuse endpoint
app.post('/api/rate-excuse', async (req, res) => {
  const { excuse } = req.body || {};

  if (!excuse || typeof excuse !== 'string' || !excuse.trim()) {
    return res.status(400).json({
      success: false,
      error: 'GENERAL_ERROR',
      message: 'Please provide an excuse to judge.',
    });
  }

  const cleanExcuse = excuse.trim().slice(0, 500);

  const validation = validateExcuseInput(cleanExcuse);
  if (!validation.isValid) {
    const nonExcuseResult = analyzeExcuseLocally(cleanExcuse);
    return res.json({
      success: true,
      data: nonExcuseResult,
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    // Zero API key required mode: run smart built-in judge!
    const localResult = analyzeExcuseLocally(cleanExcuse);
    return res.json({
      success: true,
      data: localResult,
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Use exclusively the free tier model (gemini-3.8-flash)
    // Never switch to paid models or paid upgrades
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Excuse to judge: "${cleanExcuse}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weirdness: { type: Type.NUMBER, description: 'Score from 0 to 10' },
            believability: { type: Type.NUMBER, description: 'Score from 0 to 10' },
            creativity: { type: Type.NUMBER, description: 'Score from 0 to 10' },
            comedy: { type: Type.NUMBER, description: 'Score from 0 to 10' },
            overall: { type: Type.NUMBER, description: 'Score from 0 to 10' },
            category: {
              type: Type.STRING,
              description: 'One of the allowed categories',
            },
            verdict: { type: Type.STRING, description: 'One short, funny sentence' },
          },
          required: [
            'weirdness',
            'believability',
            'creativity',
            'comedy',
            'overall',
            'category',
            'verdict',
          ],
        },
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      throw new Error('Empty response from model');
    }

    const parsed = JSON.parse(rawText);

    const overall = clampScore(parsed.overall, 50);
    const result = {
      weirdness: clampScore(parsed.weirdness, 50),
      believability: clampScore(parsed.believability, 50),
      creativity: clampScore(parsed.creativity, 50),
      comedy: clampScore(parsed.comedy, 50),
      overall,
      category: normalizeCategory(parsed.category, overall),
      verdict: String(parsed.verdict || 'An excuse so puzzling, science cannot explain it.').trim(),
    };

    return res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error('Error analyzing excuse with Gemini:');

    const errString = String(err?.message || err || '');
    const isRateLimit =
      err?.status === 429 ||
      errString.includes('429') ||
      errString.includes('RESOURCE_EXHAUSTED') ||
      errString.includes('quota') ||
      errString.includes('rate limit');

    if (isRateLimit) {
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT',
        message: '🛑 The free AI limit has been reached. Try again later.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'GENERAL_ERROR',
      message: 'Oops! Our excuse department got confused.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ExcuseCheck server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
