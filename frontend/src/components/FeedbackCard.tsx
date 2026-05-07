import { useRef } from 'react';
import { parseMarkdown } from '../utils/markdown';
import { useLang } from '../i18n/LangContext';

interface FeedbackCardProps {
  aiComment: string;
  isStreaming: boolean;
  refineStatus: string;
  onRefine: (feedback: string) => void;
}

export default function FeedbackCard({ aiComment, isStreaming, refineStatus, onRefine }: FeedbackCardProps) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleRefine() {
    const val = inputRef.current?.value.trim() ?? '';
    if (!val) return;
    if (inputRef.current) inputRef.current.value = '';
    onRefine(val);
  }

  return (
    <div className="mt-4 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] px-8 py-6 w-full max-w-[760px]">
      {aiComment && (
        <div
          className="bg-warm-bg border-s-[3px] border-brand rounded-e-lg px-4 py-[0.7rem] mb-5 text-[0.95rem] text-[#555] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(aiComment) }}
        />
      )}
      <div className="font-semibold text-[0.95rem] text-[#444] mb-3">{t('feedback.title')}</div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder={t('feedback.placeholder')}
          autoComplete="off"
          maxLength={500}
          onKeyDown={e => e.key === 'Enter' && handleRefine()}
          className="flex-1 border-[1.5px] border-[#ddd] rounded-lg px-[0.85rem] py-[0.55rem] text-[0.95rem] bg-[#fafafa] focus:outline-none focus:border-brand focus:bg-white transition-colors"
        />
        <button
          onClick={handleRefine}
          disabled={isStreaming}
          className="px-[1.3rem] py-[0.6rem] text-[0.95rem] font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark active:scale-[0.98] disabled:bg-brand-light disabled:cursor-not-allowed transition-all"
        >
          {isStreaming ? t('feedback.refining') : t('feedback.refine')}
        </button>
      </div>
      {refineStatus && (
        <div className="mt-[0.6rem] text-[0.88rem] text-[#888] min-h-[1.2em]">{refineStatus}</div>
      )}
    </div>
  );
}
