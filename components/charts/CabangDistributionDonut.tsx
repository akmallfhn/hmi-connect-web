"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Datum {
  name: string;
  value: number;
  color: string;
}

const DATA: Datum[] = [
  { name: "Cabang Jakarta Raya", value: 1850, color: "#2a78d6" },
  { name: "Cabang Bandung", value: 1420, color: "#eb6834" },
  { name: "Cabang Yogyakarta", value: 1290, color: "#1baf7a" },
  { name: "Cabang Surabaya", value: 1105, color: "#eda100" },
  { name: "Cabang Makassar", value: 980, color: "#e87ba4" },
  { name: "Cabang lainnya", value: 6202, color: "#c3c2b7" },
];

const TOTAL = DATA.reduce((sum, d) => sum + d.value, 0);

interface DonutTooltipProps {
  active?: boolean;
  payload?: { payload: Datum }[];
}

function DonutTooltip({ active, payload }: DonutTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  const percent = ((datum.value / TOTAL) * 100).toFixed(1);
  return (
    <div className="rounded-lg border border-[#e6e9ef] bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-[#172033]">
        {datum.value.toLocaleString("id-ID")} kader
      </p>
      <p className="text-xs text-[#5f6573]">
        {datum.name} · {percent}%
      </p>
    </div>
  );
}

export default function CabangDistributionDonut() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#172033]">Distribusi Kader per Cabang</p>
      <p className="text-xs text-[#5f6573]">Berdasarkan jumlah kader aktif terdaftar</p>

      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative h-52 w-52 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DATA}
                dataKey="value"
                nameKey="name"
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={2}
                strokeWidth={2}
                stroke="#ffffff"
                isAnimationActive={false}
              >
                {DATA.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl font-bold text-[#172033]">
              {TOTAL.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-[#5f6573]">Total Kader</p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2.5">
          {DATA.map((d) => (
            <div key={d.name} className="flex items-center gap-2.5 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="min-w-0 flex-1 truncate text-[#172033]">{d.name}</span>
              <span className="shrink-0 font-semibold text-[#172033]">
                {((d.value / TOTAL) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
