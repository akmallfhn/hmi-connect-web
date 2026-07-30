// Prototype-only — no real LK2 API exists yet, this whole folder is frontend scaffolding to visualize the feature.
export type Lk2BatchStatus = "upcoming" | "ongoing" | "completed";
export type Lk2ParticipantStatus = "passed" | "conditional_pass" | "failed" | "in_progress";
export type Lk2MaterialStatus = "completed" | "ongoing" | "not_started";

export interface Lk2Material {
  title: string;
  hours: number;
  instructor: string;
  understandingPercent: number;
  status: Lk2MaterialStatus;
}

export interface Lk2Participant {
  id: string;
  fullName: string;
  username: string;
  chapterName: string;
  score: number | null;
  status: Lk2ParticipantStatus;
}

export interface Lk2Document {
  name: string;
  sizeLabel: string;
}

export interface Lk2Activity {
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface Lk2ScorePoint {
  material: string;
  score: number;
}

export interface Lk2Batch {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  mot: string;
  status: Lk2BatchStatus;
  quota: number;
  batchCode: string;
  createdBy: string;
  createdAt: string;
  scoreDeltaFromPreviousBatch: number;
  materials: Lk2Material[];
  participants: Lk2Participant[];
  documents: Lk2Document[];
  activities: Lk2Activity[];
  scoreTrend: Lk2ScorePoint[];
}

export const LK2_BATCHES: Lk2Batch[] = [
  {
    id: "lk2-angkatan-xii",
    name: "LK2 Angkatan XII",
    startDate: "2026-03-10",
    endDate: "2026-03-16",
    location: "Bumi Perkemahan Kaliurang",
    mot: "Kanda Fadli Ramadhan",
    status: "completed",
    quota: 8,
    batchCode: "LK2-XII-2026",
    createdBy: "Akmal Luthfiansyah",
    createdAt: "2026-02-05T10:30:00",
    scoreDeltaFromPreviousBatch: 8.6,
    materials: [
      { title: "Konstitusi HMI", hours: 4, instructor: "Kanda Fadli Ramadhan", understandingPercent: 90, status: "completed" },
      { title: "Mission HMI", hours: 3, instructor: "Kanda Fadli Ramadhan", understandingPercent: 80, status: "completed" },
      { title: "Nilai Dasar Perjuangan (NDP)", hours: 6, instructor: "Kanda Rizky Aditya", understandingPercent: 70, status: "completed" },
      { title: "Kepemimpinan & Manajemen Organisasi", hours: 5, instructor: "Kanda Bagas Wirawan", understandingPercent: 60, status: "completed" },
      { title: "Wawasan Nusantara & Kebangsaan", hours: 4, instructor: "Yunda Salsabila Putri", understandingPercent: 60, status: "completed" },
      { title: "Analisis Sosial", hours: 4, instructor: "Kanda Dimas Prayoga", understandingPercent: 65, status: "completed" },
      { title: "Diskusi Kelompok Terarah (DKT)", hours: 3, instructor: "Kanda Bagas Wirawan", understandingPercent: 40, status: "ongoing" },
      { title: "Evaluasi Akhir", hours: 3, instructor: "Tim Penguji", understandingPercent: 0, status: "not_started" },
    ],
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
    documents: [
      { name: "Jadwal LK2 Angkatan XII.pdf", sizeLabel: "1.2 MB" },
      { name: "TOR LK2 Angkatan XII.pdf", sizeLabel: "890 KB" },
      { name: "Daftar Hadir Peserta.xlsx", sizeLabel: "220 KB" },
    ],
    activities: [
      { actor: "Akmal Luthfiansyah", action: "Menambahkan materi baru", target: "Konstitusi HMI", timestamp: "10:30 WIB" },
      { actor: "Kanda Fadli Ramadhan", action: "Mengubah nilai peserta", target: "Dewi Anggraini", timestamp: "09:15 WIB" },
      { actor: "Kanda Bagas Wirawan", action: "Mengubah status peserta", target: "Muhammad Fajar", timestamp: "Kemarin, 16:45" },
      { actor: "Sistem", action: "Generate SK Kelulusan", target: "LK2 Angkatan XII", timestamp: "Kemarin, 14:20" },
    ],
    scoreTrend: [
      { material: "Konstitusi HMI", score: 82 },
      { material: "Mission HMI", score: 88 },
      { material: "NDP", score: 65 },
      { material: "Kepemimpinan", score: 79 },
      { material: "Wawasan", score: 60 },
      { material: "Analisis Sosial", score: 75 },
      { material: "DKT", score: 85 },
      { material: "Evaluasi Akhir", score: 90 },
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
    quota: 10,
    batchCode: "LK2-XIII-2026",
    createdBy: "Akmal Luthfiansyah",
    createdAt: "2026-06-18T14:00:00",
    scoreDeltaFromPreviousBatch: 0,
    materials: [
      { title: "Konstitusi HMI", hours: 4, instructor: "Kanda Fadli Ramadhan", understandingPercent: 85, status: "completed" },
      { title: "Mission HMI", hours: 3, instructor: "Kanda Fadli Ramadhan", understandingPercent: 78, status: "completed" },
      { title: "Nilai Dasar Perjuangan (NDP)", hours: 6, instructor: "Kanda Rizky Aditya", understandingPercent: 50, status: "ongoing" },
      { title: "Kepemimpinan & Manajemen Organisasi", hours: 5, instructor: "Kanda Bagas Wirawan", understandingPercent: 0, status: "not_started" },
      { title: "Wawasan Nusantara & Kebangsaan", hours: 4, instructor: "Yunda Salsabila Putri", understandingPercent: 0, status: "not_started" },
      { title: "Analisis Sosial", hours: 4, instructor: "Kanda Dimas Prayoga", understandingPercent: 0, status: "not_started" },
      { title: "Diskusi Kelompok Terarah (DKT)", hours: 3, instructor: "Kanda Bagas Wirawan", understandingPercent: 0, status: "not_started" },
      { title: "Evaluasi Akhir", hours: 3, instructor: "Tim Penguji", understandingPercent: 0, status: "not_started" },
    ],
    participants: [
      { id: "p9", fullName: "Arif Rahman Hakim", username: "arifrahman", chapterName: "HMI Komisariat Fakultas Teknik USK", score: null, status: "in_progress" },
      { id: "p10", fullName: "Putri Wulandari", username: "putriwulan", chapterName: "HMI Komisariat FISIP UI", score: null, status: "in_progress" },
      { id: "p11", fullName: "Bayu Segara", username: "bayusegara", chapterName: "HMI Komisariat FEB UGM", score: null, status: "in_progress" },
      { id: "p12", fullName: "Zahra Amelia", username: "zahraamelia", chapterName: "HMI Komisariat Fakultas Hukum Unand", score: null, status: "in_progress" },
      { id: "p13", fullName: "Fikri Maulana", username: "fikrimaulana", chapterName: "HMI Komisariat Fakultas Teknik USK", score: null, status: "in_progress" },
    ],
    documents: [
      { name: "Jadwal LK2 Angkatan XIII.pdf", sizeLabel: "1.1 MB" },
      { name: "TOR LK2 Angkatan XIII.pdf", sizeLabel: "870 KB" },
    ],
    activities: [
      { actor: "Kanda Bagas Wirawan", action: "Membuka pendaftaran peserta", target: "LK2 Angkatan XIII", timestamp: "2 hari lalu" },
    ],
    scoreTrend: [],
  },
  {
    id: "lk2-angkatan-xiv",
    name: "LK2 Angkatan XIV",
    startDate: "2026-09-05",
    endDate: "2026-09-11",
    location: "Belum ditentukan",
    mot: "Belum ditentukan",
    status: "upcoming",
    quota: 10,
    batchCode: "LK2-XIV-2026",
    createdBy: "Akmal Luthfiansyah",
    createdAt: "2026-07-28T09:00:00",
    scoreDeltaFromPreviousBatch: 0,
    materials: [
      { title: "Konstitusi HMI", hours: 4, instructor: "Kanda Fadli Ramadhan", understandingPercent: 0, status: "not_started" },
      { title: "Mission HMI", hours: 3, instructor: "Kanda Fadli Ramadhan", understandingPercent: 0, status: "not_started" },
      { title: "Nilai Dasar Perjuangan (NDP)", hours: 6, instructor: "Kanda Rizky Aditya", understandingPercent: 0, status: "not_started" },
      { title: "Kepemimpinan & Manajemen Organisasi", hours: 5, instructor: "Kanda Bagas Wirawan", understandingPercent: 0, status: "not_started" },
      { title: "Wawasan Nusantara & Kebangsaan", hours: 4, instructor: "Yunda Salsabila Putri", understandingPercent: 0, status: "not_started" },
      { title: "Analisis Sosial", hours: 4, instructor: "Kanda Dimas Prayoga", understandingPercent: 0, status: "not_started" },
      { title: "Diskusi Kelompok Terarah (DKT)", hours: 3, instructor: "Kanda Bagas Wirawan", understandingPercent: 0, status: "not_started" },
      { title: "Evaluasi Akhir", hours: 3, instructor: "Tim Penguji", understandingPercent: 0, status: "not_started" },
    ],
    participants: [],
    documents: [],
    activities: [],
    scoreTrend: [],
  },
];
