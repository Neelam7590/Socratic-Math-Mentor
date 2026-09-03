import { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  ArrowRight,
  Filter,
  Layers,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { FORMULA_CATALOG } from '../data/formulasData.js';
import { MathView } from './MathView.js';
import { FormulaAskSection } from './FormulaAskSection.js';
import type { FormulaItem, Subject } from '../types.js';

interface FormulaGuidePageProps {
  onPracticeProblem: (raw: string, latex: string, subject: Subject, topic: string) => void;
  onSelectFormulaForAI?: (formulaName: string) => void;
}

type CategoryFilter = 'all' | 'algebra' | 'derivatives' | 'integrals' | 'limits' | 'trigonometry';

export function FormulaGuidePage({ onPracticeProblem }: FormulaGuidePageProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormula, setSelectedFormula] = useState<FormulaItem | null>(null);

  const filteredFormulas = useMemo(() => {
    return FORMULA_CATALOG.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        searchTerm.trim() === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.formulaLatex.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-emerald-700" />
          <span>Formula & Concept Handbook</span>
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Explore standard Algebra and Calculus formulas, understand when to apply them, or ask the AI tutor for in-depth intuition.
        </p>
      </div>

      {/* AI Ask Formula Engine */}
      <FormulaAskSection onPracticeProblem={onPracticeProblem} />

      {/* Catalog Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-600" />
            <span>Standard Mathematical Formulas Catalog</span>
          </h2>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search formulas by name or symbol..."
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-900"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Formulas' },
            { id: 'algebra', label: 'Algebra' },
            { id: 'derivatives', label: 'Derivatives' },
            { id: 'integrals', label: 'Integrals' },
            { id: 'limits', label: 'Limits & Series' },
            { id: 'trigonometry', label: 'Trigonometry' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFormulas.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs hover:border-stone-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-stone-900">{item.name}</h3>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-600 uppercase">
                    {item.category}
                  </span>
                </div>

                {/* KaTeX Math View */}
                <div className="p-3 bg-stone-50 rounded-lg text-stone-900 font-medium overflow-x-auto text-sm sm:text-base text-center">
                  <MathView math={item.formulaLatex} block={false} />
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.description}
                </p>

                {item.conditions && (
                  <p className="text-[11px] text-stone-400 italic">
                    Note: {item.conditions}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                {item.exampleProblem ? (
                  <button
                    onClick={() =>
                      onPracticeProblem(
                        item.exampleProblem!.raw,
                        item.exampleProblem!.latex,
                        item.exampleProblem!.subject,
                        item.exampleProblem!.topic
                      )
                    }
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Practice in Tutor</span>
                    <ArrowRight className="w-3 h-3 text-emerald-400" />
                  </button>
                ) : (
                  <span className="text-[11px] text-stone-400 font-mono">Reference Rule</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredFormulas.length === 0 && (
          <div className="text-center py-10 bg-stone-50 rounded-xl border border-stone-200 text-stone-500 text-xs">
            No formulas found matching "{searchTerm}". Try asking the AI tutor in the box above!
          </div>
        )}
      </div>
    </div>
  );
}
