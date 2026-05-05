import { useEffect, useRef, useState } from 'react';
import type { QuotaPayload } from '../types';

interface QuotaOverlayProps {
  payload: QuotaPayload;
  onClose: () => void;
}

export default function QuotaOverlay({ payload, onClose }: QuotaOverlayProps) {
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (payload.kind !== 'rate_limit') return;

    const secs = parseInt(payload.retry_after ?? '60') || 60;
    const retryAt = Date.now() + secs * 1000;

    function tick() {
      const left = Math.max(0, Math.round((retryAt - Date.now()) / 1000));
      if (left === 0) {
        setCountdown('You can try again now.');
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const m = Math.floor(left / 60);
      const s = left % 60;
      setCountdown(m > 0 ? `in ${m}m ${s.toString().padStart(2, '0')}s` : `in ${left} second${left === 1 ? '' : 's'}`);
    }

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [payload]);

  let icon = '⚠️', title = 'API error', desc: React.ReactNode = payload.message || 'An unexpected error occurred.';
  let retryTime = '';

  if (payload.kind === 'quota') {
    icon = '💳';
    title = 'Credit balance exhausted';
    desc = <>Your API key has run out of credits. <a href="https://console.anthropic.com/settings/billing" target="_blank" rel="noopener" className="text-brand font-semibold">Top up your balance</a> to continue.</>;
  } else if (payload.kind === 'rate_limit') {
    icon = '⏳';
    title = 'Rate limit reached';
    desc = 'Your API key has hit its rate limit. You can try again at:';
    const secs = parseInt(payload.retry_after ?? '60') || 60;
    retryTime = new Date(Date.now() + secs * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (payload.kind === 'overloaded') {
    icon = '🔄';
    title = 'API temporarily overloaded';
    desc = "Anthropic's API is experiencing high demand. Wait a moment and try again.";
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.2)] p-[2.2rem_2rem] max-w-[440px] w-full text-center">
        <div className="text-[2.8rem] mb-[0.6rem]">{icon}</div>
        <h3 className="text-[1.25rem] text-[#1a1a1a] mb-[0.6rem] font-bold">{title}</h3>
        <p className="text-[#666] text-[0.93rem] leading-relaxed">{desc}</p>
        {retryTime && (
          <div className="text-[2rem] font-bold text-brand mt-[1.1rem] mb-[0.2rem] tracking-tight">{retryTime}</div>
        )}
        {countdown && (
          <div className="text-[0.88rem] text-[#999] mb-6 min-h-[1.3em]">{countdown}</div>
        )}
        <button
          onClick={onClose}
          className="max-w-[180px] mx-auto block w-full py-[0.7rem] text-[0.95rem] font-semibold bg-brand text-white rounded-xl hover:bg-brand-dark transition-colors mt-6"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
