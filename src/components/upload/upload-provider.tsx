'use client';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import axios, { Canceler } from 'axios';
import { nanoid } from 'nanoid';
import { toast } from 'react-toastify';

type Status = 'queued' | 'uploading' | 'done' | 'error' | 'canceled';
export type UploadItem = {
  id: string;
  name: string;
  size: number;
  folderId: string | null;
  progress: number; // 0..100
  status: Status;
  error?: string;
};

type Ctx = {
  items: UploadItem[];
  add: (files: File[], folderId: string | null) => void;
  cancel: (id: string) => void;
  retry: (id: string) => void;
  clearCompleted: () => void;
};

const UploadCtx = createContext<Ctx | null>(null);
const CONCURRENCY = 3;

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const running = useRef(0);
  const cancels = useRef(new Map<string, Canceler>());
  const fileStore = useRef(new Map<string, File>()); // id -> File

  const patchedTick = useCallback(async () => {
    if (running.current >= CONCURRENCY) return;
    const index = items.findIndex((i) => i.status === 'queued');
    if (index === -1) return;
    const job = items[index];

    running.current += 1;
    setItems((s) => s.map((x, i) => (i === index ? { ...x, status: 'uploading', progress: 0 } : x)));

    try {
      const fd = new FormData();
      const file = fileStore.current.get(job.id);
      if (!file) throw new Error('File not found in upload store');
      fd.append('file', file);
      if (job.folderId) fd.append('folder_id', job.folderId);

      const source = axios.CancelToken.source();
      cancels.current.set(job.id, source.cancel);

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/files/upload`, fd, {
        cancelToken: source.token,
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
        onUploadProgress: (e) => {
          const p = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          setItems((s) => s.map((x) => (x.id === job.id ? { ...x, progress: p } : x)));
        },
      });

      setItems((s) => s.map((x) => (x.id === job.id ? { ...x, status: 'done', progress: 100 } : x)));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      toast.error(errorMessage);
      if (axios.isCancel(error)) {
        setItems((s) => s.map((x) => (x.id === job.id ? { ...x, status: 'canceled' } : x)));
      } else {
        setItems((s) => s.map((x) => (x.id === job.id ? { ...x, status: 'error', error: errorMessage } : x)));
      }
    } finally {
      cancels.current.delete(job.id);
      running.current -= 1;
      setTimeout(patchedTick, 0);
    }
  }, [items]);

  const drive = useCallback(() => {
    // try to fill slots
    for (let i = running.current; i < CONCURRENCY; i++) setTimeout(patchedTick, 0);
  }, [patchedTick]);

  const add = useCallback((files: File[], folderId: string | null) => {
    if (!files.length) return;
    const newItems: UploadItem[] = files.map((f) => {
      const id = nanoid(12);
      fileStore.current.set(id, f);
      return {
        id,
        name: f.name,
        size: f.size,
        folderId,
        progress: 0,
        status: 'queued',
      };
    });
    setItems((s) => [...s, ...newItems]);
    // schedule workers
    setTimeout(drive, 0);
  }, [drive]);

  // whenever new queued items added, drive
  const queuedCount = useMemo(() => items.filter(i => i.status === 'queued').length, [items]);
  if (queuedCount > 0 && running.current < CONCURRENCY) setTimeout(drive, 0);

  const cancel = useCallback((id: string) => {
    cancels.current.get(id)?.('canceled');
  }, []);

  const retry = useCallback((id: string) => {
    setItems((s) => s.map((x) => (x.id === id && (x.status === 'error' || x.status === 'canceled') ? { ...x, status: 'queued', progress: 0, error: undefined } : x)));
    setTimeout(drive, 0);
  }, [drive]);

  const clearCompleted = useCallback(() => {
    setItems((s) => s.filter((x) => x.status === 'uploading' || x.status === 'queued'));
  }, []);

  const value = useMemo<Ctx>(() => ({ items, add, cancel, retry, clearCompleted }), [items, add, cancel, retry, clearCompleted]);
  return <UploadCtx.Provider value={value}>{children}</UploadCtx.Provider>;
}

export function useUpload() {
  const ctx = useContext(UploadCtx);
  if (!ctx) throw new Error('useUpload must be used within UploadProvider');
  return ctx;
}
