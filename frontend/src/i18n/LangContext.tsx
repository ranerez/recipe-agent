import { createContext, useContext, useState } from 'react';
import type { LangCode } from './translations';
import { translations, LANGUAGES } from './translations';
import { loadLang, persistLang } from '../utils/storage';

interface LangContextValue {
  lang: LangCode;
  dir: 'ltr' | 'rtl';
  englishName: string;
  setLang: (lang: LangCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(loadLang);

  const meta = LANGUAGES.find(l => l.code === lang)!;

  function setLang(newLang: LangCode) {
    setLangState(newLang);
    persistLang(newLang);
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    let str = translations[lang]?.[key] ?? translations['en']?.[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return str;
  }

  return (
    <LangContext.Provider value={{ lang, dir: meta.dir, englishName: meta.englishName, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}
