import type { SavedRecipe, Preferences } from '../types';
import type { LangCode } from '../i18n/translations';

const INVENTORY_KEY = 'recipe-agent-inventory';
const SAVED_KEY = 'recipe-agent-saved';
const PREFS_KEY = 'recipe-agent-prefs';
const LANG_KEY = 'recipe-agent-lang';

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadInventory(): string[] {
  return safeGet<string[]>(INVENTORY_KEY, []);
}

export function saveInventory(items: string[]): void {
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(items));
}

export function loadSavedRecipes(): SavedRecipe[] {
  return safeGet<SavedRecipe[]>(SAVED_KEY, []);
}

export function persistSavedRecipes(list: SavedRecipe[]): void {
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function loadPreferences(): Preferences {
  return safeGet<Preferences>(PREFS_KEY, { serves: 2, dietary: '' });
}

export function persistPreferences(prefs: Preferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function loadLang(): LangCode {
  const raw = localStorage.getItem(LANG_KEY);
  const valid: LangCode[] = ['en', 'es', 'fr', 'de', 'he', 'ar'];
  return (raw && valid.includes(raw as LangCode)) ? (raw as LangCode) : 'en';
}

export function persistLang(lang: LangCode): void {
  localStorage.setItem(LANG_KEY, lang);
}
