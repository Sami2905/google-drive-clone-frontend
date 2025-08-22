'use client';

import * as React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import { formatFileSize } from '@/lib/utils';
import { PieChart, HardDrive, FileIcon, FolderIcon, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// TODO: Implement comprehensive storage stats in backend
interface StorageStats {
  total_size: number;
  file_count: number;
  // Optional extended stats (for future implementation)
  used_bytes?: number;
  quota_bytes?: number;
  folder_count?: number;
  mime_type_breakdown?: Record<string, number>;
  shared_bytes?: number;
  trash_bytes?: number;
}

export default function StorageUsageDetails() {
  const [stats, setStats] = React.useState<StorageStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getStorageUsage();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load storage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading storage usage...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-4 text-center">
        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto" />
        <p className="mt-2 text-sm text-muted-foreground">Failed to load storage usage</p>
        <Button variant="outline" size="sm" onClick={loadStats} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  // Use fallback values for basic implementation
  const usedBytes = stats.used_bytes || stats.total_size;
  const quotaBytes = stats.quota_bytes || (15 * 1024 * 1024 * 1024); // Default 15GB quota
  const usedPercent = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));
  const isNearQuota = usedPercent >= 90;
  const isOverQuota = usedPercent >= 100;

  // Group mime types into categories (if available)
  const categories = {
    images: 0,
    documents: 0,
    videos: 0,
    audio: 0,
    archives: 0,
    other: 0
  };

  if (stats.mime_type_breakdown) {
    Object.entries(stats.mime_type_breakdown).forEach(([mime, size]) => {
      if (mime.startsWith('image/')) categories.images += size;
      else if (mime.startsWith('video/')) categories.videos += size;
      else if (mime.startsWith('audio/')) categories.audio += size;
      else if (['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'].some(type => mime.includes(type))) {
        categories.documents += size;
      }
      else if (['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'].includes(mime)) {
        categories.archives += size;
      }
      else categories.other += size;
    });
  }

  return (
    <div className="p-4 space-y-4">
      {/* Overall Usage */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Storage Usage</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatFileSize(usedBytes)} / {formatFileSize(quotaBytes)}
          </span>
        </div>
        <Progress value={usedPercent} className={cn(
          'h-2',
          isOverQuota ? 'bg-red-200' : isNearQuota ? 'bg-yellow-200' : 'bg-primary/20'
        )} />
        {isNearQuota && (
          <p className="mt-2 text-sm text-yellow-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {isOverQuota ? 'Storage quota exceeded' : 'Storage quota almost full'}
          </p>
        )}
      </div>

      {/* File Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileIcon className="h-4 w-4" />
            Files
          </div>
          <p className="text-2xl font-semibold">{stats.file_count}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FolderIcon className="h-4 w-4" />
            Folders
          </div>
          <p className="text-2xl font-semibold">{stats.folder_count || 0}</p>
        </div>
      </div>

      {/* Storage Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Storage Breakdown</span>
        </div>
        <div className="space-y-2">
          {Object.entries(categories).map(([category, size]) => (
            size > 0 && (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="capitalize">{category}</span>
                <span className="text-muted-foreground">{formatFileSize(size)}</span>
              </div>
            )
          ))}
          {stats.shared_bytes && stats.shared_bytes > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span>Shared with others</span>
              <span className="text-muted-foreground">{formatFileSize(stats.shared_bytes)}</span>
            </div>
          )}
          {stats.trash_bytes && stats.trash_bytes > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span>In trash</span>
              <span className="text-muted-foreground">{formatFileSize(stats.trash_bytes)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Button */}
      {(isNearQuota || isOverQuota) && (
        <Button className="w-full" onClick={() => window.location.href = '/pricing'}>
          Upgrade Storage
        </Button>
      )}
    </div>
  );
}
