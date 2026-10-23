"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  clampMapView,
  getMapGeometry,
  getMapTransform,
  INITIAL_MAP_VIEW,
  panMap,
  pinchMap,
  transformMapAt,
  type MapPosition,
  type MapView,
} from "@/lib/branch-map-viewport";

export function useBranchMapViewport(onInteraction: () => void) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [pixelGrid, setPixelGrid] = useState({ ratio: 1, left: 0, top: 0 });
  const [view, setView] = useState(INITIAL_MAP_VIEW);
  const [dragging, setDragging] = useState(false);
  const viewRef = useRef(view);
  const geometryRef = useRef(getMapGeometry(size));
  const onInteractionRef = useRef(onInteraction);
  const pointers = useRef(new Map<number, MapPosition>());
  const dragOrigin = useRef<MapPosition | null>(null);
  const moved = useRef(false);
  const suppressClickUntil = useRef(0);

  useEffect(() => {
    onInteractionRef.current = onInteraction;
  }, [onInteraction]);

  const applyView = useCallback((next: MapView) => {
    viewRef.current = next;
    setView(next);
    onInteractionRef.current();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let gridFrame = 0;
    const updatePixelGrid = () => {
      const { left, top } = viewport.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      setPixelGrid((previous) =>
        previous.ratio === ratio &&
        previous.left === left &&
        previous.top === top
          ? previous
          : { ratio, left, top },
      );
    };
    const schedulePixelGrid = () => {
      if (gridFrame) return;
      gridFrame = window.requestAnimationFrame(() => {
        gridFrame = 0;
        updatePixelGrid();
      });
    };
    const observer = new ResizeObserver(([entry]) => {
      const nextSize = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
      geometryRef.current = getMapGeometry(nextSize);
      updatePixelGrid();
      setSize(nextSize);
      applyView(clampMapView(viewRef.current, geometryRef.current));
    });
    observer.observe(viewport);
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const anchor = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
      applyView(
        transformMapAt(
          viewRef.current,
          viewRef.current.zoom * Math.exp(-delta * 0.01),
          anchor,
          anchor,
          geometryRef.current,
        ),
      );
    };
    const onBlur = () => {
      pointers.current.clear();
      setDragging(false);
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("blur", onBlur);
    window.addEventListener("scroll", schedulePixelGrid, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", schedulePixelGrid);
    return () => {
      window.cancelAnimationFrame(gridFrame);
      observer.disconnect();
      viewport.removeEventListener("wheel", onWheel);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("scroll", schedulePixelGrid, true);
      window.removeEventListener("resize", schedulePixelGrid);
    };
  }, [applyView]);

  function snapPoint({ x, y }: MapPosition): MapPosition {
    const { ratio, left, top } = pixelGrid;
    return {
      x: Math.round((left + x) * ratio) / ratio - left,
      y: Math.round((top + y) * ratio) / ratio - top,
    };
  }

  function position(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const point = position(event);
    if (pointers.current.size === 0) {
      dragOrigin.current = point;
      moved.current = false;
    }
    pointers.current.set(event.pointerId, point);
    const target =
      (event.target as Element).closest("button") ?? event.currentTarget;
    target.setPointerCapture(event.pointerId);
    if (pointers.current.size > 1) {
      moved.current = true;
      setDragging(true);
      onInteractionRef.current();
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const previous = pointers.current.get(event.pointerId);
    if (!previous) return;
    const before = [...pointers.current.values()].slice(0, 2);
    const point = position(event);
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size >= 2) {
      applyView(
        pinchMap(
          viewRef.current,
          before,
          [...pointers.current.values()].slice(0, 2),
          geometryRef.current,
        ),
      );
    } else {
      if (
        !moved.current &&
        dragOrigin.current &&
        Math.hypot(
          point.x - dragOrigin.current.x,
          point.y - dragOrigin.current.y,
        ) <= 5
      )
        return;
      moved.current = true;
      setDragging(true);
      applyView(
        panMap(
          viewRef.current,
          { x: point.x - previous.x, y: point.y - previous.y },
          geometryRef.current,
        ),
      );
    }
    suppressClickUntil.current = performance.now() + 350;
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    if (moved.current) suppressClickUntil.current = performance.now() + 350;
    dragOrigin.current = pointers.current.values().next().value ?? null;
    if (!pointers.current.size) setDragging(false);
  }

  function zoomBy(factor: number, anchor?: MapPosition) {
    const geometry = geometryRef.current;
    const center = anchor ?? { x: geometry.width / 2, y: geometry.height / 2 };
    applyView(
      transformMapAt(
        viewRef.current,
        viewRef.current.zoom * factor,
        center,
        center,
        geometry,
      ),
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (
      [
        "+",
        "=",
        "-",
        "Home",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ].includes(event.key)
    )
      event.preventDefault();
    if (event.key === "+" || event.key === "=") zoomBy(2);
    else if (event.key === "-") zoomBy(0.5);
    else if (event.key === "Home") applyView(INITIAL_MAP_VIEW);
    else {
      const delta = {
        ArrowLeft: { x: 60, y: 0 },
        ArrowRight: { x: -60, y: 0 },
        ArrowUp: { x: 0, y: 60 },
        ArrowDown: { x: 0, y: -60 },
      }[event.key];
      if (delta) applyView(panMap(viewRef.current, delta, geometryRef.current));
    }
  }

  return {
    viewportRef,
    view,
    size,
    dragging,
    transform: getMapTransform(view, getMapGeometry(size)),
    snapPoint,
    zoomBy,
    reset: () => applyView(INITIAL_MAP_VIEW),
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: onPointerEnd,
      onPointerCancel: onPointerEnd,
      onLostPointerCapture: onPointerEnd,
      onKeyDown,
      onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => {
        if (performance.now() < suppressClickUntil.current) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      onDoubleClick: (event: React.MouseEvent<HTMLDivElement>) => {
        if ((event.target as Element).closest("button")) return;
        const rect = event.currentTarget.getBoundingClientRect();
        zoomBy(event.shiftKey ? 0.5 : 2, {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      },
    },
  };
}
