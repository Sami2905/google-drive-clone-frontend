'use client';

import { useState } from 'react';
import { FileGridItem, ViewMode, SearchParams } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FolderIcon, 
  FileIcon, 
  MoreHorizontalIcon,
  Download,
  ShareIcon,
  TrashIcon,
  EditIcon,
  EyeIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { ConfirmDelete } from '@/components/ui/ConfirmDelete.shad';
import { RenameDialog } from '@/components/ui/RenameDialog.shad';
import ItemContextMenu from '@/components/drive/ItemContextMenu';
import PreviewDialog from '@/components/drive/PreviewDialog.shad';
import SearchDialog from '@/components/drive/SearchDialog.shad';
import { useDragDrop } from '@/hooks/useDragDrop';
import ShareDialog from '@/components/drive/ShareDialog';

interface FileGridProps {
  items: FileGridItem[];
  viewMode: ViewMode;
  selectedItems: Set<string>;
  onSelectionChange: (selectedItems: Set<string>) => void;
  onItemClick: (item: FileGridItem) => void;
  onItemsChange?: () => void; // Callback to refresh data after delete
  currentFolderId?: string | null; // Current folder ID, null for root
}

export default function FileGrid({
  items,
  viewMode,
  selectedItems,
  onSelectionChange,
  onItemClick,
  onItemsChange,
  currentFolderId = null
}: FileGridProps) {
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
  const [searchDialog, setSearchDialog] = useState(false);
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

  const handlePreview = async (item: FileGridItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type !== 'file') return;
    
    try {
      // Get preview URL from API
      const previewResponse = await apiClient.getFilePreview(item.id);
      
      if (previewResponse.success && previewResponse.data?.preview_url) {
        // For any previewable file, show in preview dialog with the actual preview URL
        setPreviewDialog({ 
          open: true, 
          item: {
            ...item,
            preview_url: previewResponse.data.preview_url
          } as any // Type assertion to avoid TypeScript error
        });
      } else {
        // If preview is not available, fall back to download
        toast.success(`Preview not available for ${item.name}. Opening download instead.`);
        handleDownload(item, e);
      }
    } catch (error) {
      console.error('Preview failed:', error);
      // Fall back to download if preview fails
      toast.success(`Preview failed for ${item.name}. Opening download instead.`);
      handleDownload(item, e);
    }
  };

  const [folderContents, setFolderContents] = useState<{ files: number; folders: number; total_size: number } | null>(null);

  const handleDeleteClick = async (item: FileGridItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (item.type === 'folder') {
      try {
        const response = await apiClient.getFolders(item.id);
        if (response.success && response.data) {
          // Calculate folder contents from the response
          const folderContents = {
            files: response.data.files?.length || 0,
            folders: response.data.folders?.length || 0,
            total_size: response.data.files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0
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

  const handleRenameClick = (item: FileGridItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const handleSearch = (params: SearchParams) => {
    try {
      // For now, just log the search params since searchFiles doesn't exist
      // In the future, this could be implemented as a backend search endpoint
      console.log('Search params:', params);
      // TODO: Implement search functionality
    } catch (error) {
      console.error('Search failed:', error);
    }
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

  const getGridCols = () => {
    switch (viewMode.size) {
      case 'small': return 'grid-cols-6';
      case 'large': return 'grid-cols-3';
      default: return 'grid-cols-4';
    }
  };

  const getItemSize = () => {
    switch (viewMode.size) {
      case 'small': return 'p-2';
      case 'large': return 'p-4';
      default: return 'p-3';
    }
  };

  return (
    <div className="space-y-4">
      {/* Select All Header */}
      {items.length > 0 && (
        <div className="flex items-center space-x-2 px-2 py-1 border-b border-border">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el && 'indeterminate' in el) {
                (el as HTMLInputElement).indeterminate = isIndeterminate;
              }
            }}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
          </span>
        </div>
      )}

      {/* Grid */}
      <div className={cn('grid gap-4', getGridCols())}>
        {items.map((item) => {
          const isSelected = selectedItems.has(item.id);

          return (
            <div
              key={item.id}
              className={cn(
                'group relative border rounded-lg cursor-pointer transition-all duration-200',
                getItemSize(),
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:shadow-md',
                'hover:bg-accent/50',
                dragOverFolderId === item.id && 'border-primary-500 bg-primary-50 dark:bg-primary-900/20',
                draggedItem?.id === item.id && 'opacity-50'
              )}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => {}} // Removed setHoveredItem(item.id)
              onMouseLeave={() => {}} // Removed setHoveredItem(null)
              draggable={true}
              onDragStart={(e) => handleDragStart(item, e)}
              onDragOver={(e) => item.type === 'folder' && handleDragOver(item.id, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => item.type === 'folder' && handleDrop(item.id, e)}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => 
                    handleSelectionChange(item.id, checked as boolean)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Item Content */}
              <div className="flex flex-col items-center text-center space-y-2">
                {/* Icon */}
                <div className="relative group">
                  {item.type === 'folder' ? (
                    <FolderIcon className="h-12 w-12 text-blue-500" />
                  ) : (
                    <FileIcon className="h-12 w-12 text-gray-500" />
                  )}
                  
                  {/* Quick Action Buttons - Always visible on hover */}
                  {item.type === 'file' && (
                    <div className="absolute -top-2 -right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full shadow-md hover:shadow-lg"
                        onClick={(e) => handlePreview(item, e)}
                        title="Preview"
                      >
                        <EyeIcon className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-6 w-6 p-0 rounded-full shadow-md hover:shadow-lg"
                        onClick={(e) => handleDownload(item, e)}
                        title="Download"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="w-full">
                  <p className="text-sm font-medium truncate" title={item.name}>
                    {item.name}
                  </p>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground space-y-1">
                  {item.type === 'file' && item.size && (
                    <p>{formatFileSize(item.size)}</p>
                  )}
                  <p>{formatDate(item.updated_at)}</p>
                  {item.is_shared && (
                    <p className="text-blue-600">Shared</p>
                  )}
                </div>
              </div>

              {/* Context Menu */}
              <div className="absolute top-2 right-2 z-30">
                <ItemContextMenu
                  type={item.type}
                  onOpen={() => handleItemClick(item)}
                  onPreview={item.type === 'file' ? () => handlePreview(item, {} as React.MouseEvent) : undefined}
                  onDownload={item.type === 'file' ? () => handleDownload(item, {} as React.MouseEvent) : undefined}
                  onShare={() => handleShareClick(item)}
                  onRename={() => handleRenameClick(item)}
                  onTrash={() => handleDeleteClick(item, {} as React.MouseEvent)}
                  onVersions={() => {/* TODO: Implement versions */}}
                  onDuplicate={undefined}
                  onMove={undefined}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
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
              ? `Are you sure you want to delete "${deleteDialog.item?.name}" and all its contents?\n\nThis folder contains:\n- ${folderContents.files} files\n- ${folderContents.folders} subfolders\n- ${formatFileSize(folderContents.total_size)} total size\n\nThis action cannot be undone.`
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

      {/* Search Dialog */}
      <SearchDialog
        open={searchDialog}
        onOpenChange={setSearchDialog}
        onSearch={handleSearch}
        currentFolderId={currentFolderId}
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


