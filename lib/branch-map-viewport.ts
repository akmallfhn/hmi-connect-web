import { BRANCH_MAP_HEIGHT, BRANCH_MAP_WIDTH } from "./branch-map-coordinates";

export const MIN_MAP_ZOOM = 1;
export const MAX_MAP_ZOOM = 32;
export const INITIAL_MAP_VIEW = { zoom: 1, centerX: 0.5, centerY: 0.5 };
const MAP_PADDING = 24;

export type MapView = typeof INITIAL_MAP_VIEW;
export type MapPosition = { x: number; y: number };
export type MapSize = { width: number; height: number };
export type MapGeometry = MapSize & { mapWidth: number; mapHeight: number };

export function getMapGeometry(size: MapSize): MapGeometry {
  const ratio = BRANCH_MAP_WIDTH / BRANCH_MAP_HEIGHT;
  const mapWidth = Math.max(
    1,
    Math.min(
      size.width - MAP_PADDING * 2,
      (size.height - MAP_PADDING * 2) * ratio,
    ),
  );
  return { ...size, mapWidth, mapHeight: mapWidth / ratio };
}

export function clampMapView(view: MapView, geometry: MapGeometry): MapView {
  const zoom = Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, view.zoom));
  const minX = Math.min(
    0.5,
    Math.max(0, geometry.width / 2 - MAP_PADDING) / (geometry.mapWidth * zoom),
  );
  const minY = Math.min(
    0.5,
    Math.max(0, geometry.height / 2 - MAP_PADDING) /
      (geometry.mapHeight * zoom),
  );
  return {
    zoom,
    centerX: Math.min(1 - minX, Math.max(minX, view.centerX)),
    centerY: Math.min(1 - minY, Math.max(minY, view.centerY)),
  };
}

export function getMapTransform(view: MapView, geometry: MapGeometry) {
  const width = geometry.mapWidth * view.zoom;
  const height = geometry.mapHeight * view.zoom;
  return {
    x: geometry.width / 2 - view.centerX * width,
    y: geometry.height / 2 - view.centerY * height,
    width,
    height,
  };
}

export function transformMapAt(
  view: MapView,
  zoom: number,
  from: MapPosition,
  to: MapPosition,
  geometry: MapGeometry,
): MapView {
  const nextZoom = Math.min(MAX_MAP_ZOOM, Math.max(MIN_MAP_ZOOM, zoom));
  return clampMapView(
    {
      zoom: nextZoom,
      centerX:
        view.centerX +
        (from.x - geometry.width / 2) / (geometry.mapWidth * view.zoom) -
        (to.x - geometry.width / 2) / (geometry.mapWidth * nextZoom),
      centerY:
        view.centerY +
        (from.y - geometry.height / 2) / (geometry.mapHeight * view.zoom) -
        (to.y - geometry.height / 2) / (geometry.mapHeight * nextZoom),
    },
    geometry,
  );
}

export function panMap(
  view: MapView,
  delta: MapPosition,
  geometry: MapGeometry,
) {
  return transformMapAt(view, view.zoom, { x: 0, y: 0 }, delta, geometry);
}

export function pinchMap(
  view: MapView,
  before: MapPosition[],
  after: MapPosition[],
  geometry: MapGeometry,
) {
  const distance = (points: MapPosition[]) =>
    Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  const midpoint = (points: MapPosition[]) => ({
    x: (points[0].x + points[1].x) / 2,
    y: (points[0].y + points[1].y) / 2,
  });
  const previousDistance = distance(before);
  if (previousDistance < 1) return view;
  return transformMapAt(
    view,
    (view.zoom * distance(after)) / previousDistance,
    midpoint(before),
    midpoint(after),
    geometry,
  );
}

export function branchMapPointKind(
  verifiedMembers: number,
  chapters: number,
  type: "full" | "provisional",
) {
  return verifiedMembers === 0 || chapters === 0 ? "empty" : type;
}
