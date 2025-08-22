'use client';
import React from 'react';
import { File } from '@/types/drive';
import MoreMenu from './MoreMenu';
import ItemContextMenu from './ItemContextMenu';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  DocumentTextIcon, 
  PhotoIcon, 
  DocumentIcon,
  FilmIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  CodeBracketIcon,
  EyeIcon,
  DownloadIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

function FileCardImpl({
  file, onShare, onRename, onTrash, onVersions, onDuplicate, onMove,
  selected, onToggleSelect, onOpen, onPreview, onDownload,
}: {
  file: File;
  onShare: (f: File) => void;
  onRename: (f: File) => void;
  onTrash: (f: File) => void;
  onVersions: (f: File) => void;
  onDuplicate?: (f: File) => void;
  onMove?: (f: File) => void;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onOpen?: (id: string) => void;
  onPreview?: (f: File) => void;
  onDownload?: (f: File) => void;
}) {
  // Enhanced file type detection and icons
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return PhotoIcon;
    if (mimeType.startsWith('video/')) return FilmIcon;
    if (mimeType.startsWith('audio/')) return MusicalNoteIcon;
    if (mimeType.includes('pdf')) return DocumentIcon;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return ArchiveBoxIcon;
    if (mimeType.includes('text/') || mimeType.includes('javascript') || mimeType.includes('css') || mimeType.includes('html')) return CodeBracketIcon;
    return DocumentTextIcon;
  };

  const Icon = getFileIcon(file.mime_type || '');
  const isImage = file.mime_type?.startsWith('image/');
  const isPreviewable = isImage || file.mime_type?.includes('pdf') || file.mime_type?.startsWith('text/');

  const open = () => onPreview?.(file) || onOpen?.(file.id);
  
  const card = (
    <div
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      className="group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
      role="button"
      aria-label={`Open ${file.name}`}
    >
      {onToggleSelect ? (
        <div className="absolute left-2 top-2" onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={!!selected} onCheckedChange={() => onToggleSelect?.(file.id)} aria-label={`Select ${file.name}`} />
        </div>
      ) : null}

      {/* Quick Action Buttons */}
      <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 touch:opacity-100 flex gap-1">
        {isPreviewable && onPreview && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
            }}
            title="Preview"
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
        )}
        
        {onDownload && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-white/80 hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(file);
            }}
            title="Download"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        )}
        
        <MoreMenu
          onPreview={() => onPreview?.(file)}
          onDownload={() => onDownload?.(file)}
          onShare={() => onShare(file)}
          onRename={() => onRename(file)}
          onTrash={() => onTrash(file)}
          onVersions={() => onVersions(file)}
          onDuplicate={onDuplicate ? () => onDuplicate(file) : undefined}
          onMove={onMove ? () => onMove(file) : undefined}
        />
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-slate-100">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100" title={file.name}>{file.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatFileSize(file.size)} • {new Date(file.updated_at || file.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* File Type Badge */}
      <div className="absolute bottom-2 right-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800 dark:bg-slate-700 dark:text-slate-200">
          {file.mime_type?.split('/')[1]?.toUpperCase() || 'FILE'}
        </span>
      </div>
    </div>
  );

  return (
    <ItemContextMenu
      onOpen={() => onOpen?.(file.id)}
      onPreview={() => onPreview?.(file)}
      onDownload={() => onDownload?.(file)}
      onShare={() => onShare(file)}
      onRename={() => onRename(file)}
      onTrash={() => onTrash(file)}
      onVersions={() => onVersions(file)}
      onDuplicate={onDuplicate ? () => onDuplicate(file) : undefined}
      onMove={onMove ? () => onMove(file) : undefined}
    >
      {card}
    </ItemContextMenu>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default React.memo(FileCardImpl);
