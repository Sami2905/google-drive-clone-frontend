'use client';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, LinkIcon, PencilSquareIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Copy, MoveRight, Eye, Download } from 'lucide-react';
import { Fragment } from 'react';

export default function MoreMenu({
  onPreview, onDownload, onShare, onRename, onTrash, onVersions, onDuplicate, onMove,
}: {
  onPreview?: () => void;
  onDownload?: () => void;
  onShare: () => void;
  onRename: () => void;
  onTrash: () => void;
  onVersions: () => void;
  onDuplicate?: () => void;
  onMove?: () => void;
}) {
  const Item = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <Menu.Item>
      {({ active }) => (
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${active ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
        >
          {children}
        </button>
      )}
    </Menu.Item>
  );

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        aria-label="More actions"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:hover:bg-slate-800"
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
      </Menu.Button>
      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
          {onPreview ? <Item onClick={onPreview}><Eye className="h-4 w-4" /> Preview</Item> : null}
          {onDownload ? <Item onClick={onDownload}><Download className="h-4 w-4" /> Download</Item> : null}
          <Item onClick={onShare}><LinkIcon className="h-4 w-4" /> Share</Item>
          <Item onClick={onRename}><PencilSquareIcon className="h-4 w-4" /> Rename</Item>
          <Item onClick={onVersions}><ClockIcon className="h-4 w-4" /> Versions</Item>
          {onDuplicate ? <Item onClick={onDuplicate}><Copy className="h-4 w-4" /> Duplicate</Item> : null}
          {onMove ? <Item onClick={onMove}><MoveRight className="h-4 w-4" /> Move to…</Item> : null}
          <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
          <Item onClick={onTrash}><TrashIcon className="h-4 w-4 text-red-600" /> <span className="text-red-600">Move to Trash</span></Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
