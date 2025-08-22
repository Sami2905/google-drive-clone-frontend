'use client';
import * as React from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type Ctx = (opts?: ConfirmOptions) => Promise<boolean>;

const ConfirmCtx = React.createContext<Ctx | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [opts, setOpts] = React.useState<ConfirmOptions>({});
  const resolver = React.useRef<((v: boolean) => void) | null>(null);

  const confirm: Ctx = React.useCallback((o?: ConfirmOptions) => {
    setOpts(o || {});
    setOpen(true);
    return new Promise((res) => {
      resolver.current = res;
    });
  }, []);

  const close = (value: boolean) => {
    setOpen(false);
    resolver.current?.(value);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <AlertDialog open={open} onOpenChange={(v) => !v && close(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{opts.title || 'Are you sure?'}</AlertDialogTitle>
            {opts.description ? (
              <AlertDialogDescription>{opts.description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{opts.cancelLabel || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              className={opts.destructive ? 'bg-red-600 hover:bg-red-500' : ''}
              onClick={() => close(true)}
            >
              {opts.confirmLabel || 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmCtx.Provider>
  );
}

export function useConfirm(): Ctx {
  const ctx = React.useContext(ConfirmCtx);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
