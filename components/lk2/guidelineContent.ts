// Prototype-only — static reference documentation, deliberately separate from mockData.ts's per-batch data (LK2_BATCHES). Nothing here should ever depend on a specific batch instance.

export interface Lk2MaterialDetail {
  id: string;
  title: string;
  hours: number;
  objective: string;
  topics: string[];
  method: string;
  evaluation: string;
}

export const LK2_OVERVIEW = {
  description:
    "Latihan Kader 2 (LK2) adalah jenjang perkaderan formal HMI setelah Latihan Kader 1 (LK1), difokuskan pada pematangan wawasan keislaman, keindonesiaan, dan kepemimpinan kader menjelang pengabdian di tingkat Cabang dan Badko.",
  goals: [
    "Menguatkan pemahaman ideologis kader melalui Nilai Dasar Perjuangan (NDP)",
    "Membentuk kader yang memiliki kapasitas kepemimpinan dan manajemen organisasi",
    "Menumbuhkan kepekaan sosial kader terhadap persoalan umat, bangsa, dan negara",
    "Mempersiapkan kader untuk mengambil peran struktural di tingkat Cabang dan Badko",
  ],
};

export const LK2_PARTICIPANT_REQUIREMENTS = [
  "Telah dinyatakan lulus Latihan Kader 1 (LK1) minimal 1 tahun sebelum pendaftaran",
  "Aktif sebagai pengurus/anggota Komisariat, dibuktikan dengan surat rekomendasi",
  "Sehat jasmani dan rohani, dibuktikan dengan surat keterangan sehat dari fasilitas kesehatan",
  "Lulus seleksi administrasi dan wawancara panitia pelaksana",
  "Bersedia mengikuti seluruh rangkaian kegiatan hingga selesai tanpa terputus",
];

export const LK2_REGISTRATION_FLOW = [
  {
    title: "Pendaftaran",
    description: "Calon peserta mendaftar secara daring melalui panitia pelaksana Cabang dengan melengkapi formulir dan berkas administrasi.",
  },
  {
    title: "Verifikasi Berkas",
    description: "Panitia memverifikasi sertifikat LK1, surat rekomendasi Komisariat, dan identitas diri (KTM/KTP) calon peserta.",
  },
  {
    title: "Wawancara Seleksi",
    description: "Badan Pengelola Latihan (BPL) Cabang melakukan wawancara untuk menilai kesiapan wawasan dan komitmen calon peserta.",
  },
  {
    title: "Pengumuman Peserta",
    description: "Panitia mengumumkan daftar peserta yang lolos seleksi dan berhak mengikuti batch LK2 berjalan.",
  },
];

export const LK2_CLASS_RULES = {
  attendance: [
    "Peserta wajib hadir minimal 90% dari total sesi untuk dapat dinyatakan lulus",
    "Keterlambatan lebih dari 15 menit dianggap tidak hadir pada sesi tersebut",
    "Izin meninggalkan kelas hanya diberikan untuk kondisi darurat dan harus melalui panitia",
  ],
  conduct: [
    "Peserta wajib mengenakan pakaian rapi dan atribut HMI selama kegiatan berlangsung",
    "Dilarang menggunakan perangkat elektronik selama sesi materi, kecuali untuk keperluan pencatatan",
    "Peserta wajib menjaga adab dan etika berdiskusi terhadap sesama peserta maupun instruktur",
    "Dilarang membawa atau menggunakan zat terlarang serta minuman keras selama kegiatan",
  ],
  sanctions: [
    "Teguran lisan untuk pelanggaran ringan (keterlambatan, atribut tidak lengkap)",
    "Teguran tertulis dan pengurangan poin penilaian untuk pelanggaran sedang (ketidakhadiran tanpa izin)",
    "Dikeluarkan dari forum pelatihan untuk pelanggaran berat (kekerasan, pelanggaran etika serius)",
  ],
};

