"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Datum {
  name: string;
  value: number;
  color: string;
}

const PALETTE = ["var(--chart-blue)", "var(--chart-orange)", "var(--chart-success)", "var(--chart-warning)", "var(--chart-pink)"];
const OTHERS_COLOR = "var(--chart-neutral)";

interface CabangDistributionDonutProps {
  entries: { name: string; value: number }[];
  totalActiveKader: number;
  title?: string;
  subtitle?: string;
  othersLabel?: string;
}

interface DonutTooltipProps {
  active?: boolean;
  payload?: { payload: Datum }[];
  total: number;
}

function DonutTooltip({ active, payload, total }: DonutTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  const percent = total > 0 ? ((datum.value / total) * 100).toFixed(1) : "0";
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-heading">
        {datum.value.toLocaleString("id-ID")} kader
      </p>
      <p className="text-xs text-muted-foreground">
        {datum.name} · {percent}%
      </p>
    </div>
  );
}

export default function CabangDistributionDonut({
  entries,
  totalActiveKader,
  title = "Distribusi Kader per Cabang",
  subtitle = "Berdasarkan jumlah kader aktif terdaftar",
  othersLabel = "Cabang lainnya",
}: CabangDistributionDonutProps) {
  const named: Datum[] = entries.map((entry, index) => ({
    name: entry.name,
    value: entry.value,
    color: PALETTE[index % PALETTE.length],
  }));
  const namedTotal = named.reduce((sum, d) => sum + d.value, 0);
  const others = totalActiveKader - namedTotal;
  const data: Datum[] =
    others > 0
      ? [...named, { name: othersLabel, value: others, color: OTHERS_COLOR }]
      : named;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-base font-bold text-heading">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Belum ada data.</p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-52 w-52 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="70%"
                  outerRadius="100%"
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="var(--surface)"
                  isAnimationActive={false}
                >
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-heading">
                {total.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-muted-foreground">Total Kader</p>
            </div>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-2.5">
            {data.map((d) => (
              <div key={d.name} className="flex items-center gap-2.5 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="min-w-0 flex-1 truncate text-heading">{d.name}</span>
                <span className="shrink-0 font-semibold text-heading">
                  {total > 0 ? ((d.value / total) * 100).toFixed(1) : "0"}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
