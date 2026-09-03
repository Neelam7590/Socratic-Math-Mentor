import { X, Moon, Sun, Monitor, Trash2, Check } from 'lucide-react';
import type { UserSettings } from '../types.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (updater: (prev: UserSettings) => UserSettings) => void;
  onClearHistory: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearHistory,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden transition-colors"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            id="close-settings-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm text-stone-700 dark:text-stone-300">
          {/* Appearance / Theme */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings((s) => ({ ...s, theme: 'light' }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  settings.theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold shadow-2xs'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
                id="theme-light-btn"
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
                {settings.theme === 'light' && <Check className="w-4 h-4 ml-auto text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings((s) => ({ ...s, theme: 'dark' }))}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold shadow-2xs'
                    : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                }`}
                id="theme-dark-btn"
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark</span>
                {settings.theme === 'dark' && <Check className="w-4 h-4 ml-auto text-emerald-600" />}
              </button>
            </div>
          </div>

          {/* Academic Level */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Learning Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'high_school' as const, label: 'High School' },
                { id: 'intro_college' as const, label: 'College' },
                { id: 'advanced' as const, label: 'Advanced' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() =>
                    onUpdateSettings((s) => ({ ...s, learningLevel: lvl.id }))
                  }
                  className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                    settings.learningLevel === lvl.id
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                  id={`level-${lvl.id}-btn`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Adjusts the depth of explanations and step-by-step guidance.
            </p>
          </div>

          {/* Clear Data */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Clear Chat History
              </div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                Erase saved conversations and solved problems.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all history?')) {
                  onClearHistory();
                }
              }}
              className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5 cursor-pointer"
              id="clear-history-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-medium rounded-xl transition-all cursor-pointer"
            id="done-settings-btn"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
