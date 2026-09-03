import { GraduationCap, Sun, Moon, Trash2, Globe } from 'lucide-react';
import type { UserSettings } from '../types.js';

interface SettingsPageProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetProgress: () => void;
}

export function SettingsPage({
  settings,
  onUpdateSettings,
  onResetProgress,
}: SettingsPageProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Settings</h2>
        <p className="text-sm text-stone-500 mt-1">
          Customize your learning level and tutoring experience.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 shadow-xs overflow-hidden">
        {/* Learning Level */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
            <GraduationCap className="w-4 h-4 text-stone-600" />
            <span>Target Learning Level</span>
          </div>
          <p className="text-xs text-stone-500">
            The tutor adjusts the depth of Socratic scaffolding and algebraic hints accordingly.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {[
              { id: 'high_school', label: 'High School', sub: 'Algebra I/II, Pre-Calculus' },
              { id: 'intro_college', label: 'Intro College / AP', sub: 'AP Calculus AB/BC, Calc I' },
              { id: 'advanced', label: 'Advanced', sub: 'Calculus II/III, Differential Eq' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    learningLevel: lvl.id as UserSettings['learningLevel'],
                  })
                }
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  settings.learningLevel === lvl.id
                    ? 'border-stone-900 bg-stone-900 text-white shadow-2xs'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="font-semibold text-xs sm:text-sm">{lvl.label}</div>
                <div
                  className={`text-[11px] mt-1 ${
                    settings.learningLevel === lvl.id ? 'text-stone-300' : 'text-stone-500'
                  }`}
                >
                  {lvl.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Preference */}
        <div className="p-6 space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
            {settings.theme === 'dark' ? (
              <Moon className="w-4 h-4 text-stone-600" />
            ) : (
              <Sun className="w-4 h-4 text-stone-600" />
            )}
            <span>Visual Theme</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                settings.theme === 'light'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Calm Academic Light
            </button>
            <button
              onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                settings.theme === 'dark'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
              }`}
            >
              Soft Slate Dark
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
              <Globe className="w-4 h-4 text-stone-600" />
              <span>Language</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">Socratic tutor explanation language</p>
          </div>
          <span className="text-xs font-medium font-mono px-3 py-1.5 rounded-lg bg-stone-100 text-stone-700">
            English (US)
          </span>
        </div>

        {/* Data & History Reset */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50">
          <div>
            <div className="text-sm font-semibold text-stone-900">Reset Local Progress</div>
            <p className="text-xs text-stone-500 mt-0.5">
              Clears your solved problems count and practice history.
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset your practice progress?')) {
                onResetProgress();
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
}
