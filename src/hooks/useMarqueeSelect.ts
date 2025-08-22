'use client';
import { useCallback, useMemo, useRef, useState } from 'react';

type Rect = { x: number; y: number; w: number; h: number };

export function useMarqueeSelect() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const itemsRef = useRef<Map<string, DOMRect>>(new Map());

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;
    const bounds = el.getBoundingClientRect();
    start.current = { x: e.clientX - bounds.left, y: e.clientY - bounds.top };
    setDragging(true);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !start.current || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const rx = Math.min(x, start.current.x);
    const ry = Math.min(y, start.current.y);
    const rw = Math.abs(x - start.current.x);
    const rh = Math.abs(y - start.current.y);
    setRect({ x: rx, y: ry, w: rw, h: rh });
  }, [dragging]);

  const onMouseUp = useCallback(() => {
    setDragging(false);
    start.current = null;
  }, []);

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (!el) { itemsRef.current.delete(id); return; }
    itemsRef.current.set(id, el.getBoundingClientRect());
  }, []);

  const selected = useMemo(() => {
    if (!rect || !containerRef.current) return new Set<string>();
    const bounds = containerRef.current.getBoundingClientRect();
    const sel = new Set<string>();
    itemsRef.current.forEach((r, id) => {
      const rr = new DOMRect(r.left - bounds.left, r.top - bounds.top, r.width, r.height);
      const intersects = !(rr.right < rect.x || rr.left > rect.x + rect.w || rr.bottom < rect.y || rr.top > rect.y + rect.h);
      if (intersects) sel.add(id);
    });
    return sel;
  }, [rect]);

  return {
    containerRef,
    register,
    dragging,
    rect,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    selected,
  };
}
