'use client';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

const ROLES = ['viewer', 'editor'] as const;
type Role = typeof ROLES[number];

export default function ShareModal({
  fileId, open, onClose,
}: { fileId: string | null; open: boolean; onClose: () => void }) {
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [access, setAccess] = useState<{ id: string; email: string; role: Role }[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('viewer');

  useEffect(() => {
    if (!open || !fileId) return;
    (async () => {
      const res = await api.get(`/files/${fileId}/access`);
      setPublicLink(res.data.public_link || null);
      setAccess(res.data.users || []);
    })();
  }, [open, fileId]);

  const togglePublic = async () => {
    if (!fileId) return;
    try {
      if (publicLink) {
        await api.delete(`/shares/${fileId}/public`);
        setPublicLink(null);
        toast.success('Public link disabled');
      } else {
        const res = await api.post(`/shares/${fileId}/public`);
        setPublicLink(res.data.shareable_link);
        toast.success('Public link enabled');
      }
    } catch { toast.error('Error updating link'); }
  };

  const invite = async () => {
    if (!fileId || !email) return;
    try {
      await api.post(`/shares/${fileId}/user`, { email, role });
      setEmail('');
      const res = await api.get(`/files/${fileId}/access`);
      setAccess(res.data.users || []);
      toast.success('User invited');
    } catch { toast.error('Invite failed'); }
  };

  const remove = async (uid: string) => {
    if (!fileId) return;
    await api.delete(`/shares/${fileId}/user/${uid}`);
    const res = await api.get(`/files/${fileId}/access`);
    setAccess(res.data.users || []);
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <Dialog.Title className="text-base font-semibold">Share file</Dialog.Title>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Public link</span>
                  <button
                    onClick={togglePublic}
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    {publicLink ? 'Disable' : 'Enable'}
                  </button>
                </div>
                {publicLink && (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800">
                    <span className="truncate">{publicLink}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(publicLink); toast.success('Link copied'); }}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                    >
                      Copy
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  <label className="mb-1 block text-sm font-medium">Invite</label>
                  <div className="flex gap-2">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="email@company.com"
                      className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none ring-2 ring-transparent focus:border-slate-300 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900"
                    />
                    <RoleListbox value={role} onChange={setRole} />
                    <button onClick={invite} className="h-10 rounded-lg bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-500">
                      Add
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="mb-1 text-sm font-medium">People with access</h4>
                  <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                    {access.map(u => (
                      <li key={u.id} className="flex items-center justify-between bg-white px-3 py-2 text-sm dark:bg-slate-900">
                        <span>{u.email} • {u.role}</span>
                        <button onClick={() => remove(u.id)} className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
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

function RoleListbox({ value, onChange }: { value: Role; onChange: (r: Role) => void }) {
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-32">
        <Listbox.Button className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
          <span className="capitalize">{value}</span>
          <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
            {ROLES.map(r => (
              <Listbox.Option key={r} value={r} className={({ active }) =>
                `cursor-pointer px-3 py-2 capitalize ${active ? 'bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-slate-100' : ''}`}>
                {({ selected }) => (
                  <div className="flex items-center justify-between">
                    <span>{r}</span>
                    {selected ? <CheckIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> : null}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}


