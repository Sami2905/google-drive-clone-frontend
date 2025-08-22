'use client';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/api';
import FileGrid from '@/components/drive/FileGrid';
import AppHeader from '@/components/layout/AppHeader';
import Sidebar from '@/components/layout/Sidebar';
import BreadcrumbsOverflow, { Crumb } from '@/components/drive/BreadcrumbsOverflow';
import FileUploader from '@/components/drive/FileUploader';
import { ViewMode } from '@/types/drive';

export default function FolderPage() {
  const { id } = useParams<{ id: string }>();
  type FolderItem = { id: string; name: string };
  type FileItem = { id: string; name: string; size: number; mime_type: string };
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [crumbs, setCrumbs] = useState<Crumb[]>([{ id: null, name: 'My Drive' }]);
  const [selectedItems, setSelectedItems] = useState(new Set<string>());
  const [viewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return { type: 'grid', size: 'medium' };
    const savedMode = localStorage.getItem('drive_view_mode');
    if (savedMode === 'grid' || savedMode === 'list') {
      return { type: savedMode, size: 'medium' };
    }
    return { type: 'grid', size: 'medium' };
  });

  type PathItem = { id: string; name: string };
  const fetchContents = useCallback(async () => {
    if (!id) return;
    const res = await api.get(`/folders/${id}/contents`);
    const data = res.data?.data ?? res.data;
    setFolders(data.folders || []);
    setFiles(data.files || []);
    const pathRes = await api.get(`/folders/${id}/path`);
    const pathData = (pathRes.data?.data ?? pathRes.data) as PathItem[];
    const breadcrumbs = [{ id: null, name: 'My Drive' }, ...pathData.map((p) => ({ id: p.id, name: p.name }))];
    setCrumbs(breadcrumbs);
  }, [id]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);



  const goCrumb = (crumbId: string | null) => {
    if (crumbId === null) {
      // Navigate to root
      window.location.href = '/dashboard';
    } else {
      // Navigate to specific folder
      window.location.href = `/dashboard/folder/${crumbId}`;
    }
  };

  const handleItemClick = (item: { id: string; type: string }) => {
    if (item.type === 'folder') {
      window.location.href = `/dashboard/folder/${item.id}`;
    }
  };

  const handleSelectionChange = (selectedItems: Set<string>) => {
    setSelectedItems(selectedItems);
  };

  // Convert folders and files to FileGridItem format
  const items = [
    ...folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      type: 'folder' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_shared: false
    })),
    ...files.map(file => ({
      id: file.id,
      name: file.name,
      type: 'file' as const,
      size: file.size,
      mime_type: file.mime_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_shared: false
    }))
  ];

  const showBreadcrumbs = crumbs.length > 1;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <AppHeader />
      
      {/* Full-width grid; left column fixed sidebar, right column fluid content */}
      <div className="grid grid-cols-1 md:grid-cols-[16rem_minmax(0,1fr)]">
        {/* Desktop-only sidebar anchored left */}
        <Sidebar variant="desktop" />
        
        <main className="min-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Only the MAIN content is width-constrained */}
          <div className="mx-auto w-full max-w-6xl p-4">
            <div className="space-y-4">
              {showBreadcrumbs && <BreadcrumbsOverflow items={crumbs} onNavigate={goCrumb} />}
              
              <div className="px-4">
                <FileUploader folderId={id} onUploadComplete={fetchContents} />
              </div>
              <FileGrid 
                items={items}
                viewMode={viewMode}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
                onItemClick={handleItemClick}
                onItemsChange={fetchContents}
                currentFolderId={id}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


