'use client';
import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import FolderTree from './FolderTree';

interface TreeNode {
  id: string | null;
  name: string;
  hasChildren: boolean;
}
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function MoveToDialog({
  open, onOpenChange, itemIds, currentFolderId, onMoved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  itemIds: string[];                 // file IDs (MVP) – can extend for folders
  currentFolderId: string | null;    // may be null for root
  onMoved: () => void;               // reload after move
}) {
  const [dest, setDest] = React.useState<string | null>(currentFolderId ?? null);
  const root: TreeNode = { id: null, name: 'My Drive', hasChildren: true };

  React.useEffect(() => setDest(currentFolderId ?? null), [currentFolderId, open]);

  const fetchChildren = async (id: string | null): Promise<TreeNode[]> => {
    try {
      const r = await api.get(id ? `/folders/${id}/children` : '/folders/root/children');
      // expect [{id,name,has_children}]
      return (r.data.children || []).map((c: { id: string; name: string; has_children?: boolean }) => ({
        id: c.id, name: c.name, hasChildren: c.has_children ?? true,
      }));
    } catch {
      return [];
    }
  };

  const createFolder = async (name: string) => {
    const r = await api.post('/folders', { name, parent_id: dest });
    toast.success('Folder created');
    return r.data?.id as string;
  };

  const [newFolder, setNewFolder] = React.useState('');
  const onCreateHere = async () => {
    const trimmed = newFolder.trim();
    if (!trimmed) return;
    await createFolder(trimmed);
    setNewFolder('');
  };

  const move = async () => {
    if (dest === currentFolderId) return onOpenChange(false);
    try {
      // Prefer bulk if available
      try {
        await api.post('/files/move', { ids: itemIds, destination_folder_id: dest });
      } catch {
        // fallback to per-file
        await Promise.all(itemIds.map(id => api.patch(`/files/${id}`, { folder_id: dest })));
      }
      toast.success('Moved');
      onOpenChange(false);
      onMoved();
    } catch {
      toast.error('Move failed');
    }
  };

  const handleFolderSelect = (folder: { id: string; name: string; parent_id: string | null }) => {
    setDest(folder.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Move to…</DialogTitle>
          <DialogDescription>Choose a destination folder. You can also create a new folder.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* TODO: Fix FolderTree component interface mismatch */}
          {/* <FolderTree
            root={root}
            fetchChildren={fetchChildren}
            selectedId={dest}
            onSelect={handleFolderSelect}
          /> */}

          <div className="rounded-md border p-3">
            <p className="mb-2 text-sm font-medium">Create new folder here</p>
            <div className="flex gap-2">
              <Input
                placeholder="Folder name"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' ? onCreateHere() : undefined}
              />
              <Button variant="outline" onClick={onCreateHere}>Create</Button>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={move} className="bg-brand-600 hover:bg-brand-700" disabled={dest === currentFolderId}>
            Move here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
