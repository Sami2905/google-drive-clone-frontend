'use client';
import { File, Folder } from '@/types/drive';
import FileCard from './FileCard';
import { FolderIcon } from '@heroicons/react/24/outline';
import { useMarqueeSelect } from '@/hooks/useMarqueeSelect';
import { useEffect, useRef } from 'react';

export default function FileGridSelectable({
  folders, files, onOpenFolder, onShare, onRename, onTrash, onVersions, onDuplicate, onMove, onPreview, onDownload, onSelectMany,
}: {
  folders: Folder[];
  files: File[];
  onOpenFolder: (id: string) => void;
  onShare: (f: File) => void;
  onRename: (f: File) => void;
  onTrash: (f: File) => void;
  onVersions: (f: File) => void;
  onDuplicate?: (f: File) => void;
  onMove?: (f: File) => void;
  onPreview?: (f: File) => void;
  onDownload?: (f: File) => void;
  onSelectMany: (ids: string[]) => void;
}) {
  const { containerRef, register, dragging, rect, onMouseDown, onMouseMove, onMouseUp, selected } = useMarqueeSelect();
  const lastSelected = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (dragging) lastSelected.current = selected;
    else if (selected.size > 0) onSelectMany(Array.from(selected));
  }, [dragging, selected, onSelectMany]);

  return (
    <div
      ref={containerRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      className="relative"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {folders.map((f) => (
          <button
            key={f.id}
            ref={(el) => {
              if (el) register(`folder:${f.id}`, el);
            }}
            onDoubleClick={() => onOpenFolder(f.id)}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-slate-800 dark:text-slate-100">
              <FolderIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" title={f.name}>{f.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Folder</p>
            </div>
          </button>
        ))}
        {files.map((file) => (
          <div key={file.id} ref={(el) => {
            if (el) register(`file:${file.id}`, el);
          }}>
            <FileCard
              file={file}
              onShare={onShare}
              onRename={onRename}
              onTrash={onTrash}
              onVersions={onVersions}
              onDuplicate={onDuplicate}
              onMove={onMove}
              onPreview={onPreview}
              onDownload={onDownload}
            />
          </div>
        ))}
      </div>

      {/* Rubber-band rectangle */}
      {dragging && rect ? (
        <div
          className="pointer-events-none absolute rounded-md border-2 border-indigo-500/60 bg-indigo-500/10"
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
        />
      ) : null}
    </div>
  );
}
