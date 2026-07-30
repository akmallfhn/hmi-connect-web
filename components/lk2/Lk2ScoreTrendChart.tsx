"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Lk2ScorePoint } from "./mockData";

interface Lk2ScoreTrendChartProps {
  points: Lk2ScorePoint[];
  average: number;
  deltaFromPreviousBatch: number;
}

interface ScoreTooltipProps {
  active?: boolean;
  payload?: { payload: Lk2ScorePoint }[];
}

function ScoreTooltip({ active, payload }: ScoreTooltipProps) {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#e6e9ef] bg-white px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold text-[#172033]">{datum.score} poin</p>
      <p className="text-xs text-[#5f6573]">{datum.material}</p>
    </div>
  );
}

// Prototype only — batch.scoreTrend is static mock data, not a real per-material average.
export default function Lk2ScoreTrendChart({
  points,
  average,
  deltaFromPreviousBatch,
}: Lk2ScoreTrendChartProps) {
  return (
    <div className="rounded-xl border border-[#e6e9ef] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm font-bold text-[#172033]">Rata-rata Nilai</p>
        {deltaFromPreviousBatch !== 0 && (
          <p
            className={`text-xs font-semibold ${
              deltaFromPreviousBatch > 0 ? "text-[#0ca30c]" : "text-destructive"
            }`}
          >
            {deltaFromPreviousBatch > 0 ? "↑" : "↓"} {Math.abs(deltaFromPreviousBatch)} poin dari
            batch sebelumnya
          </p>
        )}
      </div>
      <p className="mt-1 text-2xl font-bold text-[#172033]">
        {average.toFixed(1)}
        <span className="text-sm font-normal text-[#5f6573]">/100</span>
      </p>

      {points.length === 0 ? (
        <p className="mt-6 text-sm text-[#5f6573]">Belum ada data nilai.</p>
      ) : (
        <div className="mt-4 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, left: -20, right: 12 }}>
              <defs>
                <linearGradient id="lk2ScoreTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ca755" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0ca755" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e6e9ef" />
              <XAxis
                dataKey="material"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5f6573", fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#5f6573", fontSize: 12 }}
                width={32}
              />
              <Tooltip content={<ScoreTooltip />} cursor={{ stroke: "#e6e9ef" }} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#0ca755"
                strokeWidth={2}
                fill="url(#lk2ScoreTrendFill)"
                dot={{ r: 3, fill: "#0ca755", strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#0ca755", stroke: "#ffffff", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
