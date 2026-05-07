import { describe, it, expect } from 'vitest';
import {
  loadInventory, saveInventory,
  loadSavedRecipes, persistSavedRecipes,
  loadPreferences, persistPreferences,
  loadLang, persistLang,
} from '../utils/storage';

// localStorage is cleared before each test by setup.ts.

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

describe('loadInventory', () => {
  it('returns empty array when nothing is stored', () => {
    expect(loadInventory()).toEqual([]);
  });

  it('returns stored items after saveInventory', () => {
    saveInventory(['chicken', 'rice', 'onion']);
    expect(loadInventory()).toEqual(['chicken', 'rice', 'onion']);
  });

  it('returns empty array when stored value is malformed JSON', () => {
    localStorage.setItem('recipe-agent-inventory', 'not-json{{');
    expect(loadInventory()).toEqual([]);
  });
});

describe('saveInventory', () => {
  it('overwrites existing items', () => {
    saveInventory(['a', 'b']);
    saveInventory(['c']);
    expect(loadInventory()).toEqual(['c']);
  });

  it('can store an empty array', () => {
    saveInventory(['a', 'b']);
    saveInventory([]);
    expect(loadInventory()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Saved recipes
// ---------------------------------------------------------------------------

describe('loadSavedRecipes', () => {
  it('returns empty array when nothing is stored', () => {
    expect(loadSavedRecipes()).toEqual([]);
  });

  it('round-trips a saved recipe', () => {
    const recipe = { name: 'Pasta', markdown: '**Pasta**', savedAt: '2026-01-01T00:00:00Z' };
    persistSavedRecipes([recipe]);
    expect(loadSavedRecipes()).toEqual([recipe]);
  });

  it('returns empty array on malformed JSON', () => {
    localStorage.setItem('recipe-agent-saved', '{bad}');
    expect(loadSavedRecipes()).toEqual([]);
  });
});

describe('persistSavedRecipes', () => {
  it('stores multiple recipes and retrieves them', () => {
    const recipes = [
      { name: 'Salad', markdown: '**Salad**', savedAt: '2026-01-01T00:00:00Z' },
      { name: 'Soup',  markdown: '**Soup**',  savedAt: '2026-01-02T00:00:00Z' },
    ];
    persistSavedRecipes(recipes);
    expect(loadSavedRecipes()).toEqual(recipes);
  });

  it('can persist an empty list', () => {
    persistSavedRecipes([{ name: 'x', markdown: 'y', savedAt: '' }]);
    persistSavedRecipes([]);
    expect(loadSavedRecipes()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

describe('loadPreferences', () => {
  it('returns default preferences when nothing is stored', () => {
    expect(loadPreferences()).toEqual({ serves: 2, dietary: '' });
  });

  it('round-trips stored preferences', () => {
    const prefs = { serves: 4, dietary: 'vegan' };
    persistPreferences(prefs);
    expect(loadPreferences()).toEqual(prefs);
  });

  it('returns defaults on malformed JSON', () => {
    localStorage.setItem('recipe-agent-prefs', 'oops');
    expect(loadPreferences()).toEqual({ serves: 2, dietary: '' });
  });
});

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

describe('loadLang', () => {
  it('returns "en" when nothing is stored', () => {
    expect(loadLang()).toBe('en');
  });

  it('returns a stored valid language code', () => {
    persistLang('he');
    expect(loadLang()).toBe('he');
  });

  it('returns "en" for an unknown stored value', () => {
    localStorage.setItem('recipe-agent-lang', 'zz');
    expect(loadLang()).toBe('en');
  });

  it('returns "en" for an empty stored value', () => {
    localStorage.setItem('recipe-agent-lang', '');
    expect(loadLang()).toBe('en');
  });

  it('accepts all six supported language codes', () => {
    for (const code of ['en', 'es', 'fr', 'de', 'he', 'ar'] as const) {
      localStorage.setItem('recipe-agent-lang', code);
      expect(loadLang()).toBe(code);
    }
  });
});

describe('persistLang', () => {
  it('makes loadLang return the persisted code', () => {
    persistLang('ar');
    expect(loadLang()).toBe('ar');
  });

  it('overwrites a previously persisted code', () => {
    persistLang('fr');
    persistLang('de');
    expect(loadLang()).toBe('de');
  });
});
