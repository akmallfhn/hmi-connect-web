"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Datum {
  month: string;
  total: number;
}

const DATA: Datum[] = [
  { month: "Jan", total: 420 },
  { month: "Feb", total: 380 },
  { month: "Mar", total: 510 },
  { month: "Apr", total: 465 },
  { month: "Mei", total: 590 },
  { month: "Jun", total: 610 },
  { month: "Jul", total: 540 },
  { month: "Agu", total: 620 },
  { month: "Sep", total: 705 },
  { month: "Okt", total: 680 },
  { month: "Nov", total: 750 },
  { month: "Des", total: 810 },
];

interface BarTooltipProps {
  active?: boolean;
  payload?: { payload: Datum }[];
}

function BarTooltip({ active, payload }: BarTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#e6e9ef] bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-[#172033]">
        {datum.total.toLocaleString("id-ID")} kader baru
      </p>
      <p className="text-xs text-[#5f6573]">{datum.month}</p>
    </div>
  );
}

export default function KaderGrowthBarChart() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#172033]">Penambahan Kader per Bulan</p>
      <p className="text-xs text-[#5f6573]">Kader baru yang aktif dalam 12 bulan terakhir</p>

      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} margin={{ left: -20 }}>
            <CartesianGrid vertical={false} stroke="#e6e9ef" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5f6573", fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#5f6573", fontSize: 12 }}
              width={40}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: "#f5f7fb" }} />
            <Bar dataKey="total" fill="#159fa2" radius={[4, 4, 0, 0]} maxBarSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
