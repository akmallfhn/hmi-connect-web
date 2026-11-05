"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconBrandHipchat,
  IconPlus,
  IconSearch,
  IconSmartHome,
  IconUserCircle,
} from "@tabler/icons-react";
import { useUnreadChatCount } from "@/hooks/useUnreadChatCount";
import Modal from "../modals/Modal";
import CreateOptionList from "./CreateOptionList";
import { NavIconPulse, usePressPulse } from "./NavPulse";
import OfficialBottomNav from "../official/OfficialBottomNav";
import { useHeaderAdminAccess } from "./HeaderAdminAccessContext";

interface BottomNavProps {
  userId?: string;
  username?: string;
}

export default function BottomNav({ userId, username }: BottomNavProps) {
  const activeEntity = useHeaderAdminAccess()?.activeEntity;
  if (activeEntity) {
    return <OfficialBottomNav entityType={activeEntity.entityType} entityId={activeEntity.entityId} />;
  }
  return <PersonalBottomNav userId={userId} username={username} />;
}

function PersonalBottomNav({ userId, username }: BottomNavProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isSearch = pathname === "/search";
  const isChats =
    pathname === "/chats" || (pathname?.startsWith("/chats/") ?? false);
  const isProfile = username ? pathname === `/profile/${username}` : false;

  const [homePressed, triggerHome] = usePressPulse();
  const [searchPressed, triggerSearch] = usePressPulse();
  const [chatsPressed, triggerChats] = usePressPulse();
  const [profilePressed, triggerProfile] = usePressPulse();

  const unreadChatCount = useUnreadChatCount(userId);
  const [composeOpen, setComposeOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-between border-t border-border bg-surface/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <Link
          href="/"
          onClick={triggerHome}
          className={[
            "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
            isHome ? "text-primary-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          <NavIconPulse pressed={homePressed}>
            <IconSmartHome className="size-5" stroke={isHome ? 2.4 : 2} />
          </NavIconPulse>
          Beranda
        </Link>

        <Link
          href={username ? "/search" : "/auth/login"}
          onClick={triggerSearch}
          className={[
            "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
            isSearch ? "text-primary-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          <NavIconPulse pressed={searchPressed}>
            <IconSearch className="size-5" stroke={isSearch ? 2.4 : 2} />
          </NavIconPulse>
          Cari
        </Link>

        {username ? (
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={composeOpen}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium text-muted-foreground"
          >
            <span className="-mt-5 flex size-11 items-center justify-center rounded-full bg-primary text-on-primary-action shadow-md shadow-primary/30 transition-transform duration-150 active:scale-90">
              <IconPlus className="size-5" stroke={2.4} />
            </span>
            Posting
          </button>
        ) : (
          <Link
            href="/auth/login"
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px] font-medium text-muted-foreground"
          >
            <span className="-mt-5 flex size-11 items-center justify-center rounded-full bg-primary text-on-primary-action shadow-md shadow-primary/30 transition-transform duration-150 active:scale-90">
              <IconPlus className="size-5" stroke={2.4} />
            </span>
            Posting
          </Link>
        )}

        <Link
          href={username ? "/chats" : "/auth/login"}
          onClick={triggerChats}
          className={[
            "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
            isChats ? "text-primary-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          <NavIconPulse pressed={chatsPressed}>
            <IconBrandHipchat className="size-5" stroke={isChats ? 2.4 : 2} />
            {unreadChatCount > 0 && (
              <span className="absolute right-0.5 top-0.5 size-2 rounded-full bg-secondary" />
            )}
          </NavIconPulse>
          Pesan
        </Link>

        <Link
          href={username ? `/profile/${username}` : "/auth/login"}
          onClick={triggerProfile}
          className={[
            "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
            isProfile ? "text-primary-foreground" : "text-muted-foreground",
          ].join(" ")}
        >
          <NavIconPulse pressed={profilePressed}>
            <IconUserCircle className="size-5" stroke={isProfile ? 2.4 : 2} />
          </NavIconPulse>
          Profil
        </Link>
      </nav>

      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="Buat baru"
        variant="bottomSheet"
        panelClassName="max-w-md"
      >
        <CreateOptionList
          className="-mx-5 flex flex-col"
          onSelected={() => setComposeOpen(false)}
        />
      </Modal>
    </>
  );
}
