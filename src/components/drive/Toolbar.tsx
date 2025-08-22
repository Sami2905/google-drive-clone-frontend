'use client';
import { Listbox, Transition } from '@headlessui/react';
import {
  MagnifyingGlassIcon, ChevronUpDownIcon, CheckIcon,
  ArrowUpIcon, ArrowDownIcon, Squares2X2Icon, Bars3BottomLeftIcon,
} from '@heroicons/react/24/outline';
import { Fragment, useEffect, useState } from 'react';

const SORTS = [
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'Size' },
  { id: 'created_at', label: 'Created' },
  { id: 'updated_at', label: 'Updated' },
] as const;

type SortId = typeof SORTS[number]['id'];
type Order = 'asc' | 'desc';
type View = 'grid' | 'list';

export default function Toolbar({
  onSearch, onChangeSort, onChangeOrder, onToggleView,
  defaultSort = 'name', defaultOrder = 'asc',
}: {
  onSearch: (q: string) => void;
  onChangeSort: (s: SortId) => void;
  onChangeOrder: (o: Order) => void;
  onToggleView: (v: View) => void;
  defaultSort?: SortId;
  defaultOrder?: Order;
}) {
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<SortId>(defaultSort);
  const [order, setOrder] = useState<Order>(defaultOrder);
  const [view, setView] = useState<View>(() => (typeof window !== 'undefined'
    ? ((localStorage.getItem('view') as View) || 'grid') : 'grid'));

  useEffect(() => onSearch(q), [q, onSearch]);
  useEffect(() => onChangeSort(sort), [sort, onChangeSort]);
  useEffect(() => onChangeOrder(order), [order, onChangeOrder]);
  useEffect(() => {
    onToggleView(view);
    if (typeof window !== 'undefined') localStorage.setItem('view', view);
  }, [view, onToggleView]);

  return (
    <div className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search your files…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:border-slate-300 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <SortListbox value={sort} onChange={setSort} />

      <button
        type="button"
        aria-label={`Sort ${order === 'asc' ? 'ascending' : 'descending'}`}
        onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {order === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
        {order === 'asc' ? 'Asc' : 'Desc'}
      </button>

      <button
        type="button"
        aria-label={`Switch to ${view === 'grid' ? 'list' : 'grid'} view`}
        onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        {view === 'grid' ? <Bars3BottomLeftIcon className="h-5 w-5" /> : <Squares2X2Icon className="h-5 w-5" />}
        {view === 'grid' ? 'List' : 'Grid'}
      </button>
    </div>
  );
}

function SortListbox({ value, onChange }: { value: SortId; onChange: (v: SortId) => void }) {
  const selected = SORTS.find((s) => s.id === value) ?? SORTS[0];
  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative w-44">
        <Listbox.Button className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <span>{selected.label}</span>
          <ChevronUpDownIcon className="h-5 w-5 text-slate-400" />
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
            {SORTS.map((s) => (
              <Listbox.Option
                key={s.id}
                value={s.id}
                className={({ active }) =>
                  `flex cursor-pointer items-center gap-2 px-3 py-2 ${
                    active ? 'bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-200'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className="flex-1">{s.label}</span>
                    {selected ? <CheckIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
