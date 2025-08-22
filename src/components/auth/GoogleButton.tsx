'use client';
export default function GoogleButton({ onClick, label = 'Continue with Google' }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
      aria-label="Sign in with Google"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42v-.1H24v7.2h11.3A12.9 12.9 0 0 1 24 38.6 13 13 0 1 1 24 12c3.3 0 6.3 1.2 8.6 3.2l5.1-5.1A20.5 20.5 0 1 0 44.5 24c0-1.2-.1-2.3-.3-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l5.9 4.3A13 13 0 0 1 24 12c3.3 0 6.3 1.2 8.6 3.2l5.1-5.1A20.5 20.5 0 0 0 3.7 14.7z"/>
        <path fill="#4CAF50" d="M24 44.5c5.4 0 10.4-2.1 14.1-5.6l-6.5-5.3A12.9 12.9 0 0 1 24 38.6a13 13 0 0 1-12.2-8.3l-6.6 5.1A20.5 20.5 0 0 0 24 44.5z"/>
        <path fill="#1976D2" d="M43.6 20.5H42v-.1H24v7.2h11.3a13 13 0 0 1-4.7 6.1l6.5 5.3C39.9 36.5 44.5 31.2 44.5 24c0-1.2-.1-2.3-.3-3.5z"/>
      </svg>
      {label}
    </button>
  );
}
