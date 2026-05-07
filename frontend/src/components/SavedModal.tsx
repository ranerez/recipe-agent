import { useState } from 'react';
import { parseMarkdown } from '../utils/markdown';
import { printRecipe } from '../utils/print';
import type { SavedRecipe } from '../types';
import { useLang } from '../i18n/LangContext';

const PrinterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

interface SavedModalProps {
  recipes: SavedRecipe[];
  onClose: () => void;
  onDelete: (i: number) => void;
}

export default function SavedModal({ recipes, onClose, onDelete }: SavedModalProps) {
  const { t } = useLang();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(i: number) {
    setOpenIndex(prev => (prev === i ? null : i));
  }

  return (
    <div
      className="fixed inset-0 bg-black/45 z-[100] overflow-y-auto py-8 px-4 pb-16"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-[760px] mx-auto p-8">
        <div className="flex justify-between items-center mb-[1.4rem]">
          <h2 className="text-[1.3rem] text-brand font-bold">{t('saved.title')}</h2>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[1.4rem] cursor-pointer text-[#888] hover:text-[#333] leading-none p-0"
          >
            ✕
          </button>
        </div>

        {recipes.length === 0 ? (
          <p className="text-[#bbb] italic text-center py-8">{t('saved.empty')}</p>
        ) : (
          recipes.map((r, i) => (
            <div key={i} className="border-t border-warm-divider py-3">
              <div className="flex justify-between items-center gap-2">
                <span
                  className="font-semibold text-[0.97rem] text-[#1a1a1a] cursor-pointer flex-1 hover:text-brand transition-colors"
                  onClick={() => toggle(i)}
                >
                  {r.name}
                </span>
                <button
                  onClick={() => printRecipe(r.name, r.markdown)}
                  title={t('saved.print')}
                  className="p-[0.28rem] border-[1.5px] border-[#ddd] rounded-md text-[#aaa] hover:text-[#555] hover:border-[#999] bg-transparent transition-colors flex items-center leading-none"
                >
                  <PrinterIcon />
                </button>
                <button
                  onClick={() => {
                    onDelete(i);
                    if (openIndex === i) setOpenIndex(null);
                    else if (openIndex !== null && openIndex > i) setOpenIndex(openIndex - 1);
                  }}
                  className="bg-transparent border-[1.5px] border-[#ddd] text-[0.78rem] font-semibold text-[#999] cursor-pointer px-[0.6rem] py-[0.2rem] rounded-md hover:text-brand hover:border-brand transition-colors"
                >
                  {t('saved.remove')}
                </button>
              </div>

              {openIndex === i && (
                <div className="mt-[0.9rem] border-t border-dashed border-warm-divider pt-[0.9rem]">
                  <div
                    className="saved-recipe-prose"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(r.markdown) }}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
