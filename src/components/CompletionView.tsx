import { useState } from 'react';
import { CheckCircle2, ArrowRight, BookOpen, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { MathView, FormattedMathText } from './MathView.js';
import type { TutorSession, MathProblem } from '../types.js';

interface CompletionViewProps {
  session: TutorSession;
  onTrySimilarProblem: (problem: MathProblem) => void;
  onStartNewProblem: () => void;
}

export function CompletionView({
  session,
  onTrySimilarProblem,
  onStartNewProblem,
}: CompletionViewProps) {
  const [isGeneratingSimilar, setIsGeneratingSimilar] = useState(false);

  const handleGenerateSimilar = async () => {
    setIsGeneratingSimilar(true);
    try {
      const res = await fetch('/api/tutor/similar-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: session.problem.subject,
          topic: session.problem.topic,
          concept: session.practicedConcepts?.[0] || session.problem.topic,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate practice problem.');
      }

      const data = await res.json();
      const newProblem: MathProblem = {
        id: 'prob_' + Date.now(),
        rawInput: data.plainText || data.latex,
        latex: data.latex,
        subject: data.subject || session.problem.subject,
        topic: data.topic || session.problem.topic,
        difficulty: data.difficulty || 'intermediate',
        suggestedStepsCount: 4,
      };

      onTrySimilarProblem(newProblem);
    } catch (err) {
      console.error(err);
      onStartNewProblem();
    } finally {
      setIsGeneratingSimilar(false);
    }
  };

  const concepts = session.practicedConcepts && session.practicedConcepts.length > 0
    ? session.practicedConcepts
    : [session.problem.topic];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 tracking-tight">Problem Solved</h2>
          <p className="text-sm text-stone-500">
            You worked through each milestone step thoughtfully.
          </p>
        </div>

        {/* Original Problem Solved */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 text-center">
          <span className="text-xs text-stone-500 font-mono uppercase tracking-wider block mb-1">
            Solved Equation:
          </span>
          <div className="text-xl text-stone-900 font-medium">
            <MathView math={session.problem.latex} block={false} />
          </div>
        </div>

        {/* What You Practiced */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-stone-600" />
            <span>What you practiced</span>
          </h3>
          <ul className="space-y-1.5">
            {concepts.map((concept, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-sm text-stone-700 font-medium p-2 rounded-lg bg-stone-50 border border-stone-100"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                <span>{concept}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Learning Note */}
        {session.learningNote && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Your learning note</span>
            </div>
            <div className="text-sm text-stone-800 leading-relaxed">
              <FormattedMathText text={session.learningNote} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleGenerateSimilar}
            disabled={isGeneratingSimilar}
            className="w-full sm:w-auto px-6 py-3.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-400 text-white font-medium rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-sm"
            id="try-similar-problem-btn"
          >
            {isGeneratingSimilar ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Generating Practice Problem...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Try a Similar Problem</span>
              </>
            )}
          </button>

          <button
            onClick={onStartNewProblem}
            className="w-full sm:w-auto px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
            id="solve-new-problem-btn"
          >
            <span>Solve Another Problem</span>
            <ArrowRight className="w-4 h-4 text-stone-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
