import type { Preferences } from '../types';

interface PreferencesCardProps {
  prefs: Preferences;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (prefs: Preferences) => void;
}

export default function PreferencesCard({ prefs, isOpen, onToggle, onChange }: PreferencesCardProps) {
  const summary = [
    `${prefs.serves} serve${prefs.serves === 1 ? '' : 's'}`,
    ...(prefs.dietary ? [prefs.dietary] : []),
  ].join(' · ');

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 w-full max-w-[760px] mb-4">
      <div
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <span className="font-semibold text-[0.95rem] text-[#444] flex-1">Preferences</span>
        <span className="text-[0.84rem] text-[#aaa]">{summary}</span>
        <span
          className={`text-[0.8rem] text-[#bbb] transition-transform duration-200 inline-block ${isOpen ? 'rotate-90' : ''}`}
        >
          ▶
        </span>
      </div>

      {isOpen && (
        <>
          <hr className="border-none border-t border-warm-divider my-[1.4rem]" />
          <div className="flex items-center gap-[0.9rem] mb-[1.1rem]">
            <label htmlFor="pref-serves" className="text-[0.92rem] text-[#555] font-medium whitespace-nowrap">
              Default serves
            </label>
            <input
              id="pref-serves"
              type="number"
              min={1}
              max={20}
              value={prefs.serves}
              onChange={e => onChange({ ...prefs, serves: Math.max(1, parseInt(e.target.value) || 2) })}
              className="w-[5.5rem] border-[1.5px] border-[#ddd] rounded-lg px-[0.7rem] py-[0.45rem] text-[0.95rem] bg-[#fafafa] focus:outline-none focus:border-brand focus:bg-white transition-colors"
            />
          </div>

          <div className="font-semibold text-[0.95rem] text-[#444] flex items-center justify-between mb-2">
            Dietary restrictions
            <span className="font-normal text-[0.82rem] text-[#aaa]">optional</span>
          </div>
          <textarea
            id="pref-dietary"
            value={prefs.dietary}
            onChange={e => onChange({ ...prefs, dietary: e.target.value })}
            placeholder="e.g. vegetarian, pescatarian, no nuts, gluten-free, dairy-free…"
            className="w-full border-[1.5px] border-[#ddd] rounded-lg px-[0.9rem] py-[0.6rem] text-[0.95rem] bg-[#fafafa] resize-y min-h-[4.5rem] focus:outline-none focus:border-brand focus:bg-white transition-colors"
          />
        </>
      )}
    </div>
  );
}
