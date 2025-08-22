'use client';
import toast from 'react-hot-toast';
import api from '@/lib/api';

function UndoToast({
  message, onUndo,
}: { message: string; onUndo: () => Promise<void> | void }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow dark:border-slate-700 dark:bg-slate-900">
      <span>{message}</span>
      <button
        onClick={async () => { await onUndo(); toast.dismiss(); }}
        className="rounded border border-slate-200 px-2 py-0.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Undo
      </button>
    </div>
  );
}

export function useUndoTrash(onRefresh: () => Promise<void> | void) {
  const trashOne = async (id: string, name?: string) => {
    await api.delete(`/files/${id}`); // soft delete
    toast.custom(
      <UndoToast
        message={`Moved "${name ?? 'file'}" to Trash`}
        onUndo={async () => { await api.patch(`/files/${id}/restore`); await onRefresh(); }}
      />,
      { duration: 5000 }
    );
    await onRefresh();
  };

  const trashMany = async (ids: string[]) => {
    if (!ids.length) return;
    await Promise.all(ids.map((id) => api.delete(`/files/${id}`)));
    toast.custom(
      <UndoToast
        message={`Moved ${ids.length} item(s) to Trash`}
        onUndo={async () => {
          await Promise.all(ids.map((id) => api.patch(`/files/${id}/restore`)));
          await onRefresh();
        }}
      />,
      { duration: 6000 }
    );
    await onRefresh();
  };

  return { trashOne, trashMany };
}
