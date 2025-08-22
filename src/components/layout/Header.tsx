'use client';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function Header({
  onToggleSidebar,
}: { onToggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:hover:bg-slate-800"
          >
            <Bars3Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-block h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 to-sky-500" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Nimbus Drive</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-slate-700 bg-indigo-100 dark:bg-slate-700 flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-600 dark:text-slate-300">U</span>
          </div>
        </div>
      </div>
    </header>
  );
}


