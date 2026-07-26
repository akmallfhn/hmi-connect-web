"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { UserGrowthEntry, UserGrowthGranularity } from "@/apis/stat";

interface Datum {
  label: string;
  addition: number;
}

interface KaderGrowthLineChartProps {
  day: UserGrowthEntry[];
  week: UserGrowthEntry[];
  month: UserGrowthEntry[];
}

const GRANULARITY_OPTIONS: { value: UserGrowthGranularity; label: string }[] = [
  { value: "day", label: "Harian" },
  { value: "week", label: "Mingguan" },
  { value: "month", label: "Bulanan" },
];

const WINDOW_LABEL: Record<UserGrowthGranularity, string> = {
  day: "7 hari terakhir",
  week: "12 minggu terakhir",
  month: "12 bulan terakhir",
};

const PERIOD_LABEL: Record<UserGrowthGranularity, string> = {
  day: "hari ini",
  week: "minggu ini",
  month: "bulan ini",
};

const DAY_WINDOW_SIZE = 7;

function formatLabel(period: string, granularity: UserGrowthGranularity) {
  const date = new Date(`${period}T00:00:00Z`);
  if (granularity === "month") {
    return new Intl.DateTimeFormat("id-ID", {
      month: "short",
      timeZone: "UTC",
    }).format(date);
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function buildData(
  entries: UserGrowthEntry[],
  granularity: UserGrowthGranularity
): Datum[] {
  const windowed = granularity === "day" ? entries.slice(-DAY_WINDOW_SIZE) : entries;
  return windowed.map((entry) => ({
    label: formatLabel(entry.period, granularity),
    addition: entry.total,
  }));
}

interface LineTooltipProps {
  active?: boolean;
  payload?: { payload: Datum }[];
  granularity: UserGrowthGranularity;
}

function LineTooltip({ active, payload, granularity }: LineTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#e6e9ef] bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-[#172033]">
        {datum.addition.toLocaleString("id-ID")} kader baru
      </p>
      <p className="text-xs text-[#5f6573]">
        {datum.label} · {PERIOD_LABEL[granularity]}
      </p>
    </div>
  );
}

interface LabelPointProps {
  x?: string | number;
  y?: string | number;
  index?: number;
}

function renderEndpointLabel(lastIndex: number, lastValue: number) {
  return function EndpointLabel({ x, y, index }: LabelPointProps) {
    if (index !== lastIndex || x === undefined || y === undefined) return null;
    return (
      <text
        x={Number(x)}
        y={Number(y) - 12}
        textAnchor="middle"
        fill="#172033"
        fontSize={12}
        fontWeight={600}
      >
        {lastValue.toLocaleString("id-ID")}
      </text>
    );
  };
}

export default function KaderGrowthLineChart({
  day,
  week,
  month,
}: KaderGrowthLineChartProps) {
  const [granularity, setGranularity] = useState<UserGrowthGranularity>("day");
  const entriesByGranularity: Record<UserGrowthGranularity, UserGrowthEntry[]> = {
    day,
    week,
    month,
  };
  const data = buildData(entriesByGranularity[granularity], granularity);
  const last = data[data.length - 1];
  const windowTotal = data.reduce((sum, d) => sum + d.addition, 0);

  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#172033]">Pertumbuhan Kader Baru</p>
          <p className="text-xs text-[#5f6573]">
            Penambahan kader dalam {WINDOW_LABEL[granularity]}
          </p>
        </div>
        {last && (
          <div className="shrink-0 text-right">
            <p className="text-xl font-bold text-[#172033]">
              {windowTotal.toLocaleString("id-ID")}
            </p>
            <p className="text-xs font-semibold text-[#0ca30c]">
              +{last.addition.toLocaleString("id-ID")} {PERIOD_LABEL[granularity]}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 inline-flex rounded-full bg-[#f5f7fb] p-1">
        {GRANULARITY_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setGranularity(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              granularity === option.value
                ? "bg-white text-primary shadow-sm"
                : "text-[#5f6573] hover:text-[#172033]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-[#5f6573]">Belum ada data.</p>
      ) : (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, left: -20, right: 24 }}>
              <defs>
                <linearGradient id="kaderGrowthFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff5c53" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#ff5c53" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e6e9ef" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5f6573", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5f6573", fontSize: 12 }}
                width={44}
                tickFormatter={(value: number) => value.toLocaleString("id-ID")}
              />
              <Tooltip
                content={<LineTooltip granularity={granularity} />}
                cursor={{ stroke: "#e6e9ef" }}
              />
              <Area
                type="monotone"
                dataKey="addition"
                stroke="#ff5c53"
                strokeWidth={2}
                fill="url(#kaderGrowthFill)"
                dot={{ r: 3, fill: "#ff5c53", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#ff5c53", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="addition"
                  content={renderEndpointLabel(data.length - 1, last.addition)}
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
