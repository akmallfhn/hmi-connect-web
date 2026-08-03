"use client";

import { Search, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { TrainingParticipant } from "@/apis/trainings";
import Avatar from "../common/Avatar";
import Pagination from "../common/Pagination";
import Input from "../fields/Input";
import { TrainingResultLabel } from "./TrainingLabels";

interface TrainingParticipantsTabProps {
  participants: TrainingParticipant[];
  totalData: number;
  totalPage: number;
  currentPage: number;
  initialSearch: string;
  pageSize: number;
}

export default function TrainingParticipantsTab({
  participants,
  totalData,
  totalPage,
  currentPage,
  initialSearch,
  pageSize,
}: TrainingParticipantsTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seenSearch, setSeenSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  if (seenSearch !== initialSearch) {
    setSeenSearch(initialSearch);
    setSearchInput(initialSearch);
  }

  function pushSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "peserta");
    if (value) params.set("participant_search", value);
    else params.delete("participant_search");
    params.set("participant_page", "1");
    router.push(`?${params.toString()}`);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput === initialSearch) return;
      pushSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className="overflow-hidden rounded-xl border border-[#e6e9ef] bg-white">
      <div className="border-b border-[#e6e9ef] p-5">
        <div className="w-full sm:max-w-sm">
          <Input
            inputId="training-participant-search"
            placeholder="Cari nama, username, atau email..."
            icon={<Search className="size-4" />}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
          <Users className="size-8 text-[#5f6573]" />
          <p className="text-sm font-medium text-[#172033]">
            Tidak ada peserta ditemukan.
          </p>
          {initialSearch && (
            <p className="text-xs text-[#5f6573]">
              Coba ubah kata kunci pencarian.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[#e6e9ef] bg-[#f5f7fb] text-[13px] font-semibold uppercase text-[#5f6573]">
              <tr>
                <th className="px-4 py-3">Peserta</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Hasil</th>
                <th className="px-4 py-3">Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e9ef] text-[13px]">
              {participants.map((participant) => (
                <tr key={participant.user_id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={participant.user_avatar}
                        name={participant.user_full_name}
                        size={34}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#172033]">
                          {participant.user_full_name}
                        </p>
                        <p className="truncate text-xs text-[#5f6573]">
                          @{participant.user_username}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#172033]">
                    {participant.user_email}
                  </td>
                  <td className="px-4 py-3">
                    <TrainingResultLabel result={participant.result} />
                  </td>
                  <td className="px-4 py-3 text-[#5f6573]">
                    {new Date(participant.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "Asia/Jakarta",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {participants.length > 0 && (
        <div className="flex flex-col items-center gap-3 border-t border-[#e6e9ef] p-5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPage}
            queryKey="participant_page"
          />
          <p className="text-center text-sm text-[#5f6573]">
            Menampilkan {(currentPage - 1) * pageSize + 1}-
            {(currentPage - 1) * pageSize + participants.length} dari {totalData} peserta
          </p>
        </div>
      )}
    </div>
  );
}
