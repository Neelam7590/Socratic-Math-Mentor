import { BookOpen, LineChart, Settings, ArrowLeft, Layers } from 'lucide-react';

interface NavigationProps {
  currentView: 'home' | 'input' | 'tutor' | 'completion' | 'progress' | 'settings' | 'formulas';
  onNavigate: (view: 'home' | 'input' | 'tutor' | 'completion' | 'progress' | 'settings' | 'formulas') => void;
  hasActiveSession: boolean;
  onResetSession?: () => void;
}

export function Navigation({
  currentView,
  onNavigate,
  hasActiveSession,
}: NavigationProps) {
  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            id="brand-logo-btn"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-50 flex items-center justify-center font-serif text-lg font-bold shadow-xs group-hover:bg-stone-800 transition-colors">
              ∫
            </div>
            <div>
              <span className="font-semibold text-stone-900 text-base tracking-tight group-hover:text-emerald-800 transition-colors">
                AI Math Tutor
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-stone-600 font-medium">
                Socratic Learning
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {hasActiveSession && currentView !== 'tutor' && (
            <button
              onClick={() => onNavigate('tutor')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full transition-colors cursor-pointer mr-1 animate-pulse"
              id="active-session-pill-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Resume Problem</span>
            </button>
          )}

          <button
            onClick={() => {
              if (hasActiveSession) {
                onNavigate('tutor');
              } else {
                onNavigate('home');
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              currentView === 'home' || currentView === 'input' || currentView === 'tutor'
                ? 'bg-stone-200/70 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            id="nav-tutor-btn"
          >
            <BookOpen className="w-4 h-4 text-stone-600" />
            <span>Tutor</span>
          </button>

          <button
            onClick={() => onNavigate('formulas')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              currentView === 'formulas'
                ? 'bg-stone-200/70 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            id="nav-formulas-btn"
          >
            <Layers className="w-4 h-4 text-stone-600" />
            <span>Formulas</span>
          </button>

          <button
            onClick={() => onNavigate('progress')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              currentView === 'progress'
                ? 'bg-stone-200/70 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            id="nav-progress-btn"
          >
            <LineChart className="w-4 h-4 text-stone-600" />
            <span>Progress</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              currentView === 'settings'
                ? 'bg-stone-200/70 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
            id="nav-settings-btn"
          >
            <Settings className="w-4 h-4 text-stone-600" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
