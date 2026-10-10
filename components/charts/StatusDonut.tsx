"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Segment {
  name: string;
  value: number;
  color: string;
}

interface StatusDonutProps {
  title: string;
  subtitle: string;
  centerLabel: string;
  segments: Segment[];
}

interface DonutTooltipProps {
  active?: boolean;
  payload?: { payload: Segment }[];
  total: number;
}

function DonutTooltip({ active, payload, total }: DonutTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  const percent = total > 0 ? ((datum.value / total) * 100).toFixed(1) : "0";
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-heading">
        {datum.value.toLocaleString("id-ID")}
      </p>
      <p className="text-xs text-muted-foreground">
        {datum.name} · {percent}%
      </p>
    </div>
  );
}

export default function StatusDonut({
  title,
  subtitle,
  centerLabel,
  segments,
}: StatusDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const leadPercent = total > 0 ? ((segments[0]?.value ?? 0) / total) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <p className="text-base font-bold text-heading">{title}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>

      {total === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Belum ada data.</p>
      ) : (
        <div className="mt-4 flex items-center gap-6">
          <div className="relative h-36 w-36 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="70%"
                  outerRadius="100%"
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="var(--surface)"
                  isAnimationActive={false}
                >
                  {segments.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-heading">
                {leadPercent.toFixed(0)}%
              </p>
              <p className="text-[10px] text-muted-foreground">{centerLabel}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            {segments.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 text-heading">{s.name}</span>
                <span className="font-semibold text-heading">
                  {s.value.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