export const LK2_MOT_SPECIFICATION = {
  requirements: [
    "Telah mengikuti dan dinyatakan lulus Senior Course (SC) atau setara",
    "Pernah menjadi instruktur pada minimal 2 kali penyelenggaraan LK2",
    "Direkomendasikan oleh Badan Pengelola Latihan (BPL) Cabang",
    "Menguasai metode pelatihan orang dewasa (andragogi)",
  ],
  responsibilities: [
    "Menyusun dan mengawasi jadwal serta materi pelatihan",
    "Mengkoordinasikan tim instruktur/pemateri selama pelatihan berlangsung",
    "Memimpin sidang penilaian akhir kelulusan peserta",
    "Menandatangani SK Kelulusan dan sertifikat peserta",
  ],
};

export const LK2_INSTRUCTOR_ROLES = [
  { role: "Master of Training (MOT)", description: "Memimpin jalannya keseluruhan pelatihan dan sidang kelulusan." },
  { role: "Instruktur Ideologi", description: "Membawakan materi Konstitusi HMI, Mission HMI, dan Nilai Dasar Perjuangan." },
  { role: "Instruktur Kepemimpinan", description: "Membawakan materi Kepemimpinan & Manajemen Organisasi." },
  { role: "Instruktur Wawasan Kebangsaan", description: "Membawakan materi Wawasan Nusantara & Kebangsaan serta Analisis Sosial." },
  { role: "Fasilitator DKT", description: "Memfasilitasi sesi Diskusi Kelompok Terarah antar peserta." },
];

export const LK2_MATERIALS: Lk2MaterialDetail[] = [
  {
    id: "konstitusi-hmi",
    title: "Konstitusi HMI",
    hours: 4,
    objective:
      "Peserta memahami landasan konstitusional HMI serta mampu menjelaskan struktur Anggaran Dasar/Anggaran Rumah Tangga organisasi.",
    topics: [
      "Sejarah lahirnya HMI dan latar belakang konstitusi",
      "Struktur Anggaran Dasar (AD) dan Anggaran Rumah Tangga (ART)",
      "Hierarki peraturan organisasi dari pusat hingga Komisariat",
      "Mekanisme perubahan dan penafsiran konstitusi",
    ],
    method: "Ceramah interaktif dan studi kasus pelanggaran konstitusi",
    evaluation: "Tes tertulis pilihan ganda dan esai singkat",
  },
  {
    id: "mission-hmi",
    title: "Mission HMI",
    hours: 3,
    objective:
      "Peserta mampu mengartikulasikan lima kualitas insan cita HMI dan mengaitkannya dengan peran kader di masyarakat.",
    topics: [
      "Independensi etis dan organisatoris",
      "Lima kualitas insan cita",
      "Peran HMI dalam dinamika keislaman dan keindonesiaan",
      "Studi kasus kontribusi alumni HMI",
    ],
    method: "Diskusi kelompok dan presentasi",
    evaluation: "Presentasi kelompok dan penilaian partisipasi diskusi",
  },
  {
    id: "ndp",
    title: "Nilai Dasar Perjuangan (NDP)",
    hours: 6,
    objective:
      "Peserta memahami kerangka filosofis NDP sebagai basis teologis dan ideologis perjuangan kader.",
    topics: [
      "Basis teologis: hakikat manusia dan alam semesta",
      "Basis kemanusiaan: ilmu pengetahuan dan keadilan sosial",
      "Implementasi NDP dalam kehidupan berorganisasi",
      "Studi tematik terkait NDP",
    ],
    method: "Ceramah, kajian tematik, dan diskusi kelompok terarah",
    evaluation: "Ujian tertulis dan penilaian makalah reflektif",
  },
  {
    id: "kepemimpinan-organisasi",
    title: "Kepemimpinan & Manajemen Organisasi",
    hours: 5,
    objective:
      "Peserta menguasai prinsip dasar kepemimpinan transformasional dan manajemen organisasi nirlaba.",
    topics: [
      "Gaya dan teori kepemimpinan",
      "Perencanaan strategis dan manajemen program kerja",
      "Pengelolaan konflik internal organisasi",
      "Simulasi rapat pleno dan pengambilan keputusan",
    ],
    method: "Simulasi organisasi (role play) dan studi kasus",
    evaluation: "Penilaian simulasi dan laporan individu",
  },
  {
    id: "wawasan-kebangsaan",
    title: "Wawasan Nusantara & Kebangsaan",
    hours: 4,
    objective:
      "Peserta memahami posisi HMI dalam bingkai keindonesiaan dan mampu menjelaskan tantangan kebangsaan kontemporer.",
    topics: [
      "Sejarah pergerakan kebangsaan Indonesia",
      "Empat pilar kebangsaan",
      "Tantangan radikalisme dan intoleransi",
      "Peran mahasiswa dalam menjaga NKRI",
    ],
    method: "Ceramah tematik dan diskusi panel",
    evaluation: "Esai reflektif dan diskusi panel",
  },
  {
    id: "analisis-sosial",
    title: "Analisis Sosial",
    hours: 4,
    objective:
      "Peserta mampu melakukan pemetaan masalah sosial di lingkungan sekitar menggunakan kerangka analisis sederhana.",
    topics: [
      "Metode pemetaan masalah sosial (problem tree)",
      "Teknik wawancara dan observasi lapangan",
      "Penyusunan rekomendasi kebijakan sederhana",
      "Studi kasus isu lokal di sekitar Komisariat",
    ],
    method: "Praktik lapangan (field study) singkat dan presentasi temuan",
    evaluation: "Laporan hasil analisis sosial kelompok",
  },
  {
    id: "dkt",
    title: "Diskusi Kelompok Terarah (DKT)",
    hours: 3,
    objective:
      "Peserta melatih kemampuan berargumentasi, mendengarkan aktif, dan menyusun kesimpulan kolektif dalam forum diskusi.",
    topics: [
      "Teknik fasilitasi diskusi",
      "Etika berargumentasi dan menyanggah pendapat",
      "Penyusunan kesimpulan dan rekomendasi hasil diskusi",
    ],
    method: "Diskusi kelompok terarah dengan fasilitator",
    evaluation: "Penilaian keaktifan dan kualitas argumentasi",
  },
];

