'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function DropzoneCard({
  onDrop,
}: {
  onDrop: (files: File[]) => void;
}) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive
          ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-950/20'
          : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900/70'
      }`}
    >
      <input {...getInputProps()} />
      <CloudArrowUpIcon className="h-8 w-8 text-slate-400" />
      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
        {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">or click to select</p>
    </div>
  );
}
