'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RenameDialog({
  open, onOpenChange, initialName, onSubmit,
  title = 'Rename',
  description = 'Give the item a new name.',
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initialName: string;
  onSubmit: (newName: string) => Promise<void> | void;
  title?: string;
  description?: string;
}) {
  const [name, setName] = React.useState(initialName);
  React.useEffect(() => setName(initialName), [initialName]);

  const handle = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === initialName) return onOpenChange(false);
    await onSubmit(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' ? handle() : undefined}
            aria-label="New name"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handle} className="bg-brand-600 hover:bg-brand-700">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
