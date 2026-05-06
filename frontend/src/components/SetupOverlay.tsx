import { useRef, useState } from 'react';

interface SetupOverlayProps {
  onSuccess: () => void;
}

export default function SetupOverlay({ onSuccess }: SetupOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const key = inputRef.current?.value.trim() ?? '';
    setStatus(null);
    if (inputRef.current) inputRef.current.classList.remove('border-red-400');

    if (!key) {
      setStatus({ msg: 'Please paste your API key.', ok: false });
      inputRef.current?.classList.add('border-red-400');
      inputRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to save key.');
      setStatus({ msg: "Key saved! You're all set.", ok: true });
      setTimeout(onSuccess, 800);
    } catch (err) {
      setStatus({ msg: (err as Error).message, ok: false });
      inputRef.current?.classList.add('border-red-400');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[rgba(253,246,238,0.97)] z-[200] overflow-y-auto flex items-start justify-center px-4 pt-12 pb-16">
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.13)] p-[2.5rem_2.2rem] w-full max-w-[560px]">
        <h2 className="text-[1.5rem] text-brand mb-[0.35rem] font-bold">🔑 API Key Required</h2>
        <p className="text-[#666] text-[0.95rem] mb-[1.6rem] leading-relaxed">
          Recipe Agent uses the Anthropic API to generate recipes. You'll need a free API key to get started.
        </p>

        <div className="bg-warm-bg rounded-xl px-[1.4rem] py-[1.2rem] mb-[1.6rem] text-[0.92rem] leading-[1.8] text-[#444]">
          <strong>How to get your API key:</strong>
          <ol className="list-decimal pl-5 mt-1">
            <li>Go to <a href="https://console.anthropic.com" target="_blank" rel="noopener" className="text-brand font-semibold hover:underline">console.anthropic.com</a> and sign in (or create a free account).</li>
            <li>In the left sidebar, click <strong>API Keys</strong>.</li>
            <li>Click <strong>Create Key</strong>, give it a name, and copy the key.</li>
            <li>Paste it below and click <strong>Save</strong>.</li>
          </ol>
          <p className="mt-3 text-[0.85rem] text-[#888] italic">
            The key starts with <code>sk-ant-</code>. It will be saved to a local <code>.env</code> file — never sent anywhere except Anthropic's API.
          </p>
        </div>

        <label className="font-semibold text-[0.95rem] text-[#444] block mb-2">Your Anthropic API Key</label>
        <div className="flex gap-2 mb-3">
          <input
            ref={inputRef}
            type={showKey ? 'text' : 'password'}
            placeholder="sk-ant-…"
            autoComplete="off"
            spellCheck={false}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            className="flex-1 border-[1.5px] border-[#ddd] rounded-lg px-[0.9rem] py-[0.65rem] text-[0.95rem] font-mono bg-[#fafafa] focus:outline-none focus:border-brand focus:bg-white transition-colors"
          />
          <button
            onClick={() => setShowKey(v => !v)}
            className="flex-shrink-0 px-[0.9rem] bg-[#f5f5f5] border-[1.5px] border-[#ddd] rounded-lg text-[0.85rem] text-[#666] cursor-pointer hover:bg-[#eee] transition-colors"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>

        {status && (
          <div className={`min-h-[1.3em] text-[0.88rem] mb-4 ${status.ok ? 'text-green-600' : 'text-red-500'}`}>
            {status.msg}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-[0.85rem] bg-brand text-white text-[1.05rem] font-semibold rounded-xl hover:bg-brand-dark disabled:bg-brand-light disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving…' : 'Save & Continue'}
        </button>
      </div>
    </div>
  );
}
