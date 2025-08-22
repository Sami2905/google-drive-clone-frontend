'use client';
import * as React from 'react';
import api from '@/lib/api';

type Activity = {
  id: string;
  type: 'upload' | 'rename' | 'share' | 'permission' | 'move' | 'delete' | 'restore' | string;
  actor?: string;
  at: string;     // ISO
  meta?: Record<string, unknown>;
};

export default function DetailsActivity({ fileId }: { fileId: string | null }) {
  const [data, setData] = React.useState<Activity[] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!fileId) return setData(null);
    (async () => {
      try {
        const r = await api.get(`/files/${fileId}/activity`);
        setData(r.data.activities || []);
        setErr(null);
      } catch {
        setData([]); setErr('Activity unavailable');
      }
    })();
  }, [fileId]);

  if (!fileId) return null;
  if (!data) return <div className="mt-2 text-sm text-slate-500">Loading activity…</div>;
  if (err) return <div className="mt-2 text-sm text-slate-500">{err}</div>;
  if (data.length === 0) return <div className="mt-2 text-sm text-slate-500">No recent activity.</div>;

  return (
    <div className="mt-3 space-y-2 text-sm">
      <p className="font-medium">Activity</p>
      <ul className="space-y-2">
        {data.map((a) => (
          <li key={a.id} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
            <div className="min-w-0">
              <p className="truncate">
                <span className="capitalize">{a.type}</span>
                {a.actor ? <> • <span className="text-slate-600 dark:text-slate-300">{a.actor}</span></> : null}
              </p>
              <p className="text-xs text-slate-500">{new Date(a.at).toLocaleString()}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
