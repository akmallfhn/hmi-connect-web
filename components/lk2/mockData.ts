// Prototype-only — no real LK2 API exists yet, this whole folder is frontend scaffolding to visualize the feature.
export type Lk2BatchStatus = "upcoming" | "ongoing" | "completed";
export type Lk2ParticipantStatus = "passed" | "conditional_pass" | "failed" | "in_progress";

export interface Lk2Material {
  title: string;
  hours: number;
  instructor: string;
}

export interface Lk2Participant {
  id: string;
  fullName: string;
  username: string;
  chapterName: string;
  score: number | null;
  status: Lk2ParticipantStatus;
}

export interface Lk2Batch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  mot: string;
  status: Lk2BatchStatus;
  materials: Lk2Material[];
  participants: Lk2Participant[];
}

const CURRICULUM: Lk2Material[] = [
  { title: "Konstitusi HMI", hours: 4, instructor: "Kanda Fadli Ramadhan" },
  { title: "Mission HMI", hours: 3, instructor: "Kanda Fadli Ramadhan" },
  { title: "Nilai Dasar Perjuangan (NDP)", hours: 6, instructor: "Kanda Rizky Aditya" },
  { title: "Kepemimpinan & Manajemen Organisasi", hours: 5, instructor: "Kanda Bagas Wirawan" },
  { title: "Wawasan Nusantara & Kebangsaan", hours: 4, instructor: "Yunda Salsabila Putri" },
  { title: "Analisis Sosial", hours: 4, instructor: "Kanda Rizky Aditya" },
  { title: "Diskusi Kelompok Terarah (DKT)", hours: 3, instructor: "Kanda Bagas Wirawan" },
];

export const LK2_BATCHES: Lk2Batch[] = [
  {
    id: "lk2-angkatan-xii",
    name: "LK2 Angkatan XII",
    startDate: "2026-03-10",
    endDate: "2026-03-16",
    location: "Bumi Perkemahan Kaliurang",
    mot: "Kanda Fadli Ramadhan",
    status: "completed",
    materials: CURRICULUM,
    participants: [
      { id: "p1", fullName: "Akmal Luthfiansyah", username: "akmalfhn", chapterName: "HMI Komisariat Fakultas Teknik USK", score: 88, status: "passed" },
      { id: "p2", fullName: "Dewi Anggraini", username: "dewianggraini", chapterName: "HMI Komisariat FISIP UI", score: 82, status: "passed" },
      { id: "p3", fullName: "Muhammad Fajar", username: "fajarm", chapterName: "HMI Komisariat FEB UGM", score: 74, status: "conditional_pass" },
      { id: "p4", fullName: "Siti Nur Halimah", username: "sitihalimah", chapterName: "HMI Komisariat Fakultas Hukum Unand", score: 90, status: "passed" },
      { id: "p5", fullName: "Rian Hidayat", username: "rianhidayat", chapterName: "HMI Komisariat Fakultas Teknik USK", score: 65, status: "failed" },
      { id: "p6", fullName: "Nabila Putri Ramadhani", username: "nabilaputri", chapterName: "HMI Komisariat FISIP UI", score: 79, status: "conditional_pass" },
      { id: "p7", fullName: "Yusuf Al Fatih", username: "yusufalfatih", chapterName: "HMI Komisariat FEB UGM", score: 85, status: "passed" },
      { id: "p8", fullName: "Indah Permatasari", username: "indahpermata", chapterName: "HMI Komisariat Fakultas Hukum Unand", score: 60, status: "failed" },
    ],
  },
  {
    id: "lk2-angkatan-xiii",
    name: "LK2 Angkatan XIII",
    startDate: "2026-07-20",
    endDate: "2026-08-02",
    location: "Wisma Diklat Cabang",
    mot: "Kanda Bagas Wirawan",
    status: "ongoing",
    materials: CURRICULUM,
    participants: [
      { id: "p9", fullName: "Arif Rahman Hakim", username: "arifrahman", chapterName: "HMI Komisariat Fakultas Teknik USK", score: null, status: "in_progress" },
      { id: "p10", fullName: "Putri Wulandari", username: "putriwulan", chapterName: "HMI Komisariat FISIP UI", score: null, status: "in_progress" },
      { id: "p11", fullName: "Bayu Segara", username: "bayusegara", chapterName: "HMI Komisariat FEB UGM", score: null, status: "in_progress" },
      { id: "p12", fullName: "Zahra Amelia", username: "zahraamelia", chapterName: "HMI Komisariat Fakultas Hukum Unand", score: null, status: "in_progress" },
      { id: "p13", fullName: "Fikri Maulana", username: "fikrimaulana", chapterName: "HMI Komisariat Fakultas Teknik USK", score: null, status: "in_progress" },
    ],
  },
  {
    id: "lk2-angkatan-xiv",
    name: "LK2 Angkatan XIV",
    startDate: "2026-09-05",
    endDate: "2026-09-11",
    location: "Belum ditentukan",
    mot: "Belum ditentukan",
    status: "upcoming",
    materials: CURRICULUM,
    participants: [],
  },
];
