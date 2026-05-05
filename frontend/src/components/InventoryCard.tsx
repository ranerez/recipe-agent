import { useRef, useState } from 'react';

interface InventoryCardProps {
  inventory: string[];
  instructions: string;
  isStreaming: boolean;
  onAdd: (raw: string) => string[];
  onRemove: (name: string) => void;
  onInstructionsChange: (v: string) => void;
  onSubmit: () => void;
}

export default function InventoryCard({
  inventory,
  instructions,
  isStreaming,
  onAdd,
  onRemove,
  onInstructionsChange,
  onSubmit,
}: InventoryCardProps) {
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

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 w-full max-w-[760px]">
      {/* Inventory label */}
      <div className="flex items-center justify-between font-semibold text-[0.95rem] text-[#444] mb-3">
        My Pantry &amp; Fridge
        <span className="font-normal text-[0.82rem] text-[#aaa]">
          {inventory.length > 0 ? `${inventory.length} item${inventory.length === 1 ? '' : 's'}` : ''}
        </span>
      </div>

      {/* Add row */}
      <div className="flex gap-2 mb-[0.9rem]">
        <input
          ref={inputRef}
          type="text"
          placeholder="Add an ingredient…"
          autoComplete="off"
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          onAnimationEnd={() => setShakingInput(false)}
          className={`flex-1 border-[1.5px] border-[#ddd] rounded-lg px-[0.85rem] py-[0.55rem] text-[0.95rem] bg-[#fafafa] focus:outline-none focus:border-brand focus:bg-white transition-colors ${shakingInput ? 'animate-shake' : ''}`}
        />
        <button
          onClick={handleAdd}
          className="px-[1.1rem] py-[0.55rem] text-[0.95rem] font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark active:scale-[0.98] transition-all"
        >
          Add
        </button>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2 min-h-[2.4rem]">
        {sorted.length === 0 ? (
          <span className="text-[#bbb] text-[0.88rem] italic py-[0.3rem]">
            No ingredients yet — add some above.
          </span>
        ) : (
          sorted.map(item => (
            <Chip
              key={item}
              name={item}
              isPulsing={pulsingChips.has(item)}
              onPulseEnd={() => setPulsingChips(prev => { const s = new Set(prev); s.delete(item); return s; })}
              onRemove={() => onRemove(item)}
            />
          ))
        )}
      </div>

      <hr className="border-none border-t border-warm-divider my-[1.4rem]" />

      {/* Instructions */}
      <div className="flex items-center justify-between font-semibold text-[0.95rem] text-[#444] mb-3">
        Any preferences?
        <span className="font-normal text-[0.82rem] text-[#aaa]">optional</span>
      </div>
      <input
        type="text"
        value={instructions}
        onChange={e => onInstructionsChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onSubmit()}
        placeholder="e.g. quick meals only, cooking for 4, no dairy, something spicy…"
        autoComplete="off"
        className="w-full border-[1.5px] border-[#ddd] rounded-lg px-[0.9rem] py-[0.6rem] text-[0.95rem] bg-[#fafafa] focus:outline-none focus:border-brand focus:bg-white transition-colors mb-4"
      />

      <button
        onClick={onSubmit}
        disabled={inventory.length === 0 || isStreaming}
        className="w-full py-[0.85rem] bg-brand text-white text-[1.05rem] font-semibold rounded-xl hover:bg-brand-dark active:scale-[0.98] disabled:bg-brand-light disabled:cursor-not-allowed transition-all"
      >
        {isStreaming ? 'Finding recipes…' : 'Find Recipes'}
      </button>
    </div>
  );
}

function Chip({
  name,
  isPulsing,
  onPulseEnd,
  onRemove,
}: {
  name: string;
  isPulsing: boolean;
  onPulseEnd: () => void;
  onRemove: () => void;
}) {
  return (
    <span
      onAnimationEnd={onPulseEnd}
      className={`inline-flex items-center gap-[0.35rem] bg-brand-bg border border-brand-border rounded-full px-[0.75rem] py-[0.3rem] text-[0.88rem] text-[#7b2c24] hover:bg-[#f9ddd9] transition-colors ${isPulsing ? 'animate-pulse-chip' : ''}`}
    >
      {name}
      <button
        onClick={onRemove}
        title="Remove"
        className="bg-transparent border-none cursor-pointer p-0 m-0 text-brand text-base leading-none opacity-60 hover:opacity-100 flex items-center transition-opacity"
      >
        ✕
      </button>
    </span>
  );
}
