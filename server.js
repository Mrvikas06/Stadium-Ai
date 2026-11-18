import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8791;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

app.use(express.json({ limit: '1mb' }));

// Security headers middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// In-memory rate limiter for API endpoints
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;

export function rateLimiter(req, res, next) {
  if (process.env.NODE_ENV === 'test' && !req.headers['x-test-ratelimit']) {
    return next();
  }
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    clientData.count += 1;
  }

  rateLimitMap.set(ip, clientData);

  if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', String(Math.ceil((clientData.resetTime - now) / 1000)));
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  next();
}

// Health and readiness check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: GEMINI_MODEL
  });
});

function getSimulatedFallback(prompt, languageCode = 'en') {
  const q = (prompt || '').toLowerCase();
  if (q.includes('food') || q.includes('snack') || q.includes('queue') || q.includes('line')) {
    return 'Food Court B currently has the shortest wait (approx 4 mins). Food Court A is currently congested at 18 mins.';
  }
  if (q.includes('gate') || q.includes('exit') || q.includes('crowd')) {
    return 'Gate 4 on the West concourse currently has the lowest congestion for exit. Gate 1 Main is at high capacity.';
  }
  if (q.includes('first aid') || q.includes('medical') || q.includes('help') || q.includes('doctor')) {
    return 'First Aid Station 1 is located near Gate 2 on Concourse Level 1. Mobile paramedics are stationed at North Stand aisle 4.';
  }
  if (q.includes('restroom') || q.includes('toilet') || q.includes('washroom')) {
    return 'Restroom Block 2 (South Concourse) is currently clear with under 2 mins wait. Restroom Block 1 has moderate wait.';
  }
  return `Stadium operations active: Recommended Gate 4 for rapid exit, Food Court B for fast dining. All safety lanes remain clear. (Language: ${languageCode})`;
}

app.post('/api/gemini', rateLimiter, async (req, res) => {
  try {
    const { userPrompt, systemPrompt, languageCode = 'en' } = req.body || {};
    if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
      return res.status(400).json({ error: 'userPrompt is required and must be non-empty string' });
    }

    if (userPrompt.length > 2000) {
      return res.status(400).json({ error: 'userPrompt exceeds maximum length of 2000 characters' });
    }

    const safeLanguageCode = String(languageCode).replace(/[^a-zA-Z-]/g, '').slice(0, 10) || 'en';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      const fallbackReply = getSimulatedFallback(userPrompt, safeLanguageCode);
      return res.json({
        reply: fallbackReply,
        model: 'simulated-local',
        notice: 'DEMO_MODE: GEMINI_API_KEY not configured on server. Showing dynamic venue assistant response.'
      });
    }

    const requestBody = {
      system_instruction: {
        parts: [{ text: `${systemPrompt || ''}\nReply in language code: ${safeLanguageCode}.` }]
      },
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 700
      },
      contents: [{ role: 'user', parts: [{ text: userPrompt.trim() }] }]
    };

    const candidateModels = [
      ...new Set([
        GEMINI_MODEL,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash'
      ])
    ];

    let lastError = 'Gemini request failed';
    for (const model of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const upstream = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });

      const payload = await upstream.json().catch(() => ({}));
      if (upstream.ok) {
        const reply = payload?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.json({ reply, model });
      }

      lastError = payload?.error?.message || `Gemini request failed for model ${model}`;
      if (upstream.status !== 404) {
        break;
      }
    }

    return res.status(502).json({ error: lastError });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
});

// JSON 404 for unhandled API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`StadiumAI server running at http://localhost:${PORT}`);
  });
}

export { app, server };
export default app;
