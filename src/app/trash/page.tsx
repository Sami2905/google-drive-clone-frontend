'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '@/lib/api-client';
import { formatFileSize, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { FileGridItem } from '@/types';
import toast from 'react-hot-toast';
import {
  Trash2,
  RotateCcw,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  FileIcon,
  FolderIcon,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { ConfirmDelete } from '@/components/ui/ConfirmDelete.shad';

type SortField = 'name' | 'size' | 'deleted_at';
type SortOrder = 'asc' | 'desc';
type ItemType = 'all' | 'files' | 'folders';

export default function TrashPage() {
  const [items, setItems] = React.useState<FileGridItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = React.useState('');
  const [itemType, setItemType] = React.useState<ItemType>('all');
  const [sortField, setSortField] = React.useState<SortField>('deleted_at');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  const [storageUsage, setStorageUsage] = React.useState<{ total_size: number; item_count: number } | null>(null);

  // Load trash items and storage usage
  React.useEffect(() => {
    loadTrash();
    loadStorageUsage();
  }, []);

  const loadTrash = async () => {
    try {
      setLoading(true);
      
      // Use the new API endpoint to get trash items
      const response = await apiClient.getTrashItems();
      
      if (response.success && response.data) {
        const { files = [], folders = [] } = response.data;
        
        // Combine and format items
        const allItems = [
          ...folders.map(folder => ({
            id: folder.id,
            name: folder.name,
            type: 'folder' as const,
            size: 0,
            created_at: folder.created_at,
            updated_at: folder.updated_at,
            deleted_at: folder.deleted_at,
            is_shared: folder.is_shared
          })),
          ...files.map(file => ({
            id: file.id,
            name: file.name,
            type: 'file' as const,
            size: file.size || 0,
            mime_type: file.mime_type,
            created_at: file.created_at,
            updated_at: file.updated_at,
            deleted_at: file.deleted_at,
            is_shared: file.is_shared
          }))
        ];

        setItems(allItems);
      } else {
        console.warn('Failed to load trash items:', response.error);
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to load trash:', error);
      toast.error('Failed to load trash items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStorageUsage = async () => {
    try {
      const response = await apiClient.getStorageUsage();
      if (response.success && response.data) {
        setStorageUsage({
          total_size: response.data.total_size || 0,
          item_count: response.data.file_count || 0
        });
      }
    } catch (error) {
      console.error('Failed to load storage usage:', error);
    }
  };

  const handleRestore = async (itemIds: string[]) => {
    try {
      setLoading(true);
      const toastId = 'restore';
      toast.loading(`Restoring ${itemIds.length} item(s)...`, { id: toastId });

      let successCount = 0;
      let errorCount = 0;

      for (const id of itemIds) {
        const item = items.find(i => i.id === id);
        if (!item) continue;

        try {
          if (item.type === 'file') {
            await apiClient.restoreFile(id);
          } else {
            // TODO: Implement restoreFolder when backend supports it
            console.warn('Restoring folders not yet supported');
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to restore ${item.type}:`, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(`Successfully restored ${successCount} item(s)`, { id: toastId });
      } else {
        toast.error(`Restored ${successCount} item(s), failed to restore ${errorCount} item(s)`, { id: toastId });
      }

      await loadTrash();
      await loadStorageUsage();
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error('Failed to restore items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemIds: string[]) => {
    try {
      setLoading(true);
      const toastId = 'delete';
      toast.loading(`Permanently deleting ${itemIds.length} item(s)...`, { id: toastId });

      let successCount = 0;
      let errorCount = 0;

      for (const id of itemIds) {
        const item = items.find(i => i.id === id);
        if (!item) continue;

        try {
          if (item.type === 'file') {
            await apiClient.permanentlyDeleteFile(id);
          } else {
            // TODO: Implement permanentlyDeleteFolder when backend supports it
            console.warn('Permanently deleting folders not yet supported');
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to delete ${item.type}:`, error);
          errorCount++;
        }
      }

      if (errorCount === 0) {
        toast.success(`Successfully deleted ${successCount} item(s)`, { id: toastId });
      } else {
        toast.error(`Deleted ${successCount} item(s), failed to delete ${errorCount} item(s)`, { id: toastId });
      }

      await loadTrash();
      await loadStorageUsage();
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete items');
    } finally {
      setLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      setLoading(true);
      const toastId = 'empty-trash';
      toast.loading('Emptying trash...', { id: toastId });

      // Delete all files first
      const fileIds = items.filter(i => i.type === 'file').map(i => i.id);
      if (fileIds.length > 0) {
        await Promise.all(fileIds.map(id => apiClient.permanentlyDeleteFile(id)));
      }

      // Then delete all folders
      const folderIds = items.filter(i => i.type === 'folder').map(i => i.id);
      if (folderIds.length > 0) {
        await Promise.all(folderIds.map(id => apiClient.deleteFolder(id, true)));
      }

      toast.success('Trash emptied successfully', { id: toastId });
      await loadTrash();
      await loadStorageUsage();
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to empty trash:', error);
      toast.error('Failed to empty trash');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    let result = items;

    // Filter by type
    if (itemType !== 'all') {
      result = result.filter(item => {
        if (itemType === 'files') return item.type === 'file';
        if (itemType === 'folders') return item.type === 'folder';
        return true;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => item.name.toLowerCase().includes(query));
    }

    // Sort items
    result = [...result].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'deleted_at':
          // TODO: Implement deleted_at sorting when backend supports it
          comparison = 0;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, itemType, searchQuery, sortField, sortOrder]);

  const isAllSelected = filteredItems.length > 0 && selectedItems.size === filteredItems.length;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < filteredItems.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Trash</h1>
          <p className="text-sm text-muted-foreground">
            Items in trash will be automatically deleted after 30 days
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedItems.size > 0 ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleRestore(Array.from(selectedItems))}
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore Selected
              </Button>
              <ConfirmDelete
                trigger={
                  <Button variant="destructive" disabled={loading}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                }
                title={`Delete ${selectedItems.size} items permanently?`}
                description="This action cannot be undone. These items will be permanently deleted."
                onConfirm={() => handleDelete(Array.from(selectedItems))}
              />
            </>
          ) : (
            <ConfirmDelete
              trigger={
                <Button variant="destructive" disabled={loading || items.length === 0}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Empty Trash
                </Button>
              }
              title="Empty trash permanently?"
              description="This action cannot be undone. All items in trash will be permanently deleted."
              onConfirm={handleEmptyTrash}
            />
          )}
        </div>
      </div>

      {/* Storage Usage */}
      {storageUsage && (
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Storage Used by Trash</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(storageUsage.total_size)} • {storageUsage.item_count} items
            </p>
          </div>
          <Progress value={Math.min(100, (storageUsage.total_size / (1024 * 1024 * 1024)) * 100)} />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search in trash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={itemType} onValueChange={(value: ItemType) => setItemType(value)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="files">Files Only</SelectItem>
            <SelectItem value="folders">Folders Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
          <SelectTrigger className="w-[150px]">
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4 mr-2" />
            ) : (
              <SortDesc className="h-4 w-4 mr-2" />
            )}
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="size">Sort by Size</SelectItem>
            <SelectItem value="deleted_at">Sort by Deleted Date</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Trash2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Trash is Empty</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'No items match your search' : 'No items in trash'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Select All Header */}
          <div className="flex items-center px-4 py-2 rounded-lg bg-muted/50">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedItems(new Set(filteredItems.map(item => item.id)));
                } else {
                  setSelectedItems(new Set());
                }
              }}
            />
            <span className="ml-2 text-sm text-muted-foreground">
              {selectedItems.size > 0 ? `${selectedItems.size} selected` : 'Select all'}
            </span>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                  selectedItems.has(item.id) && 'bg-muted border-primary'
                )}
              >
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={(checked) => {
                    const newSelection = new Set(selectedItems);
                    if (checked) {
                      newSelection.add(item.id);
                    } else {
                      newSelection.delete(item.id);
                    }
                    setSelectedItems(newSelection);
                  }}
                />
                <div className="flex-shrink-0">
                  {item.type === 'folder' ? (
                    <FolderIcon className="h-10 w-10 text-blue-500" />
                  ) : (
                    <FileIcon className="h-10 w-10 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      Updated {formatDate(item.updated_at)}
                    </span>
                    {item.type === 'file' && (
                      <span>{formatFileSize(item.size || 0)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRestore([item.id])}
                    disabled={loading}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <ConfirmDelete
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title={`Delete ${item.type} permanently?`}
                    description={`"${item.name}" will be permanently deleted. This action cannot be undone.`}
                    onConfirm={() => handleDelete([item.id])}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}