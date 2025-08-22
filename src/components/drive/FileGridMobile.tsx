'use client';

import * as React from 'react';
import { FileGridItem, ViewMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatFileSize, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  FileIcon,
  FolderIcon,
  MoreHorizontalIcon,
  Download,
  Link2,
  History,
  Pencil,
  Trash2,
  MoveRight,
  Eye
} from 'lucide-react';

interface FileGridMobileProps {
  items: FileGridItem[];
  viewMode: ViewMode;
  selectedItems: Set<string>;
  onSelectionChange: (selectedItems: Set<string>) => void;
  onItemClick: (item: FileGridItem) => void;
  onItemsChange?: () => void;
  onPreview?: (item: FileGridItem) => void;
  onDownload?: (item: FileGridItem) => void;
  onShare?: (item: FileGridItem) => void;
  onRename?: (item: FileGridItem) => void;
  onDelete?: (item: FileGridItem) => void;
  onMove?: (item: FileGridItem) => void;
  onVersions?: (item: FileGridItem) => void;
}

export default function FileGridMobile({
  items,
  viewMode,
  selectedItems,
  onSelectionChange,
  onItemClick,
  onItemsChange,
  onPreview,
  onDownload,
  onShare,
  onRename,
  onDelete,
  onMove,
  onVersions
}: FileGridMobileProps) {
  const [activeItem, setActiveItem] = React.useState<FileGridItem | null>(null);
  const [actionSheet, setActionSheet] = React.useState(false);
  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number; time: number } | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number; time: number } | null>(null);

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent, item: FileGridItem) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touch = e.touches[0];
    setTouchEnd({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    });
  };

  const handleTouchEnd = (e: React.TouchEvent, item: FileGridItem) => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const deltaTime = touchEnd.time - touchStart.time;

    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);

    // If it's a quick tap, handle as click
    if (deltaTime < 250 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      onItemClick(item);
      return;
    }

    // If it's a long press, show actions
    if (deltaTime > 500 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      setActiveItem(item);
      setActionSheet(true);
      return;
    }

    // If it's a swipe left, select item
    if (deltaX < -50 && Math.abs(deltaY) < 30) {
      const newSelection = new Set(selectedItems);
      if (selectedItems.has(item.id)) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }
      onSelectionChange(newSelection);
      return;
    }
  };

  const handleAction = (action: string) => {
    if (!activeItem) return;
    setActionSheet(false);

    switch (action) {
      case 'preview':
        onPreview?.(activeItem);
        break;
      case 'download':
        onDownload?.(activeItem);
        break;
      case 'share':
        onShare?.(activeItem);
        break;
      case 'rename':
        onRename?.(activeItem);
        break;
      case 'delete':
        onDelete?.(activeItem);
        break;
      case 'move':
        onMove?.(activeItem);
        break;
      case 'versions':
        onVersions?.(activeItem);
        break;
    }
  };

  return (
    <>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'relative flex items-center gap-3 rounded-lg border p-3 transition-colors',
              selectedItems.has(item.id) && 'bg-muted border-primary',
              'touch-none' // Disable browser touch actions
            )}
            onTouchStart={(e) => handleTouchStart(e, item)}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => handleTouchEnd(e, item)}
          >
            <div className="flex-shrink-0">
              {item.type === 'folder' ? (
                <FolderIcon className="h-10 w-10 text-blue-500" />
              ) : (
                <FileIcon className="h-10 w-10 text-gray-500" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {item.type === 'file' && (
                  <span>{formatFileSize(item.size || 0)}</span>
                )}
                <span>•</span>
                <span>{formatDate(item.updated_at)}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setActiveItem(item);
                setActionSheet(true);
              }}
            >
              <MoreHorizontalIcon className="h-5 w-5" />
            </Button>
          </div>
        ))}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No items</p>
            <p className="text-sm text-muted-foreground">
              Tap the + button to add files
            </p>
          </div>
        )}
      </div>

      {/* Action Sheet */}
      <Sheet open={actionSheet} onOpenChange={setActionSheet}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="text-left">
              {activeItem?.name}
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-full py-4">
            <div className="space-y-2">
              {activeItem?.type === 'file' && onPreview && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAction('preview')}
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Preview
                </Button>
              )}

              {activeItem?.type === 'file' && onDownload && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAction('download')}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download
                </Button>
              )}

              {onShare && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAction('share')}
                >
                  <Link2 className="mr-2 h-5 w-5" />
                  Share
                </Button>
              )}

              {onRename && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAction('rename')}
                >
                  <Pencil className="mr-2 h-5 w-5" />
                  Rename
                </Button>
              )}

              {onMove && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAction('move')}
                >
                  <MoveRight className="mr-2 h-5 w-5" />
                  Move
                </Button>
              )}

              {onVersions && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleAction('versions')}
                >
                  <History className="mr-2 h-5 w-5" />
                  Versions
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={() => handleAction('delete')}
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Delete
                </Button>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
