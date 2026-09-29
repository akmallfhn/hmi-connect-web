// Dark enough for white text, with one representative color for each thumbnail hue.
export const ATTACHMENT_PALETTE = [
  { name: "forest", color: "#293d32", hue: 145 },
  { name: "teal", color: "#254147", hue: 185 },
  { name: "ocean", color: "#293d55", hue: 215 },
  { name: "indigo", color: "#383952", hue: 250 },
  { name: "plum", color: "#49374a", hue: 305 },
  { name: "terracotta", color: "#503a34", hue: 15 },
  { name: "ochre", color: "#51432f", hue: 42 },
  { name: "olive", color: "#414832", hue: 85 },
] as const;

export const DEFAULT_ATTACHMENT_COLOR = "#30343b";

function hueDistance(a: number, b: number) {
  const difference = Math.abs(a - b);
  return Math.min(difference, 360 - difference);
}

function hueAndSaturation(red: number, green: number, blue: number) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  const difference = maximum - minimum;
  const lightness = (maximum + minimum) / 2;
  if (difference === 0) return { hue: 0, saturation: 0, lightness };

  const saturation = difference / (1 - Math.abs(2 * lightness - 1));
  let hue: number;
  if (maximum === r) hue = ((g - b) / difference) % 6;
  else if (maximum === g) hue = (b - r) / difference + 2;
  else hue = (r - g) / difference + 4;

  return { hue: (hue * 60 + 360) % 360, saturation, lightness };
}

// Only chromatic mid-tone pixels vote, so pale sky and shadows can't drown the subject's hue.
export function matchAttachmentPalette(pixels: Uint8Array, channels: number) {
  const votes = ATTACHMENT_PALETTE.map(() => 0);
  const pixelCount = Math.floor(pixels.length / channels);
  if (!pixelCount || channels < 3) return DEFAULT_ATTACHMENT_COLOR;

  for (let offset = 0; offset + 2 < pixels.length; offset += channels) {
    const { hue, saturation, lightness } = hueAndSaturation(
      pixels[offset],
      pixels[offset + 1],
      pixels[offset + 2]
    );
    if (saturation < 0.1 || lightness < 0.08 || lightness > 0.95) continue;

    const weight = saturation * Math.min(lightness * 2, 1);
    let nearest = 0;
    for (let index = 1; index < ATTACHMENT_PALETTE.length; index++) {
      if (
        hueDistance(hue, ATTACHMENT_PALETTE[index].hue) <
        hueDistance(hue, ATTACHMENT_PALETTE[nearest].hue)
      ) {
        nearest = index;
      }
    }
    votes[nearest] += weight;
  }

  const highestVote = Math.max(...votes);
  if (highestVote < pixelCount * 0.07) return DEFAULT_ATTACHMENT_COLOR;
  return ATTACHMENT_PALETTE[votes.indexOf(highestVote)].color;
}

export function isAttachmentPaletteColor(color: unknown): color is string {
  return (
    color === DEFAULT_ATTACHMENT_COLOR ||
    ATTACHMENT_PALETTE.some((entry) => entry.color === color)
  );
}
