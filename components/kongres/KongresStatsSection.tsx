import { KONGRES_STATS } from "@/lib/kongres-data";
import { KONGRES_GOLD_BG, KONGRES_SECTION_CLASS } from "./KongresDecor";

export default function KongresStatsSection() {
  return (
    <section
      id="statistik"
      aria-label="Statistik Kongres"
      className={`${KONGRES_GOLD_BG} text-[#04291a] ${KONGRES_SECTION_CLASS}`}
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 px-5 py-6 sm:px-8 lg:grid-cols-4 lg:px-10 lg:py-8">
        {KONGRES_STATS.map((stat) => (
          <div key={stat.unit} className="flex flex-col-reverse">
            <dt className="mt-0.5 text-xs font-medium text-[#04291a]/70 sm:text-sm">{stat.label}</dt>
            <dd className="whitespace-nowrap">
              <span className="font-stack-sans-headline text-3xl font-medium xl:text-4xl">{stat.value}</span>{" "}
              <span className="text-sm font-bold uppercase tracking-wider">{stat.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
