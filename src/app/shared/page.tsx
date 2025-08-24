"use client";
import React, { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  SearchIcon, 
  ShareIcon, 
  DownloadIcon, 
  EyeIcon, 
  FolderIcon, 
  FileIcon,
  UserIcon,
  CalendarIcon
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { formatFileSize, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SharedItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mime_type?: string;
  shared_by: string;
  shared_at: string;
  permissions: string[];
}

export default function SharedPage() {
  const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSharedItems();
  }, []);

  const loadSharedItems = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call when backend supports shared items
      // const response = await apiClient.getSharedItems();
      
      // Mock data for now
      const mockSharedItems: SharedItem[] = [
        {
          id: '1',
          name: 'Project Documents',
          type: 'folder',
          shared_by: 'john.doe@example.com',
          shared_at: new Date().toISOString(),
          permissions: ['view', 'comment']
        },
        {
          id: '2',
          name: 'Meeting Notes.pdf',
          type: 'file',
          size: 1024 * 512, // 512 KB
          mime_type: 'application/pdf',
          shared_by: 'jane.smith@example.com',
          shared_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          permissions: ['view', 'edit']
        }
      ];
      
      setSharedItems(mockSharedItems);
    } catch (error) {
      console.error('Failed to load shared items:', error);
      toast.error('Failed to load shared items');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: SharedItem) => {
    if (item.type === 'file') {
      try {
        // TODO: Implement actual download when backend supports it
        toast.success(`Preparing download for ${item.name}`);
      } catch (error) {
        console.error('Download failed:', error);
        toast.error('Failed to download file');
      }
    } else {
      toast('Folders cannot be downloaded directly');
    }
  };

  const handlePreview = async (item: SharedItem) => {
    if (item.type === 'file') {
      try {
        // TODO: Implement actual preview when backend supports it
        toast.success(`Opening preview for ${item.name}`);
      } catch (error) {
        console.error('Preview failed:', error);
        toast.error('Failed to open preview');
      }
    } else {
      toast('Folders cannot be previewed');
    }
  };

  const filteredItems = sharedItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.shared_by.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected = filteredItems.length > 0 && selectedItems.size === filteredItems.length;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < filteredItems.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ShareIcon className="h-6 w-6" />
            Shared with me
          </h1>
          <p className="text-sm text-muted-foreground">
            Files and folders shared with you by other users
          </p>
        </div>
        
        {selectedItems.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{selectedItems.size} selected</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search shared items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading shared items...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <ShareIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">
            {searchQuery ? 'No shared items found' : 'No items shared with you'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? 'Try adjusting your search terms' : 'When someone shares files or folders with you, they will appear here'}
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

          {/* Shared Items List */}
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  selectedItems.has(item.id) ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                }`}
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
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.name}</p>
                    {item.permissions.includes('edit') && (
                      <Badge variant="outline" className="text-xs">Can edit</Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-3 w-3" />
                      <span>Shared by {item.shared_by}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>Shared {formatDate(item.shared_at)}</span>
                    </div>
                    {item.type === 'file' && item.size && (
                      <span>{formatFileSize(item.size)}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {item.type === 'file' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(item)}
                        title="Preview"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(item)}
                        title="Download"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
