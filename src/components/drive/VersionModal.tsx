'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import api from '@/lib/api';

type Version = {
  name: string;
  size: number;
  date: string;
  download_url: string;
};

export default function VersionModal({
  fileId, open, onClose,
}: { fileId: string | null; open: boolean; onClose: () => void }) {
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    if (!open || !fileId) return;
    (async () => {
      const res = await api.get(`/files/${fileId}/versions`);
      setVersions(res.data.versions || []);
    })();
  }, [open, fileId]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <Dialog.Title className="text-base font-semibold">Version history</Dialog.Title>
              <ul className="mt-4 divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                {versions.map((v, i) => (
                  <li key={i} className="flex items-center justify-between bg-white px-3 py-2 text-sm dark:bg-slate-900">
                    <span>{v.name} • {(v.size/1024).toFixed(1)} KB • {new Date(v.date).toLocaleString()}</span>
                    <a href={v.download_url} target="_blank" rel="noreferrer" className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Download</a>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-end">
                <button onClick={onClose} className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}


