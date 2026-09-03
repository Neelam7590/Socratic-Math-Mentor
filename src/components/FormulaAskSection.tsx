import { useState, FormEvent } from 'react';
import {
  Search,
  Sparkles,
  Loader2,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { MathView, FormattedMathText } from './MathView.js';
import type { FormulaExplanation, Subject } from '../types.js';

interface FormulaAskSectionProps {
  onPracticeProblem: (raw: string, latex: string, subject: Subject, topic: string) => void;
  className?: string;
  defaultExpanded?: boolean;
}

const POPULAR_FORMULAS = [
  { label: 'Integration by Parts', query: 'Integration by parts formula and LIATE rule' },
  { label: 'Quadratic Formula', query: 'Quadratic formula and discriminant rules' },
  { label: 'Chain Rule', query: 'Chain rule for derivative of composite functions' },
  { label: 'Quotient Rule', query: 'Quotient rule for differentiation' },
  { label: "L'Hôpital's Rule", query: "L'Hopital's rule for indeterminate limits" },
  { label: 'u-Substitution', query: 'Integration by substitution method' },
  { label: 'Trig Derivatives', query: 'Derivative of sin, cos, tan, sec' },
  { label: 'Logarithm Rules', query: 'Logarithm rules and power properties' },
];

export function FormulaAskSection({
  onPracticeProblem,
  className = '',
}: FormulaAskSectionProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<FormulaExplanation | null>(null);

  const handleSearch = async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/formulas/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Could not retrieve formula explanation.');
      }

      const data: FormulaExplanation = await res.json();
      setExplanation(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to explain formula. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleChipClick = (chipQuery: string) => {
    setQuery(chipQuery);
    handleSearch(chipQuery);
  };

  return (
    <div className={`bg-white rounded-2xl border border-stone-200 p-6 sm:p-7 shadow-xs space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-mono font-bold text-sm shadow-2xs">
            ƒ(x)
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Ask Formulas & Mathematical Concepts</span>
            </h2>
            <p className="text-xs text-stone-500">
              Ask about any Algebra or Calculus formula, rule, identity, or theorem in detail.
            </p>
          </div>
        </div>

        {explanation && (
          <button
            onClick={() => {
              setExplanation(null);
              setQuery('');
            }}
            className="text-xs text-stone-500 hover:text-stone-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Search / Ask Input */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask any formula, rule, or theorem... (e.g., 'Integration by parts', 'Chain rule', 'Why is d/dx sin = cos?')"
            disabled={isLoading}
            className="w-full pl-10 pr-28 py-3.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:bg-white focus:border-stone-900 focus:outline-none transition-colors"
            id="home-formula-search-input"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            id="home-formula-ask-btn"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Explaining...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask Formula</span>
              </>
            )}
          </button>
        </div>

        {/* Quick formula chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mr-1">
            Quick Lookup:
          </span>
          {POPULAR_FORMULAS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip.query)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs transition-colors cursor-pointer font-medium"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </form>

      {/* Error display */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
          {error}
        </div>
      )}

      {/* Formula Explanation Card */}
      {explanation && (
        <div className="rounded-2xl border border-stone-300 bg-stone-50/60 p-5 sm:p-6 space-y-5 shadow-xs animate-in fade-in duration-300">
          {/* Title & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
            <div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                {explanation.category}
              </span>
              <h3 className="text-xl font-bold text-stone-900 mt-1">
                {explanation.name}
              </h3>
            </div>

            {explanation.example && (
              <button
                onClick={() =>
                  onPracticeProblem(
                    explanation.example!.rawInput || explanation.example!.problemLatex,
                    explanation.example!.problemLatex,
                    explanation.example!.subject,
                    explanation.example!.topic
                  )
                }
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
                id="practice-formula-problem-btn"
              >
                <span>Practice this in Socratic Tutor</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}
          </div>

          {/* Large Formula Display */}
          <div className="p-4 sm:p-5 rounded-xl bg-white border border-stone-200 text-center overflow-x-auto shadow-2xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400 block mb-1">
              Standard Mathematical Formula
            </span>
            <div className="text-xl sm:text-2xl text-stone-900 font-medium py-1">
              <MathView math={explanation.formulaLatex} block={false} />
            </div>
          </div>

          {/* Intuition & Why it Works */}
          <div className="space-y-1.5 bg-white p-4 rounded-xl border border-stone-200">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Intuition & Explanation</span>
            </div>
            <div className="text-sm text-stone-800 leading-relaxed">
              <FormattedMathText text={explanation.intuitiveExplanation} />
            </div>
          </div>

          {/* When to Use & Rules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* When to Use */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>When to Apply</span>
              </div>
              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                <FormattedMathText text={explanation.whenToUse} />
              </div>
            </div>

            {/* Key Steps / Mnemonics */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-1.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>Key Steps & Rules</span>
              </div>
              <ul className="space-y-1 text-xs sm:text-sm text-stone-700">
                {explanation.keyStepsOrRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-purple-600 font-bold">•</span>
                    <span><FormattedMathText text={rule} /></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Common Pitfalls / Mistakes */}
          {explanation.commonMistakes && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Common Mistakes to Avoid</span>
              </div>
              <div className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                <FormattedMathText text={explanation.commonMistakes} />
              </div>
            </div>
          )}

          {/* Example Walkthrough */}
          {explanation.example && (
            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Example Walkthrough</span>
                </div>
                <span className="text-xs font-mono text-stone-500">
                  {explanation.example.topic}
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg text-center font-medium text-stone-900">
                <MathView math={explanation.example.problemLatex} block={false} />
              </div>

              <div className="text-xs sm:text-sm text-stone-700 leading-relaxed pt-1">
                <FormattedMathText text={explanation.example.quickWalkthrough} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
