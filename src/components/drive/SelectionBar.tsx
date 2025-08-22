'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Link2, Download, MoveRight } from 'lucide-react';

export default function SelectionBar({
  count, onClear, onBulkShare, onBulkTrash, onBulkDownload, onBulkMove,
}: {
  count: number;
  onClear: () => void;
  onBulkShare: () => void;
  onBulkTrash: () => void;
  onBulkDownload?: () => void;
  onBulkMove: () => void;
}) {
  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40">
      <div className="mx-auto flex max-w-3xl items-center justify-between rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">{count} selected</Badge>
          <button onClick={onClear} className="text-slate-600 underline-offset-2 hover:underline dark:text-slate-300">Clear</button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBulkShare}><Link2 className="mr-2 h-4 w-4" /> Share</Button>
          {onBulkDownload ? <Button variant="outline" onClick={onBulkDownload}><Download className="mr-2 h-4 w-4" /> Download</Button> : null}
          <Button variant="outline" onClick={onBulkMove}><MoveRight className="mr-2 h-4 w-4" /> Move</Button>
          <Button className="bg-red-600 hover:bg-red-500" onClick={onBulkTrash}><Trash2 className="mr-2 h-4 w-4" /> Trash</Button>
        </div>
      </div>
    </div>
  );
}
