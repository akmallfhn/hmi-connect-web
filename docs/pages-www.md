# Akses halaman situs utama

Dokumen ini mencatat **route halaman** pada host `www` (segmen internal `/www` tidak tampak di URL). Mode **User** berarti tidak ada cookie `hmi_acting_account` yang valid. Mode **Entity** berarti cookie memilih entity yang masih memiliki grant `manage` tepat pada entity itu. Cookie tanpa grant yang berlaku diperlakukan sebagai mode User. `404` di bawah berasal dari pemeriksaan server, bukan hanya menu yang disembunyikan.

`(gated)` mewajibkan sesi dan mengarahkan akun yang belum aktif ke `/activation`. Untuk route di luar `(gated)`, ikuti catatan khusus pada tabel. `Login` berarti pengunjung diarahkan ke login, kadang dengan `redirectTo`. URL sebenarnya memakai `/organizational-documents` dan `/prayer-schedules`.

| Route | Belum login | Mode User | Mode Entity | Catatan |
| --- | --- | --- | --- | --- |
| `/` | Login | Feed pribadi | Timeline dan composer entity | Satu URL, dua tampilan; entity nonaktif menghasilkan 404. |
| `/settings` | Login | Pengaturan akun dan pilihan Official Account | **404** | Beralih kembali ke User tersedia di header desktop dan navigasi entity. |
| `/notifications` | Login | Notifikasi pribadi | **404** | Termasuk badge/list milik user. |
| `/articles` | Bisa baca | Katalog artikel dan tab pribadi | **404** | Pengunjung hanya mendapat tab publik. |
| `/articles/[article_slug]/[article_id]` | Bisa baca | Detail artikel | **404** | Slug dekoratif; artikel harus ditemukan. |
| `/articles/create` | Login | Tulis artikel | **404** | Perlu penulis dari sesi. |
| `/articles/[article_slug]/[article_id]/edit` | Login | Edit artikel sendiri; Super Admin juga diizinkan | **404** | Selain pemilik/Admin mendapat halaman forbidden. |
| `/organizational-documents` | Login | Daftar pedoman organisasi | **404** | Nama URL untuk “org documents”. |
| `/organizational-documents/[document_slug]/[document_id]` | Login | Detail dokumen | **404** | Dilindungi layout yang sama. |
| `/people-recommendation` | Login | Rekomendasi orang | **404** | Data personal. |
| `/quran` | Login | Daftar surah/juz | **404** | Dilindungi layout yang sama dengan turunannya. |
| `/quran/[surah_slug]` | Login | Bacaan surah | **404** |  |
| `/quran/juz/[juz_id]` | Login | Bacaan juz | **404** |  |
| `/prayer-schedules` | Login | Jadwal salat | **404** | Nama URL yang berlaku berbentuk jamak. |
| `/chats` | Login | Daftar percakapan pribadi | **404** | Termasuk semua halaman chat di bawah ini. |
| `/chats/new` | Login | Mulai percakapan | **404** |  |
| `/chats/[conversation_id]` | Login | Detail percakapan | **404** |  |
| `/events` | Login | Katalog event | Katalog event | Katalog saat ini memerlukan sesi; API event memakai token sesi. |
| `/events/[event_id]` | Login | Detail event dan aksi hadir | Detail event | Event tak ditemukan menghasilkan 404. |
| `/events/manage` | Login | **404** | Daftar event entity terpilih | Hanya cookie valid beserta grant saat ini yang dapat memilih entity. |
| `/events/manage/create` | Login | **404** | Buat event entity terpilih | Server Action juga mencocokkan entity pada payload. |
| `/events/manage/[event_id]` | Login | **404** | Form edit event entity terpilih | Event milik entity lain menghasilkan 404; Server Action update/delete memeriksa kepemilikan. |
| `/events/manage/[event_id]/edit` | Login | **404** | Redirect ke `/events/manage/[event_id]` | URL edit lama tetap bisa dibuka. |
| `/search` | Login | Pencarian sebagai user | Pencarian sebagai entity | Interaksi feed menggunakan identitas aktif. |
| `/feeds/[feed_id]` | Bisa baca | Detail feed dan interaksi user | Detail feed dan interaksi entity | Query lama `?as=` dibersihkan tanpa mengganti mode. |
| `/profile/[username]` | Bisa baca | Profil anggota | Profil anggota dengan interaksi entity | Profil yang tidak aktif/tidak ada menghasilkan 404. |
| `/profile/[username]/activities` | Bisa buka | Redirect ke tab aktivitas profil | Redirect ke tab aktivitas profil | Mengikuti gate route profil tujuan. |
| `/organizations/[organization_id]`, `/coordinating-bodies/[coordinating_body_id]`, `/branches/[branch_id]`, `/coordinating-chapters/[coordinating_chapter_id]`, `/chapters/[chapter_id]` | Login | Profil entity | Profil entity dengan interaksi entity | Kelima route berada di `(gated)` dan memeriksa entity aktif. |
| `/kohati/[mention_name]`, `/bpl/[mention_name]` | Login | Profil badan khusus | Profil badan khusus dengan interaksi entity | Keduanya berada di `(gated)`. |
| `/mentions/[mention_name]` | Redirect ke profil tujuan | Redirect ke profil tujuan | Redirect ke profil tujuan | Akses akhir mengikuti profil tujuan. |
| `/institutions/[institution_slug]/[institution_id]` | Bisa baca | Profil institusi | Profil institusi | Halaman publik. |
| `/trainings`, `/trainings/[training_id]` | Bisa baca | Katalog/detail pelatihan | Katalog/detail pelatihan | Halaman baca publik. |
| `/trainings/create`, `/trainings/[training_id]/edit` | Login | Buat/edit sesuai pemeriksaan pemilik dan verifikasi | Route saat ini belum memblokir mode Entity | Keduanya di luar `(gated)` dengan pemeriksaan sesi sendiri. |
| `/trainings/[training_id]/register` | 404 | 404 | 404 | Route registrasi belum diimplementasikan. |
| `/membership` | Login | Kartu keanggotaan | **404** | Perlu status verifikasi yang sesuai. |
| `/activation` | Login | Hanya akun berstatus `pending` | Tidak berlaku untuk akun pending | Selain pending diarahkan ke `/`. |
| `/verification` | Login | Hanya akun yang perlu mengirim verifikasi | **404** | Status verified/pending diarahkan ke `/`. |
| `/invitations/[grant_id]` | Login dengan `redirectTo` | Undangan akses sesuai aturan grant | **404** | Akun pending diarahkan ke aktivasi. |
| `/auth/login` | Form login | Redirect dari halaman login bila sudah bersesi | Redirect dari halaman login bila sudah bersesi | Aturan redirect ada di `next.config.mts`. |
| `/auth/forget-password`, `/reset-password/[session_id]` | Bisa buka | Bisa buka | Bisa buka | Alur pemulihan akun; akses final mengikuti validitas token reset. |
| `/pages/kongres-hmi-xxxiii`, `/pendataan-komisariat` | Bisa buka | Bisa buka | Bisa buka | Halaman kampanye/form publik. |

## Lokasi pemeriksaan mode

- `lib/user-mode.ts#requireUserMode` memanggil `selectedActingEntityRef` dan mengembalikan 404 untuk mode Entity. `components/layouts/UserOnlyWwwLayout.tsx` memasangnya pada root route personal di atas, termasuk kedua cabang `/articles`, `/membership`, `/verification`, dan `/invitations`. Layout `/chats` memanggil helper yang sama sebelum membangun UI percakapan.
- `components/pages/OfficialEventRoutes.tsx` mewajibkan pilihan Entity yang valid untuk seluruh `/events/manage` dan mencocokkan entity pemilik event pada form edit.
- `lib/acting-entity.ts` memvalidasi isi cookie terhadap ID user dan grant terkini. Beralih ke mode User menghapus cookie; sesi login tidak ikut dihapus.
