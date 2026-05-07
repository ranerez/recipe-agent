import { useLang } from '../i18n/LangContext';

interface HeaderProps {
  savedCount: number;
  onSavedClick: () => void;
  onAboutClick: () => void;
}

export default function Header({ savedCount, onSavedClick, onAboutClick }: HeaderProps) {
  const { t } = useLang();
  const savedLabel = savedCount > 0
    ? t('header.savedRecipesCount', { count: savedCount })
    : t('header.savedRecipes');

  return (
    <header className="text-center mb-8">
      <h1 className="text-[2.2rem] font-bold text-brand tracking-tight">🍳 Recipe Agent</h1>
      <p className="mt-1.5 text-gray-500 text-base">
        {t('header.subtitle')}
      </p>
      <div className="mt-2 flex items-center justify-center gap-4">
        <button
          onClick={onSavedClick}
          className="text-sm text-brand opacity-75 hover:opacity-100 hover:underline bg-transparent border-none cursor-pointer"
        >
          {savedLabel}
        </button>
        <span className="text-[#ddd] select-none">|</span>
        <button
          onClick={onAboutClick}
          className="text-sm text-brand opacity-75 hover:opacity-100 hover:underline bg-transparent border-none cursor-pointer"
        >
          {t('about.link')}
        </button>
      </div>
    </header>
  );
}
