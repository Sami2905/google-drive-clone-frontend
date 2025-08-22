'use client';

import { useCallback, useState } from 'react';
import { FileGridItem } from '@/types';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

export function useDragDrop(onItemsChange?: () => void) {
  const [draggedItem, setDraggedItem] = useState<FileGridItem | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const handleDragStart = useCallback((item: FileGridItem, e: React.DragEvent) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((folderId: string | null, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(folderId);
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);
  }, []);

  const handleDrop = useCallback(async (targetFolderId: string | null, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    if (!draggedItem) return;

    const toastId = `move-${draggedItem.id}`;
    try {
      toast.loading(`Moving ${draggedItem.name}...`, { id: toastId });

      if (draggedItem.type === 'file') {
        await apiClient.updateFile(draggedItem.id, { folder_id: targetFolderId || undefined });
        toast.success(`File moved successfully`, { id: toastId });
      } else {
        await apiClient.updateFolder(draggedItem.id, { parent_id: targetFolderId || undefined });
        toast.success(`Folder moved successfully`, { id: toastId });
      }

      onItemsChange?.();
    } catch (error) {
      console.error('Move failed:', error);
      toast.error(`Failed to move ${draggedItem.type}`, { id: toastId });
    } finally {
      setDraggedItem(null);
    }
  }, [draggedItem, onItemsChange]);

  return {
    draggedItem,
    dragOverFolderId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
