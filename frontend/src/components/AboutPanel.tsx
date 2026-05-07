import { useLang } from '../i18n/LangContext';

interface AboutPanelProps {
  onClose: () => void;
}

export default function AboutPanel({ onClose }: AboutPanelProps) {
  const { t } = useLang();

  return (
    <div
      className="fixed inset-0 bg-black/45 z-[100] overflow-y-auto py-8 px-4 pb-16"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl max-w-[680px] mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-[1.3rem] text-brand font-bold">🍳 {t('about.title')}</h2>
            <p className="text-[#888] text-[0.9rem] mt-1">{t('about.tagline')}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-[1.4rem] cursor-pointer text-[#888] hover:text-[#333] leading-none p-0 ms-4 flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <hr className="border-none border-t border-warm-divider mb-6" />

        {/* What it does */}
        <Section title={t('about.whatTitle')}>
          <p className="text-[0.93rem] text-[#555] leading-relaxed">{t('about.what')}</p>
        </Section>

        {/* Each recipe includes */}
        <Section title={t('about.eachRecipeTitle')}>
          <ul className="space-y-1">
            {(['about.eachRecipe1', 'about.eachRecipe2', 'about.eachRecipe3', 'about.eachRecipe4'] as const).map(key => (
              <li key={key} className="flex items-start gap-2 text-[0.93rem] text-[#555]">
                <span className="text-brand mt-[2px] flex-shrink-0">✓</span>
                {t(key)}
              </li>
            ))}
          </ul>
        </Section>

        {/* Prompt caching */}
        <Section title={t('about.cachingTitle')}>
          <p className="text-[0.93rem] text-[#555] leading-relaxed">{t('about.caching')}</p>
        </Section>

        {/* API key */}
        <Section title={t('about.keyTitle')} last>
          <p className="text-[0.93rem] text-[#555] leading-relaxed">{t('about.key')}</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={last ? '' : 'mb-5'}>
      <h3 className="font-semibold text-[0.92rem] text-[#333] mb-2">{title}</h3>
      {children}
    </div>
  );
}
