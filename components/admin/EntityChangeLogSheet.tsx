"use client";

import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { EntityChangeLogEntry } from "@/apis/entity-change-logs";
import { ADMIN_ENTITY_LABEL } from "@/lib/access";
import { listEntityChangeLogs } from "@/lib/actions";
import { formatShortDateTime } from "@/lib/time-manipulation";
import type { AccessEntityTypeEnum } from "@/lib/types";
import Button from "../buttons/Button";
import Avatar from "../common/Avatar";
import Label from "../common/Label";
import Sheet from "../modals/Sheet";
import { Bar, Circle } from "../states/Skeleton";

interface EntityChangeLogSheetProps {
  open: boolean;
  onClose: () => void;
  entityType: AccessEntityTypeEnum;
  entityId: string;
}

const PAGE_SIZE = 20;

const TYPE_TEXT: Record<string, string> = {
  full: "Penuh",
  provisional: "Persiapan",
};

// Text columns whose before/after values are worth showing under the sentence.
const VALUE_FIELD_LABEL: Record<string, string> = {
  name: "nama",
  legal_name: "nama resmi",
  slug: "slug",
  institution_name: "asal universitas",
  description: "deskripsi",
};

// The trigger logs institution_name beside every institution_id change, so the raw id row is noise.
const HIDDEN_FIELDS = new Set(["institution_id"]);

type LogDescription = {
  action: ReactNode;
  oldValue?: string | null;
  newValue?: string | null;
  destructive?: boolean;
};

