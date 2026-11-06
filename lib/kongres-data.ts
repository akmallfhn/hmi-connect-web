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
  adipura: commons(
    "d/d6/Bundaran_Tugu_Adipura_Bandar_Lampung.JPG",
    "Sakurai Midori",
    "CC BY-SA 3.0",
    "Bundaran Tugu Adipura",
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
  tapis: commons("6/6a/Kain_tapis.JPG", "Midori", "CC BY 2.5", "Kain Tapis Lampung"),
  elephant: commons("4/4c/Elephant_bath_time.jpg", "Jinda Zain", "CC BY 4.0", "Gajah Sumatera di Way Kambas"),
} satisfies Record<string, KongresPhoto>;

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
  { name: "Putri Haryani", role: "Kepala Divisi Acara Kongres", photo: panitia("putri-haryani"), username: "putrikhalif" },
  { name: "Andika Pezri Mulia", role: "Kepala Divisi HUMAS Internal", photo: panitia("andika-pezri-mulia") },
  { name: "Mahdi Arifan", role: "Kepala Divisi HUMAS Eksternal", photo: panitia("mahdi-arifan") },
  { name: "Fathan Taufiq", role: "Kepala Divisi Media & Informasi", photo: panitia("fathan-taufiq") },
  { name: "Abdul Kayum N", role: "Kepala Divisi Konten Kreatif & Dokumentasi", photo: panitia("abdul-kayum-n") },
  { name: "Gunawan Al Bima", role: "Kepala Divisi Keamanan", photo: panitia("gunawan-al-bima"), username: "albima" },
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
      ["Ilham Mandala", "ilham-mandala", "anugrah_16"],
      ["Maryadi", "maryadi", "yadi"],
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

export const KONGRES_MAIN_VENUE = {
  id: "pkor-way-halim",
  name: "PKOR Way Halim",
  label: "Lokasi Utama Kongres",
  address: "Perumnas Way Halim, Kec. Way Halim, Kota Bandar Lampung",
  description: "Pusat kegiatan Kongres XXXIII HMI pada 28 November–5 Desember 2026.",
  mapQuery: "PKOR Way Halim Lampung",
};

export type KongresTransportRoute = {
  id: "airport" | "port" | "north-sumatra";
  title: string;
  steps: string[];
  mapOrigin: string;
  mapLabel: string;
};

