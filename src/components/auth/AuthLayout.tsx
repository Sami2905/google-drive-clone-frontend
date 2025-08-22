'use client';
import Link from 'next/link';

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500/30 via-sky-500/20 to-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-tr from-fuchsia-500/20 via-violet-500/20 to-indigo-500/20 blur-3xl" />
      </div>

      {/* Sticky header with brand */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/50 border-b border-black/5 dark:border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-sky-500" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">Nimbus Drive</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/docs" className="hover:text-slate-900 dark:hover:text-white transition-colors">Docs</Link>
          </nav>
        </div>
      </header>

      {/* Auth card */}
      <main className="mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl grid-cols-1 lg:grid-cols-2 items-stretch px-4">
        {/* Left hero (hidden on mobile) */}
        <section className="relative hidden lg:flex flex-col justify-center p-10">
          <h1 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white">
            Secure, fast, elegant file storage.
          </h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Upload, preview, share with permissions, and search across everything. Designed for teams, built for speed.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>• SSO with Google</li>
            <li>• Granular permissions</li>
            <li>• Version history</li>
            <li>• Lightning-fast search</li>
          </ul>
        </section>

        {/* Right form column */}
        <section className="flex items-center justify-center py-12">
          <div className="w-full max-w-md rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-xl backdrop-blur-xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
              {subtitle ? (
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
              ) : null}
            </div>
            {children}
            <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
              By continuing you agree to our{' '}
              <Link href="/terms" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Terms</Link> and{' '}
              <Link href="/privacy" className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Privacy</Link>.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
