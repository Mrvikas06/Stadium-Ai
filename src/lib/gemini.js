export async function askGemini({ systemPrompt, userPrompt, languageCode = 'en', timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        languageCode
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload?.error || payload?.error?.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data?.reply || '';
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check venue connection and retry.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
