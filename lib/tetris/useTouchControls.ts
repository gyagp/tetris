import { useEffect, useRef, useCallback } from "react";

interface TouchAction {
  onLeft: () => void;
  onRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotate: () => void;
}

const SWIPE_THRESHOLD = 30;
const TAP_THRESHOLD = 10;
const TAP_MAX_DURATION = 200;

export function useTouchControls(
  containerRef: React.RefObject<HTMLElement | null>,
  actions: TouchAction,
  enabled: boolean,
) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const handled = useRef(false);

  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const onTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    handled.current = false;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStart.current || handled.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > SWIPE_THRESHOLD && absDx > absDy) {
      e.preventDefault();
      handled.current = true;
      if (dx > 0) actionsRef.current.onRight();
      else actionsRef.current.onLeft();
      touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      handled.current = false;
    } else if (absDy > SWIPE_THRESHOLD && absDy > absDx) {
      e.preventDefault();
      handled.current = true;
      if (dy > 0) {
        actionsRef.current.onSoftDrop();
        touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        handled.current = false;
      } else {
        actionsRef.current.onHardDrop();
      }
    }
  }, []);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current || handled.current) return;
    const touch = e.changedTouches[0];
    const dx = Math.abs(touch.clientX - touchStart.current.x);
    const dy = Math.abs(touch.clientY - touchStart.current.y);
    const duration = Date.now() - touchStart.current.time;

    if (dx < TAP_THRESHOLD && dy < TAP_THRESHOLD && duration < TAP_MAX_DURATION) {
      e.preventDefault();
      actionsRef.current.onRotate();
    }
    touchStart.current = null;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [containerRef, enabled, onTouchStart, onTouchMove, onTouchEnd]);
}
