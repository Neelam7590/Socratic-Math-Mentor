import { Plus, MessageSquare, Trash2, Sun, Moon, Settings, Calculator, X } from 'lucide-react';
import type { UserSettings } from '../types.js';

export interface RecentChatSession {
  id: string;
  title: string;
  latex?: string;
  subject?: 'algebra' | 'calculus';
  timestamp: number;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  recentSessions: RecentChatSession[];
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions?: () => void;
  settings: UserSettings;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

export function ChatSidebar({
  isOpen,
  onClose,
  recentSessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  settings,
  onToggleTheme,
  onOpenSettings,
}: ChatSidebarProps) {
  return (
    <>
      {/* Backdrop overlay when sidebar is open (clicking backdrop closes sidebar) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container - Slide-in drawer (minimized/hidden by default until 2-rectangle button is tapped) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-stone-100 dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: New Problem & Close */}
        <div className="p-3.5 flex items-center gap-2 border-b border-stone-200/80 dark:border-stone-800">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-semibold shadow-2xs transition-all cursor-pointer group"
            id="new-chat-sidebar-btn"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>New Problem</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400">
              New
            </span>
          </button>

          {/* Close Sidebar button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close sidebar"
            id="sidebar-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          <div className="px-2 py-1.5 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Recent Problems ({recentSessions.length})
            </span>
            {recentSessions.length > 0 && onClearAllSessions && (
              <button
                type="button"
                onClick={onClearAllSessions}
                className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                title="Clear all recent problems"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          {recentSessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-stone-500 dark:text-stone-400 space-y-1.5">
              <Calculator className="w-7 h-7 mx-auto text-stone-400 dark:text-stone-600 mb-2 opacity-80" />
              <p className="font-semibold text-stone-700 dark:text-stone-300">No recent problems</p>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Solved questions and formulas will be saved here automatically.
              </p>
            </div>
          ) : (
            recentSessions.map((s) => {
              const isActive = s.id === activeSessionId;
              return (
                <div
                  key={s.id}
                  className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium shadow-2xs'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800/70'
                  }`}
                  onClick={() => {
                    onSelectSession(s.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 text-stone-400 dark:text-stone-500" />
                    <span className="truncate text-left font-medium">{s.title || s.latex || 'Math Problem'}</span>
                  </div>

                  {/* Delete individual problem button - clearly visible and easily touchable */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(s.id);
                    }}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 active:scale-95 transition-all cursor-pointer shrink-0"
                    title="Delete this problem"
                    aria-label="Delete problem"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Bar: Theme toggle & Settings */}
        <div className="p-3 border-t border-stone-200/80 dark:border-stone-800 space-y-1">
          {/* Quick Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            id="sidebar-theme-toggle-btn"
          >
            <div className="flex items-center gap-2.5">
              {settings.theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span>{settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-500">
              Toggle
            </span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            id="sidebar-settings-btn"
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span>Settings</span>
          </button>

          {/* MathGPT Brand footer badge */}
          <div className="px-3 pt-2 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              MathGPT
            </span>
            <span>Step-by-Step AI</span>
          </div>
        </div>
      </aside>
    </>
  );
}
