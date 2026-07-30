"use client";

import {
  BookOpen,
  Clock,
  Compass,
  EllipsisVertical,
  Flag,
  GripVertical,
  MessagesSquare,
  PlusCircle,
  Scale,
  Search,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Dropdown from "../common/Dropdown";
import Input from "../fields/Input";
import Select from "../fields/Select";
import { COLOR_STYLES, type ColorName } from "./colorStyles";
import { Lk2MaterialStatusLabel } from "./Lk2Labels";
import Lk2StatCard from "./Lk2StatCard";
import type { Lk2Batch } from "./mockData";

interface Lk2MaterialsTabProps {
  batch: Lk2Batch;
}

const SORT_OPTIONS = [
  { label: "Urutan Modul", value: "order" },
  { label: "Nama Materi", value: "name" },
  { label: "Durasi", value: "hours" },
];

// Cycled by index — batch materials don't carry a stable topic id to key a semantic icon off of.
const MATERIAL_ICON_CYCLE: { icon: LucideIcon; color: ColorName }[] = [
  { icon: Scale, color: "blue" },
  { icon: Flag, color: "orange" },
  { icon: Compass, color: "purple" },
  { icon: Users, color: "green" },
  { icon: Target, color: "yellow" },
  { icon: Search, color: "pink" },
  { icon: MessagesSquare, color: "red" },
  { icon: BookOpen, color: "blue" },
];

function notWired() {
  toast.info("Prototipe — fitur ini belum tersambung ke backend.");
}

// Prototype only — search/sort run client-side over batch.materials mock data, drag & drop is decorative.
export default function Lk2MaterialsTab({ batch }: Lk2MaterialsTabProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("order");

  const totalHours = batch.materials.reduce((sum, material) => sum + material.hours, 0);
  const uniqueInstructors = new Set(batch.materials.map((material) => material.instructor)).size;
  const completedCount = batch.materials.filter((material) => material.status === "completed").length;
  const completedPercent =
    batch.materials.length > 0 ? Math.round((completedCount / batch.materials.length) * 100) : 0;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = batch.materials.filter(
      (material) =>
        !query ||
        material.title.toLowerCase().includes(query) ||
        material.instructor.toLowerCase().includes(query)
    );
    if (sort === "name") {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sort === "hours") {
      return [...list].sort((a, b) => b.hours - a.hours);
    }
    return list;
  }, [batch.materials, search, sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Lk2StatCard icon={BookOpen} color="blue" label="Total Materi" value={batch.materials.length} hint="Modul" />
        <Lk2StatCard icon={Clock} color="purple" label="Total Durasi" value={`${totalHours} jam`} hint="Estimasi" />
        <Lk2StatCard icon={Users} color="pink" label="Pemateri" value={uniqueInstructors} hint="Orang" />
        <Lk2StatCard
          icon={BookOpen}
          color="green"
          label="Selesai Materi"
          value={completedCount}
          hint={`${completedPercent}%`}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <p className="text-sm font-bold text-[#172033] sm:mr-auto">Daftar Materi</p>
          <div className="w-full sm:max-w-xs">
            <Input
              inputId="lk2-material-search"
              placeholder="Cari materi atau pemateri..."
              icon={<Search className="size-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:max-w-44">
            <Select
              selectId="lk2-material-sort"
              placeholder="Urutkan"
              value={sort}
              onChange={(value) => setSort(String(value ?? "order"))}
              options={SORT_OPTIONS}
            />
          </div>
          <Button variant="primary" className="w-fit" onClick={notWired}>
            <PlusCircle className="size-4" />
            Tambah Materi
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <BookOpen className="size-8 text-[#5f6573]" />
            <p className="text-sm font-medium text-[#172033]">Tidak ada materi ditemukan.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-[#e6e9ef] px-5">
            {filtered.map((material, index) => {
              const meta = MATERIAL_ICON_CYCLE[index % MATERIAL_ICON_CYCLE.length];
              const Icon = meta.icon;
              const style = COLOR_STYLES[meta.color];
              return (
                <div key={material.title} className="flex items-center gap-3 py-3">
                  <GripVertical className="size-4 shrink-0 cursor-grab text-[#c3c9d4]" />
                  <span className="w-6 shrink-0 text-center text-xs font-semibold text-[#5f6573]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${style.bg}`}
                  >
                    <Icon className={`size-4 ${style.text}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#172033]">{material.title}</p>
                  </div>
                  <p className="w-16 shrink-0 text-sm text-[#5f6573]">{material.hours} jam</p>
                  <p className="hidden w-40 shrink-0 truncate text-sm text-[#5f6573] sm:block">
                    {material.instructor}
                  </p>
                  <div className="shrink-0">
                    <Lk2MaterialStatusLabel status={material.status} />
                  </div>
                  <Dropdown
                    panelClassName="w-44"
                    trigger={({ toggle }) => (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggle}
                        aria-label="Aksi materi"
                      >
                        <EllipsisVertical className="size-4" />
                      </Button>
                    )}
                  >
                    <button
                      type="button"
                      onClick={notWired}
                      className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                    >
                      Edit Materi
                    </button>
                    <button
                      type="button"
                      onClick={notWired}
                      className="flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm font-medium text-destructive transition hover:bg-destructive-soft"
                    >
                      Hapus Materi
                    </button>
                  </Dropdown>
                </div>
              );
            })}
          </div>
        )}

        <div className="m-5 mt-2 flex items-center gap-2 rounded-lg bg-[#f5f7fb] px-4 py-2.5 text-sm text-[#5f6573]">
          💡 Tip: Drag & drop untuk mengubah urutan materi.
        </div>
      </div>
    </div>
  );
}
