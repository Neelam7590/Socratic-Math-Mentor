import { BookOpen, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MathView } from './MathView.js';
import type { UserProgressData, Subject, MathProblem } from '../types.js';

interface ProgressPageProps {
  progress: UserProgressData;
  onPracticeConcept: (concept: string, subject: Subject) => void;
  onSelectRecentProblem: (problem: MathProblem) => void;
}

export function ProgressPage({
  progress,
  onPracticeConcept,
  onSelectRecentProblem,
}: ProgressPageProps) {
  const topics = Object.entries(progress.topicsPracticed);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Your Learning Progress</h2>
        <p className="text-sm text-stone-500 mt-1">
          A summary of your solved problems, topics practiced, and recommended concepts to review.
        </p>
      </div>

      {/* High-level stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium block">Problems Solved</span>
          <span className="text-2xl font-bold text-stone-900 mt-1 block">
            {progress.problemsSolved}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium block">Algebra Topics</span>
          <span className="text-2xl font-bold text-stone-900 mt-1 block">
            {progress.algebraCount}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs text-stone-500 font-medium block">Calculus Topics</span>
          <span className="text-2xl font-bold text-stone-900 mt-1 block">
            {progress.calculusCount}
          </span>
        </div>
      </div>

      {/* Recommended Practice Section */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-semibold text-base">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Concepts That Need Practice</span>
        </div>

        {progress.conceptsNeedingPractice && progress.conceptsNeedingPractice.length > 0 ? (
          <div className="space-y-3">
            {progress.conceptsNeedingPractice.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 uppercase">
                      {item.subject}
                    </span>
                    <span className="text-sm font-semibold text-stone-900">{item.concept}</span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    Encountered {item.mistakeCount} step correction{item.mistakeCount > 1 ? 's' : ''}.
                  </p>
                </div>

                <button
                  onClick={() => onPracticeConcept(item.concept, item.subject)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  <span>Practice {item.concept}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-500 text-center py-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            No recurring struggle areas detected yet. Keep solving problems to track mastery!
          </div>
        )}
      </div>

      {/* Topics Practiced */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-stone-900 font-semibold text-base">
          <BookOpen className="w-4 h-4 text-stone-600" />
          <span>Topics Practiced</span>
        </div>

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {topics.map(([topicName, count]) => (
              <div
                key={topicName}
                className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-sm text-stone-800"
              >
                <span>{topicName}</span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-stone-200/70 text-stone-700">
                  {count} solved
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500 italic">No topics logged yet.</p>
        )}
      </div>

      {/* Recent Sessions */}
      {progress.recentSessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-stone-900">Recent Completed Problems</h3>
          <div className="space-y-2">
            {progress.recentSessions.map((session) => (
              <div
                key={session.id}
                onClick={() =>
                  onSelectRecentProblem({
                    id: session.id,
                    rawInput: session.latex,
                    latex: session.latex,
                    subject: session.subject,
                    topic: session.topic,
                    difficulty: 'intermediate',
                  })
                }
                className="p-3.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/80 transition-colors flex items-center justify-between cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="text-sm font-medium text-stone-900 group-hover:text-emerald-900">
                    <MathView math={session.latex} block={false} />
                  </div>
                  <span className="text-xs text-stone-500 font-mono">
                    {session.subject} • {session.topic} ({session.stepsCount} steps)
                  </span>
                </div>
                <span className="text-xs text-stone-400 group-hover:text-emerald-700 flex items-center gap-1">
                  <span>Review</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
