import { useState } from 'react';
import { Copy, Check, Sparkles, ArrowRight, AlertTriangle, BookOpen, Layers } from 'lucide-react';
import { MathView, FormattedMathText } from './MathView.js';
import type { FormulaExplanation } from '../types.js';

interface FormulaResponseCardProps {
  data: FormulaExplanation;
  onPracticeExample?: (raw: string, latex: string, subject: 'algebra' | 'calculus', topic: string) => void;
}

export function FormulaResponseCard({ data, onPracticeExample }: FormulaResponseCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(data.formulaLatex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 my-2 text-stone-800 dark:text-stone-200">
      {/* Formula Title & LaTeX Card */}
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h3 className="font-semibold text-base sm:text-lg text-stone-900 dark:text-stone-100 tracking-tight">
              {data.name}
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 capitalize">
            {data.category}
          </span>
        </div>

        {/* Big LaTeX Formula Presentation */}
        <div className="relative group bg-white dark:bg-stone-950 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800/80 shadow-2xs overflow-x-auto text-center py-5">
          <div className="text-xl sm:text-2xl text-stone-900 dark:text-stone-100 font-medium">
            <MathView math={data.formulaLatex} block={true} />
          </div>
          <button
            type="button"
            onClick={handleCopyLatex}
            className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
            title="Copy LaTeX"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>LaTeX</span>
              </>
            )}
          </button>
        </div>

        {/* Intuitive Explanation */}
        <div className="text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          <FormattedMathText text={data.intuitiveExplanation} />
        </div>
      </div>

      {/* When to Use & Key Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* When to Use */}
        <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-1.5">
          <div className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>When to Apply:</span>
          </div>
          <div className="text-stone-700 dark:text-stone-300 leading-relaxed">
            <FormattedMathText text={data.whenToUse} />
          </div>
        </div>

        {/* Common Traps */}
        <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 space-y-1.5">
          <div className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Common Traps to Avoid:</span>
          </div>
          <div className="text-stone-700 dark:text-stone-300 leading-relaxed">
            <FormattedMathText text={data.commonMistakes} />
          </div>
        </div>
      </div>

      {/* Key Steps / Rules list */}
      {data.keyStepsOrRules && data.keyStepsOrRules.length > 0 && (
        <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-2">
          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-stone-500" />
            Key Method & Transformation Steps:
          </span>
          <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400 pl-4 list-disc">
            {data.keyStepsOrRules.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Example Problem with Instant Practice CTA */}
      {data.example && onPracticeExample && (
        <div className="p-4 rounded-xl bg-stone-100/80 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Worked Example Problem
            </span>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
              Ready to Practice
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-stone-950 rounded-lg border border-stone-200 dark:border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-base text-stone-900 dark:text-stone-100 font-medium">
              <MathView math={data.example.problemLatex} />
            </div>
            <button
              type="button"
              onClick={() =>
                onPracticeExample(
                  data.example!.rawInput || data.example!.problemLatex,
                  data.example!.problemLatex,
                  data.example!.subject,
                  data.example!.topic
                )
              }
              className="px-3.5 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-medium flex items-center gap-1.5 transition-all self-start sm:self-auto cursor-pointer shadow-2xs"
            >
              <span>Solve Step-by-Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.example.quickWalkthrough && (
            <p className="text-xs text-stone-500 dark:text-stone-400 italic">
              Walkthrough: {data.example.quickWalkthrough}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
