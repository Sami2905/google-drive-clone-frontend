'use client';
import { FolderIcon } from '@heroicons/react/24/outline';

export default function EmptyState({
  title = 'No files here yet',
  subtitle = 'Drag & drop to upload your first files.',
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <FolderIcon className="h-12 w-12 text-slate-400" />
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
    </div>
  );
}
