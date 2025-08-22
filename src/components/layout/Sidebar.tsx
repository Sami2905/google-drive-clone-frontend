'use client';
import { useRouter, usePathname } from 'next/navigation';
import { FolderIcon, UsersIcon, TrashIcon, StarIcon, ClockIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import StorageUsageDetails from './StorageUsageDetails';

export default function Sidebar({ variant = 'desktop' }: { variant?: 'desktop' | 'sheet' }) {
  const router = useRouter();
  const path = usePathname();

  const base =
    'w-64 shrink-0 border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70';
  const visibility = variant === 'desktop' ? 'hidden md:block' : 'block md:hidden';

  const NavBtn = ({
    label,
    icon: Icon,
    href,
    badge,
  }: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: string | number;
  }) => {
    const active = path?.startsWith(href);
    return (
      <button
        onClick={() => router.push(href)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors',
          active
            ? 'bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-slate-100'
            : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
        )}
        aria-current={active ? 'page' : undefined}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5" />
          <span className="text-sm">{label}</span>
        </div>
        {badge && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className={`${visibility} ${base} flex flex-col`}>
      <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Drive</h2>
      <nav className="space-y-1">
        <NavBtn label="My Drive" icon={FolderIcon} href="/dashboard" />
        <NavBtn label="Shared with Me" icon={UsersIcon} href="/shared" />
        <NavBtn label="Starred" icon={StarIcon} href="/starred" />
        <NavBtn label="Recent" icon={ClockIcon} href="/recent" />
        <NavBtn label="Trash" icon={TrashIcon} href="/trash" />
      </nav>
      <div className="mt-6">
        <StorageUsageDetails />
      </div>
    </aside>
  );
}