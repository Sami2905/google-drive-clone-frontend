'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Keyboard } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open command palette' },
      { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
      { keys: ['⌘', 'F'], description: 'Search files' },
      { keys: ['⌘', '.'], description: 'Toggle sidebar' },
      { keys: ['⌘', 'I'], description: 'Toggle info panel' }
    ]
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['←'], description: 'Go back' },
      { keys: ['→'], description: 'Go forward' },
      { keys: ['↑', '↓'], description: 'Navigate items' },
      { keys: ['Space'], description: 'Select item' },
      { keys: ['Enter'], description: 'Open item' }
    ]
  },
  {
    title: 'File Operations',
    shortcuts: [
      { keys: ['⌘', 'U'], description: 'Upload files' },
      { keys: ['⌘', 'N'], description: 'New folder' },
      { keys: ['⌘', 'D'], description: 'Download selected' },
      { keys: ['⌘', 'C'], description: 'Copy selected' },
      { keys: ['⌘', 'X'], description: 'Cut selected' },
      { keys: ['⌘', 'V'], description: 'Paste' },
      { keys: ['F2'], description: 'Rename selected' },
      { keys: ['Delete'], description: 'Move to trash' }
    ]
  },
  {
    title: 'View',
    shortcuts: [
      { keys: ['⌘', '1'], description: 'Grid view' },
      { keys: ['⌘', '2'], description: 'List view' },
      { keys: ['⌘', '+'], description: 'Zoom in' },
      { keys: ['⌘', '-'], description: 'Zoom out' },
      { keys: ['⌘', '0'], description: 'Reset zoom' }
    ]
  },
  {
    title: 'Selection',
    shortcuts: [
      { keys: ['⌘', 'A'], description: 'Select all' },
      { keys: ['Esc'], description: 'Clear selection' },
      { keys: ['Shift', '↑'], description: 'Extend selection up' },
      { keys: ['Shift', '↓'], description: 'Extend selection down' }
    ]
  },
  {
    title: 'Preview',
    shortcuts: [
      { keys: ['Space'], description: 'Quick preview' },
      { keys: ['←', '→'], description: 'Previous/Next page' },
      { keys: ['+', '-'], description: 'Zoom in/out' },
      { keys: ['R'], description: 'Rotate image' },
      { keys: ['Esc'], description: 'Close preview' }
    ]
  }
];

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Keyboard shortcuts to help you work faster
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {shortcutGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-semibold text-sm">{group.title}</h3>
                <div className="mt-2 space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
