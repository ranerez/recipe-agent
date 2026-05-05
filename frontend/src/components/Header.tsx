interface HeaderProps {
  savedCount: number;
  onSavedClick: () => void;
}

export default function Header({ savedCount, onSavedClick }: HeaderProps) {
  return (
    <header className="text-center mb-8">
      <h1 className="text-[2.2rem] font-bold text-brand tracking-tight">🍳 Recipe Agent</h1>
      <p className="mt-1.5 text-gray-500 text-base">
        Tell me what's in your fridge or pantry and I'll suggest dinner ideas. Add raw ingredients or leftovers.
      </p>
      <button
        onClick={onSavedClick}
        className="mt-2 inline-block text-sm text-brand opacity-75 hover:opacity-100 hover:underline bg-transparent border-none cursor-pointer"
      >
        {savedCount > 0 ? `Saved Recipes (${savedCount})` : 'Saved Recipes'}
      </button>
    </header>
  );
}
