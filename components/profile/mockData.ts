import type { Degree, TrainingResultEnum } from "@/lib/types";

// Placeholder data — ordina has no session-gated endpoint for bio/education/training yet.

export interface EducationEntry {
  id: string;
  institution: string;
  degree: Degree;
  major: string;
  startYear: number;
  endYear?: number;
}

export interface TrainingEntry {
  id: string;
  level: string;
  result: TrainingResultEnum;
  organizerName: string;
  year: number;
}

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

export const PLACEHOLDER_ABOUT =
  "Kader HMI yang percaya organisasi adalah tempat belajar kepemimpinan sekaligus berkontribusi untuk umat dan bangsa. Aktif di kegiatan kaderisasi dan diskusi keislaman.";

export const PLACEHOLDER_EDUCATION: EducationEntry[] = [
  {
    id: "edu-1",
    institution: "Universitas Gadjah Mada",
    degree: "sarjana",
    major: "Ilmu Pemerintahan",
    startYear: 2021,
    endYear: 2025,
  },
];

export const PLACEHOLDER_TRAINING: TrainingEntry[] = [
  {
    id: "training-1",
    level: "LK1",
    result: "passed",
    organizerName: "HMI Cabang Yogyakarta",
    year: 2022,
  },
  {
    id: "training-2",
    level: "LK2",
    result: "passed",
    organizerName: "Korkom DIY",
    year: 2024,
  },
];

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
