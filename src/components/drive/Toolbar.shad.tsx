'use client';
import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, LayoutGrid, List, Search } from 'lucide-react';
import { NewMenu } from './NewMenu.shad';

type SortId = 'name' | 'size' | 'created_at' | 'updated_at';
type Order = 'asc' | 'desc';
type View = 'grid' | 'list';

export default function ToolbarShad({
  onSearch, onChangeSort, onChangeOrder, onToggleView,
  onCreateFolder, onUploadFiles, onUploadFolder, onCreateDoc,
  onToggleInfo, infoPinned,
  defaultSort = 'name', defaultOrder = 'asc',
  folderId = null,
}: {
  onSearch: (q: string) => void;
  onChangeSort: (s: SortId) => void;
  onChangeOrder: (o: Order) => void;
  onToggleView: (v: View) => void;
  onCreateFolder: (name?: string) => void;
  onUploadFiles: (files?: File[]) => void;
  onUploadFolder?: (files?: File[]) => void;
  onCreateDoc?: (name: string, type: 'txt'|'md') => void;
  onToggleInfo?: (show: boolean) => void;
  infoPinned?: boolean;
  defaultSort?: SortId; defaultOrder?: Order;
  folderId?: string | null;
}) {
  const [q, setQ] = React.useState('');
  const [order, setOrder] = React.useState<Order>(defaultOrder);
  const [view, setView] = React.useState<View>(() => (typeof window !== 'undefined' ? ((localStorage.getItem('view') as View) || 'grid') : 'grid'));

  React.useEffect(() => {
    const id = setTimeout(() => onSearch(q), 350);
    return () => clearTimeout(id);
  }, [q, onSearch]);

  React.useEffect(() => { onChangeOrder(order); }, [order, onChangeOrder]);
  React.useEffect(() => { onToggleView(view); if (typeof window !== 'undefined') localStorage.setItem('view', view); }, [view, onToggleView]);

  const showNew = !!onCreateFolder || !!onUploadFiles || !!onUploadFolder || !!onCreateDoc;

  return (
    <div className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id="global-search-input"
          placeholder="Search your files…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-10 pl-9 bg-white border-slate-200 focus:ring-brand-500/30"
        />
      </div>

      <Select defaultValue={defaultSort} onValueChange={(v: SortId) => onChangeSort(v)}>
        <SelectTrigger className="h-10 w-44 bg-white border-slate-200 focus:ring-brand-500/30">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="size">Size</SelectItem>
          <SelectItem value="created_at">Created</SelectItem>
          <SelectItem value="updated_at">Updated</SelectItem>
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="h-10 text-slate-700 hover:bg-slate-50 dark:text-slate-200"
              aria-label={`Sort ${order === 'asc' ? 'ascending' : 'descending'}`}
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            >
              {order === 'asc' ? <ArrowUp className="mr-2 h-4 w-4" /> : <ArrowDown className="mr-2 h-4 w-4" />}
              {order === 'asc' ? 'Asc' : 'Desc'}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle sort order</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as View)} className="hidden sm:flex">
        <ToggleGroupItem value="grid" aria-label="Grid view" className="text-slate-700 dark:text-slate-200">
          <LayoutGrid className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view" className="text-slate-700 dark:text-slate-200">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {typeof onToggleInfo === 'function' && (
        <Button
          variant={infoPinned ? 'default' : 'outline'}
          className="h-10 text-slate-700 hover:bg-slate-50 dark:text-slate-200"
          aria-label={infoPinned ? 'Hide info panel' : 'Show info panel'}
          aria-pressed={!!infoPinned}
          onClick={() => onToggleInfo(!infoPinned)}
        >
          {infoPinned ? 'Hide Info' : 'Show Info'}
        </Button>
      )}

      {showNew && (
        <NewMenu
          onCreateFolder={() => onCreateFolder?.()}
          onUploadFiles={(files) => onUploadFiles?.(files)}
          onUploadFolder={(files) => onUploadFolder?.(files)}
          onCreateDoc={(name, type) => onCreateDoc?.(name, type)}
          folderId={folderId}
        />
      )}
    </div>
  );
}
