'use client';
import { Skeleton } from '@/components/ui/skeleton';

export function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-lgx border p-4">
          <div className="mb-3 flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="overflow-hidden rounded-lgx border">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-12 items-center gap-2 px-4 py-3">
          <Skeleton className="col-span-6 h-4" />
          <Skeleton className="col-span-2 h-4" />
          <Skeleton className="col-span-3 h-4" />
          <Skeleton className="col-span-1 h-4 justify-self-end" />
        </div>
      ))}
    </div>
  );
}
