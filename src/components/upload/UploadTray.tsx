'use client';

import { useState, useCallback } from 'react';
import { File as DriveFile, UploadProgress } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { XIcon, UploadIcon, CheckIcon, AlertCircleIcon } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadTrayProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (files: DriveFile[]) => void;
  currentFolderId?: string | null;
}

export default function UploadTray({
  isOpen,
  onClose,
  onUploadComplete,
  currentFolderId
}: UploadTrayProps) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback((files: FileList) => {
    const newUploads: UploadProgress[] = Array.from(files).map((file: globalThis.File) => ({
      fileId: Math.random().toString(36).substring(7),
      fileName: file.name,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload each file
    Array.from(files).forEach((file: globalThis.File, index) => {
      const uploadId = newUploads[index].fileId;
      
      apiClient.uploadFile(file, currentFolderId || undefined, (progress) => {
        setUploads(prev => 
          prev.map(upload => 
            upload.fileId === uploadId 
              ? { ...upload, progress }
              : upload
          )
        );
      })
      .then(response => {
        if (response.success && response.data) {
          setUploads(prev => 
            prev.map(upload => 
              upload.fileId === uploadId 
                ? { ...upload, status: 'completed' as const, progress: 100 }
                : upload
            )
          );
          
          // Add to completed files
          onUploadComplete([response.data]);
          toast.success(`${file.name} uploaded successfully`);
        }
      })
      .catch(error => {
        console.error('Upload failed:', error);
        setUploads(prev => 
          prev.map(upload => 
            upload.fileId === uploadId 
              ? { ...upload, status: 'error' as const, error: error.message }
              : upload
          )
        );
        toast.error(`Failed to upload ${file.name}`);
      });
    });
  }, [currentFolderId, onUploadComplete]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const removeUpload = (fileId: string) => {
    setUploads(prev => prev.filter(upload => upload.fileId !== fileId));
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return <UploadIcon className="h-4 w-4 animate-pulse" />;
      case 'completed':
        return <CheckIcon className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 right-0 w-96 bg-background border border-border rounded-t-lg shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Uploads</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCompleted}
            disabled={!uploads.some(upload => upload.status === 'completed')}
          >
            Clear Completed
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={cn(
          'p-4 border-2 border-dashed transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <UploadIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Drop files here or{' '}
            <label className="text-primary cursor-pointer hover:underline">
              browse
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              />
            </label>
          </p>
        </div>
      </div>

      {/* Upload List */}
      <div className="max-h-64 overflow-y-auto">
        {uploads.map((upload) => (
          <div
            key={upload.fileId}
            className="p-4 border-b border-border last:border-b-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(upload.status)}
                <span className={cn('text-sm font-medium', getStatusColor(upload.status))}>
                  {upload.fileName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeUpload(upload.fileId)}
                className="h-6 w-6 p-0"
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>

            {upload.status === 'uploading' && (
              <Progress value={upload.progress} className="h-2" />
            )}

            {upload.status === 'error' && upload.error && (
              <p className="text-xs text-red-500 mt-1">{upload.error}</p>
            )}

            {upload.status === 'completed' && (
              <p className="text-xs text-green-500 mt-1">Upload complete</p>
            )}
          </div>
        ))}

        {uploads.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            <p className="text-sm">No uploads yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
