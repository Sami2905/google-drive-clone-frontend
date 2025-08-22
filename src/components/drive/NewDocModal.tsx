'use client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as React from 'react';

type DocType = 'txt' | 'md';

export default function NewDocModal({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (name: string, type: DocType) => Promise<void> | void;
}) {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<DocType>('txt');

  const submit = async () => {
    if (!name.trim()) return;
    await onCreate(name.trim(), type);
    setName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New document</DialogTitle>
          <DialogDescription>Create a blank text or markdown file.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="doc-name">Name</Label>
            <Input id="doc-name" autoFocus placeholder="Untitled" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={(v: DocType) => setType(v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Choose type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="txt">Text (.txt)</SelectItem>
                <SelectItem value="md">Markdown (.md)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} className="bg-brand-600 hover:bg-brand-700">Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
