'use client';
import * as React from 'react';
import { File } from '@/types/drive';
import { Button } from '@/components/ui/button';
import { downloadFile } from '@/lib/file-actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import DetailsActivity from './DetailsActivity';

export default function DetailsPanelPinned({
  file, onRename, onOpenShare,
}: {
  file: File | null;
  onRename: (name: string) => Promise<void> | void;
  onOpenShare: () => void;
}) {
  const [name, setName] = React.useState(file?.name ?? '');
  React.useEffect(() => setName(file?.name ?? ''), [file?.name]);

  return (
    <aside className="sticky top-20 h-[calc(100vh-120px)] w-[360px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-sm font-semibold">Info</h3>
      {!file ? (
        <p className="mt-2 text-sm text-slate-500">Select a file to see details.</p>
      ) : (
        <div className="mt-3 space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <div className="mt-1 flex gap-2">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              <Button disabled={!name || name === file.name} onClick={() => onRename(name)}>Save</Button>
            </div>
          </div>
          <div className="space-y-2 rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-500">Type</span><span className="font-medium">{file.mime_type || '—'}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">Size</span><span className="font-medium">{(file.size/1024).toFixed(1)} KB</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">Modified</span><span className="font-medium">{new Date(file.updated_at || file.created_at).toLocaleString()}</span></div>
          </div>
          <Separator />
          <DetailsActivity fileId={file?.id ?? null} />
          <div className="space-y-2">
            <Button variant="outline" onClick={onOpenShare}>Manage sharing</Button>
            <Button onClick={() => downloadFile(file.id, file.name)}>Download</Button>
          </div>
        </div>
      )}
    </aside>
  );
}
