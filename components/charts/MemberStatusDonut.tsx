"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Datum {
  name: string;
  value: number;
  color: string;
}

const DATA: Datum[] = [
  { name: "Aktif", value: 12847, color: "#0ca30c" },
  { name: "Tidak Aktif", value: 1523, color: "#c3c2b7" },
];

const TOTAL = DATA.reduce((sum, d) => sum + d.value, 0);
const activePercent = ((DATA[0].value / TOTAL) * 100).toFixed(0);

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

export default function MemberStatusDonut() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#172033]">Status Keanggotaan</p>
      <p className="text-xs text-[#5f6573]">Perbandingan kader aktif dan tidak aktif</p>

      <div className="mt-4 flex items-center gap-6">
        <div className="relative h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DATA}
                dataKey="value"
                nameKey="name"
                innerRadius="70%"
                outerRadius="100%"
                paddingAngle={3}
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
            <p className="text-lg font-bold text-[#172033]">{activePercent}%</p>
            <p className="text-[10px] text-[#5f6573]">Aktif</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {DATA.map((d) => (
            <div key={d.name} className="flex items-center gap-2.5 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="flex-1 text-[#172033]">{d.name}</span>
              <span className="font-semibold text-[#172033]">
                {d.value.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