export const LK2_ASSESSMENT = {
  components: [
    { label: "Kehadiran", weight: 20 },
    { label: "Tugas & Partisipasi", weight: 30 },
    { label: "Ujian Tertulis", weight: 30 },
    { label: "Sikap & Etika", weight: 20 },
  ],
  criteria: [
    { range: "≥ 80", status: "Lulus" },
    { range: "70 – 79", status: "Lulus Bersyarat (wajib bimbingan lanjutan)" },
    { range: "< 70", status: "Tidak Lulus" },
  ],
};

export const LK2_CERTIFICATION = [
  "Peserta yang dinyatakan Lulus atau Lulus Bersyarat berhak mendapatkan sertifikat kelulusan LK2",
  "SK Kelulusan diterbitkan oleh Cabang dan ditandatangani oleh Master of Training (MOT)",
  "Sertifikat dan SK Kelulusan dapat diterbitkan melalui halaman detail masing-masing batch LK2",
];

export interface Lk2DocSection {
  id: string;
  title: string;
}

export const LK2_DOC_SECTIONS: Lk2DocSection[] = [
  { id: "pendahuluan", title: "Pendahuluan" },
  { id: "syarat-peserta", title: "Syarat Peserta" },
  { id: "alur-pendaftaran", title: "Alur Pendaftaran" },
  { id: "peraturan-kelas", title: "Peraturan Kelas" },
  { id: "mot", title: "Master of Training" },
  { id: "instruktur", title: "Tim Instruktur" },
  { id: "kurikulum", title: "Kurikulum & Materi" },
  { id: "penilaian", title: "Sistem Penilaian" },
  { id: "sertifikasi", title: "Sertifikasi & SK Kelulusan" },
];
