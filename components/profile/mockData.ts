// Placeholder data — ordina has no session-gated endpoint for activity/posts yet.

export interface ActivityPost {
  id: string;
  timestamp: string;
  content: string;
  image?: string;
  badge?: string;
  likes: number;
  comments: number;
  shares: number;
}

export const PLACEHOLDER_ACTIVITY: ActivityPost[] = [
  {
    id: "activity-1",
    timestamp: "2 hari lalu",
    badge: "Menyelesaikan LK2",
    content:
      "Alhamdulillah, LK2 sudah selesai! Terima kasih untuk semua instruktur dan panitia Korkom DIY.",
    likes: 34,
    comments: 6,
    shares: 1,
  },
  {
    id: "activity-2",
    timestamp: "1 minggu lalu",
    content:
      "Diskusi publik minggu ini seru banget, banyak insight baru soal ekonomi kerakyatan.",
    likes: 21,
    comments: 3,
    shares: 0,
  },
];
