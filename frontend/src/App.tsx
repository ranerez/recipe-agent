import { useEffect, useRef, useState } from 'react';
import type { Message, QuotaPayload, SavedRecipe, Preferences } from './types';
import {
  loadInventory, saveInventory,
  loadSavedRecipes, persistSavedRecipes,
  loadPreferences, persistPreferences,
} from './utils/storage';
import { extractAiComment } from './utils/markdown';
import { useLang } from './i18n/LangContext';
import Header from './components/Header';
import PreferencesCard from './components/PreferencesCard';
import InventoryCard from './components/InventoryCard';
import OutputCard from './components/OutputCard';
import FeedbackCard from './components/FeedbackCard';
import SavedModal from './components/SavedModal';
import AboutPanel from './components/AboutPanel';
import QuotaOverlay from './components/QuotaOverlay';
import SetupOverlay from './components/SetupOverlay';

export default function App() {
  const { dir, englishName, t } = useLang();
  const [inventory, setInventory] = useState<string[]>(loadInventory);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(loadSavedRecipes);
  const [prefs, setPrefs] = useState<Preferences>(loadPreferences);
  const [prefsOpen, setPrefsOpen] = useState(false);

  const [history, setHistory] = useState<Message[]>([]);
  const [rawMarkdown, setRawMarkdown] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState('');
  const [refineStatus, setRefineStatus] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [aiComment, setAiComment] = useState('');
  const [instructions, setInstructions] = useState('');

  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [quotaPayload, setQuotaPayload] = useState<QuotaPayload | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  // Ref mirrors rawMarkdown state so the streaming loop can read the accumulated
  // text synchronously on [DONE] — setState is async and wouldn't reflect the
  // latest value within the same while-loop iteration.
  const rawMarkdownRef = useRef('');

  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(d => { if (!d.configured) setShowSetup(true); })
      .catch(() => setShowSetup(true));
  }, []);

  function handlePrefsChange(p: Preferences) {
    setPrefs(p);
    persistPreferences(p);
  }

  function sanitizeText(s: string): string {
    // Strip control characters (except normal whitespace) and trim.
    return s.replace(/[^\P{C}\t\n\r ]/gu, '').trim();
  }

  function handleAddIngredient(raw: string): string[] {
    const newItems = raw
      .split(',')
      .map(s => sanitizeText(s).slice(0, 100))
      .filter(Boolean);
    const current = loadInventory();
    const duplicates: string[] = [];

    for (const item of newItems) {
      const existing = current.find(i => i.toLowerCase() === item.toLowerCase());
      if (!existing) current.push(item);
      else duplicates.push(existing);
    }

    current.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    saveInventory(current);
    setInventory([...current]);
    return duplicates;
  }

  function handleClear() {
    setRawMarkdown('');
    rawMarkdownRef.current = '';
    setHistory([]);
    setShowFeedback(false);
    setAiComment('');
    setStreamStatus('');
    setRefineStatus('');
  }

  function handleRemoveIngredient(name: string) {
    const updated = inventory.filter(i => i !== name);
    saveInventory(updated);
    setInventory(updated);
  }

  function handleToggleSave(name: string, markdown: string) {
    const list = loadSavedRecipes();
    if (list.some(r => r.name === name)) return;
    list.push({ name, markdown, savedAt: new Date().toISOString() });
    persistSavedRecipes(list);
    setSavedRecipes([...list]);
  }

  function handleDeleteSaved(i: number) {
    const list = loadSavedRecipes();
    list.splice(i, 1);
    persistSavedRecipes(list);
    setSavedRecipes([...list]);
  }

  async function streamFromHistory(messages: Message[], onStatus: (s: string) => void) {
    rawMarkdownRef.current = '';
    setRawMarkdown('');
    setIsStreaming(true);
    setShowFeedback(false);

    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || res.statusText);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last fragment: a read() chunk may end mid-line.
        buffer = lines.pop()!;

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const chunk = line.slice(6);

          if (chunk.startsWith('[ERROR:')) {
            try {
              const payload = JSON.parse(chunk.slice(7, -1)) as QuotaPayload;
              setQuotaPayload(payload);
            } catch {
              onStatus(t('app.apiError'));
            }
            return;
          }

          if (chunk === '[DONE]') {
            onStatus('');
            const final = rawMarkdownRef.current;
            setHistory(h => [...h, { role: 'assistant', content: final }]);
            const comment = extractAiComment(final);
            setAiComment(comment ?? '');
            setShowFeedback(true);
            return;
          }

          // Server escapes newlines as \n so they don't break SSE framing.
          rawMarkdownRef.current += chunk.replace(/\\n/g, '\n');
          setRawMarkdown(rawMarkdownRef.current);
        }
      }
    } catch (err) {
      onStatus(`${t('app.error')}${(err as Error).message}`);
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleSubmit() {
    if (!inventory.length) {
      setStreamStatus(t('app.addIngredients'));
      return;
    }

    const { serves, dietary } = prefs;
    const prefParts = [`Scale for ${serves} serving${serves === 1 ? '' : 's'}`];
    if (dietary) prefParts.push(dietary);
    if (instructions.trim()) prefParts.push(instructions.trim());

    const userMessage = `I have: ${inventory.join(', ')}\n\nPreferences: ${prefParts.join(', ')}\n\nWhat dinners can I make tonight?\n\nPlease respond entirely in ${englishName}.`;
    const newHistory: Message[] = [{ role: 'user', content: userMessage }];
    setHistory(newHistory);
    setStreamStatus(t('inventory.finding'));

    await streamFromHistory(newHistory, setStreamStatus);
  }

  async function handleRefine(feedback: string) {
    const newHistory: Message[] = [...history, { role: 'user', content: feedback }];
    setHistory(newHistory);
    setRefineStatus('Refining…');

    await streamFromHistory(newHistory, setRefineStatus);

    // On success, streamFromHistory appended an assistant message, so the last
    // role is 'assistant' and this is a no-op. On error it was never appended,
    // so the last role is still 'user' — remove it to keep history consistent.
    setHistory(h => {
      if (h[h.length - 1]?.role === 'user') return h.slice(0, -1);
      return h;
    });
  }

  return (
    <div dir={dir} className="bg-warm-bg min-h-screen flex flex-col items-center px-4 py-8 pb-16">
      <Header savedCount={savedRecipes.length} onSavedClick={() => setShowSavedModal(true)} onAboutClick={() => setShowAbout(true)} />

      <PreferencesCard
        prefs={prefs}
        isOpen={prefsOpen}
        onToggle={() => setPrefsOpen(o => !o)}
        onChange={handlePrefsChange}
      />

      <InventoryCard
        inventory={inventory}
        instructions={instructions}
        isStreaming={isStreaming}
        hasResults={!!rawMarkdown}
        onAdd={handleAddIngredient}
        onRemove={handleRemoveIngredient}
        onInstructionsChange={setInstructions}
        onSubmit={handleSubmit}
        onClear={handleClear}
      />

      {streamStatus && !isStreaming && (
        <p className="mt-4 text-sm text-[#888] text-center">{streamStatus}</p>
      )}

      <OutputCard
        rawMarkdown={rawMarkdown}
        isStreaming={isStreaming}
        savedRecipes={savedRecipes}
        onToggleSave={handleToggleSave}
      />

      {showFeedback && !isStreaming && (
        <FeedbackCard
          aiComment={aiComment}
          isStreaming={isStreaming}
          refineStatus={refineStatus}
          onRefine={handleRefine}
        />
      )}

      {showSavedModal && (
        <SavedModal
          recipes={savedRecipes}
          onClose={() => setShowSavedModal(false)}
          onDelete={handleDeleteSaved}
        />
      )}

      {showAbout && <AboutPanel onClose={() => setShowAbout(false)} />}

      {quotaPayload && (
        <QuotaOverlay
          payload={quotaPayload}
          onClose={() => setQuotaPayload(null)}
        />
      )}

      {showSetup && (
        <SetupOverlay onSuccess={() => setShowSetup(false)} />
      )}

      <footer className="mt-auto pt-6 text-center text-[#aaa] text-xs">
        {t('footer.copyright')}
      </footer>
    </div>
  );
}
