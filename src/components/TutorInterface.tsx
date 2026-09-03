import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
  Send,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { MathView, FormattedMathText } from './MathView.js';
import { MathSymbolBar } from './MathSymbolBar.js';
import type { MathProblem, TutorSession, TutorMessage, SocraticStep } from '../types.js';

interface TutorInterfaceProps {
  session: TutorSession;
  onUpdateSession: (updated: TutorSession) => void;
  onCompleteSession: (session: TutorSession) => void;
  onExitSession: () => void;
}

export function TutorInterface({
  session,
  onUpdateSession,
  onCompleteSession,
  onExitSession,
}: TutorInterfaceProps) {
  const [studentInput, setStudentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<'why' | 'hint' | 'stuck' | 'recap' | null>(null);
  const [hintCountForStep, setHintCountForStep] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages, actionLoading]);

  // Focus input when step changes
  useEffect(() => {
    inputRef.current?.focus();
    setHintCountForStep(0);
  }, [session.currentStep?.stepNumber]);

  const handleInsertSymbol = (symbol: string) => {
    setStudentInput((prev) => prev + symbol);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCheckAnswer();
    }
  };

  // Submit student answer for evaluation
  const handleCheckAnswer = async () => {
    const trimmed = studentInput.trim();
    if (!trimmed || isSubmitting || !session.currentStep) return;

    setIsSubmitting(true);

    const studentMessage: TutorMessage = {
      id: 'msg_' + Date.now(),
      sender: 'student',
      type: 'answer',
      content: trimmed,
      stepNumber: session.currentStep.stepNumber,
      timestamp: Date.now(),
    };

    const updatedMessages = [...session.messages, studentMessage];
    setStudentInput('');

    try {
      const res = await fetch('/api/tutor/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: session.problem,
          currentStep: session.currentStep,
          studentAnswer: trimmed,
          sessionHistory: updatedMessages,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate answer.');
      }

      const result = await res.json();

      const feedbackMessage: TutorMessage = {
        id: 'msg_' + (Date.now() + 1),
        sender: 'tutor',
        type: 'feedback',
        content: result.feedback,
        mathExpression: result.feedbackMathSnippet,
        isCorrect: result.isCorrect,
        stepNumber: session.currentStep.stepNumber,
        timestamp: Date.now(),
      };

      const newHistory = [
        ...session.attempts,
        {
          stepNumber: session.currentStep.stepNumber,
          studentAnswer: trimmed,
          isCorrect: result.isCorrect,
          tutorFeedback: result.feedback,
          timestamp: Date.now(),
        },
      ];

      // If the problem is completed:
      if (result.isProblemComplete) {
        const completionMsg: TutorMessage = {
          id: 'msg_' + (Date.now() + 2),
          sender: 'tutor',
          type: 'completion',
          content: "We've solved the entire problem! Here is a summary of what you practiced.",
          timestamp: Date.now(),
        };

        const completedSession: TutorSession = {
          ...session,
          status: 'completed',
          messages: [...updatedMessages, feedbackMessage, completionMsg],
          attempts: newHistory,
          learningNote: result.learningNote || session.learningNote,
          practicedConcepts: result.practicedConcepts || session.practicedConcepts,
          completedTime: Date.now(),
        };

        onUpdateSession(completedSession);
        onCompleteSession(completedSession);
        return;
      }

      // If correct and there is a next step:
      if (result.isCorrect && result.nextStep) {
        const nextStepPrompt: TutorMessage = {
          id: 'msg_' + (Date.now() + 2),
          sender: 'tutor',
          type: 'step_prompt',
          content: result.nextStep.question,
          mathExpression: result.nextStep.mathSnippet,
          stepNumber: result.nextStep.stepNumber,
          timestamp: Date.now(),
        };

        const updatedSession: TutorSession = {
          ...session,
          currentStep: result.nextStep,
          messages: [...updatedMessages, feedbackMessage, nextStepPrompt],
          attempts: newHistory,
          practicedConcepts: result.practicedConcepts || session.practicedConcepts,
        };

        onUpdateSession(updatedSession);
      } else {
        // If incorrect, prompt student to try again on the same step
        const updatedSession: TutorSession = {
          ...session,
          messages: [...updatedMessages, feedbackMessage],
          attempts: newHistory,
        };
        onUpdateSession(updatedSession);
      }
    } catch (err) {
      console.error(err);
      const errMessage: TutorMessage = {
        id: 'msg_' + Date.now(),
        sender: 'system',
        type: 'feedback',
        content: 'I had trouble evaluating that response. Please try submitting again.',
        timestamp: Date.now(),
      };
      onUpdateSession({
        ...session,
        messages: [...updatedMessages, errMessage],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Quick Socratic Actions: "Why?", "Hint", "I'm stuck", "Recap"
  const handleQuickAction = async (action: 'why' | 'hint' | 'stuck' | 'recap') => {
    if (actionLoading || !session.currentStep) return;

    setActionLoading(action);
    const nextHintLevel = action === 'hint' ? Math.min(hintCountForStep + 1, 3) : 1;
    if (action === 'hint') {
      setHintCountForStep(nextHintLevel);
    }

    try {
      const res = await fetch('/api/tutor/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          problem: session.problem,
          currentStep: session.currentStep,
          sessionHistory: session.messages,
          hintLevel: nextHintLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Action failed');
      }

      const result = await res.json();

      let type: TutorMessage['type'] = 'explanation_why';
      if (action === 'hint') type = 'hint';
      if (action === 'stuck') type = 'stuck_breakdown';
      if (action === 'recap') type = 'recap';

      const tutorResponseMsg: TutorMessage = {
        id: 'msg_' + Date.now(),
        sender: 'tutor',
        type,
        content: result.explanation,
        mathExpression: result.mathSnippet,
        hintLevel: action === 'hint' ? nextHintLevel : undefined,
        stepNumber: session.currentStep.stepNumber,
        timestamp: Date.now(),
      };

      const updatedSession: TutorSession = {
        ...session,
        messages: [...session.messages, tutorResponseMsg],
        whyAskedCount: action === 'why' ? session.whyAskedCount + 1 : session.whyAskedCount,
        hintsUsedCount: action === 'hint' ? session.hintsUsedCount + 1 : session.hintsUsedCount,
        stuckUsedCount: action === 'stuck' ? session.stuckUsedCount + 1 : session.stuckUsedCount,
      };

      onUpdateSession(updatedSession);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const currentStepNum = session.currentStep?.stepNumber || 1;
  const totalStepsEst = session.currentStep?.totalStepsEstimated || session.problem.suggestedStepsCount || 4;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Banner: Confirmed Problem & Progress Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded bg-stone-100 text-stone-700 uppercase">
              {session.problem.subject}
            </span>
            <span className="text-xs font-semibold text-stone-600">
              {session.problem.topic}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-stone-500 font-mono">
              Step <span className="font-bold text-stone-800">{currentStepNum}</span> of{' '}
              <span>{totalStepsEst}</span>
            </div>
            <button
              onClick={onExitSession}
              className="text-xs text-stone-600 hover:text-stone-700 transition-colors cursor-pointer"
            >
              Exit Session
            </button>
          </div>
        </div>

        {/* Current Math Equation Display */}
        <div className="pt-3 pb-1 flex items-center justify-between overflow-x-auto">
          <div className="text-lg sm:text-xl font-medium text-stone-900">
            <MathView math={session.problem.latex} block={false} />
          </div>
        </div>

        {/* Milestone Steps Bar */}
        <div className="w-full bg-stone-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, (currentStepNum / totalStepsEst) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Socratic Dialogue Stream */}
      <div className="space-y-4">
        {session.messages.map((msg) => {
          if (msg.sender === 'student') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-xs bg-stone-900 text-white p-4 shadow-2xs">
                  <div className="text-xs text-stone-400 font-medium mb-1">Your Answer:</div>
                  <div className="text-sm sm:text-base font-medium">
                    <FormattedMathText text={msg.content} />
                  </div>
                </div>
              </div>
            );
          }

          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="text-center text-xs text-stone-500 py-1 font-mono">
                {msg.content}
              </div>
            );
          }

          // Tutor Message Variations
          const isIntro = msg.type === 'intro';
          const isFeedback = msg.type === 'feedback';
          const isWhy = msg.type === 'explanation_why';
          const isHint = msg.type === 'hint';
          const isStuck = msg.type === 'stuck_breakdown';
          const isRecap = msg.type === 'recap';

          return (
            <div key={msg.id} className="flex items-start gap-3">
              {/* Teacher Avatar */}
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-serif font-bold text-sm flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                T
              </div>

              <div
                className={`flex-1 rounded-2xl p-4 sm:p-5 border shadow-2xs space-y-2 ${
                  isIntro
                    ? 'bg-stone-50 border-stone-200/90 text-stone-800'
                    : isFeedback
                    ? msg.isCorrect
                      ? 'bg-emerald-50/80 border-emerald-200 text-stone-800'
                      : 'bg-amber-50/80 border-amber-200 text-stone-800'
                    : isWhy
                    ? 'bg-blue-50/70 border-blue-200 text-stone-800'
                    : isHint
                    ? 'bg-purple-50/70 border-purple-200 text-stone-800'
                    : isStuck
                    ? 'bg-orange-50/70 border-orange-200 text-stone-800'
                    : 'bg-white border-stone-200 text-stone-800'
                }`}
              >
                {/* Header Tag for message */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    {isFeedback && (
                      <>
                        {msg.isCorrect ? (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct Insight
                          </span>
                        ) : (
                          <span className="text-amber-700 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Let's Check This
                          </span>
                        )}
                      </>
                    )}
                    {isWhy && (
                      <span className="text-blue-700 flex items-center gap-1 font-mono">
                        <HelpCircle className="w-3.5 h-3.5" /> Conceptual Rationale ("Why")
                      </span>
                    )}
                    {isHint && (
                      <span className="text-purple-700 flex items-center gap-1 font-mono">
                        <Lightbulb className="w-3.5 h-3.5" /> Step Hint (Level {msg.hintLevel || 1}/3)
                      </span>
                    )}
                    {isStuck && (
                      <span className="text-orange-700 flex items-center gap-1 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5" /> Stepping Stone Question
                      </span>
                    )}
                    {isRecap && (
                      <span className="text-stone-600 flex items-center gap-1 font-mono">
                        <RotateCcw className="w-3.5 h-3.5" /> Session Recap
                      </span>
                    )}
                    {isIntro && (
                      <span className="text-stone-500 font-medium font-mono">
                        AI Math Teacher
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="text-sm sm:text-base leading-relaxed">
                  <FormattedMathText text={msg.content} />
                </div>

                {/* Math snippet if provided */}
                {msg.mathExpression && (
                  <div className="p-3 bg-white/90 rounded-xl border border-stone-200/80 my-2 overflow-x-auto text-stone-900">
                    <MathView math={msg.mathExpression} block={true} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator for Socratic Action */}
        {actionLoading && (
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-stone-100 text-stone-600 text-xs font-medium animate-pulse max-w-sm">
            <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
            <span>
              {actionLoading === 'why' && 'Formulating conceptual explanation...'}
              {actionLoading === 'hint' && 'Preparing progressive hint...'}
              {actionLoading === 'stuck' && 'Breaking problem into a smaller step...'}
              {actionLoading === 'recap' && 'Summarizing session state...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Step & Input Area */}
      {session.status === 'active' && session.currentStep && (
        <div className="sticky bottom-4 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-300 p-4 sm:p-5 shadow-md space-y-4">
          {/* Socratic Assistance Buttons: Why / Hint / I'm Stuck */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Need guidance?
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Why button */}
              <button
                onClick={() => handleQuickAction('why')}
                disabled={Boolean(actionLoading) || isSubmitting}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Explain why we perform this step"
                id="tutor-why-btn"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Why?</span>
              </button>

              {/* Hint button */}
              <button
                onClick={() => handleQuickAction('hint')}
                disabled={Boolean(actionLoading) || isSubmitting}
                className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Get a progressive hint for this step"
                id="tutor-hint-btn"
              >
                <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
                <span>Hint {hintCountForStep > 0 ? `(${hintCountForStep}/3)` : ''}</span>
              </button>

              {/* I'm Stuck button */}
              <button
                onClick={() => handleQuickAction('stuck')}
                disabled={Boolean(actionLoading) || isSubmitting}
                className="px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Break this step into an easier question"
                id="tutor-stuck-btn"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                <span>I'm stuck</span>
              </button>

              {/* What were we doing recap */}
              <button
                onClick={() => handleQuickAction('recap')}
                disabled={Boolean(actionLoading) || isSubmitting}
                className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                title="Summarize what we are doing"
                id="tutor-recap-btn"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Recap</span>
              </button>
            </div>
          </div>

          {/* Student Answer Input Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="student-answer-input" className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your turn</span>
              </label>
              <span className="text-xs text-stone-400">Press Enter or click Check Answer</span>
            </div>

            <div className="flex gap-2">
              <input
                id="student-answer-input"
                ref={inputRef}
                type="text"
                value={studentInput}
                onChange={(e) => setStudentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer for this step..."
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-sm focus:bg-white focus:border-stone-900 focus:outline-none transition-colors"
              />

              <button
                onClick={handleCheckAnswer}
                disabled={isSubmitting || !studentInput.trim()}
                className="px-5 py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-medium rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer text-sm shrink-0"
                id="tutor-check-answer-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span className="hidden sm:inline">Checking...</span>
                  </>
                ) : (
                  <>
                    <span>Check Answer</span>
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                  </>
                )}
              </button>
            </div>

            {/* Quick symbol helpers */}
            <MathSymbolBar onInsert={handleInsertSymbol} className="pt-1" />
          </div>
        </div>
      )}
    </div>
  );
}
