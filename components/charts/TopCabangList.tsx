interface Datum {
  rank: number;
  name: string;
  value: number;
}

const DATA: Datum[] = [
  { rank: 1, name: "Cabang Jakarta Raya", value: 1850 },
  { rank: 2, name: "Cabang Bandung", value: 1420 },
  { rank: 3, name: "Cabang Yogyakarta", value: 1290 },
  { rank: 4, name: "Cabang Surabaya", value: 1105 },
  { rank: 5, name: "Cabang Makassar", value: 980 },
];

const MAX = DATA[0].value;

export default function TopCabangList() {
  return (
    <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-[#172033]">Cabang dengan Kader Terbanyak</p>
      <p className="text-xs text-[#5f6573]">Top 5 cabang berdasarkan jumlah kader aktif</p>

      <div className="mt-4 flex flex-col gap-4">
        {DATA.map((d) => (
          <div key={d.rank} className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
              {d.rank}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-[#172033]">{d.name}</p>
                <p className="shrink-0 text-sm font-semibold text-[#172033]">
                  {d.value.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f5f7fb]">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(d.value / MAX) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
