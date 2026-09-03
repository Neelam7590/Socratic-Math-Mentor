import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import {
  Send,
  Camera,
  Paperclip,
  Lightbulb,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Loader2,
  Copy,
  Check,
  PanelLeft,
  Sun,
  Moon,
  Settings,
  Plus,
  ArrowUp,
  ArrowLeft,
  Keyboard as KeyboardIcon,
  CheckCircle2,
  XCircle,
  Flame,
} from 'lucide-react';
import { MathView, FormattedMathText } from './MathView.js';
import { MathSymbolBar } from './MathSymbolBar.js';
import { FormulaResponseCard } from './FormulaResponseCard.js';
import { PhotoUploadModal } from './PhotoUploadModal.js';
import { SettingsModal } from './SettingsModal.js';
import { ChatSidebar, RecentChatSession } from './ChatSidebar.js';
import { MathBackground } from './MathBackground.js';
import type {
  MathProblem,
  TutorSession,
  TutorMessage,
  SocraticStep,
  UserSettings,
  FormulaExplanation,
} from '../types.js';

interface UnifiedChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  type: 'text' | 'formula_explanation' | 'socratic_session' | 'step_feedback' | 'error';
  content: string;
  mathExpression?: string;
  formulaData?: FormulaExplanation;
  thumbnailUrl?: string;
  socraticStep?: SocraticStep;
  isCorrect?: boolean;
  timestamp: number;
}

interface MathGPTInterfaceProps {
  settings: UserSettings;
  onUpdateSettings: (updater: (prev: UserSettings) => UserSettings) => void;
}

