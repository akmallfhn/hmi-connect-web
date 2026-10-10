import Link from "next/link";
import type { Notification } from "@/apis/notifications";
import NotificationRow from "./NotificationRow";

const DROPDOWN_LIMIT = 5;

interface NotificationsDropdownPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAllRead: () => void;
  onRead: (id: string) => void;
}

// Shared between every bell trigger (Header's desktop bell, MobileGreetingBar's bell) —
// same list, just differently-positioned trigger buttons.
export default function NotificationsDropdownPanel({
  notifications,
  unreadCount,
  onMarkAllRead,
  onRead,
}: NotificationsDropdownPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-heading">Notifikasi</p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="cursor-pointer text-xs font-medium text-primary-foreground hover:underline"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>
      <div className="flex max-h-80 flex-col overflow-y-auto">
        {notifications.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Belum ada notifikasi.
          </p>
        )}
        {notifications.slice(0, DROPDOWN_LIMIT).map((item) => (
          <NotificationRow key={item.id} notification={item} onRead={onRead} />
        ))}
      </div>
      <Link
        href="/notifications"
        className="block border-t border-border px-4 py-2.5 text-center text-xs font-medium text-primary-foreground hover:bg-surface-muted"
      >
        Lihat semua notifikasi
      </Link>
    </>
  );
}
