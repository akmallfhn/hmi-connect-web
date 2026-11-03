// Campaign content for /pages/kongres-hmi-xxxiii. Only the theme, logo, and national committee are official; the rest is placeholder.

export const KONGRES_PATH = "/pages/kongres-hmi-xxxiii";
export const KONGRES_HASHTAG = "KongresHMI33Lampung";
export const KONGRES_STARTS_AT = "2026-11-28T08:00:00+07:00";
export const KONGRES_ENDS_AT = "2026-12-05T23:59:00+07:00";
export const KONGRES_THEME = "Akselerasi HMI Untuk Kedaulatan Nasional";

// Every Kongres asset sits flat in the CDN's /kongres folder (no subfolders).
const KONGRES_CDN = "https://cdn.hmiconnect.id/kongres";
export const kongresAsset = (file: string) => `${KONGRES_CDN}/${file}`;

export type KongresPhoto = {
  src: string;
  alt: string;
  credit: string;
  license: string;
  sourceUrl: string;
};

// Wikimedia Commons, hotlinked at a standard thumbnail width; credits render in the page footer.
function commons(path: string, credit: string, license: string, alt: string): KongresPhoto {
  const name = path.split("/").pop() ?? "";
  return {
    src: `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/1280px-${name}`,
    alt,
    credit,
    license,
    sourceUrl: `https://commons.wikimedia.org/wiki/File:${decodeURIComponent(name)}`,
  };
}

export const KONGRES_PHOTOS = {
  city: commons("c/ca/Bandar_Lampung.JPG", "22Kartika", "CC BY-SA 3.0", "Lanskap Kota Bandar Lampung"),
  cityPanorama: commons("2/23/Bandar_Lampung_banner.JPG", "22Kartika", "CC BY-SA 3.0", "Panorama Kota Bandar Lampung"),
  cityPortrait: commons(
    "7/7d/Portrait_view_of_Bandar_Lampung%2C_Lampung_%2829_December_2019%29.jpg",
    "Firzafp",
    "CC BY-SA 4.0",
    "Kota Bandar Lampung dari ketinggian",
  ),
  adipura: commons(
    "d/d6/Bundaran_Tugu_Adipura_Bandar_Lampung.JPG",
    "Sakurai Midori",
    "CC BY-SA 3.0",
    "Bundaran Tugu Adipura",
  ),
  furqon: commons(
    "2/29/Masjid_Agung_Al-Furqon_Bandar_Lampung.jpg",
    "Xiangliangzai",
    "CC BY-SA 4.0",
    "Masjid Agung Al-Furqon",
  ),
  siger: commons(
    "7/78/Port_of_Bakauheni_and_Siger_Tower.JPG",
    "Sakurai Midori",
    "CC BY 2.5",
    "Menara Siger di Bakauheni",
  ),
  pahawang: commons(
    "e/e5/Pahawang_Island%2C_Indonesia.jpg",
    "Fidelia Zheng",
    "CC0",
    "Pulau Pahawang",
  ),
  unila: commons(
    "1/12/Lampung_University_Rectorate_Building.jpg",
    "Crisco 1492",
    "CC BY-SA 3.0",
    "Gedung Rektorat Universitas Lampung",
  ),
  tapis: commons("6/6a/Kain_tapis.JPG", "Midori", "CC BY 2.5", "Kain Tapis Lampung"),
  elephant: commons("4/4c/Elephant_bath_time.jpg", "Jinda Zain", "CC BY 4.0", "Gajah Sumatera di Way Kambas"),
  wayKambas: commons("7/7a/TN_Way_Kambas.jpg", "Mustiadewi", "CC BY-SA 4.0", "Taman Nasional Way Kambas"),
} satisfies Record<string, KongresPhoto>;

export const KONGRES_STATS = [
  { value: "8", unit: "Hari", label: "Persidangan & agenda" },
  { value: "200+", unit: "Cabang", label: "Utusan se-Indonesia" },
  { value: "1.500+", unit: "Peserta", label: "Utusan & peninjau" },
  { value: "6", unit: "Lokasi", label: "Di Bandar Lampung" },
];

