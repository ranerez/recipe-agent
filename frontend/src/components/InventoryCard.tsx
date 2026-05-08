import { useRef, useState } from 'react';
import { useLang } from '../i18n/LangContext';

interface InventoryCardProps {
  inventory: string[];
  selectedIngredients: string[];
  instructions: string;
  isStreaming: boolean;
  hasResults: boolean;
  onAdd: (raw: string) => string[];
  onRemove: (name: string) => void;
  onSelect: (name: string) => void;
  onDeselect: (name: string) => void;
  onClearSelected: () => void;
  onInstructionsChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export default function InventoryCard({
  inventory,
  selectedIngredients,
  instructions,
  isStreaming,
  hasResults,
  onAdd,
  onRemove,
  onSelect,
  onDeselect,
  onClearSelected,
  onInstructionsChange,
  onSubmit,
  onClear,
}: InventoryCardProps) {
  const { t } = useLang();
  const inputRef = useRef<HTMLInputElement>(null);
  const [shakingInput, setShakingInput] = useState(false);
  const [pulsingChips, setPulsingChips] = useState<Set<string>>(new Set());

  function handleAdd() {
    const raw = inputRef.current?.value.trim() ?? '';
    if (!raw) return;
    const duplicates = onAdd(raw);
    if (inputRef.current) inputRef.current.value = '';
    inputRef.current?.focus();

    if (duplicates.length > 0) {
      setShakingInput(true);
      setPulsingChips(new Set(duplicates));
    }
  }

  const sorted = [...inventory].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const selectedSet = new Set(selectedIngredients);
  const itemCount = inventory.length;
  const itemWord = itemCount === 1 ? t('inventory.item') : t('inventory.items');

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 w-full max-w-[760px]">
      {/* Title row */}
      <div className="flex items-center justify-between font-semibold text-[0.95rem] text-[#444] mb-3">
        {t('inventory.title')}
        <span className="font-normal text-[0.82rem] text-[#aaa]">
          {itemCount > 0 ? `${itemCount} ${itemWord}` : ''}
        </span>
      </div>

      {/* Add row */}
      <div className="flex gap-2 mb-[0.9rem]">
        <input
          ref={inputRef}
          type="text"
          placeholder={t('inventory.addPlaceholder')}
          autoComplete="off"
          maxLength={200}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          onAnimationEnd={() => setShakingInput(false)}
          className={`flex-1 border-[1.5px] border-[#ddd] rounded-lg px-[0.85rem] py-[0.55rem] text-[0.95rem] bg-[#fafafa] focus:outline-none focus:border-brand focus:bg-white transition-colors ${shakingInput ? 'animate-shake' : ''}`}
        />
        <button
          onClick={handleAdd}
          className="px-[1.1rem] py-[0.55rem] text-[0.95rem] font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark active:scale-[0.98] transition-all"
        >
          {t('inventory.add')}
        </button>
      </div>

      {/* Pantry chips */}
      <div className="flex flex-wrap gap-2 min-h-[2.4rem]">
        {sorted.length === 0 ? (
          <span className="text-[#bbb] text-[0.88rem] italic py-[0.3rem]">
            {t('inventory.empty')}
          </span>
        ) : (
          sorted.map(item => (
            <PantryChip
              key={item}
              name={item}
              isSelected={selectedSet.has(item)}
              isPulsing={pulsingChips.has(item)}
              onPulseEnd={() => setPulsingChips(prev => { const s = new Set(prev); s.delete(item); return s; })}
              onRemove={() => onRemove(item)}
              onSelect={() => onSelect(item)}
            />
          ))
        )}
      </div>

      {/* Use-only section */}
      <div className="mt-[1.2rem]">
        <div className="flex items-center justify-between mb-[0.3rem]">
          <span className="font-semibold text-[0.95rem] text-[#444]">
            {t('inventory.useOnly')}
          </span>
          {selectedIngredients.length > 0 && (
            <button
              onClick={onClearSelected}
              className="text-[0.8rem] text-[#aaa] hover:text-brand transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              {t('inventory.clearAll')}
            </button>
          )}
        </div>
        <p className="text-[0.82rem] text-[#bbb] mb-2">{t('inventory.useOnlyHint')}</p>
        <div className="flex flex-wrap gap-2 min-h-[2rem]">
          {selectedIngredients.map(item => (
            <SelectedChip key={item} name={item} onDeselect={() => onDeselect(item)} />
          ))}
        </div>
      </div>

      <hr className="border-none border-t border-warm-divider my-[1.4rem]" />

      {/* Instructions */}
      <div className="flex items-center justify-between font-semibold text-[0.95rem] text-[#444] mb-3">
        {t('inventory.prefsTitle')}
        <span className="font-normal text-[0.82rem] text-[#aaa]">{t('inventory.optional')}</span>
      </div>
      <input
        type="text"
        value={instructions}
        onChange={e => onInstructionsChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        placeholder={t('inventory.prefsPlaceholder')}
        autoComplete="off"
        maxLength={500}
        className="w-full border-[1.5px] border-[#ddd] rounded-lg px-[0.9rem] py-[0.6rem] text-[0.95rem] bg-[#fafafa] focus:outline-none focus:border-brand focus:bg-white transition-colors mb-4"
      />

      <div className="flex gap-3">
        <button
          onClick={onSubmit}
          disabled={inventory.length === 0 || isStreaming}
          className="flex-1 py-[0.85rem] bg-brand text-white text-[1.05rem] font-semibold rounded-xl hover:bg-brand-dark active:scale-[0.98] disabled:bg-brand-light disabled:cursor-not-allowed transition-all"
        >
          {isStreaming ? t('inventory.finding') : t('inventory.find')}
        </button>
        {hasResults && !isStreaming && (
          <button
            onClick={onClear}
            className="px-5 py-[0.85rem] text-[1.05rem] font-semibold rounded-xl border-[1.5px] border-[#ddd] text-[#888] hover:border-brand hover:text-brand active:scale-[0.98] transition-all bg-white"
          >
            {t('inventory.clear')}
          </button>
        )}
      </div>
    </div>
  );
}

function PantryChip({
  name,
  isSelected,
  isPulsing,
  onPulseEnd,
  onRemove,
  onSelect,
}: {
  name: string;
  isSelected: boolean;
  isPulsing: boolean;
  onPulseEnd: () => void;
  onRemove: () => void;
  onSelect: () => void;
}) {
  return (
    <span
      onAnimationEnd={onPulseEnd}
      className={`inline-flex items-center gap-[0.3rem] bg-brand-bg border border-brand-border rounded-full px-[0.75rem] py-[0.3rem] text-[0.88rem] text-[#7b2c24] transition-colors ${isPulsing ? 'animate-pulse-chip' : 'hover:bg-[#f9ddd9]'}`}
    >
      {!isSelected && (
        <button
          onClick={onSelect}
          title="+"
          className="bg-transparent border-none cursor-pointer p-0 m-0 text-brand leading-none opacity-50 hover:opacity-100 flex items-center transition-opacity font-bold text-[0.95rem]"
        >
          +
        </button>
      )}
      {name}
      <button
        onClick={onRemove}
        title="Remove"
        className="bg-transparent border-none cursor-pointer p-0 m-0 text-brand text-base leading-none opacity-40 hover:opacity-100 flex items-center transition-opacity"
      >
        ✕
      </button>
    </span>
  );
}

function SelectedChip({ name, onDeselect }: { name: string; onDeselect: () => void }) {
  return (
    <span className="inline-flex items-center gap-[0.3rem] bg-brand border border-brand rounded-full px-[0.75rem] py-[0.3rem] text-[0.88rem] text-white">
      <button
        onClick={onDeselect}
        title="−"
        className="bg-transparent border-none cursor-pointer p-0 m-0 text-white leading-none opacity-70 hover:opacity-100 flex items-center transition-opacity font-bold text-[1rem]"
      >
        −
      </button>
      {name}
    </span>
  );
}
