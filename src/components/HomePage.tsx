import { ArrowRight, Camera, Keyboard, Sparkles, CheckCircle2, BookOpen } from 'lucide-react';
import { MathView } from './MathView.js';
import { FormulaAskSection } from './FormulaAskSection.js';

interface HomePageProps {
  onStartLearning: (mode?: 'upload' | 'type') => void;
  onSelectPresetProblem: (raw: string, latex: string, subject: 'algebra' | 'calculus', topic: string) => void;
  onNavigateToFormulas?: () => void;
}

const PRESET_PROBLEMS = [
  {
    subject: 'calculus' as const,
    topic: 'Integration by Parts',
    latex: '\\int x^2 \\sin(x) \\, dx',
    raw: 'int x^2 * sin(x) dx',
    description: 'Calculus • Definite / Indefinite Integrals',
  },
  {
    subject: 'algebra' as const,
    topic: 'Quadratic Equations',
    latex: '2x^2 + 5x - 3 = 0',
    raw: '2x^2 + 5x - 3 = 0',
    description: 'Algebra • Factoring & Roots',
  },
  {
    subject: 'calculus' as const,
    topic: 'Chain Rule Derivatives',
    latex: '\\frac{d}{dx} \\left[ \\ln(\\sin(x)) \\right]',
    raw: 'd/dx [ln(sin(x))]',
    description: 'Calculus • Composite Functions',
  },
  {
    subject: 'calculus' as const,
    topic: 'Limits & Indeterminate Forms',
    latex: '\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}',
    raw: 'lim_{x->0} sin(3x)/x',
    description: 'Calculus • Limits & L\'Hôpital',
  },
];

export function HomePage({
  onStartLearning,
  onSelectPresetProblem,
  onNavigateToFormulas,
}: HomePageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Socratic Math Pedagogy</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-[1.15]">
          AI Math Tutor
        </h1>

        <p className="text-xl sm:text-2xl text-stone-600 font-serif italic leading-snug">
          "Don't just get the answer. Learn how to solve it."
        </p>

        <p className="text-sm sm:text-base text-stone-500 max-w-lg mx-auto">
          Step-by-step guidance for <strong className="text-stone-700 font-semibold">Algebra</strong> and <strong className="text-stone-700 font-semibold">Calculus</strong>. Solve problems or ask about any mathematical formula and concept.
        </p>

        {/* Primary and Secondary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onStartLearning('upload')}
            className="w-full sm:w-auto px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-98"
            id="hero-start-learning-btn"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Upload or Photo Math</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={() => onStartLearning('type')}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-stone-100 text-stone-700 font-medium rounded-xl border border-stone-300 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-2xs"
            id="hero-type-problem-btn"
          >
            <Keyboard className="w-4 h-4 text-stone-500" />
            <span>Type a Problem</span>
          </button>

          {onNavigateToFormulas && (
            <button
              onClick={onNavigateToFormulas}
              className="w-full sm:w-auto px-5 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-xl border border-stone-200 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-2xs"
              id="hero-formula-handbook-btn"
            >
              <BookOpen className="w-4 h-4 text-stone-600" />
              <span>Formulas Handbook</span>
            </button>
          )}
        </div>
      </section>

      {/* Direct Interactive Formula & Concept Assistant */}
      <section className="max-w-3xl mx-auto">
        <FormulaAskSection
          onPracticeProblem={(raw, latex, subject, topic) =>
            onSelectPresetProblem(raw, latex, subject, topic)
          }
        />
      </section>

      {/* Subtle Step-by-Step Pedagogical Visual Representation */}
      <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto">
        <div className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-4 flex items-center justify-between">
          <span>How Socratic Tutoring Works</span>
          <span className="text-emerald-700 flex items-center gap-1 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Step-by-Step Guidance
          </span>
        </div>

        <div className="space-y-4">
          {/* Problem Banner */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-stone-500 font-medium block">Problem Given:</span>
              <div className="text-lg font-medium text-stone-900 mt-0.5">
                <MathView math="\int x^2 \sin(x) \, dx" block={false} />
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 bg-stone-200/60 rounded-md text-stone-600 self-start sm:self-auto">
              Calculus • Integration
            </span>
          </div>

          {/* Socratic Dialogue Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Tutor (Step 1):</span>
              </div>
              <p className="text-stone-700">
                "We have a product of algebraic ($x^2$) and trigonometric ($\sin x$) terms. Which technique simplifies this integral?"
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Student & Tutor Interaction:</span>
              </div>
              <p className="text-stone-700">
                Student: <em>"Integration by parts?"</em><br />
                Tutor: <em>"Spot on! Which factor should we pick for $u$ so its derivative is simpler?"</em>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Try an Example Section */}
      <section className="space-y-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            Or practice with a sample problem:
          </h2>
          <span className="text-xs text-stone-400">Click to start tutoring</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_PROBLEMS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPresetProblem(preset.raw, preset.latex, preset.subject, preset.topic)}
              className="p-4 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 hover:border-stone-300 text-left transition-all group cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between"
              id={`preset-problem-${idx}-btn`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span>{preset.topic}</span>
                  <span className="capitalize text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">
                    {preset.subject}
                  </span>
                </div>
                <div className="text-base text-stone-900 group-hover:text-emerald-900 transition-colors py-1">
                  <MathView math={preset.latex} />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 group-hover:text-emerald-700">
                <span>Start Step-by-Step</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
