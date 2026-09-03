interface MathSymbolBarProps {
  onInsert: (symbol: string) => void;
  className?: string;
}

const COMMON_SYMBOLS = [
  { label: 'x²', insert: 'x²' },
  { label: 'x³', insert: 'x³' },
  { label: 'xⁿ', insert: '^' },
  { label: '√x', insert: '√(' },
  { label: '±', insert: '±' },
  { label: '∫', insert: '∫ ' },
  { label: 'dx', insert: ' dx' },
  { label: 'd/dx', insert: 'd/dx ' },
  { label: 'lim', insert: 'lim_{x→0} ' },
  { label: 'a/b', insert: ' / ' },
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'ln', insert: 'ln(' },
  { label: 'eˣ', insert: 'e^' },
  { label: 'π', insert: 'π' },
  { label: 'θ', insert: 'θ' },
  { label: '∞', insert: '∞' },
];

export function MathSymbolBar({ onInsert, className = '' }: MathSymbolBarProps) {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar ${className}`}>
      <span className="text-xs font-medium text-stone-500 uppercase tracking-wider shrink-0 mr-1 select-none">
        Symbols:
      </span>
      {COMMON_SYMBOLS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onInsert(s.insert)}
          className="h-8 px-2.5 rounded-md bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-700 text-xs font-mono font-medium border border-stone-200/80 transition-colors shrink-0 shadow-xs cursor-pointer"
          title={`Insert ${s.label}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