export const KONGRES_LOGO_DOWNLOADS = [
  {
    title: "Logo Lengkap",
    description: "PNG transparan resolusi tinggi untuk cetak dan baliho.",
    meta: "PNG · 3256 × 3944",
    href: kongresAsset("logo-kongres-xxxiii-hd.png"),
    downloadName: "logo-kongres-hmi-xxxiii-hd",
    preview: kongresAsset("logo-kongres-xxxiii.png"),
    dark: false,
  },
  {
    title: "Logo Horizontal",
    description: "Versi mendatar untuk latar terang: kop surat, spanduk, dan slide.",
    meta: "PNG · 1600 × 398",
    href: kongresAsset("logo-kongres-xxxiii-horizontal-light.png"),
    downloadName: "logo-kongres-hmi-xxxiii-horizontal",
    preview: kongresAsset("logo-kongres-xxxiii-horizontal-light.png"),
    dark: false,
  },
  {
    title: "Logo Horizontal Gelap",
    description: "Versi mendatar bertulisan putih, khusus untuk latar gelap.",
    meta: "PNG · 10072 × 2754",
    href: kongresAsset("logo-kongres-xxxiii-horizontal-hd.png"),
    downloadName: "logo-kongres-hmi-xxxiii-horizontal-gelap",
    preview: kongresAsset("logo-kongres-xxxiii-horizontal.png"),
    dark: true,
  },
  {
    title: "Emblem",
    description: "Lambang tanpa tulisan untuk ikon, stiker, dan watermark.",
    meta: "PNG · 695 × 800",
    href: kongresAsset("emblem-kongres-xxxiii.png"),
    downloadName: "emblem-kongres-hmi-xxxiii",
    preview: kongresAsset("emblem-kongres-xxxiii.png"),
    dark: false,
  },
];

// Copy and icons follow the committee's "Filosofi Logo" sheet; icons are cropped from its source files.
export const KONGRES_LOGO_PHILOSOPHY = [
  {
    title: "Siger Lampung",
    icon: kongresAsset("siger.png"),
    body: "Siger merupakan simbol kehormatan dan identitas budaya masyarakat Lampung. Kehadirannya dalam logo melambangkan kemuliaan, kebijaksanaan, serta penghormatan terhadap adat dan tradisi sebagai bagian dari identitas daerah tuan rumah Kongres XXXIII HMI.",
  },
  {
    title: "Gajah",
    icon: kongresAsset("gajah.png"),
    body: "Gajah merupakan satwa ikonik Lampung yang merepresentasikan kekuatan, keteguhan, dan kebijaksanaan. Sepasang gajah dalam logo melambangkan persatuan, solidaritas, serta semangat kebersamaan kader HMI dalam menghadapi tantangan dan memperjuangkan tujuan organisasi.",
  },
  {
    title: "Tugu Adipura",
    icon: kongresAsset("tugu-adipura.png"),
    body: "Tugu Adipura menjadi representasi identitas Kota Bandar Lampung sebagai lokasi penyelenggaraan kongres. Elemen ini melambangkan kemajuan, kebanggaan daerah, dan semangat membangun, sekaligus menjadi pengingat akan pentingnya kontribusi nyata HMI bagi masyarakat, daerah, dan bangsa.",
  },
  {
    title: "Kelopak Bunga",
    icon: kongresAsset("kelopak-bunga.png"),
    body: "Bentuk bunga atau kelopak melambangkan pertumbuhan, keharmonisan, dan regenerasi. Elemen ini menggambarkan proses perkaderan HMI dalam melahirkan generasi yang berintelektualitas, berkarakter, dan berintegritas, serta mampu berkembang tanpa meninggalkan nilai-nilai luhur budaya.",
  },
  {
    title: "Bulan Bintang",
    icon: kongresAsset("bulan-bintang.png"),
    body: "Bulan bintang merepresentasikan nilai-nilai keislaman sebagai landasan utama perjuangan HMI. Simbol ini menggambarkan cahaya petunjuk, harapan, dan semangat pembaruan dalam membentuk kader yang beriman, berintegritas, serta berpegang teguh pada nilai-nilai Islam.",
  },
  {
    title: "Motif Lampung",
    icon: kongresAsset("motif-lampung.png"),
    body: "Motif Lampung merepresentasikan kekayaan seni dan warisan budaya masyarakat setempat. Susunan motif yang berulang melambangkan kesinambungan, keteraturan, dan persatuan, sekaligus menegaskan pentingnya menjaga jati diri budaya sebagai bagian dari perjalanan menuju masa depan.",
  },
];

// The four-colour strip closing the philosophy sheet.
export const KONGRES_BRAND_COLORS = ["#0b5d33", "#0a9a4a", "#f2c52f", "#1a1a1a"];

