import {
  ArrowLeft,
  Award,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Compass,
  Crown,
  Feather,
  Flag,
  GraduationCap,
  MessagesSquare,
  Route,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import Button from "../buttons/Button";
import AchievementTrophyIllustration from "../illustrations/AchievementTrophyIllustration";
import InstructionalGoalsIllustration from "../illustrations/InstructionalGoalsIllustration";
import OrganizationGearIllustration from "../illustrations/OrganizationGearIllustration";
import TargetFlagIllustration from "../illustrations/TargetFlagIllustration";
import {
  LK2_ASSESSMENT,
  LK2_CERTIFICATION,
  LK2_CLASS_RULES,
  LK2_DOC_SECTIONS,
  LK2_INSTRUCTOR_ROLES,
  LK2_MATERIALS,
  LK2_MOT_SPECIFICATION,
  LK2_OVERVIEW,
  LK2_PARTICIPANT_REQUIREMENTS,
  LK2_REGISTRATION_FLOW,
} from "../lk2/guidelineContent";

interface BranchLk2GuidelinePageProps {
  branchId: string;
}

type ColorName =
  | "green"
  | "orange"
  | "red"
  | "purple"
  | "blue"
  | "yellow"
  | "pink";

const COLOR_STYLES: Record<ColorName, { bg: string; text: string }> = {
  green: { bg: "bg-primary-soft", text: "text-primary" },
  orange: { bg: "bg-secondary-soft", text: "text-secondary" },
  red: { bg: "bg-destructive-soft", text: "text-destructive" },
  purple: { bg: "bg-[#EFEDF9]", text: "text-[#42359B]" },
  blue: { bg: "bg-[#E2F0FF]", text: "text-[#164EA6]" },
  yellow: { bg: "bg-[#FFF6E0]", text: "text-[#8A6300]" },
  pink: { bg: "bg-[#FDE7EE]", text: "text-[#BE2B5D]" },
};

const SECTION_META: Record<
  string,
  { icon: LucideIcon; color: ColorName; description: string }
> = {
  pendahuluan: {
    icon: Feather,
    color: "blue",
    description: "Gambaran umum dan tujuan penyelenggaraan LK2.",
  },
  "syarat-peserta": {
    icon: ClipboardCheck,
    color: "green",
    description: "Kriteria yang harus dipenuhi sebelum mendaftar.",
  },
  "alur-pendaftaran": {
    icon: Route,
    color: "orange",
    description: "Tahapan dari pendaftaran hingga pengumuman peserta.",
  },
  "peraturan-kelas": {
    icon: ShieldAlert,
    color: "red",
    description: "Tata tertib yang berlaku selama pelatihan berlangsung.",
  },
  mot: {
    icon: Crown,
    color: "purple",
    description: "Kualifikasi dan tanggung jawab pemimpin pelatihan.",
  },
  instruktur: {
    icon: Users,
    color: "pink",
    description: "Pembagian peran tim pemateri selama pelatihan.",
  },
  kurikulum: {
    icon: GraduationCap,
    color: "yellow",
    description: "Rincian materi, metode, dan evaluasi setiap sesi.",
  },
  penilaian: {
    icon: BarChart3,
    color: "blue",
    description: "Komponen penilaian dan kriteria kelulusan peserta.",
  },
  sertifikasi: {
    icon: Award,
    color: "green",
    description: "Bentuk pengakuan resmi atas kelulusan peserta.",
  },
};

const MATERIAL_META: Record<string, { icon: LucideIcon; color: ColorName }> = {
  "konstitusi-hmi": { icon: Scale, color: "blue" },
  "mission-hmi": { icon: Target, color: "orange" },
  ndp: { icon: Compass, color: "purple" },
  "kepemimpinan-organisasi": { icon: Users, color: "green" },
  "wawasan-kebangsaan": { icon: Flag, color: "yellow" },
  "analisis-sosial": { icon: Search, color: "pink" },
  dkt: { icon: MessagesSquare, color: "red" },
};

const INSTRUCTOR_META: { icon: LucideIcon; color: ColorName }[] = [
  { icon: Crown, color: "purple" },
  { icon: Scale, color: "blue" },
  { icon: Users, color: "green" },
  { icon: Flag, color: "yellow" },
  { icon: MessagesSquare, color: "pink" },
];

// One illustration per Tujuan Instruksional goal, picked from the SVGs the user supplied.
const GOAL_ILLUSTRATIONS = [
  InstructionalGoalsIllustration,
  OrganizationGearIllustration,
  TargetFlagIllustration,
  AchievementTrophyIllustration,
];

function IconBadge({
  icon: Icon,
  color,
  size = "size-9",
}: {
  icon: LucideIcon;
  color: ColorName;
  size?: string;
}) {
  const style = COLOR_STYLES[color];
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center rounded-lg ${style.bg}`}
    >
      <Icon className={`size-5 ${style.text}`} />
    </span>
  );
}

function ChecklistItem({ children }: { children: string }) {
  return (
    <li className="flex gap-2 text-base text-[#172033]">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
      {children}
    </li>
  );
}

function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#e6e9ef]">
      <table className="w-full text-left text-base">{children}</table>
    </div>
  );
}

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  const meta = SECTION_META[id];
  return (
    <section
      id={id}
      className="scroll-mt-6 rounded-xl border border-[#e6e9ef] bg-white p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <IconBadge icon={meta.icon} color={meta.color} size="size-10" />
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#172033]">{title}</h2>
          <p className="text-sm text-[#5f6573]">{meta.description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Static documentation page — no client state, no batch-specific data. See components/lk2/guidelineContent.ts.
export default function BranchLk2GuidelinePage({
  branchId,
}: BranchLk2GuidelinePageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Link href={`/branches/${branchId}/lk2`} className="inline-block w-fit">
        <Button variant="ghost">
          <ArrowLeft className="size-4" />
          Kembali ke daftar batch
        </Button>
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-[#172033] sm:text-3xl">
          Guideline & Kurikulum LK2
        </h1>
        <p className="mt-1.5 text-base text-[#5f6573]">
          Panduan resmi penyelenggaraan Latihan Kader 2 di tingkat Cabang.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <nav className="flex shrink-0 flex-col gap-1 lg:sticky lg:top-6 lg:w-64">
          {LK2_DOC_SECTIONS.map((section) => {
            return (
              <div key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-base font-medium text-[#41474E] transition hover:bg-[#f5f7fb] hover:text-primary"
                >
                  {section.title}
                </a>
                {section.id === "kurikulum" && (
                  <div className="ml-3 flex flex-col gap-0.5 border-l border-[#e6e9ef] pl-3">
                    {LK2_MATERIALS.map((material) => (
                      <a
                        key={material.id}
                        href={`#materi-${material.id}`}
                        className="block truncate rounded-lg px-2 py-1.5 text-[15px] text-[#5f6573] transition hover:bg-[#f5f7fb] hover:text-primary"
                      >
                        {material.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <DocSection id="pendahuluan" title="Pendahuluan">
            <p className="text-base leading-relaxed text-[#172033]">
              {LK2_OVERVIEW.description}
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-[#e6e9ef] bg-black">
              <div className="relative aspect-video w-full">
                <iframe
                  src="https://www.youtube.com/embed/q08RJ70QeFw"
                  title="Dokumentasi Pelatihan Kaderisasi HMI"
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
            <p className="mt-2 text-[15px] text-[#5f6573]">
              Dokumentasi suasana pelatihan kaderisasi HMI, sebagai gambaran
              umum jalannya Latihan Kader.
            </p>

            <div className="mt-5">
              <p className="text-base font-semibold text-[#172033]">
                Tujuan Instruksional
              </p>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {LK2_OVERVIEW.goals.map((goal, index) => {
                  const Illustration = GOAL_ILLUSTRATIONS[index % GOAL_ILLUSTRATIONS.length];
                  return (
                    <div
                      key={goal}
                      className="flex items-center gap-3 rounded-xl bg-[#f5f7fb] p-4"
                    >
                      <Illustration className="size-12 shrink-0" />
                      <p className="text-base text-[#172033]">{goal}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </DocSection>

          <DocSection id="syarat-peserta" title="Syarat Peserta">
            <ul className="flex flex-col gap-1.5">
              {LK2_PARTICIPANT_REQUIREMENTS.map((requirement) => (
                <ChecklistItem key={requirement}>{requirement}</ChecklistItem>
              ))}
            </ul>
          </DocSection>

          <DocSection id="alur-pendaftaran" title="Alur Pendaftaran & Seleksi">
            <ol className="flex flex-col gap-3">
              {LK2_REGISTRATION_FLOW.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-3 rounded-xl bg-[#f5f7fb] p-4"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-base font-semibold text-secondary">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-[#172033]">
                      {step.title}
                    </p>
                    <p className="mt-0.5 text-base text-[#172033]">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </DocSection>

          <DocSection id="peraturan-kelas" title="Peraturan Kelas">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#f5f7fb] p-4">
                <div className="flex items-center gap-2.5">
                  <IconBadge icon={Clock} color="blue" size="size-8" />
                  <p className="text-base font-semibold text-[#172033]">
                    Kehadiran
                  </p>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5 text-base text-[#172033]">
                  {LK2_CLASS_RULES.attendance.map((rule) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-[#f5f7fb] p-4">
                <div className="flex items-center gap-2.5">
                  <IconBadge icon={ShieldCheck} color="purple" size="size-8" />
                  <p className="text-base font-semibold text-[#172033]">
                    Kedisiplinan & Etika
                  </p>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5 text-base text-[#172033]">
                  {LK2_CLASS_RULES.conduct.map((rule) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-[#f5f7fb] p-4">
                <div className="flex items-center gap-2.5">
                  <IconBadge icon={ShieldAlert} color="red" size="size-8" />
                  <p className="text-base font-semibold text-[#172033]">
                    Sanksi Pelanggaran
                  </p>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5 text-base text-[#172033]">
                  {LK2_CLASS_RULES.sanctions.map((rule) => (
                    <li key={rule} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-destructive" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DocSection>

          <DocSection id="mot" title="Spesifikasi Master of Training (MOT)">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f5f7fb] p-4">
                <div className="flex items-center gap-2.5">
                  <IconBadge
                    icon={ClipboardCheck}
                    color="green"
                    size="size-8"
                  />
                  <p className="text-base font-semibold text-[#172033]">
                    Syarat
                  </p>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {LK2_MOT_SPECIFICATION.requirements.map((requirement) => (
                    <ChecklistItem key={requirement}>
                      {requirement}
                    </ChecklistItem>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-[#f5f7fb] p-4">
                <div className="flex items-center gap-2.5">
                  <IconBadge icon={Briefcase} color="orange" size="size-8" />
                  <p className="text-base font-semibold text-[#172033]">
                    Tanggung Jawab
                  </p>
                </div>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {LK2_MOT_SPECIFICATION.responsibilities.map(
                    (responsibility) => (
                      <ChecklistItem key={responsibility}>
                        {responsibility}
                      </ChecklistItem>
                    )
                  )}
                </ul>
              </div>
            </div>
          </DocSection>

          <DocSection id="instruktur" title="Tim Instruktur & Pemateri">
            <TableShell>
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[15px] font-semibold tracking-wide text-[#41474E] uppercase">
                <tr>
                  <th className="px-4 py-3">Peran</th>
                  <th className="px-4 py-3">Deskripsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef]">
                {LK2_INSTRUCTOR_ROLES.map((instructor, index) => {
                  const meta = INSTRUCTOR_META[index % INSTRUCTOR_META.length];
                  return (
                    <tr
                      key={instructor.role}
                      className="transition hover:bg-[#f5f7fb]"
                    >
                      <td className="px-4 py-3 font-medium text-[#172033]">
                        <div className="flex items-center gap-2.5">
                          <IconBadge
                            icon={meta.icon}
                            color={meta.color}
                            size="size-8"
                          />
                          {instructor.role}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#172033]">
                        {instructor.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </TableShell>
          </DocSection>

          <DocSection id="kurikulum" title="Kurikulum & Materi">
            <p className="text-base text-[#172033]">
              Total{" "}
              {LK2_MATERIALS.reduce((sum, material) => sum + material.hours, 0)}{" "}
              jam pelatihan yang terbagi ke dalam {LK2_MATERIALS.length} materi
              wajib berikut.
            </p>

            <div className="mt-4 flex flex-col gap-4">
              {LK2_MATERIALS.map((material) => {
                const meta = MATERIAL_META[material.id];
                return (
                  <div
                    key={material.id}
                    id={`materi-${material.id}`}
                    className="scroll-mt-6 rounded-xl bg-[#f5f7fb] p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <IconBadge
                          icon={meta.icon}
                          color={meta.color}
                          size="size-9"
                        />
                        <p className="text-lg font-semibold text-[#172033]">
                          {material.title}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[14px] font-semibold text-[#172033]">
                        {material.hours} jam
                      </span>
                    </div>
                    <p className="mt-3 text-base text-[#172033]">
                      {material.objective}
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[15px] font-semibold tracking-wide text-[#5f6573] uppercase">
                          Pokok Bahasan
                        </p>
                        <ul className="mt-1.5 flex flex-col gap-1.5">
                          {material.topics.map((topic) => (
                            <li
                              key={topic}
                              className="flex gap-2 text-base text-[#172033]"
                            >
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-[15px] font-semibold tracking-wide text-[#5f6573] uppercase">
                            Metode
                          </p>
                          <p className="mt-1 text-base text-[#172033]">
                            {material.method}
                          </p>
                        </div>
                        <div>
                          <p className="text-[15px] font-semibold tracking-wide text-[#5f6573] uppercase">
                            Evaluasi
                          </p>
                          <p className="mt-1 text-base text-[#172033]">
                            {material.evaluation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DocSection>

          <DocSection id="penilaian" title="Sistem Penilaian">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TableShell>
                <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[15px] font-semibold tracking-wide text-[#41474E] uppercase">
                  <tr>
                    <th className="px-4 py-3">Komponen</th>
                    <th className="px-4 py-3 text-right">Bobot</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e9ef]">
                  {LK2_ASSESSMENT.components.map((component) => (
                    <tr
                      key={component.label}
                      className="transition hover:bg-[#f5f7fb]"
                    >
                      <td className="px-4 py-3 text-[#172033]">
                        {component.label}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#172033]">
                        {component.weight}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
              <TableShell>
                <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[15px] font-semibold tracking-wide text-[#41474E] uppercase">
                  <tr>
                    <th className="px-4 py-3">Nilai Akhir</th>
                    <th className="px-4 py-3">Status Kelulusan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e9ef]">
                  {LK2_ASSESSMENT.criteria.map((criterion) => (
                    <tr
                      key={criterion.range}
                      className="transition hover:bg-[#f5f7fb]"
                    >
                      <td className="px-4 py-3 font-semibold text-[#172033]">
                        {criterion.range}
                      </td>
                      <td className="px-4 py-3 text-[#172033]">
                        {criterion.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            </div>
          </DocSection>

          <DocSection id="sertifikasi" title="Sertifikasi & SK Kelulusan">
            <ul className="flex flex-col gap-1.5">
              {LK2_CERTIFICATION.map((point) => (
                <ChecklistItem key={point}>{point}</ChecklistItem>
              ))}
            </ul>
          </DocSection>
        </div>
      </div>
    </div>
  );
}
