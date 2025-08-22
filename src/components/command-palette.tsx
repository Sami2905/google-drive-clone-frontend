'use client';
import * as React from 'react';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';
import { Folder, Users, Trash, Search, Link, Pencil, MoveRight, Trash2 } from 'lucide-react';


type Suggest = { id: string; name: string };

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<Suggest[]>([]);
  const [active, setActive] = React.useState<Suggest | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const emit = (type: 'preview'|'rename'|'move'|'trash'|'share', id: string) => {
    document.dispatchEvent(new CustomEvent('nimbus:action', { detail: { type, id } }));
    setOpen(false);
  };



  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search files or type an action…"
        onValueChange={async (val) => {
          if (!val || val.length < 2) return setSuggestions([]);
          try {
            const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(val)}&limit=5`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
            });
            const data = await r.json();
            const files = (data.files || []).slice(0, 5).map((f: { id: string; name: string }) => ({ id: f.id, name: f.name }));
            setSuggestions(files);
          } catch {
            setSuggestions([]);
          }
        }}
      />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => { router.push('/dashboard'); setOpen(false); }}>
            <Folder className="mr-2 h-4 w-4" /> My Drive
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/shared'); setOpen(false); }}>
            <Users className="mr-2 h-4 w-4" /> Shared with me
          </CommandItem>
          <CommandItem onSelect={() => { router.push('/trash'); setOpen(false); }}>
            <Trash className="mr-2 h-4 w-4" /> Trash
          </CommandItem>
        </CommandGroup>

        {suggestions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Files">
              {suggestions.map((s) => (
                <CommandItem key={s.id} onSelect={() => { setActive(s); emit('preview', s.id); }}>
                  <Search className="mr-2 h-4 w-4" /> {s.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {active && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Actions: ${active.name}`}>
              <CommandItem onSelect={() => emit('share', active.id)}><Link className="mr-2 h-4 w-4" /> Share</CommandItem>
              <CommandItem onSelect={() => emit('rename', active.id)}><Pencil className="mr-2 h-4 w-4" /> Rename</CommandItem>
              <CommandItem onSelect={() => emit('move', active.id)}><MoveRight className="mr-2 h-4 w-4" /> Move to…</CommandItem>
              <CommandItem onSelect={() => emit('trash', active.id)}><Trash2 className="mr-2 h-4 w-4" /> Move to Trash</CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
