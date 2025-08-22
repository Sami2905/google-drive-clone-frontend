'use client';
import { Virtuoso } from 'react-virtuoso';
import { File } from '@/types/drive';
import MoreMenu from './MoreMenu';

type Props = {
  files: File[];
  onShare: (f: File) => void;
  onRename: (f: File) => void;
  onTrash: (f: File) => void;
  onVersions: (f: File) => void;
};
export default function VirtualFileRowList({ files, onShare, onRename, onTrash, onVersions }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="grid grid-cols-12 border-b border-slate-200 px-4 py-2 text-slate-500 dark:border-slate-700">
        <div className="col-span-6">Name</div>
        <div className="col-span-2">Size</div>
        <div className="col-span-3">Modified</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>
      <Virtuoso
        style={{ height: 600 }}
        totalCount={files.length}
        itemContent={(index) => {
          const f = files[index];
          return (
            <div className="grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800">
              <div className="col-span-6 truncate" title={f.name}>{f.name}</div>
              <div className="col-span-2">{(f.size / 1024).toFixed(1)} KB</div>
              <div className="col-span-3">{new Date(f.updated_at || f.created_at).toLocaleString()}</div>
              <div className="col-span-1 text-right">
                <MoreMenu
                  onShare={() => onShare(f)}
                  onRename={() => onRename(f)}
                  onTrash={() => onTrash(f)}
                  onVersions={() => onVersions(f)}
                />
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
