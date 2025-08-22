'use client';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Download, Link2, Pencil, Trash2, History, Copy, MoveRight, Eye } from 'lucide-react';

export default function ItemContextMenu({
  children, onOpen, onShare, onRename, onTrash, onVersions, onDuplicate, onMove, onDownload, onPreview, type = 'file',
}: {
  children: React.ReactNode;
  onOpen?: () => void;
  onShare: () => void;
  onRename: () => void;
  onTrash: () => void;
  onVersions: () => void;
  onDuplicate?: () => void;
  onMove?: () => void;
  onDownload?: () => void;
  onPreview?: () => void;
  type?: 'file' | 'folder';
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {onOpen ? <ContextMenuItem onClick={onOpen}>{type === 'folder' ? 'Open' : 'Open preview'}</ContextMenuItem> : null}
        {onPreview ? <ContextMenuItem onClick={onPreview}><Eye className="mr-2 h-4 w-4" /> Preview</ContextMenuItem> : null}
        <ContextMenuItem onClick={onShare}><Link2 className="mr-2 h-4 w-4" /> Share</ContextMenuItem>
        <ContextMenuItem onClick={onRename}><Pencil className="mr-2 h-4 w-4" /> Rename</ContextMenuItem>
        <ContextMenuItem onClick={onVersions}><History className="mr-2 h-4 w-4" /> Versions</ContextMenuItem>
        {onDuplicate ? <ContextMenuItem onClick={onDuplicate}><Copy className="mr-2 h-4 w-4" /> Duplicate</ContextMenuItem> : null}
        {onMove ? <ContextMenuItem onClick={onMove}><MoveRight className="mr-2 h-4 w-4" /> Move to…</ContextMenuItem> : null}
        <ContextMenuSeparator />
        {onDownload ? <ContextMenuItem onClick={onDownload}><Download className="mr-2 h-4 w-4" /> Download</ContextMenuItem> : null}
        <ContextMenuItem onClick={onTrash} className="text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
