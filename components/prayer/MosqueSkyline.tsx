import type { SVGProps } from "react";

// Onion dome whose base spans cx±r at y and whose tip sits h above it.
function domePath(cx: number, y: number, r: number, h: number) {
  return `M${cx - r * 0.82} ${y}C${cx - r * 1.18} ${y - h * 0.48} ${cx - r * 0.42} ${y - h * 0.74} ${cx} ${y - h}C${cx + r * 0.42} ${y - h * 0.74} ${cx + r * 1.18} ${y - h * 0.48} ${cx + r * 0.82} ${y}Z`;
}

function archPath(x: number, y: number, w: number, h: number) {
  return `M${x} ${y + h}V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V${y + h}Z`;
}

function sparklePath(cx: number, cy: number, r: number) {
  const k = r * 0.22;
  return `M${cx} ${cy - r}Q${cx + k} ${cy - k} ${cx + r} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + r}Q${cx - k} ${cy + k} ${cx - r} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - r}Z`;
}

function Minaret({ x, top, fill }: { x: number; top: number; fill: string }) {
  return (
    <g fill={fill}>
      <path d={`M${x - 7} ${top + 14}L${x} ${top - 6}L${x + 7} ${top + 14}Z`} />
      <rect x={x - 6} y={top + 14} width={12} height={180 - top - 14} />
      <rect x={x - 9} y={top + 40} width={18} height={5} rx={1.5} />
      <rect x={x - 9} y={top + 80} width={18} height={5} rx={1.5} />
      <circle cx={x} cy={top - 9} r={2.2} />
    </g>
  );
}

// Decorative skyline for the prayer widget banner, drawn in the HMI tosca/orange palette.
export default function MosqueSkyline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 400 180" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="prayer-skyline-dome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fcfd1" />
          <stop offset="1" stopColor="#159fa2" />
        </linearGradient>
        <linearGradient id="prayer-skyline-side" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb08a" />
          <stop offset="1" stopColor="#ff5c53" />
        </linearGradient>
        <linearGradient id="prayer-skyline-hall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0e7c7e" />
          <stop offset="1" stopColor="#024a4b" />
        </linearGradient>
      </defs>

      <g fill="#ffffff" opacity={0.1}>
        <path d={domePath(34, 168, 30, 50)} />
        <path d={domePath(368, 168, 30, 50)} />
        <path d={domePath(250, 120, 22, 36)} />
        <rect x={6} y={150} width={60} height={30} />
        <rect x={336} y={150} width={60} height={30} />
      </g>
      <Minaret x={14} top={70} fill="rgb(255 255 255 / 0.1)" />
      <Minaret x={388} top={62} fill="rgb(255 255 255 / 0.1)" />

      <Minaret x={62} top={40} fill="#bfe6e7" />
      <Minaret x={338} top={40} fill="#bfe6e7" />

      <rect x={82} y={134} width={56} height={46} fill="url(#prayer-skyline-hall)" />
      <rect x={262} y={134} width={56} height={46} fill="url(#prayer-skyline-hall)" />
      <path d={domePath(110, 136, 26, 42)} fill="url(#prayer-skyline-side)" />
      <path d={domePath(290, 136, 26, 42)} fill="url(#prayer-skyline-side)" />
      <circle cx={110} cy={91} r={2.4} fill="#ffb08a" />
      <circle cx={290} cy={91} r={2.4} fill="#ffb08a" />

      <rect x={128} y={104} width={144} height={76} fill="url(#prayer-skyline-hall)" />
      <rect x={146} y={98} width={108} height={10} rx={2} fill="#0e7c7e" />
      <path d={domePath(200, 100, 56, 76)} fill="url(#prayer-skyline-dome)" />
      <path d={domePath(184, 96, 14, 58)} fill="#ffffff" opacity={0.18} />
      <rect x={199} y={13} width={2} height={12} fill="#bfe6e7" />
      <path d="M203 3.5A5 5 0 1 0 203 12.5A4 4 0 1 1 203 3.5Z" fill="#ffd27d" />

      <g fill="#ffd9a8" opacity={0.85}>
        <path d={archPath(150, 124, 12, 26)} />
        <path d={archPath(172, 124, 12, 26)} />
        <path d={archPath(216, 124, 12, 26)} />
        <path d={archPath(238, 124, 12, 26)} />
        <path d={archPath(96, 150, 9, 18)} />
        <path d={archPath(115, 150, 9, 18)} />
        <path d={archPath(276, 150, 9, 18)} />
        <path d={archPath(295, 150, 9, 18)} />
      </g>
      <path d={archPath(190, 136, 20, 44)} fill="#013334" />

      <rect x={0} y={176} width={400} height={4} fill="#0e7c7e" />

      <g fill="#ffffff">
        <path d={sparklePath(28, 30, 9)} opacity={0.9} />
        <path d={sparklePath(372, 22, 11)} opacity={0.9} />
        <path d={sparklePath(300, 56, 5)} opacity={0.6} />
        <path d={sparklePath(102, 60, 4)} opacity={0.6} />
      </g>
    </svg>
  );
}
