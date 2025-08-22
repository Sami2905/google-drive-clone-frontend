'use client';
import * as React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { File } from '@/types/drive';
import { downloadFile } from '@/lib/file-actions';

type Props = {
  open: boolean;
  file: File | null;
  onOpenChange: (o: boolean) => void;
  onRename: (name: string) => Promise<void> | void;
  onOpenShare: () => void;
};
export default function DetailsSheet({ open, file, onOpenChange, onRename, onOpenShare }: Props) {
  const [name, setName] = React.useState(file?.name ?? '');
  React.useEffect(() => setName(file?.name ?? ''), [file?.name]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:w-[440px]">
        <SheetHeader>
          <SheetTitle>Details</SheetTitle>
          <SheetDescription>File info and quick actions.</SheetDescription>
        </SheetHeader>

        {!file ? (
          <div className="p-4 text-sm text-slate-500">No file selected.</div>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="fname">Name</Label>
              <div className="mt-1 flex gap-2">
                <Input id="fname" value={name} onChange={(e) => setName(e.target.value)} />
                <Button onClick={() => onRename(name)} disabled={!name || name === file.name}>Save</Button>
              </div>
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Type</span>
                <span className="font-medium">{file.mime_type || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Size</span>
                <span className="font-medium">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Modified</span>
                <span className="font-medium">{new Date(file.updated_at || file.created_at).toLocaleString()}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" onClick={onOpenShare}>Manage sharing</Button>
              <Button onClick={() => downloadFile(file.id, file.name)}>Download</Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
