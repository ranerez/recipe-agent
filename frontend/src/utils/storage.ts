import type { SavedRecipe, Preferences } from '../types';

const INVENTORY_KEY = 'recipe-agent-inventory';
const SAVED_KEY = 'recipe-agent-saved';
const PREFS_KEY = 'recipe-agent-prefs';

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
