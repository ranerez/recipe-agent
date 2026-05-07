import { useEffect, useRef, useState } from 'react';
import type { QuotaPayload } from '../types';
import { useLang } from '../i18n/LangContext';

interface QuotaOverlayProps {
  payload: QuotaPayload;
  onClose: () => void;
}

export default function QuotaOverlay({ payload, onClose }: QuotaOverlayProps) {
  const { t } = useLang();
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (payload.kind !== 'rate_limit') return;

    const secs = parseInt(payload.retry_after ?? '60') || 60;
    const retryAt = Date.now() + secs * 1000;

    function tick() {
      const left = Math.max(0, Math.round((retryAt - Date.now()) / 1000));
      if (left === 0) {
        setCountdown(t('quota.tryAgainNow'));
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const m = Math.floor(left / 60);
      const s = left % 60;
      setCountdown(
        m > 0
          ? t('quota.inMinutes', { m, s: s.toString().padStart(2, '0') })
          : left === 1
            ? t('quota.inSeconds', { count: left })
            : t('quota.inSecondsPlural', { count: left }),
      );
    }

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [payload, t]);

  let icon = '⚠️';
  let title = t('quota.apiErrorTitle');
  let desc: React.ReactNode = payload.message || t('quota.apiErrorDesc');
  let retryTime = '';

  if (payload.kind === 'quota') {
    icon = '💳';
    title = t('quota.quotaTitle');
    desc = (
      <>
        {t('quota.quotaDesc')}{' '}
        <a href="https://console.anthropic.com/settings/billing" target="_blank" rel="noopener" className="text-brand font-semibold">
          {t('quota.topUp')}
        </a>
      </>
    );
  } else if (payload.kind === 'rate_limit') {
    icon = '⏳';
    title = t('quota.rateLimitTitle');
    desc = t('quota.rateLimitDesc');
    const secs = parseInt(payload.retry_after ?? '60') || 60;
    retryTime = new Date(Date.now() + secs * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (payload.kind === 'overloaded') {
    icon = '🔄';
    title = t('quota.overloadedTitle');
    desc = t('quota.overloadedDesc');
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
          {t('quota.gotIt')}
        </button>
      </div>
    </div>
  );
}
