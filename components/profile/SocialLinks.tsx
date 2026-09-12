"use client";

import type { SocialMediaAccountEntry } from "@/apis/users";
import { ExternalLink, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Modal from "../modals/Modal";

// Chips past these counts collapse into a "+N lainnya" trigger, per breakpoint.
const MOBILE_VISIBLE = 2;
const DESKTOP_VISIBLE = 3;

function normalizeSocialUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "#";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export default function SocialLinks({
  accounts,
  isOwnProfile,
  onAdd,
  className,
}: {
  accounts: SocialMediaAccountEntry[];
  isOwnProfile?: boolean;
  onAdd: () => void;
  className?: string;
}) {
  const [isListOpen, setIsListOpen] = useState(false);

  const wrapperClasses = ["flex flex-wrap gap-2", className]
    .filter(Boolean)
    .join(" ");

  if (accounts.length === 0) {
    if (!isOwnProfile) return null;

    return (
      <div className={wrapperClasses}>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-[#dbe3ef] bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-[#f5f7fb]"
        >
          <Plus className="size-3.5" />
          Tambah sosial media
        </button>
      </div>
    );
  }

  const mobileHidden = accounts.length - MOBILE_VISIBLE;
  const desktopHidden = accounts.length - DESKTOP_VISIBLE;

  return (
    <>
      <div className={wrapperClasses}>
        {accounts.slice(0, DESKTOP_VISIBLE).map((account, index) => (
          <a
            key={account.id}
            href={normalizeSocialUrl(account.url)}
            target="_blank"
            rel="noreferrer"
            className={[
              "max-w-full items-center gap-1.5 rounded-full border border-[#e6e9ef] bg-white px-3 py-1.5 text-xs font-semibold text-[#172033] transition hover:bg-[#f5f7fb]",
              // The third chip is desktop-only, so mobile stops at two before the counter.
              index < MOBILE_VISIBLE ? "inline-flex" : "hidden sm:inline-flex",
            ].join(" ")}
            title={account.url}
          >
            <PlatformIcon account={account} />
            <span className="max-w-[140px] truncate">
              {account.platform_name}
            </span>
            <ExternalLink className="size-3 text-current/70" />
          </a>
        ))}

        {mobileHidden > 0 && (
          <OverflowButton
            count={mobileHidden}
            className="sm:hidden"
            onClick={() => setIsListOpen(true)}
          />
        )}
        {desktopHidden > 0 && (
          <OverflowButton
            count={desktopHidden}
            className="hidden sm:inline-flex"
            onClick={() => setIsListOpen(true)}
          />
        )}
      </div>

      <Modal
        open={isListOpen}
        onClose={() => setIsListOpen(false)}
        title="Sosial Media"
        variant="bottomSheet"
        panelClassName="max-w-md"
      >
        <div className="divide-y divide-[#e6e9ef] rounded-xl border border-[#e6e9ef]">
          {accounts.map((account) => (
            <a
              key={account.id}
              href={normalizeSocialUrl(account.url)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 transition first:rounded-t-xl last:rounded-b-xl hover:bg-[#f5f7fb]"
            >
              <PlatformIcon account={account} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold text-[#172033]">
                  {account.platform_name}
                </span>
                <span className="block truncate text-[13px] text-[#5f6573]">
                  {account.url}
                </span>
              </span>
              <ExternalLink className="size-4 shrink-0 text-[#7b8190]" />
            </a>
          ))}
        </div>
      </Modal>
    </>
  );
}

function OverflowButton({
  count,
  className,
  onClick,
}: {
  count: number;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer items-center rounded-full border border-[#e6e9ef] bg-white px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-[#f5f7fb] ${className}`}
    >
      +{count} lainnya
    </button>
  );
}

function PlatformIcon({
  account,
  size = 16,
}: {
  account: SocialMediaAccountEntry;
  size?: number;
}) {
  if (account.logo_url) {
    return (
      <Image
        src={account.logo_url}
        alt={account.platform_name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-semibold text-primary"
    >
      {account.platform_name.slice(0, 1)}
    </span>
  );
}
