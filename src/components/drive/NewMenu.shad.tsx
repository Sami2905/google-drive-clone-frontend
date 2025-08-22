'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, FolderPlus, Upload, FolderInput, FilePlus2 } from 'lucide-react';
import NewDocModal from './NewDocModal';
import { useUpload } from '@/components/upload/upload-provider';

export function NewMenu({
  onCreateFolder, onUploadFiles, onUploadFolder, onCreateDoc,
  folderId = null,
}: {
  onCreateFolder: () => void;
  onUploadFiles: (files?: File[]) => void;
  onUploadFolder: (files?: File[]) => void;
  onCreateDoc: (name: string, type: 'txt'|'md') => void;
  folderId?: string | null;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);
  const [docOpen, setDocOpen] = React.useState(false);
  const { add } = useUpload();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="rounded-md bg-brand-600 text-white hover:bg-brand-700">
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={onCreateFolder}><FolderPlus className="mr-2 h-4 w-4" /> New folder</DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload files</DropdownMenuItem>
          <DropdownMenuItem onClick={() => folderInputRef.current?.click()}><FolderInput className="mr-2 h-4 w-4" /> Upload folder</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDocOpen(true)}><FilePlus2 className="mr-2 h-4 w-4" /> New document</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        id="toolbar-upload-input"
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            add(files, folderId);
            onUploadFiles(files);
          }
        }}
      />
      {/* webkitdirectory is non-standard but widely supported in Chromium/WebKit */}
      <input
        id="toolbar-upload-folder-input"
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error non-standard
        webkitdirectory="true"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) {
            add(files, folderId);
            onUploadFolder(files);
          }
        }}
      />

      <NewDocModal
        open={docOpen}
        onOpenChange={setDocOpen}
        onCreate={(name, type) => onCreateDoc(name, type)}
      />
    </>
  );
}
