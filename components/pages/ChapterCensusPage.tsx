"use client";

import {
  IconArrowLeft,
  IconArrowRight,
  IconBriefcase,
  IconBuildingCommunity,
  IconCheck,
  IconCircleCheckFilled,
  IconGitBranch,
  IconMail,
  IconMinus,
  IconPencil,
  IconPlus,
  IconSchool,
  IconSitemap,
  IconTrash,
  IconUser,
  type TablerIcon,
} from "@tabler/icons-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { PublicBranch } from "@/apis/branches";
import type { PublicCoordinatingBody } from "@/apis/coordinating-bodies";
import { submitChapterCensus } from "@/lib/actions";
import {
  CHAPTER_CENSUS_LIMITS as LIMITS,
  EMAIL_PATTERN,
  type ChapterCensusEntry,
} from "@/lib/chapter-census-shared";
import {
  NO_COORDINATING_BODY_FILTER,
  NO_COORDINATING_BODY_LABEL,
} from "@/lib/constants";
import type { BranchTypeEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Input from "../fields/Input";
import RadioButton from "../fields/RadioButton";
import SearchableSelect, {
  type SearchableOption,
} from "../fields/SearchableSelect";
import LogoHmi from "../svg/LogoHmi";

const STEPS: { label: string; icon: TablerIcon }[] = [
  { label: "Data Pengisi", icon: IconUser },
  { label: "Asal Cabang", icon: IconGitBranch },
  { label: "Komisariat", icon: IconSchool },
  { label: "Tinjau", icon: IconCheck },
];

const TYPE_OPTIONS: { value: BranchTypeEnum; label: string }[] = [
  { value: "full", label: "Penuh" },
  { value: "provisional", label: "Persiapan" },
];

type ChapterRow = ChapterCensusEntry & { key: number };

interface ChapterCensusPageProps {
  coordinatingBodies: PublicCoordinatingBody[];
  branches: PublicBranch[];
}

function filterOptions(options: SearchableOption[], query: string) {
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? options.filter((option) => option.label.toLowerCase().includes(needle))
    : options;
  return { options: matches, hasMore: false };
}

function Stepper({ step }: { step: number }) {
  return (
    <div>
      <ol className="flex items-center">
        {STEPS.map(({ label, icon: Icon }, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li
              key={label}
              className={`flex items-center ${index < STEPS.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                    done
                      ? "border-primary bg-primary text-on-primary-action"
                      : current
                        ? "border-primary bg-primary-soft text-primary-foreground"
                        : "border-border bg-surface text-muted-foreground"
                  }`}
                  aria-current={current ? "step" : undefined}
                >
                  {done ? (
                    <IconCheck className="size-5" stroke={2.4} />
                  ) : (
                    <Icon className="size-5" />
                  )}
                </span>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    current || done ? "text-heading" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <span
                  className={`mx-2 h-0.5 flex-1 rounded-full transition-colors sm:mb-6 ${
                    done ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-sm text-muted-foreground sm:hidden">
        Langkah {step + 1} dari {STEPS.length} ·{" "}
        <span className="font-medium text-heading">{STEPS[step].label}</span>
      </p>
    </div>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="font-stack-sans-headline text-xl font-medium text-heading">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function CountStepper({
  value,
  onDecrement,
  onIncrement,
}: {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-border-strong bg-surface p-1">
      <button
        type="button"
        onClick={onDecrement}
        disabled={value <= 1}
        aria-label="Kurangi Komisariat"
        className="flex size-8 items-center justify-center rounded-full text-heading transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:text-disabled-foreground disabled:hover:bg-transparent"
      >
        <IconMinus className="size-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-heading" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={value >= LIMITS.chapters}
        aria-label="Tambah Komisariat"
        className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary-action transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <IconPlus className="size-4" />
      </button>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-heading">{title}</h3>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <IconPencil className="size-4" /> Ubah
        </Button>
      </div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5 sm:flex-row sm:gap-4">
      <dt className="text-sm text-muted-foreground sm:w-28 sm:shrink-0">{label}</dt>
      <dd className="break-words text-sm font-medium text-heading">{value}</dd>
    </div>
  );
}

export default function ChapterCensusPage({
  coordinatingBodies,
  branches,
}: ChapterCensusPageProps) {
  const nextKey = useRef(1);
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [website, setWebsite] = useState("");
  const [coordinatingBody, setCoordinatingBody] =
    useState<SearchableOption | null>(null);
  const [branch, setBranch] = useState<SearchableOption | null>(null);
  const [chapters, setChapters] = useState<ChapterRow[]>([
    { key: 0, name: "", campus: "", type: "full" },
  ]);
  const [focusKey, setFocusKey] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const coordinatingBodyOptions = useMemo<SearchableOption[]>(() => {
    const options = coordinatingBodies.map((row) => ({
      value: row.id,
      label: `Badko ${row.name}`,
    }));
    if (branches.some((row) => row.coordinating_body_id === null)) {
      options.push({
        value: NO_COORDINATING_BODY_FILTER,
        label: NO_COORDINATING_BODY_LABEL,
      });
    }
    return options;
  }, [coordinatingBodies, branches]);

  const branchOptions = useMemo<SearchableOption[]>(() => {
    if (!coordinatingBody) return [];
    const parentId =
      coordinatingBody.value === NO_COORDINATING_BODY_FILTER
        ? null
        : String(coordinatingBody.value);
    return branches
      .filter((row) => row.coordinating_body_id === parentId)
      .map((row) => ({ value: row.id, label: `Cabang ${row.name}` }))
      .sort((a, b) => a.label.localeCompare(b.label, "id"));
  }, [branches, coordinatingBody]);

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const stepValid = [
    fullName.trim() !== "" && emailValid && position.trim() !== "",
    coordinatingBody !== null && branch !== null,
    chapters.length > 0 && chapters.every((row) => row.name.trim() !== ""),
    true,
  ];
  const filledChapters = chapters.filter((row) => row.name.trim() !== "").length;

  function addChapter() {
    if (chapters.length >= LIMITS.chapters) return;
    const key = nextKey.current++;
    setChapters((rows) => [...rows, { key, name: "", campus: "", type: "full" }]);
    setFocusKey(key);
  }

  function removeChapter(key: number) {
    setChapters((rows) => (rows.length > 1 ? rows.filter((row) => row.key !== key) : rows));
  }

  function removeLastChapter() {
    const last = chapters[chapters.length - 1];
    if (last) removeChapter(last.key);
  }

  function updateChapter(key: number, patch: Partial<ChapterCensusEntry>) {
    setChapters((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function goNext() {
    if (!stepValid[step]) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function reset() {
    nextKey.current = 1;
    setStep(0);
    setFullName("");
    setEmail("");
    setPosition("");
    setCoordinatingBody(null);
    setBranch(null);
    setChapters([{ key: 0, name: "", campus: "", type: "full" }]);
    setSubmitted(false);
  }

  async function handleSubmit() {
    if (!stepValid.every(Boolean) || !coordinatingBody || !branch) return;
    setSubmitting(true);
    try {
      const result = await submitChapterCensus({
        fullName,
        email,
        position,
        coordinatingBodyId: String(coordinatingBody.value),
        branchId: String(branch.value),
        chapters: chapters.map(({ name, campus, type }) => ({ name, campus, type })),
        website,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setSubmitted(true);
    } catch (err) {
      console.error("[ChapterCensusPage] submit threw:", err);
      toast.error("Data gagal dikirim. Coba lagi beberapa saat lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-surface-subtle px-4 py-8 sm:py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <LogoHmi className="h-16 w-auto" />
          <div>
            <h1 className="font-stack-sans-headline text-2xl font-medium text-heading sm:text-3xl">
              Pendataan Komisariat
            </h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              Bantu kami mencatat seluruh Komisariat di Cabang kamu.
            </p>
          </div>
        </header>

        <div className="rounded-3xl border border-border bg-surface p-5 sm:p-8">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <IconCircleCheckFilled className="size-16 text-primary" />
              <div>
                <h2 className="font-stack-sans-headline text-xl font-medium text-heading">
                  Terima kasih, data terkirim!
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {chapters.length} Komisariat dari {branch?.label} sudah kami terima.
                  Tim HMI Connect akan menindaklanjutinya.
                </p>
              </div>
              <Button variant="outline" onClick={reset}>
                Isi formulir lagi
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <Stepper step={step} />

              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <StepHeading
                    title="Data Pengisi"
                    description="Siapa yang mengisi formulir ini? Kami akan menghubungi lewat email ini bila perlu."
                  />
                  <Input
                    inputId="census-name"
                    label="Nama Lengkap"
                    placeholder="Nama lengkap kamu"
                    icon={<IconUser className="size-4" />}
                    value={fullName}
                    maxLength={LIMITS.name}
                    onChange={(event) => setFullName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                  <Input
                    inputId="census-email"
                    label="Email"
                    type="email"
                    placeholder="nama@email.com"
                    icon={<IconMail className="size-4" />}
                    value={email}
                    maxLength={LIMITS.email}
                    onChange={(event) => setEmail(event.target.value)}
                    errorMessage={
                      email.trim() && !emailValid ? "Format email belum benar." : undefined
                    }
                    autoComplete="email"
                    required
                  />
                  <Input
                    inputId="census-position"
                    label="Jabatan"
                    placeholder="Contoh: Sekretaris Umum Cabang"
                    icon={<IconBriefcase className="size-4" />}
                    value={position}
                    maxLength={LIMITS.position}
                    onChange={(event) => setPosition(event.target.value)}
                    required
                  />
                  {/* Honeypot: off-screen and skipped by keyboard and assistive tech, so only bots fill it. */}
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] size-px opacity-0"
                  />
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <StepHeading
                    title="Asal Cabang"
                    description="Pilih Badko terlebih dahulu, lalu Cabang di bawahnya."
                  />
                  <SearchableSelect
                    selectId="census-coordinating-body"
                    label="Asal Badko"
                    icon={<IconSitemap className="size-4" />}
                    placeholder="Pilih Badko"
                    value={coordinatingBody}
                    onChange={(option) => {
                      if (option?.value !== coordinatingBody?.value) setBranch(null);
                      setCoordinatingBody(option);
                    }}
                    defaultOptions={coordinatingBodyOptions}
                    loadOptions={async (query) => filterOptions(coordinatingBodyOptions, query)}
                    noOptionsMessage="Badko tidak ditemukan."
                    required
                  />
                  <SearchableSelect
                    key={String(coordinatingBody?.value ?? "none-selected")}
                    selectId="census-branch"
                    label="Asal Cabang"
                    icon={<IconGitBranch className="size-4" />}
                    placeholder={coordinatingBody ? "Pilih Cabang" : "Pilih Badko dahulu"}
                    value={branch}
                    onChange={setBranch}
                    defaultOptions={branchOptions}
                    loadOptions={async (query) => filterOptions(branchOptions, query)}
                    noOptionsMessage="Belum ada Cabang di Badko ini."
                    disabled={!coordinatingBody}
                    required
                  />
                  {coordinatingBody && (
                    <p className="pl-1 text-xs text-muted-foreground">
                      {branchOptions.length} Cabang terdaftar di {coordinatingBody.label}.
                    </p>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <StepHeading
                      title="Daftar Komisariat"
                      description={`Tambahkan setiap Komisariat di ${branch?.label ?? "Cabang ini"}.`}
                    />
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <span className="text-sm text-muted-foreground">Jumlah</span>
                      <CountStepper
                        value={chapters.length}
                        onDecrement={removeLastChapter}
                        onIncrement={addChapter}
                      />
                    </div>
                  </div>

                  <ul className="flex flex-col gap-3">
                    {chapters.map((row, index) => (
                      <li
                        key={row.key}
                        className="rounded-2xl border border-border bg-surface-subtle/60 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-sm font-semibold text-heading">
                            <span className="flex size-7 items-center justify-center rounded-full bg-primary-soft text-xs text-primary-foreground">
                              {index + 1}
                            </span>
                            Komisariat {index + 1}
                          </span>
                          <Button
                            variant="ghost"
                            size="iconSm"
                            onClick={() => removeChapter(row.key)}
                            disabled={chapters.length <= 1}
                            aria-label={`Hapus Komisariat ${index + 1}`}
                          >
                            <IconTrash className="size-4 text-destructive-foreground" />
                          </Button>
                        </div>
                        <div className="flex flex-col gap-3">
                          <Input
                            inputId={`census-chapter-name-${row.key}`}
                            label="Nama Komisariat"
                            placeholder="Contoh: FT UI"
                            icon={<IconSchool className="size-4" />}
                            value={row.name}
                            maxLength={LIMITS.chapterName}
                            autoFocus={focusKey === row.key}
                            onChange={(event) => updateChapter(row.key, { name: event.target.value })}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && index === chapters.length - 1) {
                                event.preventDefault();
                                addChapter();
                              }
                            }}
                            required
                          />
                          <Input
                            inputId={`census-chapter-campus-${row.key}`}
                            label="Asal Kampus (opsional)"
                            placeholder="Contoh: Univ Brawijaya"
                            icon={<IconBuildingCommunity className="size-4" />}
                            value={row.campus}
                            maxLength={LIMITS.chapterCampus}
                            onChange={(event) =>
                              updateChapter(row.key, { campus: event.target.value })
                            }
                          />
                          <div className="flex flex-col gap-1">
                            <span className="pl-1 text-[15px] font-medium text-heading">Status</span>
                            <div className="grid grid-cols-2 gap-3">
                              {TYPE_OPTIONS.map((option) => (
                                <RadioButton<BranchTypeEnum>
                                  key={option.value}
                                  radioName={`census-chapter-type-${row.key}`}
                                  label={option.label}
                                  value={option.value}
                                  selectedValue={row.type}
                                  onChange={(value) => updateChapter(row.key, { type: value })}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={addChapter}
                    disabled={chapters.length >= LIMITS.chapters}
                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border-strong py-4 text-sm font-medium text-primary-foreground transition hover:border-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <IconPlus className="size-4" /> Tambah Komisariat
                  </button>
                  <p className="text-center text-xs text-muted-foreground">
                    Tekan Enter di nama Komisariat terakhir untuk menambah baris baru. Maksimal{" "}
                    {LIMITS.chapters} Komisariat.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-4">
                  <StepHeading
                    title="Tinjau Data"
                    description="Periksa kembali sebelum dikirim."
                  />
                  <ReviewSection title="Data Pengisi" onEdit={() => setStep(0)}>
                    <dl>
                      <ReviewRow label="Nama" value={fullName.trim()} />
                      <ReviewRow label="Email" value={email.trim()} />
                      <ReviewRow label="Jabatan" value={position.trim()} />
                    </dl>
                  </ReviewSection>
                  <ReviewSection title="Asal Cabang" onEdit={() => setStep(1)}>
                    <dl>
                      <ReviewRow label="Badko" value={coordinatingBody?.label ?? "—"} />
                      <ReviewRow label="Cabang" value={branch?.label ?? "—"} />
                    </dl>
                  </ReviewSection>
                  <ReviewSection
                    title={`Komisariat (${filledChapters})`}
                    onEdit={() => setStep(2)}
                  >
                    <ol className="divide-y divide-border">
                      {chapters.map((row, index) => (
                        <li key={row.key} className="flex items-start gap-3 py-2.5">
                          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary-foreground">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-medium text-heading">
                              Komisariat {row.name.trim()}
                            </p>
                            {row.campus.trim() && (
                              <p className="break-words text-xs text-muted-foreground">
                                {row.campus.trim()}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-heading">
                            {row.type === "full" ? "Penuh" : "Persiapan"}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </ReviewSection>
                </div>
              )}

              <div className="flex gap-3 border-t border-border pt-6">
                {step > 0 && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep((current) => current - 1)}
                    disabled={submitting}
                  >
                    <IconArrowLeft className="size-4" /> Kembali
                  </Button>
                )}
                {step < STEPS.length - 1 ? (
                  <Button className="flex-1" onClick={goNext} disabled={!stepValid[step]}>
                    Lanjut <IconArrowRight className="size-4" />
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Mengirim..." : "Kirim Data"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Data hanya digunakan untuk keperluan internal HMI.
        </p>
      </div>
    </main>
  );
}