// randomuser.me portraits are generic placeholders for the sample "momen" posts.
const portrait = (gender: "men" | "women", id: number) =>
  `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;

export type KongresCommitteeMember = {
  name: string;
  role: string;
  photo: string;
  leader?: boolean;
  // Set only where an HMI Connect profile was confirmed by full name or the member's Instagram handle.
  username?: string;
};

// The Panitia Nasional (Panasko) as announced on @kongreshmike33_lampung; portraits are background-removed cutouts.
const panitia = (slug: string) => kongresAsset(`${slug}.webp`);

export const KONGRES_NATIONAL_COMMITTEE: KongresCommitteeMember[] = [
  { name: "Mauldan Agusta Rifanda", role: "Ketua Panitia Nasional Kongres", photo: panitia("mauldan-agusta-rifanda"), leader: true },
  { name: "Ramanda Ansori", role: "Sekretaris Panitia Nasional Kongres", photo: panitia("ramanda-ansori"), leader: true },
  { name: "Anida", role: "Bendahara Panitia Nasional Kongres", photo: panitia("anida"), leader: true, username: "anida" },
  { name: "Putri Haryani", role: "Kepala Divisi Acara Kongres", photo: panitia("putri-haryani") },
  { name: "Andika Pezri Mulia", role: "Kepala Divisi HUMAS Internal", photo: panitia("andika-pezri-mulia") },
  { name: "Mahdi Arifan", role: "Kepala Divisi HUMAS Eksternal", photo: panitia("mahdi-arifan") },
  { name: "Fathan Taufiq", role: "Kepala Divisi Media & Informasi", photo: panitia("fathan-taufiq") },
  { name: "Abdul Kayum N", role: "Kepala Divisi Konten Kreatif & Dokumentasi", photo: panitia("abdul-kayum-n") },
  { name: "Gunawan Al Bima", role: "Kepala Divisi Keamanan", photo: panitia("gunawan-al-bima") },
  { name: "Muaidin", role: "Kepala Divisi Konsumsi", photo: panitia("muaidin") },
  { name: "Rahimun", role: "Kepala Divisi Kesehatan", photo: panitia("rahimun") },
  { name: "A. Muh. Satriansyah", role: "Kepala Divisi Sarana & Prasarana", photo: panitia("a-muh-satriansyah") },
  { name: "Dini Yuliana Solin", role: "Kepala Divisi Transportasi", photo: panitia("dini-yuliana-solin") },
];

// The Steering Committee as announced by the committee; only call names were published, so that is what shows.
const sc = (slug: string) => kongresAsset(`${slug}.webp`);

export const KONGRES_STEERING_COMMITTEE: KongresCommitteeMember[] = [
  { name: "Sukrin", role: "Koordinator SC Kongres", photo: sc("sukrin"), leader: true, username: "sukrin" },
  { name: "Gian", role: "Sekretaris SC Kongres", photo: sc("gian"), leader: true },
  ...(
    [
      ["Rheno", "rheno"],
      ["Yusuf", "yusuf"],
      ["Arsyi", "arsyi"],
      ["Romadhon", "romadhon", "romaadhon.odn"],
      ["Syaiful", "syaiful", "amsyaifull"],
      ["Nur Ghina", "nur-ghina", "nurghinaa"],
      ["Ilham Mandala", "ilham-mandala"],
      ["Maryadi", "maryadi"],
      ["Sri Meisista", "sri-meisista", "srimeisista"],
      ["Ramon", "ramon"],
      ["A Hakim El", "a-hakim-el"],
      ["Nur Hariyani", "nur-hariyani", "nurhariyani_"],
      ["Rifyan", "rifyan", "officialrrs7"],
      ["Ibnu", "ibnu"],
      ["Dini Asmiatul", "dini-asmiatul", "diniasmiatul"],
      ["Fajar", "fajar"],
      ["Alif", "alif"],
    ] as [string, string, string?][]
  ).map(([name, slug, username]) => ({ name, role: "Anggota SC Kongres", photo: sc(slug), username })),
];

export const KONGRES_HOST_FACTS = [
  { value: "1,1 jt", label: "Penduduk" },
  { value: "197 km²", label: "Luas kota" },
  { value: "20", label: "Kecamatan" },
  { value: "1682", label: "Berdiri sejak" },
];

export const KONGRES_HOST_HIGHLIGHTS = [
  {
    title: "Gerbang Sumatera",
    body: "Pintu masuk utama dari Jawa melalui Bakauheni, ditandai Menara Siger yang ikonik.",
    photo: KONGRES_PHOTOS.siger,
  },
  {
    title: "Tapis & Siger",
    body: "Tenun tapis bersulam benang emas dan mahkota siger menjadi kebanggaan budaya Lampung.",
    photo: KONGRES_PHOTOS.tapis,
  },
  {
    title: "Rumah Gajah Sumatera",
    body: "Taman Nasional Way Kambas melestarikan gajah Sumatera, salah satu yang tertua di Indonesia.",
    photo: KONGRES_PHOTOS.elephant,
  },
  {
    title: "Teluk & Pulau",
    body: "Pahawang dan Teluk Lampung menawarkan laut jernih hanya satu jam dari pusat kota.",
    photo: KONGRES_PHOTOS.pahawang,
  },
];

export const KONGRES_CULINARY = ["Seruit", "Kopi Robusta Lampung", "Keripik Pisang", "Pempek Lampung", "Gulai Taboh", "Lapis Legit"];

export type KongresVenue = {
  id: string;
  name: string;
  role: string;
  address: string;
  schedule: string;
  capacity: string;
  mapQuery: string;
  photo: KongresPhoto;
};

export const KONGRES_VENUES: KongresVenue[] = [
  {
    id: "pembukaan",
    name: "GOR Saburai",
    role: "Pembukaan Kongres",
    address: "Jl. Jend. Sudirman, Enggal, Bandar Lampung",
    schedule: "Sabtu, 28 November 2026",
    capacity: "5.000 orang",
    mapQuery: "GOR Saburai Bandar Lampung",
    photo: KONGRES_PHOTOS.adipura,
  },
  {
    id: "pleno",
    name: "GSG Universitas Lampung",
    role: "Sidang Pleno",
    address: "Jl. Prof. Dr. Sumantri Brojonegoro, Rajabasa",
    schedule: "29 November – 4 Desember 2026",
    capacity: "2.000 orang",
    mapQuery: "Gedung Serba Guna Universitas Lampung",
    photo: KONGRES_PHOTOS.unila,
  },
  {
    id: "komisi",
    name: "Kompleks Fakultas Unila",
    role: "Sidang Komisi",
    address: "Kampus Universitas Lampung, Gedong Meneng",
    schedule: "30 November – 2 Desember 2026",
    capacity: "6 ruang komisi",
    mapQuery: "Universitas Lampung",
    photo: KONGRES_PHOTOS.unila,
  },
  {
    id: "sekretariat",
    name: "Hotel Novotel Lampung",
    role: "Sekretariat & Media Center",
    address: "Jl. Gatot Subroto No. 136, Tanjung Karang",
    schedule: "Buka 24 jam selama Kongres",
    capacity: "Pusat registrasi",
    mapQuery: "Novotel Lampung",
    photo: KONGRES_PHOTOS.city,
  },
  {
    id: "penutupan",
    name: "Mahan Agung",
    role: "Penutupan & Ramah Tamah",
    address: "Jl. Dr. Susilo No. 1, Teluk Betung",
    schedule: "Sabtu, 5 Desember 2026",
    capacity: "1.500 orang",
    mapQuery: "Mahan Agung Bandar Lampung",
    photo: KONGRES_PHOTOS.cityPortrait,
  },
  {
    id: "ziarah",
    name: "Masjid Agung Al-Furqon",
    role: "Shalat Jumat & Tausiyah",
    address: "Jl. Diponegoro, Teluk Betung Utara",
    schedule: "Jumat, 4 Desember 2026",
    capacity: "10.000 jamaah",
    mapQuery: "Masjid Agung Al-Furqon Bandar Lampung",
    photo: KONGRES_PHOTOS.furqon,
  },
];

export type KongresAgendaItem = {
  time: string;
  title: string;
  venue: string;
  tag: "Seremoni" | "Sidang" | "Pemilihan" | "Budaya" | "Ibadah" | "Logistik";
  highlight?: boolean;
};

export type KongresDay = {
  date: string;
  weekday: string;
  phase: string;
  agenda: KongresAgendaItem[];
};

export const KONGRES_RUNDOWN: KongresDay[] = [
  {
    date: "28 Nov",
    weekday: "Sabtu",
    phase: "Pembukaan",
    agenda: [
      { time: "06.00", title: "Kedatangan & registrasi utusan cabang", venue: "Hotel Novotel Lampung", tag: "Logistik" },
      { time: "09.00", title: "Kirab budaya & arak-arakan bendera cabang", venue: "Jl. Jend. Sudirman", tag: "Budaya" },
      { time: "13.30", title: "Upacara pembukaan Kongres XXXIII", venue: "GOR Saburai", tag: "Seremoni", highlight: true },
      { time: "16.00", title: "Pidato kebangsaan & sambutan tuan rumah", venue: "GOR Saburai", tag: "Seremoni" },
      { time: "19.30", title: "Malam ramah tamah utusan", venue: "Mahan Agung", tag: "Budaya" },
    ],
  },
  {
    date: "29 Nov",
    weekday: "Minggu",
    phase: "Sidang Pleno I",
    agenda: [
      { time: "08.00", title: "Pengesahan jadwal acara & tata tertib", venue: "GSG Unila", tag: "Sidang", highlight: true },
      { time: "13.00", title: "Pemilihan presidium sidang", venue: "GSG Unila", tag: "Pemilihan" },
      { time: "19.30", title: "Laporan pertanggungjawaban PB HMI", venue: "GSG Unila", tag: "Sidang" },
    ],
  },
  {
    date: "30 Nov",
    weekday: "Senin",
    phase: "Sidang Pleno II",
    agenda: [
      { time: "08.00", title: "Pandangan umum cabang atas LPJ", venue: "GSG Unila", tag: "Sidang" },
      { time: "14.00", title: "Jawaban PB HMI atas pandangan umum", venue: "GSG Unila", tag: "Sidang" },
      { time: "20.00", title: "Pembagian sidang komisi", venue: "GSG Unila", tag: "Sidang", highlight: true },
    ],
  },
  {
    date: "1 Des",
    weekday: "Selasa",
    phase: "Sidang Komisi",
    agenda: [
      { time: "08.00", title: "Komisi A: Konstitusi & organisasi", venue: "Kompleks Fakultas Unila", tag: "Sidang" },
      { time: "08.00", title: "Komisi B: Pedoman perkaderan", venue: "Kompleks Fakultas Unila", tag: "Sidang" },
      { time: "08.00", title: "Komisi C: Rekomendasi eksternal", venue: "Kompleks Fakultas Unila", tag: "Sidang" },
      { time: "19.30", title: "Diskusi publik: Kader dan Indonesia Emas 2045", venue: "GSG Unila", tag: "Seremoni" },
    ],
  },
  {
    date: "2 Des",
    weekday: "Rabu",
    phase: "Sidang Komisi",
    agenda: [
      { time: "08.00", title: "Lanjutan sidang komisi", venue: "Kompleks Fakultas Unila", tag: "Sidang" },
      { time: "15.00", title: "Finalisasi draf hasil komisi", venue: "Kompleks Fakultas Unila", tag: "Sidang" },
      { time: "20.00", title: "Malam budaya Lampung", venue: "GSG Unila", tag: "Budaya", highlight: true },
    ],
  },
  {
    date: "3 Des",
    weekday: "Kamis",
    phase: "Sidang Pleno III",
    agenda: [
      { time: "08.00", title: "Pengesahan hasil sidang komisi", venue: "GSG Unila", tag: "Sidang" },
      { time: "14.00", title: "Penyampaian visi calon Ketua Umum", venue: "GSG Unila", tag: "Pemilihan", highlight: true },
      { time: "20.00", title: "Debat calon Ketua Umum PB HMI", venue: "GSG Unila", tag: "Pemilihan" },
    ],
  },
  {
    date: "4 Des",
    weekday: "Jumat",
    phase: "Pemilihan",
    agenda: [
      { time: "08.00", title: "Pemungutan suara Ketua Umum PB HMI", venue: "GSG Unila", tag: "Pemilihan", highlight: true },
      { time: "11.30", title: "Shalat Jumat & tausiyah", venue: "Masjid Agung Al-Furqon", tag: "Ibadah" },
      { time: "15.00", title: "Penghitungan suara & penetapan", venue: "GSG Unila", tag: "Pemilihan" },
    ],
  },
  {
    date: "5 Des",
    weekday: "Sabtu",
    phase: "Penutupan",
    agenda: [
      { time: "09.00", title: "Pelantikan formatur & mide formatur", venue: "GSG Unila", tag: "Seremoni" },
      { time: "14.00", title: "Upacara penutupan Kongres XXXIII", venue: "Mahan Agung", tag: "Seremoni", highlight: true },
      { time: "16.00", title: "Kepulangan utusan cabang", venue: "Hotel Novotel Lampung", tag: "Logistik" },
    ],
  },
];

export type KongresNews = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  photo: KongresPhoto;
};

export const KONGRES_NEWS: KongresNews[] = [
  {
    id: "persiapan-final",
    category: "Panitia",
    title: "Panitia Pastikan Enam Lokasi Kongres XXXIII Siap Sambut 1.500 Utusan",
    excerpt:
      "Gladi lokasi dilakukan di GOR Saburai dan Universitas Lampung. Panitia menargetkan seluruh venue rampung sepekan sebelum pembukaan.",
    date: "2 November 2026",
    photo: KONGRES_PHOTOS.unila,
  },
  {
    id: "tema-kongres",
    category: "Persidangan",
    title: "SC Umumkan Tema Kongres: Akselerasi HMI Untuk Kedaulatan Nasional",
    excerpt: "Tema dipilih untuk menegaskan peran kader HMI dalam menjaga kedaulatan bangsa di tengah perubahan global.",
    date: "30 Oktober 2026",
    photo: KONGRES_PHOTOS.city,
  },
  {
    id: "registrasi-dibuka",
    category: "Registrasi",
    title: "Registrasi Utusan Cabang Dibuka hingga 20 November",
    excerpt: "Setiap cabang penuh mengirim utusan sesuai kuota; peninjau mendaftar melalui Badko masing-masing.",
    date: "28 Oktober 2026",
    photo: KONGRES_PHOTOS.adipura,
  },
  {
    id: "lampung-siap",
    category: "Tuan Rumah",
    title: "Pemprov Lampung Siapkan Transportasi Gratis bagi Peserta Kongres",
    excerpt: "Bus antarvenue beroperasi setiap 30 menit dari hotel utusan ke Universitas Lampung.",
    date: "25 Oktober 2026",
    photo: KONGRES_PHOTOS.cityPortrait,
  },
  {
    id: "malam-budaya",
    category: "Budaya",
    title: "Malam Budaya Lampung Hadirkan Tari Sigeh Pengunten dan Tapis Kolosal",
    excerpt: "Pertunjukan digelar 2 Desember dan terbuka untuk masyarakat umum.",
    date: "21 Oktober 2026",
    photo: KONGRES_PHOTOS.tapis,
  },
];

export type KongresMoment = {
  id: string;
  author: string;
  username: string;
  avatar: string;
  caption: string;
  photo: KongresPhoto;
  likes: number;
  tall?: boolean;
};

export const KONGRES_MOMENTS: KongresMoment[] = [
  {
    id: "m1",
    author: "HMI Cabang Bandar Lampung",
    username: "hmicabangbandarlampung",
    avatar: portrait("men", 22),
    caption: "Gladi bersih di GOR Saburai. Bandar Lampung siap menyambut kader se-Indonesia! 🔥",
    photo: KONGRES_PHOTOS.adipura,
    likes: 1240,
  },
  {
    id: "m2",
    author: "Nadia Putri",
    username: "nadiaputri",
    avatar: portrait("women", 44),
    caption: "Masjid Al-Furqon, tempat shalat Jumat bersama utusan nanti.",
    photo: KONGRES_PHOTOS.furqon,
    likes: 864,
    tall: true,
  },
  {
    id: "m3",
    author: "Rizky Maulana",
    username: "rizkymaulana",
    avatar: portrait("men", 41),
    caption: "Sepulang sidang, Pahawang menunggu. Siapa ikut?",
    photo: KONGRES_PHOTOS.pahawang,
    likes: 2310,
  },
  {
    id: "m4",
    author: "KOHATI Cabang Metro",
    username: "kohatimetro",
    avatar: portrait("women", 65),
    caption: "Tapis untuk delegasi KOHATI sudah siap dibagikan.",
    photo: KONGRES_PHOTOS.tapis,
    likes: 732,
  },
  {
    id: "m5",
    author: "Dimas Prakoso",
    username: "dimasprakoso",
    avatar: portrait("men", 75),
    caption: "Way Kambas, inspirasi gajah di logo Kongres kita.",
    photo: KONGRES_PHOTOS.elephant,
    likes: 1588,
    tall: true,
  },
  {
    id: "m6",
    author: "Salsabila Nur",
    username: "salsabilanur",
    avatar: portrait("women", 33),
    caption: "Meja registrasi utusan sudah berdiri. Sampai jumpa 28 November!",
    photo: KONGRES_PHOTOS.city,
    likes: 506,
  },
];
