import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Server API Endpoints', () => {
  it('GET /api/health should return 200 with server status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.model).toBeDefined();
    expect(typeof res.body.geminiConfigured).toBe('boolean');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/nonexistent should return 404 JSON', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('API route not found');
  });

  it('POST /api/gemini with empty body should return 400', async () => {
    const res = await request(app)
      .post('/api/gemini')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/userPrompt is required/i);
  });

  it('POST /api/gemini with empty userPrompt string should return 400', async () => {
    const res = await request(app)
      .post('/api/gemini')
      .send({ userPrompt: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/userPrompt is required/i);
  });

  it('POST /api/gemini with excessive length prompt should return 400', async () => {
    const hugePrompt = 'x'.repeat(2001);
    const res = await request(app)
      .post('/api/gemini')
      .send({ userPrompt: hugePrompt });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/maximum length/i);
  });

  it('POST /api/gemini without API key returns simulated response', async () => {
    const res = await request(app)
      .post('/api/gemini')
      .send({ userPrompt: 'Where is the nearest food court?' });
    expect(res.status).toBe(200);
    expect(res.body.reply).toBeDefined();
    expect(res.body.reply).toMatch(/Food Court/i);
  });
});
