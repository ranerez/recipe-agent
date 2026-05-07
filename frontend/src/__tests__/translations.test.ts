import { describe, it, expect } from 'vitest';
import { LANGUAGES, translations } from '../i18n/translations';
import type { LangCode } from '../i18n/translations';

const EN_KEYS = Object.keys(translations.en);

// ---------------------------------------------------------------------------
// LANGUAGES metadata
// ---------------------------------------------------------------------------

describe('LANGUAGES metadata', () => {
  it('contains exactly six languages', () => {
    expect(LANGUAGES).toHaveLength(6);
  });

  it('includes all expected language codes', () => {
    const codes = LANGUAGES.map(l => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('es');
    expect(codes).toContain('fr');
    expect(codes).toContain('de');
    expect(codes).toContain('he');
    expect(codes).toContain('ar');
  });

  it('marks Hebrew and Arabic as RTL', () => {
    const he = LANGUAGES.find(l => l.code === 'he')!;
    const ar = LANGUAGES.find(l => l.code === 'ar')!;
    expect(he.dir).toBe('rtl');
    expect(ar.dir).toBe('rtl');
  });

  it('marks English, Spanish, French and German as LTR', () => {
    for (const code of ['en', 'es', 'fr', 'de']) {
      const lang = LANGUAGES.find(l => l.code === code)!;
      expect(lang.dir, `${code} should be LTR`).toBe('ltr');
    }
  });

  it('every language has a non-empty flag, name, and englishName', () => {
    for (const lang of LANGUAGES) {
      expect(lang.flag.length, `${lang.code} flag`).toBeGreaterThan(0);
      expect(lang.name.length, `${lang.code} name`).toBeGreaterThan(0);
      expect(lang.englishName.length, `${lang.code} englishName`).toBeGreaterThan(0);
    }
  });

  it('language codes match the entries in the translations object', () => {
    const translationCodes = Object.keys(translations) as LangCode[];
    for (const lang of LANGUAGES) {
      expect(translationCodes).toContain(lang.code);
    }
  });
});

// ---------------------------------------------------------------------------
// Translation completeness
// ---------------------------------------------------------------------------

describe('translations completeness', () => {
  const nonEnglishLangs = LANGUAGES.filter(l => l.code !== 'en');

  for (const lang of nonEnglishLangs) {
    it(`${lang.code} (${lang.englishName}) has all keys from English`, () => {
      const langStrings = translations[lang.code];
      const missingKeys = EN_KEYS.filter(k => !(k in langStrings));
      expect(
        missingKeys,
        `Missing keys in ${lang.code}: ${missingKeys.join(', ')}`,
      ).toHaveLength(0);
    });
  }

  it('no translation has an empty string value', () => {
    for (const [code, strings] of Object.entries(translations)) {
      for (const [key, value] of Object.entries(strings)) {
        expect(value.length, `${code}.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('every language code has a translations entry', () => {
    for (const lang of LANGUAGES) {
      expect(translations, `no entry for ${lang.code}`).toHaveProperty(lang.code);
    }
  });
});

// ---------------------------------------------------------------------------
// Translation interpolation helper (mirrors LangContext t())
// ---------------------------------------------------------------------------

function interpolate(str: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
    str,
  );
}

describe('translation interpolation', () => {
  it('replaces a single {placeholder}', () => {
    const result = interpolate('Hello, {name}!', { name: 'World' });
    expect(result).toBe('Hello, World!');
  });

  it('replaces multiple distinct placeholders', () => {
    const result = interpolate('{m}m {s}s remaining', { m: 2, s: '05' });
    expect(result).toBe('2m 05s remaining');
  });

  it('replaces the same placeholder multiple times', () => {
    const result = interpolate('{x} and {x}', { x: 'cat' });
    expect(result).toBe('cat and cat');
  });

  it('leaves unmatched placeholders intact', () => {
    const result = interpolate('Hello {name}', { other: 'value' });
    expect(result).toBe('Hello {name}');
  });

  it('works with English savedRecipesCount template', () => {
    const tmpl = translations.en['header.savedRecipesCount'];
    expect(interpolate(tmpl, { count: 3 })).toBe('Saved Recipes (3)');
  });

  it('works with inSeconds template for each language', () => {
    for (const [code, strings] of Object.entries(translations)) {
      const tmpl = strings['quota.inSecondsPlural'];
      const result = interpolate(tmpl, { count: 5 });
      expect(result, `${code} inSecondsPlural`).not.toContain('{count}');
    }
  });
});
