"use client";

import {
  Award,
  ClipboardList,
  Download,
  EllipsisVertical,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import Dropdown from "../common/Dropdown";
import Input from "../fields/Input";
import Select from "../fields/Select";
import { Lk2ParticipantStatusLabel } from "./Lk2Labels";
import Lk2StatCard from "./Lk2StatCard";
import type { Lk2Batch, Lk2Participant } from "./mockData";

interface Lk2ParticipantsTabProps {
  batch: Lk2Batch;
  onAssess: (participant: Lk2Participant) => void;
  onViewCertificate: (participant: Lk2Participant) => void;
}

const STATUS_FILTER_OPTIONS = [
  { label: "Semua Status", value: "" },
  { label: "Lulus", value: "passed" },
  { label: "Lulus Bersyarat", value: "conditional_pass" },
  { label: "Tidak Lulus", value: "failed" },
  { label: "Sedang Mengikuti", value: "in_progress" },
];

// Prototype only — search/status filter run client-side over batch.participants mock data.
export default function Lk2ParticipantsTab({
  batch,
  onAssess,
  onViewCertificate,
}: Lk2ParticipantsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const passedCount = batch.participants.filter((p) => p.status === "passed").length;
  const conditionalCount = batch.participants.filter((p) => p.status === "conditional_pass").length;
  const failedCount = batch.participants.filter((p) => p.status === "failed").length;
  const quotaPercent = batch.quota > 0 ? Math.round((batch.participants.length / batch.quota) * 100) : 0;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return batch.participants.filter((participant) => {
      const matchesSearch =
        !query ||
        participant.fullName.toLowerCase().includes(query) ||
        participant.chapterName.toLowerCase().includes(query);
      const matchesStatus = !statusFilter || participant.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [batch.participants, search, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Lk2StatCard
          icon={Users}
          color="blue"
          label="Total Peserta"
          value={batch.participants.length}
          hint={`${quotaPercent}% dari kuota`}
        />
        <Lk2StatCard icon={Award} color="green" label="Lulus" value={passedCount} />
        <Lk2StatCard icon={Award} color="yellow" label="Lulus Bersyarat" value={conditionalCount} />
        <Lk2StatCard icon={XCircle} color="red" label="Tidak Lulus" value={failedCount} />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
        <p className="p-5 pb-0 text-sm font-bold text-[#172033]">Daftar Peserta</p>
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-xs">
            <Input
              inputId="lk2-participant-search"
              placeholder="Cari nama atau komisariat..."
              icon={<Search className="size-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:max-w-52">
            <Select
              selectId="lk2-participant-status-filter"
              placeholder="Filter Status"
              value={statusFilter}
              onChange={(value) => setStatusFilter(String(value ?? ""))}
              options={STATUS_FILTER_OPTIONS}
            />
          </div>
          <Button
            variant="outline"
            className="w-fit sm:ml-auto"
            onClick={() => toast.info("Prototipe — export belum tersambung ke backend.")}
          >
            <Download className="size-4" />
            Export
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
            <Users className="size-8 text-[#5f6573]" />
            <p className="text-sm font-medium text-[#172033]">Tidak ada peserta ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase tracking-wide text-[#5f6573]">
                <tr>
                  <th className="px-4 py-3">Peserta</th>
                  <th className="px-4 py-3">Komisariat</th>
                  <th className="px-4 py-3">Nilai</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
                {filtered.map((participant) => (
                  <tr key={participant.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={participant.fullName} size={32} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#172033]">
                            {participant.fullName}
                          </p>
                          <p className="truncate text-[13px] text-[#5f6573]">
                            @{participant.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#172033]">{participant.chapterName}</td>
                    <td className="px-4 py-3 text-[#172033]">{participant.score ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Lk2ParticipantStatusLabel status={participant.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => onAssess(participant)}>
                          <ClipboardList className="size-3.5" />
                          Beri Penilaian
                        </Button>
                        <Dropdown
                          panelClassName="w-52"
                          trigger={({ toggle }) => (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggle}
                              aria-label="Aksi lainnya"
                            >
                              <EllipsisVertical className="size-4" />
                            </Button>
                          )}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toast.info("Prototipe — detail peserta belum tersambung ke backend.")
                            }
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb]"
                          >
                            Lihat Detail
                          </button>
                          <button
                            type="button"
                            disabled={
                              participant.status !== "passed" &&
                              participant.status !== "conditional_pass"
                            }
                            onClick={() => onViewCertificate(participant)}
                            className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-[#172033] transition hover:bg-[#f5f7fb] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Award className="size-4 text-[#5f6573]" />
                            Generate Sertifikat
                          </button>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e6e9ef] px-5 py-4 sm:flex-row">
            <p className="text-sm text-[#5f6573]">
              Menampilkan 1–{filtered.length} dari {filtered.length} peserta
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
