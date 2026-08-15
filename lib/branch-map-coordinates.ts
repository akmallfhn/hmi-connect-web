type CoordinateBounds = {
  lat: [north: number, south: number];
  lng: [west: number, east: number];
};

type MapRegion = {
  coverage: CoordinateBounds[];
  projection: CoordinateBounds & {
    pixelX: [start: number, end: number];
    pixelY: [start: number, end: number];
  };
};

const VIEW_WIDTH = 1600;
const VIEW_HEIGHT = 613;

// MapSquare is decorative artwork, not a true projection — these per-island bounds place stat/branch-map's real coordinates without a second Cabang/city name list.
const MAP_REGIONS: MapRegion[] = [
  {
    coverage: [{ lat: [-1, -4], lng: [105, 108.5] }],
    projection: {
      pixelX: [367, 463],
      pixelY: [271, 331],
      lat: [-1.5, -3.5],
      lng: [105.5, 108.3],
    },
  },
  {
    coverage: [{ lat: [-7.4, -11.5], lng: [114.4, 125.7] }],
    projection: {
      pixelX: [685, 1100],
      pixelY: [493, 589],
      lat: [-8.1, -10.9],
      lng: [114.4, 125.2],
    },
  },
  {
    coverage: [{ lat: [-5.2, -9], lng: [105, 114.7] }],
    projection: {
      pixelX: [361, 679],
      pixelY: [421, 517],
      lat: [-5.9, -8.8],
      lng: [105.2, 114.5],
    },
  },
  {
    coverage: [
      { lat: [2, -4.5], lng: [125.2, 130.5] },
      { lat: [-4.5, -7.5], lng: [125.2, 134] },
    ],
    projection: {
      pixelX: [1116, 1231],
      pixelY: [133, 343],
      lat: [1, -4],
      lng: [126.5, 129.5],
    },
  },
  {
    coverage: [{ lat: [2.7, -9.5], lng: [130.4, 142] }],
    projection: {
      pixelX: [1225, 1579],
      pixelY: [235, 529],
      lat: [2, -9],
      lng: [131, 141],
    },
  },
  {
    coverage: [{ lat: [2.3, -6.5], lng: [118.5, 125.7] }],
    projection: {
      pixelX: [823, 1045],
      pixelY: [156, 415],
      lat: [1.7, -5.8],
      lng: [118.7, 125.2],
    },
  },
  {
    coverage: [{ lat: [5.2, -4.5], lng: [108, 119.1] }],
    projection: {
      pixelX: [487, 829],
      pixelY: [73, 361],
      lat: [4.5, -4.2],
      lng: [108.5, 119],
    },
  },
  {
    coverage: [{ lat: [6.7, -6.3], lng: [94, 106.5] }],
    projection: {
      pixelX: [19, 391],
      pixelY: [19, 421],
      lat: [5.9, -5.9],
      lng: [95, 106],
    },
  },
];

function contains(
  { lat: [north, south], lng: [west, east] }: CoordinateBounds,
  latitude: number,
  longitude: number
) {
  return (
    latitude <= north &&
    latitude >= south &&
    longitude >= west &&
    longitude <= east
  );
}

function clampFraction(value: number) {
  return Math.min(1, Math.max(0, value));
}

// Projects coordinates returned by stat/branch-map onto MapSquare's artwork.
export function projectBranchMapPosition(
  latitude: number,
  longitude: number
): { x: number; y: number } | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const region = MAP_REGIONS.find(({ coverage }) =>
    coverage.some((bounds) => contains(bounds, latitude, longitude))
  );
  if (!region) return null;

  const {
    pixelX: [pixelXStart, pixelXEnd],
    pixelY: [pixelYStart, pixelYEnd],
    lat: [latNorth, latSouth],
    lng: [lngWest, lngEast],
  } = region.projection;
  const xFraction = clampFraction(
    (longitude - lngWest) / (lngEast - lngWest)
  );
  const yFraction = clampFraction(
    (latNorth - latitude) / (latNorth - latSouth)
  );

  return {
    x:
      ((pixelXStart + xFraction * (pixelXEnd - pixelXStart)) / VIEW_WIDTH) *
      100,
    y:
      ((pixelYStart + yFraction * (pixelYEnd - pixelYStart)) / VIEW_HEIGHT) *
      100,
  };
}
