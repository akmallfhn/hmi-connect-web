"use client";

import {
  ArrowDown,
  ArrowUp,
  IndentDecrease,
  IndentIncrease,
  ListTree,
  Plus,
  Trash2,
} from "lucide-react";
import {
  MAX_OUTLINE_DEPTH,
  newOutlineRow,
  type FlatOutlineRow,
} from "@/lib/organizational-document";
import Button from "../buttons/Button";
import EmptyState from "../states/EmptyState";

interface DocumentOutlineEditorProps {
  rows: FlatOutlineRow[];
  onChange: (rows: FlatOutlineRow[]) => void;
  errors: Record<string, string>;
}

// Each row may sit at most one level deeper than the row above it, and the first row is always top-level.
function normalizeDepths(rows: FlatOutlineRow[]) {
  let previous = -1;
  return rows.map((row) => {
    const depth = Math.max(
      0,
      Math.min(row.depth, previous + 1, MAX_OUTLINE_DEPTH)
    );
    previous = depth;
    return depth === row.depth ? row : { ...row, depth };
  });
}

export default function DocumentOutlineEditor({
  rows,
  onChange,
  errors,
}: DocumentOutlineEditorProps) {
  function update(index: number, patch: Partial<FlatOutlineRow>) {
    onChange(
      normalizeDepths(
        rows.map((row, position) =>
          position === index ? { ...row, ...patch } : row
        )
      )
    );
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(normalizeDepths(next));
  }

  function remove(index: number) {
    onChange(normalizeDepths(rows.filter((_, position) => position !== index)));
  }

  function insertAfter(index: number) {
    const anchor = rows[index];
    const next = [...rows];
    next.splice(
      index + 1,
      0,
      newOutlineRow(anchor?.depth ?? 0, "", anchor?.page ?? "")
    );
    onChange(normalizeDepths(next));
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong">
        <EmptyState
          title="Daftar isi masih kosong"
          description="Tambahkan bab dan pasal supaya kader bisa melompat langsung ke halamannya."
          action={
            <Button variant="soft" onClick={() => onChange([newOutlineRow()])}>
              <Plus className="size-4" />
              Tambah Bagian
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="@container">
      <div className="hidden grid-cols-[minmax(0,1fr)_80px_156px] gap-3 px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground @lg:grid">
        <span>Judul bagian</span>
        <span>Halaman</span>
        <span className="text-right">Aksi</span>
      </div>
      <ol className="flex flex-col gap-2">
        {rows.map((row, index) => {
          const error = errors[row.key];
          const canIndent =
            index > 0 &&
            row.depth < Math.min(rows[index - 1].depth + 1, MAX_OUTLINE_DEPTH);
          return (
            <li key={row.key}>
              <div
                className={`grid grid-cols-[minmax(0,1fr)_80px] items-center gap-2 rounded-xl border bg-surface p-2 @lg:grid-cols-[minmax(0,1fr)_80px_156px] @lg:gap-3 ${
                  error ? "border-destructive" : "border-border"
                }`}
              >
                <div
                  className="flex min-w-0 items-center gap-2"
                  style={{ paddingLeft: `${row.depth * 20}px` }}
                >
                  <span
                    aria-hidden="true"
                    className={`size-1.5 shrink-0 rounded-full ${
                      row.depth === 0 ? "bg-primary" : "bg-border-strong"
                    }`}
                  />
                  <input
                    value={row.title}
                    onChange={(event) =>
                      update(index, { title: event.target.value })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        insertAfter(index);
                      }
                    }}
                    placeholder={
                      row.depth === 0
                        ? "Contoh: BAB I - Ketentuan Umum"
                        : "Contoh: Pasal 1 - Nama"
                    }
                    aria-label={`Judul bagian ${index + 1}`}
                    maxLength={200}
                    className={`h-10 min-w-0 flex-1 rounded-lg border border-border-strong bg-surface px-3 text-sm text-heading outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                      row.depth === 0 ? "font-semibold" : ""
                    }`}
                  />
                </div>
                <input
                  value={row.page}
                  onChange={(event) =>
                    update(index, {
                      page: event.target.value.replace(/\D/g, ""),
                    })
                  }
                  inputMode="numeric"
                  placeholder="Hlm."
                  aria-label={`Halaman bagian ${index + 1}`}
                  className="h-10 w-full rounded-lg border border-border-strong bg-surface px-3 text-center text-sm tabular-nums text-heading outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
                <div className="col-span-2 flex items-center justify-end gap-1 @lg:col-span-1">
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => update(index, { depth: row.depth - 1 })}
                    disabled={row.depth === 0}
                    aria-label="Naikkan level"
                    title="Naikkan level"
                  >
                    <IndentDecrease className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => update(index, { depth: row.depth + 1 })}
                    disabled={!canIndent}
                    aria-label="Jadikan sub-bagian"
                    title="Jadikan sub-bagian"
                  >
                    <IndentIncrease className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Pindah ke atas"
                    title="Pindah ke atas"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1}
                    aria-label="Pindah ke bawah"
                    title="Pindah ke bawah"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    onClick={() => remove(index)}
                    aria-label="Hapus bagian"
                    title="Hapus bagian"
                    className="text-destructive-foreground hover:bg-destructive-soft!"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              {error && (
                <p className="mt-1 pl-3 text-xs text-destructive-foreground">
                  {error}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button variant="soft" onClick={() => insertAfter(rows.length - 1)}>
          <Plus className="size-4" />
          Tambah Bagian
        </Button>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ListTree className="size-3.5" />
          {rows.length} bagian · tekan Enter di judul untuk menambah baris di
          bawahnya
        </p>
      </div>
    </div>
  );
}
