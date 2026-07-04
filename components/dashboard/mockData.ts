export interface FeedAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  timestamp: string;
  content: string;
  image?: string;
  type?: "achievement" | "event" | "photo" | "text";
  badge?: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  day: string;
  month: string;
  time: string;
  location: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  thumbnail: string;
}

export interface SuggestedConnection {
  id: string;
  name: string;
  role: string;
  avatar: string;
  mutual: number;
}

export interface NotificationItem {
  id: string;
  actor: string;
  avatar: string;
  action: string;
  timestamp: string;
  read?: boolean;
}

export const FEED_POSTS: FeedPost[] = [
  {
    id: "post-1",
    author: {
      name: "Siti Rahmawati",
      role: "Kader • Cabang Banda Aceh",
      avatar: "https://i.pravatar.cc/150?img=47",
    },
    timestamp: "2 jam lalu",
    type: "achievement",
    badge: "Menyelesaikan LK1",
    content:
      "Alhamdulillah, akhirnya menyelesaikan Latihan Kader 1! Terima kasih untuk semua panitia dan instruktur yang sudah membimbing selama 3 hari ini. Banyak ilmu baru soal ke-Islaman dan ke-organisasian yang aku dapetin 🙌",
    likes: 42,
    comments: 8,
    shares: 1,
    liked: false,
  },
  {
    id: "post-2",
    author: {
      name: "HMI Cabang Yogyakarta",
      role: "Akun Resmi Cabang",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    timestamp: "5 jam lalu",
    type: "event",
    content:
      "Yuk daftar! Latihan Kader 2 (LK2) tingkat Korkom DIY akan dilaksanakan 12–15 Agustus 2026 di Bumi Perkemahan Kaliurang. Kuota terbatas untuk 60 peserta se-DIY. Link pendaftaran ada di komentar ya, Kanda-Yunda!",
    image: "https://picsum.photos/seed/hmi-event/800/450",
    likes: 128,
    comments: 24,
    shares: 19,
    liked: true,
  },
  {
    id: "post-3",
    author: {
      name: "Budi Santoso",
      role: "Kader • Cabang Makassar",
      avatar: "https://i.pravatar.cc/150?img=33",
    },
    timestamp: "1 hari lalu",
    type: "text",
    content:
      '"Yakin Usaha Sampai." Kalimat ini yang selalu jadi pegangan aku tiap kali capek ngurus proker komisariat. Semangat terus buat Kanda-Yunda yang lagi berjuang di cabang masing-masing!',
    likes: 76,
    comments: 5,
    shares: 3,
    liked: false,
  },
  {
    id: "post-4",
    author: {
      name: "Nadia Putri",
      role: "Kader • Cabang Malang",
      avatar: "https://i.pravatar.cc/150?img=25",
    },
    timestamp: "1 hari lalu",
    type: "photo",
    content:
      "Bakti sosial Komisariat Ekonomi hari ini di Panti Asuhan Nurul Iman. Terima kasih untuk semua kanda-yunda yang sudah menyempatkan waktu, insyaAllah berkah untuk kita semua 💚🧡",
    image: "https://picsum.photos/seed/hmi-baksos/800/500",
    likes: 96,
    comments: 12,
    shares: 4,
    liked: false,
  },
  {
    id: "post-5",
    author: {
      name: "Ahmad Fauzi",
      role: "Kader • Cabang Medan",
      avatar: "https://i.pravatar.cc/150?img=51",
    },
    timestamp: "2 hari lalu",
    type: "achievement",
    badge: "Sertifikat Senior Course",
    content:
      "Setelah 5 hari penuh diskusi dan materi berat, akhirnya rampung juga Senior Course angkatan ini. Banyak insight baru soal manajemen organisasi tingkat lanjut. Next level unlocked!",
    likes: 61,
    comments: 9,
    shares: 2,
    liked: false,
  },
];

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

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: "news-1",
    title: "PB HMI Gelar Rapat Koordinasi Nasional Jelang Kongres",
    source: "hmi.or.id",
    thumbnail: "https://picsum.photos/seed/hmi-news-1/200/200",
  },
  {
    id: "news-2",
    title: "5 Alumni HMI yang Kini Jadi Menteri di Kabinet",
    source: "Kabar Kader",
    thumbnail: "https://picsum.photos/seed/hmi-news-2/200/200",
  },
  {
    id: "news-3",
    title: "Cabang Makassar Raih Penghargaan Cabang Terbaik 2026",
    source: "hmi.or.id",
    thumbnail: "https://picsum.photos/seed/hmi-news-3/200/200",
  },
];

export const SUGGESTED_CONNECTIONS: SuggestedConnection[] = [
  {
    id: "conn-1",
    name: "Rizky Ramadhan",
    role: "Kader • Cabang Bandung",
    avatar: "https://i.pravatar.cc/150?img=14",
    mutual: 6,
  },
  {
    id: "conn-2",
    name: "Dewi Anggraini",
    role: "Kader • Cabang Semarang",
    avatar: "https://i.pravatar.cc/150?img=45",
    mutual: 3,
  },
  {
    id: "conn-3",
    name: "Fajar Nugroho",
    role: "Kader • Cabang Surabaya",
    avatar: "https://i.pravatar.cc/150?img=60",
    mutual: 9,
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

export const WEEK_DAYS = ["S", "S", "R", "K", "J", "S", "M"];
