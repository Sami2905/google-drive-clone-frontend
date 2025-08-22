'use client';

import { useState } from 'react';
import { FileGridItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FolderIcon, 
  FileIcon, 
  MoreHorizontalIcon,
  DownloadIcon,
  ShareIcon,
  TrashIcon,
  EditIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { ConfirmDelete } from '@/components/ui/ConfirmDelete.shad';
import { RenameDialog } from '@/components/ui/RenameDialog.shad';
import ItemContextMenu from '@/components/drive/ItemContextMenu';
import PreviewDialog from '@/components/drive/PreviewDialog.shad';
import ShareDialog from '@/components/drive/ShareDialog';
import { useDragDrop } from '@/hooks/useDragDrop';

interface FileRowListProps {
  items: FileGridItem[];
  selectedItems: Set<string>;
  onSelectionChange: (selectedItems: Set<string>) => void;
  onItemClick: (item: FileGridItem) => void;
  onItemsChange?: () => void; // Callback to refresh data after delete
}

export default function FileRowList({
  items,
  selectedItems,
  onSelectionChange,
  onItemClick,
  onItemsChange
}: FileRowListProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: FileGridItem | null }>({
    open: false,
    item: null
  });
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; item: FileGridItem | null }>({
    open: false,
    item: null
  });
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; item: FileGridItem | null }>({
    open: false,
    item: null
  });
  const [shareDialog, setShareDialog] = useState<{ open: boolean; item: FileGridItem | null }>({
    open: false,
    item: null
  });

  const {
    draggedItem,
    dragOverFolderId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useDragDrop(onItemsChange);

  const handleItemClick = (item: FileGridItem) => {
    onItemClick(item);
  };

  const handleSelectionChange = (itemId: string, checked: boolean) => {
    const newSelection = new Set(selectedItems);
    if (checked) {
      newSelection.add(itemId);
    } else {
      newSelection.delete(itemId);
    }
    onSelectionChange(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(items.map(item => item.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleDownload = async (item: FileGridItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type !== 'file') return;
    
    const toastId = `download-${item.id}`;
    try {
      toast.loading(`Downloading ${item.name}...`, { id: toastId });
      
      const blob = await apiClient.downloadFile(item.id, (progress) => {
        toast.loading(`Downloading ${item.name}... ${progress}%`, { id: toastId });
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success(`${item.name} downloaded successfully`, { id: toastId });
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(`Failed to download ${item.name}`, { id: toastId });
    }
  };

  const [folderContents, setFolderContents] = useState<{ files: number; folders: number; totalSize: number } | null>(null);

  const handleDeleteClick = async (item: FileGridItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (item.type === 'folder') {
      try {
        const response = await apiClient.getFolders(item.id);
        if (response.success && response.data) {
          // Calculate folder contents from the response
          const folderContents = {
            files: response.data.files?.length || 0,
            folders: response.data.folders?.length || 0,
            totalSize: response.data.files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0
          };
          setFolderContents(folderContents);
        }
      } catch (error) {
        console.error('Failed to get folder contents:', error);
      }
    } else {
      setFolderContents(null);
    }
    
    setDeleteDialog({ open: true, item });
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    
    const toastId = `delete-${deleteDialog.item.id}`;
    try {
      toast.loading(`Deleting ${deleteDialog.item.name}...`, { id: toastId });
      
      if (deleteDialog.item.type === 'file') {
        await apiClient.deleteFile(deleteDialog.item.id);
        toast.success(`File "${deleteDialog.item.name}" deleted successfully`, { id: toastId });
      } else {
        await apiClient.deleteFolder(deleteDialog.item.id);
        toast.success(`Folder "${deleteDialog.item.name}" and its contents deleted successfully`, { id: toastId });
      }
      
      onItemsChange?.(); // Refresh the data
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(`Failed to delete ${deleteDialog.item.type} "${deleteDialog.item.name}"`, { id: toastId });
    } finally {
      setDeleteDialog({ open: false, item: null });
    }
  };

  const handleBatchDelete = async () => {
    if (selectedItems.size === 0) return;
    
    const toastId = 'batch-delete';
    try {
      toast.loading(`Deleting ${selectedItems.size} items...`, { id: toastId });
      
      const selectedFiles = items.filter(item => selectedItems.has(item.id));
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of selectedFiles) {
        try {
          if (item.type === 'file') {
            await apiClient.deleteFile(item.id);
          } else {
            await apiClient.deleteFolder(item.id);
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to delete ${item.type} "${item.name}":`, error);
          errorCount++;
        }
      }
      
      if (errorCount === 0) {
        toast.success(`Successfully deleted ${successCount} items`, { id: toastId });
      } else {
        toast.error(`Deleted ${successCount} items, failed to delete ${errorCount} items`, { id: toastId });
      }
      
      onItemsChange?.(); // Refresh the data
      onSelectionChange(new Set()); // Clear selection
    } catch (error) {
      console.error('Batch delete failed:', error);
      toast.error('Failed to delete selected items', { id: toastId });
    }
  };

  const handleRenameClick = (item: FileGridItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenameDialog({ open: true, item });
  };

  const handlePreviewClick = (item: FileGridItem) => {
    if (item.type === 'file') {
      setPreviewDialog({ open: true, item });
    }
  };

  const handleShareClick = (item: FileGridItem) => {
    setShareDialog({ open: true, item });
  };

  const handleRename = async (newName: string) => {
    if (!renameDialog.item) return;
    
    const toastId = `rename-${renameDialog.item.id}`;
    try {
      toast.loading(`Renaming ${renameDialog.item.type}...`, { id: toastId });
      
      if (renameDialog.item.type === 'file') {
        await apiClient.updateFile(renameDialog.item.id, { name: newName });
        toast.success(`File renamed to "${newName}"`, { id: toastId });
      } else {
        await apiClient.updateFolder(renameDialog.item.id, { name: newName });
        toast.success(`Folder renamed to "${newName}"`, { id: toastId });
      }
      
      onItemsChange?.(); // Refresh the data
    } catch (error) {
      console.error('Rename failed:', error);
      toast.error(`Failed to rename ${renameDialog.item.type}`, { id: toastId });
    }
  };

  const isAllSelected = items.length > 0 && selectedItems.size === items.length;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < items.length;

  return (
    <div className="space-y-2">
      {/* Select All Header */}
      {items.length > 0 && (
        <div className="flex items-center space-x-4 px-4 py-2 border-b border-border bg-muted/50 rounded-t-lg">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el && 'indeterminate' in el) {
                (el as HTMLInputElement).indeterminate = isIndeterminate;
              }
            }}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm font-medium">Name</span>
          <span className="text-sm font-medium w-24">Size</span>
          <span className="text-sm font-medium w-32">Modified</span>
          <span className="text-sm font-medium w-20">Type</span>
          <span className="text-sm font-medium w-20">Actions</span>
        </div>
      )}

      {/* List Items */}
      <div className="space-y-1">
        {items.map((item) => {
          const isSelected = selectedItems.has(item.id);
          const isHovered = hoveredItem === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                'group flex items-center space-x-4 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200',
                isSelected
                  ? 'bg-primary/5 border border-primary/20'
                  : 'hover:bg-accent/50 border border-transparent',
                dragOverFolderId === item.id && 'border-primary-500 bg-primary-50 dark:bg-primary-900/20',
                draggedItem?.id === item.id && 'opacity-50'
              )}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              draggable={true}
              onDragStart={(e) => handleDragStart(item, e)}
              onDragOver={(e) => item.type === 'folder' && handleDragOver(item.id, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => item.type === 'folder' && handleDrop(item.id, e)}
            >
              {/* Selection Checkbox */}
              <div className="flex-shrink-0">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => 
                    handleSelectionChange(item.id, checked as boolean)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Icon */}
              <div className="flex-shrink-0">
                {item.type === 'folder' ? (
                  <FolderIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={item.name}>
                  {item.name}
                </p>
                {item.is_shared && (
                  <span className="text-xs text-blue-600">Shared</span>
                )}
              </div>

              {/* Size */}
              <div className="w-24 flex-shrink-0">
                {item.type === 'file' && item.size ? (
                  <span className="text-sm text-muted-foreground">
                    {formatFileSize(item.size)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">--</span>
                )}
              </div>

              {/* Modified Date */}
              <div className="w-32 flex-shrink-0">
                <span className="text-sm text-muted-foreground">
                  {formatDate(item.updated_at)}
                </span>
              </div>

              {/* Type */}
              <div className="w-20 flex-shrink-0">
                <span className="text-sm text-muted-foreground capitalize">
                  {item.type}
                </span>
              </div>

              {/* Actions */}
              <div className="w-20 flex-shrink-0">
                <ItemContextMenu
                  type={item.type}
                  onOpen={() => handleItemClick(item)}
                  onPreview={item.type === 'file' ? () => handlePreviewClick(item) : undefined}
                  onDownload={item.type === 'file' ? () => handleDownload(item, {} as React.MouseEvent) : undefined}
                  onShare={() => handleShareClick(item)}
                  onRename={() => handleRenameClick(item, {} as React.MouseEvent)}
                  onTrash={() => handleDeleteClick(item, {} as React.MouseEvent)}
                  onVersions={() => {/* TODO: Implement versions */}}
                  onDuplicate={undefined}
                  onMove={undefined}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontalIcon className="h-3 w-3" />
                  </Button>
                </ItemContextMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <FileIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No items found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialogs */}
      <ConfirmDelete
        trigger={null}
        title={`Delete ${deleteDialog.item?.type}?`}
        description={
          deleteDialog.item?.type === 'folder'
            ? folderContents
              ? `Are you sure you want to delete "${deleteDialog.item?.name}" and all its contents?\n\nThis folder contains:\n- ${folderContents.files} files\n- ${folderContents.folders} subfolders\n- ${formatFileSize(folderContents.totalSize)} total size\n\nThis action cannot be undone.`
              : `Are you sure you want to delete "${deleteDialog.item?.name}" and all its contents? This action cannot be undone.`
            : `Are you sure you want to delete "${deleteDialog.item?.name}"? This action cannot be undone.`
        }
        onConfirm={handleDelete}
      />
      {selectedItems.size > 0 && (
        <ConfirmDelete
          trigger={
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialog({ open: true, item: null })}
            >
              Delete {selectedItems.size} selected items
            </Button>
          }
          title={`Delete ${selectedItems.size} items?`}
          description="Are you sure you want to delete all selected items? This action cannot be undone."
          onConfirm={handleBatchDelete}
        />
      )}

      {/* Rename Dialog */}
      <RenameDialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}
        initialName={renameDialog.item?.name || ''}
        title={`Rename ${renameDialog.item?.type}`}
        description={`Enter a new name for this ${renameDialog.item?.type}.`}
        onSubmit={handleRename}
      />

      {/* Preview Dialog */}
      <PreviewDialog
        open={previewDialog.open}
        onOpenChange={(open) => setPreviewDialog({ ...previewDialog, open })}
        file={previewDialog.item}
      />

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialog.open}
        onOpenChange={(open) => setShareDialog({ ...shareDialog, open })}
        item={shareDialog.item}
      />
    </div>
  );
}
