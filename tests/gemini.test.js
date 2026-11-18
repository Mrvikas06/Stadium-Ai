import { describe, it, expect, vi } from 'vitest';
import { askGemini } from '../src/lib/gemini.js';

describe('Gemini Client Library', () => {
  it('throws helpful error on timeout', async () => {
    // Mock fetch that hangs longer than timeoutMs
    global.fetch = vi.fn().mockImplementation((_url, options) => {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => {
          const err = new Error('The user aborted a request.');
          err.name = 'AbortError';
          reject(err);
        });
      });
    });

    await expect(askGemini({ userPrompt: 'test prompt', timeoutMs: 20 }))
      .rejects.toThrow(/timed out/i);
  });

  it('parses error message on failed response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid prompt parameters' })
    });

    await expect(askGemini({ userPrompt: 'bad input' }))
      .rejects.toThrow('Invalid prompt parameters');
  });

  it('returns reply string on successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: 'Gate 4 is open.' })
    });

    const reply = await askGemini({ userPrompt: 'test' });
    expect(reply).toBe('Gate 4 is open.');
  });
});
