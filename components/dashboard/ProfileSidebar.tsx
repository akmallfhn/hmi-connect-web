import {
  Award,
  ChevronRight,
  Flame,
  GraduationCap,
  MessageCircle,
  Trophy,
  Users,
} from "lucide-react";
import Avatar from "../common/Avatar";
import { WEEK_DAYS } from "./mockData";

interface ProfileSidebarProps {
  fullName?: string;
  avatar?: string;
  role?: string;
}

const QUICK_LINKS = [
  { label: "Postingan", icon: MessageCircle },
  { label: "Sertifikat", icon: Award },
  { label: "Kaderisasi", icon: GraduationCap },
  { label: "Prestasi", icon: Trophy },
];

const WEEK_PROGRESS = [true, true, false, true, true, false, false];

export default function ProfileSidebar({
  fullName,
  avatar,
  role,
}: ProfileSidebarProps) {
  const displayName = fullName ?? "Kader";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-[#e6e9ef] bg-white p-5 shadow-sm">
        <a
          href="/profile"
          className="flex flex-col items-center gap-3 text-center"
        >
          <Avatar src={avatar} name={displayName} size={72} ring />
          <div>
            <p className="font-bold text-[#172033]">{displayName}</p>
            <p className="text-sm text-[#5f6573]">
              {role ?? "Kader • HMI Connect"}
            </p>
          </div>
        </a>

        <div className="mt-5 grid grid-cols-3 divide-x divide-[#e6e9ef] border-y border-[#e6e9ef] py-3 text-center">
          <div>
            <p className="font-bold text-[#172033]">128</p>
            <p className="text-xs text-[#5f6573]">Mengikuti</p>
          </div>
          <div>
            <p className="font-bold text-[#172033]">64</p>
            <p className="text-xs text-[#5f6573]">Pengikut</p>
          </div>
          <div>
            <p className="font-bold text-[#172033]">12</p>
            <p className="text-xs text-[#5f6573]">Postingan</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#172033]">
              Aktivitas Terakhir
            </p>
            <p className="text-xs text-[#5f6573]">
              Menyelesaikan LK1 • 2 hari lalu
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-[#e6e9ef] pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-[#172033]">
              Progres Minggu Ini
            </p>
            <span className="flex items-center gap-1 text-xs font-semibold text-secondary">
              <Flame className="size-3.5" />3 Minggu
            </span>
          </div>
          <div className="flex justify-between">
            {WEEK_DAYS.map((day, index) => (
              <div
                key={`${day}-${index}`}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-[#5f6573]">{day}</span>
                <div
                  className={[
                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                    WEEK_PROGRESS[index]
                      ? "bg-primary text-white"
                      : "border border-[#dbe3ef] text-[#5f6573]",
                  ].join(" ")}
                >
                  {WEEK_PROGRESS[index] ? "✓" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>

        <a
          href="#"
          className="mt-4 flex items-center justify-between border-t border-[#e6e9ef] pt-4 text-sm font-medium text-primary"
        >
          Lihat Log Kaderisasi Saya
          <ChevronRight className="size-4" />
        </a>
      </div>

      <div className="rounded-2xl border border-[#e6e9ef] bg-white p-3 shadow-sm">
        <div className="grid grid-cols-4 gap-1">
          {QUICK_LINKS.map(({ label, icon: Icon }) => (
            <a
              key={label}
              href="#"
              className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition hover:bg-[#f5f7fb]"
            >
              <Icon className="size-5 text-[#5f6573]" />
              <span className="text-[11px] text-[#5f6573]">{label}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="hidden rounded-2xl border border-[#e6e9ef] bg-white p-4 shadow-sm lg:block">
        <div className="flex items-center gap-2 text-sm font-medium text-[#172033]">
          <Users className="size-4 text-[#5f6573]" />
          Cabang & Komisariat
        </div>
        <p className="mt-1.5 text-xs text-[#5f6573]">
          Cabang Banda Aceh • Komisariat Ekonomi
        </p>
      </div>
    </div>
  );
}