export const KONGRES_TRANSPORT_ROUTES: KongresTransportRoute[] = [
  {
    id: "airport",
    title: "Dari Bandara Radin Inten II",
    steps: [
      "Paling praktis gunakan taksi resmi bandara atau transportasi daring langsung ke PKOR Way Halim.",
      "Jika menggunakan angkutan menuju Bandar Lampung, lanjutkan dari titik turun dengan taksi atau transportasi daring.",
    ],
    mapOrigin: "Bandar Udara Internasional Radin Inten II Lampung",
    mapLabel: "Rute bandara ke PKOR",
  },
  {
    id: "port",
    title: "Dari Pelabuhan Bakauheni",
    steps: [
      "Naik bus atau travel tujuan Bandar Lampung atau Terminal Rajabasa.",
      "Dari titik turun, lanjutkan dengan taksi atau transportasi daring menuju PKOR Way Halim.",
    ],
    mapOrigin: "Pelabuhan Bakauheni Lampung",
    mapLabel: "Rute pelabuhan ke PKOR",
  },
  {
    id: "north-sumatra",
    title: "Dari Arah Sumatera",
    steps: [
      "Dengan bus AKAP, pilih perjalanan tujuan Terminal Rajabasa, Bandar Lampung.",
      "Dengan kendaraan pribadi, lanjutkan melalui Jalan Lintas Sumatera atau Jalan Tol Trans Sumatera dan ikuti navigasi menuju PKOR Way Halim.",
      "Dari Terminal Rajabasa, gunakan taksi atau transportasi daring untuk perjalanan terakhir ke lokasi.",
    ],
    mapOrigin: "Terminal Rajabasa Bandar Lampung",
    mapLabel: "Rute Rajabasa ke PKOR",
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
      { time: "06.00", title: "Kedatangan & registrasi utusan cabang", venue: KONGRES_MAIN_VENUE.name, tag: "Logistik" },
      { time: "09.00", title: "Kirab budaya & arak-arakan bendera cabang", venue: KONGRES_MAIN_VENUE.name, tag: "Budaya" },
      { time: "13.30", title: "Upacara pembukaan Kongres XXXIII", venue: KONGRES_MAIN_VENUE.name, tag: "Seremoni", highlight: true },
      { time: "16.00", title: "Pidato kebangsaan & sambutan tuan rumah", venue: KONGRES_MAIN_VENUE.name, tag: "Seremoni" },
      { time: "19.30", title: "Malam ramah tamah utusan", venue: KONGRES_MAIN_VENUE.name, tag: "Budaya" },
    ],
  },
  {
    date: "29 Nov",
    weekday: "Minggu",
    phase: "Sidang Pleno I",
    agenda: [
      { time: "08.00", title: "Pengesahan jadwal acara & tata tertib", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang", highlight: true },
      { time: "13.00", title: "Pemilihan presidium sidang", venue: KONGRES_MAIN_VENUE.name, tag: "Pemilihan" },
      { time: "19.30", title: "Laporan pertanggungjawaban PB HMI", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang" },
    ],
  },
  {
    date: "30 Nov",
    weekday: "Senin",
    phase: "Sidang Pleno II",
    agenda: [
      { time: "08.00", title: "Pandangan umum cabang atas LPJ", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang" },
      { time: "14.00", title: "Jawaban PB HMI atas pandangan umum", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang" },
      { time: "20.00", title: "Pembagian sidang komisi", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang", highlight: true },
    ],
  },
  {
    date: "1 Des",
    weekday: "Selasa",
    phase: "Sidang Komisi",
    agenda: [
      { time: "08.00", title: "Komisi A: Konstitusi & organisasi", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang" },
      { time: "08.00", title: "Komisi B: Pedoman perkaderan", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang" },
      { time: "08.00", title: "Komisi C: Rekomendasi eksternal", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang" },
      { time: "19.30", title: "Diskusi publik: Kader dan Indonesia Emas 2045", venue: KONGRES_MAIN_VENUE.name, tag: "Seremoni" },
    ],
  },
  {
    date: "2 Des",
    weekday: "Rabu",
    phase: "Sidang Komisi",
    agenda: [
      { time: "08.00", title: "Lanjutan sidang komisi", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang" },
      { time: "15.00", title: "Finalisasi draf hasil komisi", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang" },
      { time: "20.00", title: "Malam budaya Lampung", venue: KONGRES_MAIN_VENUE.name, tag: "Budaya", highlight: true },
    ],
  },
  {
    date: "3 Des",
    weekday: "Kamis",
    phase: "Sidang Pleno III",
    agenda: [
      { time: "08.00", title: "Pengesahan hasil sidang komisi", venue: KONGRES_MAIN_VENUE.name, tag: "Sidang" },
      { time: "14.00", title: "Penyampaian visi calon Ketua Umum", venue: KONGRES_MAIN_VENUE.name, tag: "Pemilihan", highlight: true },
      { time: "20.00", title: "Debat calon Ketua Umum PB HMI", venue: KONGRES_MAIN_VENUE.name, tag: "Pemilihan" },
    ],
  },
  {
    date: "4 Des",
    weekday: "Jumat",
    phase: "Pemilihan",
    agenda: [
      { time: "08.00", title: "Pemungutan suara Ketua Umum PB HMI", venue: KONGRES_MAIN_VENUE.name, tag: "Pemilihan", highlight: true },
      { time: "11.30", title: "Jeda salat Jumat", venue: KONGRES_MAIN_VENUE.name, tag: "Ibadah" },
      { time: "15.00", title: "Penghitungan suara & penetapan", venue: KONGRES_MAIN_VENUE.name, tag: "Pemilihan" },
    ],
  },
  {
    date: "5 Des",
    weekday: "Sabtu",
    phase: "Penutupan",
    agenda: [
      { time: "09.00", title: "Pelantikan formatur & mide formatur", venue: KONGRES_MAIN_VENUE.name, tag: "Seremoni" },
      { time: "14.00", title: "Upacara penutupan Kongres XXXIII", venue: KONGRES_MAIN_VENUE.name, tag: "Seremoni", highlight: true },
      { time: "16.00", title: "Kepulangan utusan cabang", venue: KONGRES_MAIN_VENUE.name, tag: "Logistik" },
    ],
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
    caption: "Persiapan PKOR Way Halim terus berjalan. Bandar Lampung siap menyambut kader se-Indonesia! 🔥",
    photo: KONGRES_PHOTOS.adipura,
    likes: 1240,
  },
  {
    id: "m2",
    author: "Nadia Putri",
    username: "nadiaputri",
    avatar: portrait("women", 44),
    caption: "Tiba dari Jawa lewat Bakauheni, gerbang menuju Kongres XXXIII.",
    photo: KONGRES_PHOTOS.siger,
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
