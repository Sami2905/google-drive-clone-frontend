'use client';

import { useEffect, useCallback } from 'react';

interface GlobalShortcutsOptions {
  // Navigation
  onBack?: () => void;
  onForward?: () => void;
  onParentFolder?: () => void;

  // Selection
  hasSelection: boolean;
  onSelectAll?: () => void;
  onClearSelection: () => void;
  onSelectUp?: () => void;
  onSelectDown?: () => void;

  // File Operations
  onTrashSelection: () => void;
  onCopySelection?: () => void;
  onCutSelection?: () => void;
  onPaste?: () => void;
  onRenameSelection?: () => void;
  onDownloadSelection?: () => void;

  // View
  onToggleView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onToggleSidebar?: () => void;
  onToggleInfo?: () => void;

  // Actions
  onFocusSearch?: () => void;
  onOpenCommandPalette?: () => void;
  onShowShortcuts?: () => void;
  onUploadOpen?: () => void;
  onNewFolder?: () => void;
  onMoveOpen?: () => void;
}

export function useGlobalShortcuts(opts: GlobalShortcutsOptions) {
  const isInputActive = useCallback(() => {
    const activeElement = document.activeElement;
    return (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      (activeElement instanceof HTMLElement && activeElement.isContentEditable)
    );
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if input is focused (except for specific shortcuts)
      if (isInputActive() && !e.metaKey && !e.ctrlKey) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      // Command Palette
      if (cmdKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        opts.onOpenCommandPalette?.();
        return;
      }

      // Show Shortcuts
      if (cmdKey && e.key === '/') {
        e.preventDefault();
        opts.onShowShortcuts?.();
        return;
      }

      // Search
      if (cmdKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        opts.onFocusSearch?.();
        return;
      }

      // Selection
      if (cmdKey && e.key === 'a') {
        e.preventDefault();
        opts.onSelectAll?.();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        opts.onClearSelection();
        return;
      }

      if (e.shiftKey && e.key === 'ArrowUp') {
        e.preventDefault();
        opts.onSelectUp?.();
        return;
      }

      if (e.shiftKey && e.key === 'ArrowDown') {
        e.preventDefault();
        opts.onSelectDown?.();
        return;
      }

      // File Operations
      if ((e.key === 'Delete' || e.key === 'Backspace') && opts.hasSelection) {
        e.preventDefault();
        opts.onTrashSelection();
        return;
      }

      if (cmdKey && e.key === 'c' && opts.hasSelection) {
        e.preventDefault();
        opts.onCopySelection?.();
        return;
      }

      if (cmdKey && e.key === 'x' && opts.hasSelection) {
        e.preventDefault();
        opts.onCutSelection?.();
        return;
      }

      if (cmdKey && e.key === 'v') {
        e.preventDefault();
        opts.onPaste?.();
        return;
      }

      if (e.key === 'F2' && opts.hasSelection) {
        e.preventDefault();
        opts.onRenameSelection?.();
        return;
      }

      if (cmdKey && e.key === 'd' && opts.hasSelection) {
        e.preventDefault();
        opts.onDownloadSelection?.();
        return;
      }

      // Navigation
      if (e.key === 'ArrowLeft' && e.altKey) {
        e.preventDefault();
        opts.onBack?.();
        return;
      }

      if (e.key === 'ArrowRight' && e.altKey) {
        e.preventDefault();
        opts.onForward?.();
        return;
      }

      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        opts.onParentFolder?.();
        return;
      }

      // View
      if (cmdKey && e.key === '1') {
        e.preventDefault();
        opts.onToggleView?.();
        return;
      }

      if (cmdKey && e.key === '+') {
        e.preventDefault();
        opts.onZoomIn?.();
        return;
      }

      if (cmdKey && e.key === '-') {
        e.preventDefault();
        opts.onZoomOut?.();
        return;
      }

      if (cmdKey && e.key === '0') {
        e.preventDefault();
        opts.onResetZoom?.();
        return;
      }

      if (cmdKey && e.key === '.') {
        e.preventDefault();
        opts.onToggleSidebar?.();
        return;
      }

      if (cmdKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        opts.onToggleInfo?.();
        return;
      }

      // Actions
      if (cmdKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        opts.onUploadOpen?.();
        return;
      }

      if (cmdKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        opts.onNewFolder?.();
        return;
      }

      if (cmdKey && e.key.toLowerCase() === 'm' && opts.hasSelection) {
        e.preventDefault();
        opts.onMoveOpen?.();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [opts, isInputActive]);
}