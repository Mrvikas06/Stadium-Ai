import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { defaultTranslations } from '../src/lib/i18n.js';

describe('Internationalization (i18n)', () => {
  it('defaultTranslations has english dictionary with critical keys', () => {
    expect(defaultTranslations.en).toBeDefined();
    expect(defaultTranslations.en.title).toBe('Stadium Operations Hub');
    expect(defaultTranslations.en.dashboard).toBe('Dashboard');
    expect(defaultTranslations.en.navigate).toBe('Navigate');
    expect(defaultTranslations.en.assistant).toBe('Assistant');
  });

  const langDir = path.resolve(process.cwd(), 'public/lang');
  const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));

  it('all 13 language files exist in public/lang', () => {
    const expected = ['as', 'bn', 'en', 'es', 'gu', 'hi', 'kn', 'ml', 'mr', 'or', 'pa', 'ta', 'te'];
    const current = files.map(f => f.replace('.json', ''));
    expected.forEach(lang => {
      expect(current).toContain(lang);
    });
  });

  files.forEach(file => {
    it(`public/lang/${file} contains valid JSON and core properties`, () => {
      const content = fs.readFileSync(path.join(langDir, file), 'utf8');
      const parsed = JSON.parse(content);
      expect(parsed.dashboard).toBeDefined();
      expect(parsed.navigate).toBeDefined();
      expect(parsed.assistant).toBeDefined();
      expect(parsed.title).toBeDefined();
    });
  });
});
