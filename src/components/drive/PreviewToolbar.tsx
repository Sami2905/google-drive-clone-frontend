'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCcw, RotateCw } from 'lucide-react';

export default function PreviewToolbar({
  onZoomIn, onZoomOut, onReset, onRotate, zoom, rotation,
}: {
  onZoomIn: () => void; onZoomOut: () => void; onReset: () => void; onRotate: () => void;
  zoom: number; rotation: number;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-md border bg-white/80 px-2 py-1 text-xs shadow-sm backdrop-blur dark:bg-slate-900/60">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onZoomOut}><ZoomOut className="mr-1 h-3 w-3" /> Zoom out</Button>
        <Button variant="outline" size="sm" onClick={onZoomIn}><ZoomIn className="mr-1 h-3 w-3" /> Zoom in</Button>
        <Button variant="outline" size="sm" onClick={onRotate}><RotateCw className="mr-1 h-3 w-3" /> Rotate</Button>
      </div>
      <div className="flex items-center gap-2">
        <span>{Math.round(zoom * 100)}% • {rotation}°</span>
        <Button size="sm" onClick={onReset}><RefreshCcw className="mr-1 h-3 w-3" /> Reset</Button>
      </div>
    </div>
  );
}