function Strong({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-heading">{children}</span>;
}

function describeParentMove(
  entry: EntityChangeLogEntry,
  label: string
): LogDescription {
  if (!entry.new_value) return { action: `mengeluarkan dari ${label}` };
  if (!entry.old_value) return { action: `memasukkan ke ${label}` };
  return { action: `memindahkan ke ${label} lain` };
}

function describeUpdate(
  entry: EntityChangeLogEntry,
  entityLabel: string
): LogDescription {
  const field = entry.field_name ?? "";
  const { old_value: oldValue, new_value: newValue } = entry;

  switch (field) {
    case "status":
      return newValue === "inactive"
        ? { action: `menyuspend ${entityLabel} ini`, destructive: true }
        : { action: `mengaktifkan kembali ${entityLabel} ini` };
    case "type":
      return {
        action: (
          <>
            mengubah status kepengurusan dari{" "}
            <Strong>{TYPE_TEXT[oldValue ?? ""] ?? oldValue ?? "—"}</Strong>{" "}
            menjadi{" "}
            <Strong>{TYPE_TEXT[newValue ?? ""] ?? newValue ?? "—"}</Strong>
          </>
        ),
      };
    case "image_url":
    case "logo_url":
      if (!oldValue) return { action: "menambahkan logo" };
      if (!newValue) return { action: "menghapus logo" };
      return { action: "mengganti logo" };
    case "deleted_at":
      return newValue
        ? { action: `menghapus ${entityLabel} ini`, destructive: true }
        : { action: `memulihkan ${entityLabel} ini` };
    case "client_secret":
      return { action: "memperbarui client secret" };
    case "index":
      return { action: "mengubah urutan" };
    case "organization_id":
      return describeParentMove(entry, ADMIN_ENTITY_LABEL.organization);
    case "coordinating_body_id":
      return describeParentMove(entry, ADMIN_ENTITY_LABEL.coordinating_body);
    case "branch_id":
      return describeParentMove(entry, ADMIN_ENTITY_LABEL.branch);
    case "coordinating_chapter_id":
      return describeParentMove(entry, ADMIN_ENTITY_LABEL.coordinating_chapter);
  }

  const label = VALUE_FIELD_LABEL[field];
  if (label) {
    const verb = !oldValue
      ? "menambahkan"
      : !newValue
        ? "menghapus"
        : "mengubah";
    return { action: `${verb} ${label}`, oldValue, newValue };
  }
  return { action: `mengubah ${field.replaceAll("_", " ") || "data"}` };
}

function describeEntry(
  entry: EntityChangeLogEntry,
  entityLabel: string
): LogDescription {
  const subject = entry.subject_user_full_name ?? "seorang pengguna";

  switch (entry.event_type) {
    case "create":
      return { action: `membuat ${entityLabel} ini` };
    case "admin_invited":
      return {
        action: (
          <>
            mengundang <Strong>{subject}</Strong> sebagai admin
          </>
        ),
      };
    case "admin_accepted":
      return entry.subject_user_id === entry.actor_id
        ? { action: "menerima undangan sebagai admin" }
        : {
            action: (
              <>
                menerima undangan admin untuk <Strong>{subject}</Strong>
              </>
            ),
          };
    case "admin_revoked":
      return entry.old_value === "pending"
        ? {
            action: (
              <>
                membatalkan undangan admin <Strong>{subject}</Strong>
              </>
            ),
            destructive: true,
          }
        : {
            action: (
              <>
                mencabut akses admin <Strong>{subject}</Strong>
              </>
            ),
            destructive: true,
          };
    default:
      return describeUpdate(entry, entityLabel);
  }
}

function ValueChange({
  oldValue,
  newValue,
}: {
  oldValue?: string | null;
  newValue?: string | null;
}) {
  return (
    <div className="mt-2 flex flex-col gap-1 rounded-lg border border-border bg-surface-subtle px-3 py-2 text-[13px]">
      {oldValue && (
        <p className="line-clamp-3 break-words text-muted-foreground line-through">
          {oldValue}
        </p>
      )}
      {newValue && (
        <p className="line-clamp-3 break-words text-heading">{newValue}</p>
      )}
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Circle className="mt-1 size-3.5" />
          <Circle className="size-9" />
          <div className="flex flex-1 flex-col gap-1.5 pt-1">
            <Bar className="h-3 w-4/5" />
            <Bar className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Mounted only while the sheet is open, so every open starts from page 1.
function ChangeLogTimeline({
  entityType,
  entityId,
}: {
  entityType: AccessEntityTypeEnum;
  entityId: string;
}) {
  const [entries, setEntries] = useState<EntityChangeLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listEntityChangeLogs({ entityType, entityId, page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          if (page === 1) setFailed(true);
          else toast.error("Gagal memuat log perubahan.");
          return;
        }
        setEntries((current) =>
          page === 1 ? result.list : [...current, ...result.list]
        );
        setTotalPage(result.totalPage);
      })
      .catch((error) => {
        console.error("[EntityChangeLogSheet] list threw:", error);
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId, page]);

  function loadMore() {
    setLoading(true);
    setPage((current) => current + 1);
  }

  if (loading && entries.length === 0) return <TimelineSkeleton />;

  if (failed) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Log perubahan tidak dapat dimuat. Coba lagi nanti.
      </p>
    );
  }

  const visible = entries.filter(
    (entry) => !HIDDEN_FIELDS.has(entry.field_name ?? "")
  );
  if (visible.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Belum ada perubahan yang tercatat.
      </p>
    );
  }

  const entityLabel = ADMIN_ENTITY_LABEL[entityType];

  return (
    <div>
      <ol>
        {visible.map((entry, index) => {
          const { action, oldValue, newValue, destructive } = describeEntry(
            entry,
            entityLabel
          );
          const isLast = index === visible.length - 1;
          return (
            <li key={entry.id} className="relative flex gap-3 pb-6 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute top-5 bottom-0 left-[6.5px] w-px bg-border"
                />
              )}
              <span
                aria-hidden="true"
                className={`relative mt-1.5 size-3.5 shrink-0 rounded-full border-[3px] bg-surface ${
                  destructive ? "border-destructive" : "border-primary"
                }`}
              />
              <Avatar
                src={entry.actor_avatar}
                name={entry.actor_full_name}
                size={36}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug break-words text-foreground">
                  <Strong>{entry.actor_full_name}</Strong> {action}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <time
                    dateTime={entry.occurred_at}
                    className="text-xs text-muted-foreground"
                  >
                    {formatShortDateTime(entry.occurred_at)}
                  </time>
                  {entry.is_backfilled && (
                    <Label variant="gray" size="sm">
                      Data lama
                    </Label>
                  )}
                </div>
                {(oldValue || newValue) && (
                  <ValueChange oldValue={oldValue} newValue={newValue} />
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {page < totalPage && (
        <Button
          variant="outline"
          onClick={loadMore}
          disabled={loading}
          className="mt-6 w-full"
        >
          {loading ? "Memuat..." : "Muat lebih banyak"}
        </Button>
      )}
    </div>
  );
}

export default function EntityChangeLogSheet({
  open,
  onClose,
  entityType,
  entityId,
}: EntityChangeLogSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Log Perubahan"
      description={`Riwayat perubahan data dan admin.`}
    >
      <ChangeLogTimeline entityType={entityType} entityId={entityId} />
    </Sheet>
  );
}