export function MathGPTInterface({ settings, onUpdateSettings }: MathGPTInterfaceProps) {
  // Chat state
  const [messages, setMessages] = useState<UnifiedChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSymbolBar, setShowSymbolBar] = useState(false);

  // Active Socratic problem tracking if user is currently solving
  const [activeSession, setActiveSession] = useState<TutorSession | null>(null);
  const [stepInput, setStepInput] = useState('');
  const [actionLoading, setActionLoading] = useState<'why' | 'hint' | 'stuck' | 'recap' | null>(null);
  const [hintCount, setHintCount] = useState(0);

  // Modals & Sidebar
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persistence for chats in localStorage
  const [recentSessions, setRecentSessions] = useState<RecentChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('mathgpt_recent_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // Save recent sessions
  useEffect(() => {
    try {
      localStorage.setItem('mathgpt_recent_sessions', JSON.stringify(recentSessions));
    } catch (e) {
      console.error(e);
    }
  }, [recentSessions]);

  // Scroll to bottom on new messages strictly inside the chat container (prevents window jumping)
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isProcessing, actionLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Handle dark mode class on root
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    onUpdateSettings((s) => ({
      ...s,
      theme: s.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveSession(null);
    setInputText('');
    setStepInput('');
    setIsProcessing(false);
  };

  const handleClearAllHistory = () => {
    setRecentSessions([]);
    localStorage.removeItem('mathgpt_recent_sessions');
    localStorage.removeItem('ai_math_tutor_progress');
    handleNewChat();
    setIsSettingsOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setRecentSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSession?.id === id) {
      handleNewChat();
    }
  };

  const handleSelectSession = (id: string) => {
    const found = recentSessions.find((s) => s.id === id);
    if (found) {
      handleNewChat();
      if (found.latex || found.title) {
        handleSendMessage(found.latex || found.title);
      }
    }
  };

  const handleInsertSymbol = (symbol: string) => {
    if (activeSession) {
      setStepInput((prev) => prev + symbol);
    } else {
      if (textareaRef.current) {
        const ta = textareaRef.current;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const nextVal = inputText.substring(0, start) + symbol + inputText.substring(end);
        setInputText(nextVal);
        setTimeout(() => {
          ta.focus();
          ta.setSelectionRange(start + symbol.length, start + symbol.length);
        }, 10);
      } else {
        setInputText((prev) => prev + symbol);
      }
    }
  };

  // Unified submit handler from the main prompt bar (Direct ChatGPT Response Engine)
  const handleSendMessage = async (customText?: string) => {
    const query = (customText || inputText).trim();
    if (!query || isProcessing) return;

    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Append user message
    const userMsg: UnifiedChatMessage = {
      id: 'user_' + Date.now(),
      sender: 'user',
      type: 'text',
      content: query,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // Build conversation history payload
      const historyPayload = messages
        .filter((m) => m.type === 'text' || m.type === 'formula_explanation')
        .map((m) => ({
          role: m.sender,
          content: m.content,
        }));

      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          history: historyPayload,
          learningLevel: settings.learningLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to solve query with MathGPT.');
      }

      const data = await res.json();
      const asstMsg: UnifiedChatMessage = {
        id: 'asst_' + Date.now(),
        sender: 'assistant',
        type: 'text',
        content: data.content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, asstMsg]);

      // Add to recent sessions list
      const firstLine = query.split('\n')[0].substring(0, 32);
      setRecentSessions((prev) => [
        {
          id: 'sess_' + Date.now(),
          title: firstLine,
          timestamp: Date.now(),
        },
        ...prev.filter((s) => s.title !== firstLine).slice(0, 14),
      ]);
    } catch (err: any) {
      console.error(err);
      const errMsg: UnifiedChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        type: 'error',
        content: err.message || 'Something went wrong. Please check your math expression and retry.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Start solving photo-extracted math problem immediately with full direct breakdown
  const handleSolvePhotoProblem = async (problem: MathProblem, thumbnail?: string) => {
    setIsProcessing(true);

    // Show photo in user message
    const userMsg: UnifiedChatMessage = {
      id: 'user_photo_' + Date.now(),
      sender: 'user',
      type: 'text',
      content: `Solve this equation: ${problem.latex || problem.rawInput}`,
      thumbnailUrl: thumbnail,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Solve this mathematical problem step-by-step with clear explanation and final answer: ${problem.latex || problem.rawInput}`,
          history: [],
          learningLevel: settings.learningLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to solve photo problem.');
      }

      const data = await res.json();
      const asstMsg: UnifiedChatMessage = {
        id: 'asst_photo_sol_' + Date.now(),
        sender: 'assistant',
        type: 'text',
        content: data.content,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, asstMsg]);

      // Add to recent sessions
      setRecentSessions((prev) => [
        {
          id: 'sess_photo_' + Date.now(),
          title: problem.topic || problem.latex || 'Photo Problem',
          latex: problem.latex,
          subject: problem.subject,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 14),
      ]);
    } catch (err: any) {
      console.error(err);
      const errMsg: UnifiedChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        type: 'error',
        content: err.message || 'Could not solve the photo problem. Please retry.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit answer for active step
  const handleEvaluateStep = async () => {
    const trimmed = stepInput.trim();
    if (!trimmed || !activeSession || !activeSession.currentStep || isProcessing) return;

    setStepInput('');
    setIsProcessing(true);

    const userStepMsg: UnifiedChatMessage = {
      id: 'usr_step_' + Date.now(),
      sender: 'user',
      type: 'text',
      content: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userStepMsg]);

    const studentMessage: TutorMessage = {
      id: 'msg_' + Date.now(),
      sender: 'student',
      type: 'answer',
      content: trimmed,
      stepNumber: activeSession.currentStep.stepNumber,
      timestamp: Date.now(),
    };

    const updatedHistory = [...activeSession.messages, studentMessage];

    try {
      const res = await fetch('/api/tutor/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: activeSession.problem,
          currentStep: activeSession.currentStep,
          studentAnswer: trimmed,
          sessionHistory: updatedHistory,
          learningLevel: settings.learningLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to evaluate step answer.');
      }

      const result = await res.json();

      const asstFeedbackMsg: UnifiedChatMessage = {
        id: 'asst_feedback_' + Date.now(),
        sender: 'assistant',
        type: 'step_feedback',
        content: result.feedback,
        isCorrect: result.isCorrect,
        socraticStep: result.nextStep || undefined,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, asstFeedbackMsg]);

      if (result.isCorrect && result.nextStep) {
        // Move to next step
        setActiveSession((prev) =>
          prev
            ? {
                ...prev,
                currentStep: result.nextStep,
                messages: [
                  ...updatedHistory,
                  {
                    id: 'fb_' + Date.now(),
                    sender: 'tutor',
                    type: 'feedback',
                    content: result.feedback,
                    isCorrect: true,
                    timestamp: Date.now(),
                  },
                ],
              }
            : null
        );
        setHintCount(0);
      } else if (result.isProblemCompleted) {
        // Completed all steps!
        setActiveSession(null);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg: UnifiedChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        type: 'error',
        content: err.message || 'Could not verify step answer. Please retry.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Socratic Actions (Hint, Why, Stuck, Full Solution)
  const handleTutorAction = async (action: 'why' | 'hint' | 'stuck' | 'recap') => {
    if (!activeSession || !activeSession.currentStep || actionLoading) return;

    setActionLoading(action);
    const nextHintLevel = action === 'hint' ? hintCount + 1 : hintCount;

    try {
      const res = await fetch('/api/tutor/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          problem: activeSession.problem,
          currentStep: activeSession.currentStep,
          sessionHistory: activeSession.messages,
          hintLevel: nextHintLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to execute tutor action.');
      }

      const result = await res.json();
      if (action === 'hint') {
        setHintCount(nextHintLevel);
      }

      const actionMsg: UnifiedChatMessage = {
        id: 'asst_action_' + Date.now(),
        sender: 'assistant',
        type: 'text',
        content: result.explanation || result.content,
        mathExpression: result.mathSnippet,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, actionMsg]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStepKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEvaluateStep();
    }
  };

  return (
    <div className="h-full h-[100dvh] w-full flex bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors relative overflow-hidden font-sans">
      {/* Background Math Glyph Doodles */}
      <MathBackground />

      {/* Collapsible ChatGPT-style Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        recentSessions={recentSessions}
        activeSessionId={activeSession?.id}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllHistory}
        settings={settings}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 overflow-hidden">
        {/* Top Minimal Header */}
        <header className="h-14 shrink-0 border-b border-stone-200/80 dark:border-stone-800/80 px-3 sm:px-4 flex items-center justify-between bg-white/95 dark:bg-stone-950/95 backdrop-blur-md z-30">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Back Button (shown prominently when in a chat/problem solving session) */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleNewChat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800/90 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all cursor-pointer text-xs sm:text-sm font-medium border border-stone-200/80 dark:border-stone-700/80 shadow-2xs active:scale-95 shrink-0"
                title="Back to Home"
                id="header-back-btn"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {/* Sidebar toggle (the 2 rectangles panel icon to open/close recent chats) */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 border ${
                isSidebarOpen
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-700'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 border-transparent'
              }`}
              title={isSidebarOpen ? 'Close History' : 'Open History & Recent Problems'}
              id="header-sidebar-toggle-btn"
              aria-label="Toggle History"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 flex items-center justify-center font-serif text-base font-bold shadow-xs shrink-0">
                ∫
              </div>
              <h1 className="font-semibold text-sm sm:text-base tracking-tight text-stone-900 dark:text-stone-100 truncate">
                MathGPT
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                4o Socratic
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* New Chat Button (Prominent Icon + Text) */}
            <button
              type="button"
              onClick={handleNewChat}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Start New Chat"
              id="header-new-chat-btn"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold">New Chat</span>
            </button>

            {/* Dark / Light Theme Quick Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title={settings.theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              id="header-theme-toggle-btn"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Settings Dialog Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              title="Settings"
              id="header-settings-btn"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Chat Stream Body - No unwanted scrollbars on welcome screen */}
        <div
          ref={chatScrollContainerRef}
          className={`flex-1 overflow-y-auto no-scrollbar px-3 sm:px-6 overscroll-contain flex flex-col ${
            messages.length === 0 ? 'justify-center' : 'py-6'
          }`}
        >
          {messages.length === 0 ? (
            /* Welcome Screen with EXACTLY TWO primary options - dynamically fits any screen size without vertical scrollbar */
            <div className="w-full max-w-xl mx-auto py-2 sm:py-6 text-center space-y-4 sm:space-y-6 animate-in fade-in duration-300 my-auto">
              {/* Center Brand Emblem */}
              <div className="space-y-2 sm:space-y-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold shadow-md mx-auto">
                  ∫
                </div>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight px-2">
                  What math problem are we solving today?
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto px-4">
                  Algebra, Calculus, limits, derivatives, integrals, or formula inquiries.
                </p>
              </div>

              {/* EXACTLY TWO MAIN OPTIONS - Responsive row/grid without vertical scrolling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 max-w-md sm:max-w-lg mx-auto w-full px-2">
                {/* Option 1: Type a Problem */}
                <button
                  type="button"
                  onClick={() => textareaRef.current?.focus()}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200/90 dark:border-stone-800 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer group flex sm:flex-col items-center sm:items-start gap-3 sm:gap-3.5 active:scale-[0.98]"
                  id="welcome-type-problem-card"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <KeyboardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      Type a Problem
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                      Enter any equation, formula inquiry, or math doubt.
                    </p>
                  </div>
                </button>

                {/* Option 2: Upload a Photo */}
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200/90 dark:border-stone-800 text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer group flex sm:flex-col items-center sm:items-start gap-3 sm:gap-3.5 active:scale-[0.98]"
                  id="welcome-upload-photo-card"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                      Upload a Photo
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                      Snap or upload handwritten notes, textbook equations.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6 pb-12 w-full">
              {/* Conversation Messages */}
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 sm:gap-4 ${
                      isUser ? 'justify-end' : 'justify-start'
                    } animate-in fade-in duration-200`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 flex items-center justify-center font-serif text-sm font-bold shrink-0 mt-1 shadow-xs">
                        ∫
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-sm ${
                        isUser
                          ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-medium rounded-tr-xs shadow-xs'
                          : 'bg-stone-100/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 border border-stone-200/80 dark:border-stone-800 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {/* User Image Attachment preview if present */}
                      {msg.thumbnailUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950 max-w-xs">
                          <img
                            src={msg.thumbnailUrl}
                            alt="Math problem photo"
                            className="max-h-48 object-contain w-full"
                          />
                        </div>
                      )}

                      {/* Formula Response View */}
                      {msg.type === 'formula_explanation' && msg.formulaData ? (
                        <FormulaResponseCard
                          data={msg.formulaData}
                          onPracticeExample={(raw, latex) =>
                            handleSendMessage(`Solve this example step-by-step: ${latex || raw}`)
                          }
                        />
                      ) : msg.type === 'socratic_session' ? (
                        /* Socratic Initial Problem Presentation */
                        <div className="space-y-3">
                          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            Problem Initialized
                          </div>

                          {msg.mathExpression && (
                            <div className="p-3 bg-white dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 text-center text-lg font-medium text-stone-900 dark:text-stone-100 overflow-x-auto py-4">
                              <MathView math={msg.mathExpression} block={true} />
                            </div>
                          )}

                          <FormattedMathText
                            text={msg.content}
                            className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed"
                          />

                          {msg.socraticStep && (
                            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-2 mt-2">
                              <span className="text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Step {msg.socraticStep.stepNumber} of {msg.socraticStep.totalStepsEstimated}: {msg.socraticStep.title}
                              </span>
                              <p className="text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-medium">
                                {msg.socraticStep.question}
                              </p>
                              {msg.socraticStep.mathSnippet && (
                                <div className="text-sm font-mono text-stone-900 dark:text-stone-100 bg-white/80 dark:bg-stone-950/80 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                                  <MathView math={msg.socraticStep.mathSnippet} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : msg.type === 'step_feedback' ? (
                        /* Step Evaluation Feedback */
                        <div className="space-y-3">
                          <div
                            className={`flex items-center gap-1.5 text-xs font-semibold ${
                              msg.isCorrect
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {msg.isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Correct Step!</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-4 h-4" />
                                <span>Almost there — Guidance:</span>
                              </>
                            )}
                          </div>

                          <FormattedMathText
                            text={msg.content}
                            className="text-stone-700 dark:text-stone-300 text-sm leading-relaxed"
                          />

                          {msg.socraticStep && (
                            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-2 mt-2">
                              <span className="text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Step {msg.socraticStep.stepNumber}: {msg.socraticStep.title}
                              </span>
                              <p className="text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-medium">
                                {msg.socraticStep.question}
                              </p>
                              {msg.socraticStep.mathSnippet && (
                                <div className="text-sm font-mono text-stone-900 dark:text-stone-100 bg-white/80 dark:bg-stone-950/80 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                                  <MathView math={msg.socraticStep.mathSnippet} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Regular text / markdown message */
                        <FormattedMathText
                          text={msg.content}
                          className="leading-relaxed whitespace-pre-wrap"
                        />
                      )}

                      {msg.mathExpression && msg.type !== 'socratic_session' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-white/80 dark:bg-stone-950/80 border border-stone-200 dark:border-stone-800 text-center font-medium overflow-x-auto">
                          <MathView math={msg.mathExpression} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Active Socratic Step Action Pills if tutor session is ongoing */}
            {activeSession && activeSession.currentStep && (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 animate-in fade-in">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTutorAction('hint')}
                    disabled={Boolean(actionLoading)}
                    className="px-3 py-1.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    <span>{hintCount > 0 ? `Next Hint (${hintCount})` : 'Get Hint'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTutorAction('why')}
                    disabled={Boolean(actionLoading)}
                    className="px-3 py-1.5 rounded-xl bg-blue-100/80 dark:bg-blue-950/50 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-900 dark:text-blue-200 border border-blue-300/60 dark:border-blue-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Why this step?</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTutorAction('stuck')}
                    disabled={Boolean(actionLoading)}
                    className="px-3 py-1.5 rounded-xl bg-rose-100/80 dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-900 dark:text-rose-200 border border-rose-300/60 dark:border-rose-800/60 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>I'm Stuck</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTutorAction('recap')}
                    disabled={Boolean(actionLoading)}
                    className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ml-auto disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Explain Full Solution</span>
                  </button>
                </div>

                {/* Socratic Step Input Field */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={stepInput}
                    onChange={(e) => setStepInput(e.target.value)}
                    onKeyDown={handleStepKeyDown}
                    placeholder={`Your answer for Step ${activeSession.currentStep.stepNumber}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:border-emerald-500 shadow-2xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleEvaluateStep}
                    disabled={!stepInput.trim() || isProcessing}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>Verify Step</span>
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {(isProcessing || actionLoading) && (
              <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 py-2">
                <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 flex items-center justify-center font-serif text-sm font-bold shrink-0 shadow-xs">
                  ∫
                </div>
                <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-900 px-4 py-2.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600 dark:text-emerald-400" />
                  <span>MathGPT is calculating mathematical breakdown...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

        {/* Bottom Floating Prompt Bar */}
        <div className="shrink-0 px-3 py-3 sm:px-6 sm:py-4 bg-white dark:bg-stone-950 z-20 border-t border-stone-200 dark:border-stone-800 shadow-md">
          <div className="max-w-3xl mx-auto space-y-2">
            {/* Math Symbols Bar Drawer */}
            {showSymbolBar && (
              <div className="p-2.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <MathSymbolBar onInsert={handleInsertSymbol} />
              </div>
            )}

            {/* Prompt Container */}
            <div className="relative rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm focus-within:border-stone-400 dark:focus-within:border-stone-600 transition-all flex flex-col">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Type any math problem, formula (e.g. 'integration by parts'), or equation..."
                className="w-full px-4 pt-3.5 pb-2 bg-transparent text-stone-900 dark:text-stone-100 text-sm focus:outline-none resize-none placeholder:text-stone-400 dark:placeholder:text-stone-500 font-sans"
              />

              {/* Action Toolbar */}
              <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
                <div className="flex items-center gap-1.5">
                  {/* Photo Upload Icon */}
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Upload or Capture Math Photo"
                    id="prompt-photo-btn"
                  >
                    <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </button>

                  {/* Math Symbols Keyboard Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowSymbolBar((prev) => !prev)}
                    className={`p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer ${
                      showSymbolBar ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100' : ''
                    }`}
                    title="Math Symbols Keyboard"
                    id="prompt-symbols-btn"
                  >
                    <span className="font-mono text-xs font-bold px-0.5">√x</span>
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isProcessing}
                  className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
                  id="prompt-send-btn"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Subtle Subtext */}
            <p className="text-center text-[11px] text-stone-600 dark:text-stone-400 font-medium">
              MathGPT can make mistakes. Verify important mathematical derivations.
            </p>
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onProblemConfirmed={(problem, thumbnail) => {
          handleSolvePhotoProblem(problem, thumbnail);
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onClearHistory={handleClearAllHistory}
      />
    </div>
  );
}
