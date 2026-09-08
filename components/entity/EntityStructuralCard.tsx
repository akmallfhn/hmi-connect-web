import Link from "next/link";
import type { StructuralPeriodDetail } from "@/apis/structurals";
import Avatar from "../common/Avatar";
import Label from "../common/Label";

interface EntityStructuralCardProps {
  period: StructuralPeriodDetail | null;
}

export default function EntityStructuralCard({
  period,
}: EntityStructuralCardProps) {
  const officers = period?.officers ?? [];
  const periodLabel = period
    ? `Periode ${period.start_year}-${period.end_year ?? "sekarang"}`
    : null;

  return (
    <div className="border border-x-0 border-[#e6e9ef] bg-white p-5 lg:rounded-2xl lg:border-x lg:shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#172033] xl:text-[15px]">
          Kepengurusan
        </h2>
        {periodLabel && (
          <span className="text-xs text-[#5f6573] xl:text-[13px]">
            {periodLabel}
          </span>
        )}
      </div>

      {officers.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-[#dbe3ef] px-4 py-5 text-sm text-[#5f6573] xl:text-[15px]">
          Belum ada struktur kepengurusan yang dipublikasikan.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {officers.map((officer) => (
            <Link
              key={officer.id}
              href={
                officer.user_username
                  ? `/profile/${officer.user_username}`
                  : "#"
              }
              className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e6e9ef] p-3 transition hover:bg-[#f5f7fb]"
            >
              <Avatar
                src={officer.user_avatar}
                name={officer.user_full_name}
                size={40}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#172033]">
                  {officer.user_full_name}
                </p>
                <p className="truncate text-xs text-[#5f6573] xl:text-[13px]">
                  {officer.position_name}
                </p>
              </div>
              {officer.status === "inactive" && (
                <Label variant="gray" size="sm" className="ml-auto">
                  Non-aktif
                </Label>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
