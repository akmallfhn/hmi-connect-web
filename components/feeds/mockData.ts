export interface UpcomingEvent {
  id: string;
  title: string;
  day: string;
  month: string;
  time: string;
  location: string;
}

export interface NotificationItem {
  id: string;
  actor: string;
  avatar: string;
  action: string;
  timestamp: string;
  read?: boolean;
}

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: "event-1",
    title: "Latihan Kader 2 Korkom DIY",
    day: "12",
    month: "Agu",
    time: "08.00 WIB",
    location: "Bumi Perkemahan Kaliurang",
  },
  {
    id: "event-2",
    title: "Diskusi Publik: Ekonomi Kerakyatan",
    day: "18",
    month: "Agu",
    time: "19.30 WIB",
    location: "Sekretariat Cabang Jakarta Pusat",
  },
  {
    id: "event-3",
    title: "Rapat Kerja Cabang Se-Sumatra",
    day: "25",
    month: "Agu",
    time: "09.00 WIB",
    location: "Aula PB HMI, Jakarta",
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    actor: "Siti Rahmawati",
    avatar: "https://i.pravatar.cc/150?img=47",
    action: "menyukai postinganmu",
    timestamp: "10 menit lalu",
    read: false,
  },
  {
    id: "notif-2",
    actor: "HMI Cabang Yogyakarta",
    avatar: "https://i.pravatar.cc/150?img=12",
    action: "membagikan event baru",
    timestamp: "1 jam lalu",
    read: false,
  },
  {
    id: "notif-3",
    actor: "Budi Santoso",
    avatar: "https://i.pravatar.cc/150?img=33",
    action: "mengomentari postinganmu",
    timestamp: "3 jam lalu",
    read: true,
  },
  {
    id: "notif-4",
    actor: "Rizky Ramadhan",
    avatar: "https://i.pravatar.cc/150?img=14",
    action: "mulai mengikuti kamu",
    timestamp: "1 hari lalu",
    read: true,
  },
];

export const NAV_ITEMS = [
  { label: "Beranda", href: "#" },
  { label: "Anggota", href: "#" },
  { label: "Cabang", href: "#" },
  { label: "Kaderisasi", href: "#" },
  { label: "Event", href: "#" },
];
