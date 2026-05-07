import { parseMarkdown, parseRecipeSections } from '../utils/markdown';
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

interface OutputCardProps {
  rawMarkdown: string;
  isStreaming: boolean;
  savedRecipes: SavedRecipe[];
  onToggleSave: (name: string, markdown: string) => void;
}

export default function OutputCard({ rawMarkdown, isStreaming, savedRecipes, onToggleSave }: OutputCardProps) {
  const { t } = useLang();

  if (!rawMarkdown && !isStreaming) return null;

  if (isStreaming) {
    return (
      <div className="mt-6 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 w-full max-w-[760px]">
        <div className="recipe-prose" dangerouslySetInnerHTML={{ __html: parseMarkdown(rawMarkdown) }} />
        <span className="streaming-cursor" />
      </div>
    );
  }

  const sections = parseRecipeSections(rawMarkdown);

  return (
    <div className="mt-6 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 w-full max-w-[760px]">
      {sections.map((section, i) => {
        if (section.type === 'text') {
          return (
            <div
              key={i}
              className="recipe-prose"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(section.markdown) }}
            />
          );
        }

        const bodyMarkdown = section.markdown
          .replace(/^\*\*\[?.+?\]?\*\*\n?/, '')
          .trim();

        const isSaved = savedRecipes.some(r => r.name === section.title);

        return (
          <div key={i}>
            {i > 0 && <hr className="border-none border-t border-[#eee] my-[1.2rem]" />}
            <div className="flex justify-between items-center gap-2 mt-[1.2rem] mb-1">
              <p className="font-bold text-[0.97rem] leading-snug flex-1">
                {section.title}
              </p>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => printRecipe(section.title, section.markdown)}
                  title={t('output.print')}
                  className="p-[0.28rem] border-[1.5px] border-[#ddd] rounded-md text-[#aaa] hover:text-[#555] hover:border-[#999] bg-transparent transition-colors flex items-center leading-none"
                >
                  <PrinterIcon />
                </button>
                <button
                  onClick={isSaved ? undefined : () => onToggleSave(section.title, section.markdown)}
                  disabled={isSaved}
                  className={`px-3 py-[0.28rem] text-[0.78rem] font-semibold rounded-md border-[1.5px] transition-colors ${
                    isSaved
                      ? 'bg-brand border-brand text-white cursor-default'
                      : 'bg-transparent border-brand text-brand hover:bg-brand-bg'
                  }`}
                >
                  {isSaved ? t('output.saved') : t('output.save')}
                </button>
              </div>
            </div>
            <div
              className="recipe-prose"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(bodyMarkdown) }}
            />
          </div>
        );
      })}
    </div>
  );
}
