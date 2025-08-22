'use client';
import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type Crumb = { id: string | null; name: string };

export default function BreadcrumbsOverflow({
  items, onNavigate, rootLabel = 'My Drive',
}: {
  items: Crumb[]; onNavigate: (id: string | null) => void; rootLabel?: string;
}) {
  if (!items.length || items[0]?.id !== null) items = [{ id: null, name: rootLabel }, ...items];

  const start = items[0];
  const end = items[items.length - 1];
  const middle = items.slice(1, -1);

  return (
    <nav className="w-full overflow-x-auto">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Button variant="ghost" size="sm" className="px-2" onClick={() => onNavigate(start.id)} aria-current={items.length === 1 ? 'page' : undefined}>
            {start.name}
          </Button>
        </li>
        {middle.length ? (
          <>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <li>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2" aria-label="Show path">…</Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-1">
                  <ul className="max-h-64 w-56 overflow-auto text-sm">
                    {middle.map((m) => (
                      <li key={m.id ?? 'root'}>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onNavigate(m.id)}>
                          {m.name}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              </Popover>
            </li>
          </>
        ) : null}
        {items.length > 1 && (
          <>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <li>
              <Button variant="ghost" size="sm" className="px-2 font-semibold" aria-current="page" onClick={() => onNavigate(end.id)}>
                {end.name}
              </Button>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
