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
    <div className="rounded-lg border border-[#e6e9ef] bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-[#172033]">
        {datum.value.toLocaleString("id-ID")}
      </p>
      <p className="text-xs text-[#5f6573]">
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
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#172033]">{title}</p>
      <p className="text-xs text-[#5f6573]">{subtitle}</p>

      {total === 0 ? (
        <p className="mt-6 text-sm text-[#5f6573]">Belum ada data.</p>
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
                  stroke="#ffffff"
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
              <p className="text-lg font-bold text-[#172033]">
                {leadPercent.toFixed(0)}%
              </p>
              <p className="text-[10px] text-[#5f6573]">{centerLabel}</p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3">
            {segments.map((s) => (
              <div key={s.name} className="flex items-center gap-2.5 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="flex-1 text-[#172033]">{s.name}</span>
                <span className="font-semibold text-[#172033]">
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
