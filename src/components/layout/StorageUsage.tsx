'use client';
import * as React from 'react';
import api from '@/lib/api';

export default function StorageUsage() {
  const [used, setUsed] = React.useState<number | null>(null);
  const [quota, setQuota] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await api.get('/me/storage'); // { used_bytes, quota_bytes }
        setUsed(r.data.used_bytes ?? 0);
        setQuota(r.data.quota_bytes ?? 5 * 1024 * 1024 * 1024);
      } catch {
        setUsed(0); setQuota(5 * 1024 * 1024 * 1024);
      }
    })();
  }, []);

  if (used == null || quota == null) return null;
  const pct = Math.min(100, Math.round((used / quota) * 100));
  const fmt = (n: number) => `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;

  return (
    <div className="px-3 py-2 text-xs">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-slate-600 dark:text-slate-300">Storage</span>
        <span className="text-slate-500">{fmt(used)} / {fmt(quota)} ({pct}%)</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full bg-indigo-600" style={{ width: `${pct}%` }} />
      </div>
      <a href="/pricing" className="mt-2 inline-block rounded-md border px-2 py-1 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800">
        Upgrade plan
      </a>
    </div>
  );
}
