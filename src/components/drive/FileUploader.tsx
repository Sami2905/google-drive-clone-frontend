'use client';
import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function FileUploader({ folderId, onUploadComplete }: { folderId?: string; onUploadComplete: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folderId', folderId);

      try {
        await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) {
              setProgress(Math.round((e.loaded * 100) / e.total));
            }
          },
        });
        toast.success(`Uploaded: ${file.name}`);
      } catch {
        toast.error(`Failed: ${file.name}`);
      }
    }
    setUploading(false);
    setProgress(0);
    onUploadComplete();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed p-6 text-center cursor-pointer rounded-lg transition-colors duration-150 ${
        isDragActive ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-300 hover:bg-gray-50'
      }`}
      aria-label="Upload files"
    >
      <input {...getInputProps()} />
      {uploading ? (
        <div>
          <p className="font-medium mb-2">Uploading...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-700">
          <div className="text-3xl">📤</div>
          <p className="font-medium">Drag & drop files here</p>
          <p className="text-xs">or click to select</p>
        </div>
      )}
    </div>
  );
}


