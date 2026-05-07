import { useRef, useState } from 'react';
import { useLang } from '../i18n/LangContext';

interface SetupOverlayProps {
  onSuccess: () => void;
}

export default function SetupOverlay({ onSuccess }: SetupOverlayProps) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const key = inputRef.current?.value.trim() ?? '';
    setStatus(null);
    if (inputRef.current) inputRef.current.classList.remove('border-red-400');

    if (!key) {
      setStatus({ msg: t('setup.emptyKey'), ok: false });
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
      if (!res.ok) throw new Error(data.detail || t('setup.failed'));
      setStatus({ msg: t('setup.success'), ok: true });
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
        <h2 className="text-[1.5rem] text-brand mb-[0.35rem] font-bold">{t('setup.title')}</h2>
        <p className="text-[#666] text-[0.95rem] mb-[1.6rem] leading-relaxed">
          {t('setup.desc')}
        </p>

        <div className="bg-warm-bg rounded-xl px-[1.4rem] py-[1.2rem] mb-[1.6rem] text-[0.92rem] leading-[1.8] text-[#444]">
          <strong>{t('setup.howTo')}</strong>
          <ol className="list-decimal ps-5 mt-1">
            <li>
              <a href="https://console.anthropic.com" target="_blank" rel="noopener" className="text-brand font-semibold hover:underline">
                console.anthropic.com
              </a>{' '}
              — {t('setup.step1')}
            </li>
            <li>{t('setup.step2')}</li>
            <li>{t('setup.step3')}</li>
            <li>{t('setup.step4')}</li>
          </ol>
          <p className="mt-3 text-[0.85rem] text-[#888] italic">
            {t('setup.keyNote')}
          </p>
        </div>

        <label className="font-semibold text-[0.95rem] text-[#444] block mb-2">{t('setup.keyLabel')}</label>
        {/* API key input is always LTR regardless of UI language */}
        <div className="flex gap-2 mb-3" dir="ltr">
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
            {showKey ? t('setup.hide') : t('setup.show')}
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
          {saving ? t('setup.saving') : t('setup.save')}
        </button>
      </div>
    </div>
  );
}
