'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

type PanZoomOptions = { minScale?: number; maxScale?: number };
export function usePanZoom({ minScale = 0.3, maxScale = 3 }: PanZoomOptions = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const panning = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const touches = useRef<Map<number, { x: number; y: number }>>(new Map());
  const startDist = useRef<number | null>(null);

  const clamp = useCallback((v: number) => Math.min(maxScale, Math.max(minScale, v)), [maxScale, minScale]);

  const wheel = useCallback((e: WheelEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const delta = -e.deltaY;
    const next = clamp(scale + (delta > 0 ? 0.1 : -0.1));

    const k = next / scale;
    setTx((prev) => (prev - cx) * k + cx);
    setTy((prev) => (prev - cy) * k + cy);
    setScale(next);
  }, [scale, clamp]);

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    if (e.pointerType === 'touch') {
      touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.current.size === 2) {
        const [a, b] = Array.from(touches.current.values());
        startDist.current = Math.hypot(a.x - b.x, a.y - b.y);
      }
      return;
    }
    panning.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return;
    if (e.pointerType === 'touch' && touches.current.size >= 1) {
      const prev = touches.current.get(e.pointerId);
      if (!prev) return;
      touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (touches.current.size === 1) {
        // single-finger pan
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        setTx((t) => t + dx);
        setTy((t) => t + dy);
      } else if (touches.current.size === 2) {
        // pinch zoom around midpoint
        const [a, b] = Array.from(touches.current.values());
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (startDist.current) {
          const factor = dist / startDist.current;
          const next = clamp(scale * factor);
          const rect = containerRef.current.getBoundingClientRect();
          const cx = (a.x + b.x) / 2 - rect.left;
          const cy = (a.y + b.y) / 2 - rect.top;
          const k = next / scale;
          setTx((prev) => (prev - cx) * k + cx);
          setTy((prev) => (prev - cy) * k + cy);
          setScale(next);
          startDist.current = dist;
        }
      }
      return;
    }

    if (!panning.current || !last.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    setTx((t) => t + dx);
    setTy((t) => t + dy);
  }, [scale, clamp]);

  const onPointerUp = useCallback((e: PointerEvent) => {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    if (e.pointerType === 'touch') {
      touches.current.delete(e.pointerId);
      if (touches.current.size < 2) startDist.current = null;
      return;
    }
    panning.current = false;
    last.current = null;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    return () => {
      el.removeEventListener('wheel', wheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, [wheel, onPointerDown, onPointerMove, onPointerUp]);

  const reset = useCallback(() => { 
    setScale(1); 
    setTx(0); 
    setTy(0); 
    setRotation(0); 
  }, []);

  return { containerRef, scale, setScale, rotation, setRotation, tx, ty, setTx, setTy, reset };
}
