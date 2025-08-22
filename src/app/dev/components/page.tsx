'use client';
import ToolbarShad from '@/components/drive/Toolbar.shad';
import FileCard from '@/components/drive/FileCard';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '@/components/drive/ShareDialog.shad';
import { useState } from 'react';

const ALLOW = process.env.NEXT_PUBLIC_SHOW_GALLERY === 'true';

export default function ComponentGallery() {
  const [shareOpen, setShareOpen] = useState(false);
  if (!ALLOW) return <div className="p-6 text-sm text-slate-500">Component Gallery disabled. Set NEXT_PUBLIC_SHOW_GALLERY=true to view.</div>;

          const file = {
          id: '1',
          name: 'Preview.png',
          original_name: 'Preview.png',
          mime_type: 'image/png',
          size: 123000,
          user_id: 'dev-user',
          storage_path: '/dev/preview.png',
          storage_provider: 'supabase' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_shared: false,
          is_starred: false,
          is_deleted: false,
          parent_id: null
        };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-lg font-semibold">Component Gallery</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Toolbar</h2>
        <ToolbarShad
          onSearch={() => {}}
          onChangeSort={() => {}}
          onChangeOrder={() => {}}
          onToggleView={() => {}}
          onCreateFolder={() => {}}
          onUploadFiles={() => {}}
          onUploadFolder={() => {}}
          onCreateDoc={() => {}}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">File Card</h2>
        <div className="max-w-sm">
          <FileCard
            file={file}
            onShare={() => setShareOpen(true)}
            onRename={() => {}}
            onTrash={() => {}}
            onVersions={() => {}}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Buttons</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      <ShareDialog fileId="1" open={shareOpen} onOpenChange={setShareOpen} />
    </main>
  );
}
