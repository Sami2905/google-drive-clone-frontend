'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useFolderContents(folderId: string | null, params: { sort?: string; order?: string; q?: string }) {
  const key = ['folder', folderId, params];
  const fetcher = async () => {
    const { sort = 'name', order = 'asc', q } = params || {};
    if (q && q.length) {
      const r = await api.get(`/search`, { params: { q, sort, order, folder: folderId ?? undefined } });
      return { folders: r.data.folders || [], files: r.data.files || [] };
    }
    const r = await api.get(folderId ? `/folders/${folderId}/contents` : `/folders/root`, { params: { sort, order } });
    return { folders: r.data.folders || [], files: r.data.files || [] };
  };
  return useQuery({ queryKey: key, queryFn: fetcher, refetchOnWindowFocus: true });
}

export function useInvalidateFolder() {
  const qc = useQueryClient();
  return (folderId: string | null) => qc.invalidateQueries({ queryKey: ['folder', folderId] });
}
