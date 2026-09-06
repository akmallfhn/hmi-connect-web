# Access Grant — Aturan Invite & Revoke

Ringkasan aturan hak akses admin di HMI Connect, disarikan dari `docs/api/access.md`
dan `docs/api/organization.md` pada backend `ordina`. Kalau backend mengubah aturannya,
perbarui dokumen ini juga.

Hierarki entitas: **Organisasi → Badko → Cabang → Korkom → Komisariat**.

Akses admin disimpan di tabel `access_grants`, satu baris per `(user, entity, capability)`.
`capability` saat ini selalu `manage`. `Super Admin` berada di luar tabel ini — ia akar dari
rantai grant, karena harus ada yang bisa memberikan grant pertama.

## 1. Invite — mengangkat admin

Menjangkau **ke bawah**. Ini satu-satunya governance action yang mengikuti aturan baca
(grant di entitas itu _atau di mana pun di atasnya_), bukan aturan governance, karena
begitulah level atas mengisi pos di bawahnya.

| Pemegang grant di ↓ / Target → | Organisasi | Badko | Cabang | Korkom | Komisariat |
| ------------------------------ | ---------- | ----- | ------ | ------ | ---------- |
| **Super Admin**                | ✅         | ✅    | ✅     | ✅     | ✅         |
| **Organisasi**                 | ✅ (peer)  | ✅    | ✅     | ✅     | ✅         |
| **Badko**                      | ❌         | ✅ (peer) | ✅ | ✅     | ✅         |
| **Cabang**                     | ❌         | ❌    | ✅ (peer) | ✅  | ✅         |
| **Korkom**                     | ❌         | ❌    | ❌     | ✅ (peer) | ✅      |
| **Komisariat**                 | ❌         | ❌    | ❌     | ❌     | ✅ (peer)  |

- **Horizontal di entitas sendiri**: boleh — itulah cara menambah sesama admin.
- **Horizontal ke lini lain** (admin Cabang A mengundang di Cabang B): `403`. Jangkauan ke
  bawah hanya berlaku dalam garis keturunannya sendiri.
- **Ke atas**: `403`.
- Undangan mendarat sebagai `pending` dan belum memberi akses apa pun sampai diterima
  lewat `/invitations/{grant_id}` di situs utama.

## 2. Revoke — mencabut akses

Kebalikannya: **horizontal saja, tidak menjangkau ke bawah**.

| Pemegang grant di ↓ / Target → | Organisasi | Badko | Cabang | Korkom | Komisariat |
| ------------------------------ | ---------- | ----- | ------ | ------ | ---------- |
| **Super Admin**                | ✅         | ✅    | ✅     | ✅     | ✅         |
| **Organisasi**                 | ✅ (entitas sama) | ❌ | ❌  | ❌     | ❌         |
| **Badko**                      | ❌         | ✅ (entitas sama) | ❌ | ❌ | ❌      |
| **Cabang**                     | ❌         | ❌    | ✅ (entitas sama) | ❌ | ❌   |
| **Korkom**                     | ❌         | ❌    | ❌     | ✅ (entitas sama) | ❌ |
| **Komisariat**                 | ❌         | ❌    | ❌     | ❌     | ✅ (entitas sama) |

- Di entitas yang sama, **siapa pun pemegang boleh mencabut siapa pun** — termasuk sesama
  admin, bahkan orang yang dulu mengundangnya. `granted_by` hanya jejak audit, bukan hak.
- **Tanpa cascade**: mencabut satu grant tidak menyentuh orang-orang yang pernah diangkat
  oleh yang dicabut. Membersihkan satu lini berarti mencabut satu per satu, dan itu disengaja
  agar terlihat, bisa dibatalkan satu-satu, dan tidak bisa terjadi karena kecelakaan.
- Level di atas yang tidak setuju **tidak boleh** merogoh roster unit; ia menyuspend unitnya
  (lihat bagian 3).

Asimetri ini disengaja: pengangkatan mengalir turun agar pos terisi, sedangkan keanggotaan
admin diselesaikan sendiri oleh unit yang bersangkutan.

## 3. Pembanding: Suspend & Activate

Supaya modelnya utuh — ini justru **hanya dari atas**, tidak pernah oleh unit itu sendiri.
Karena itu suspend/activate punya endpoint sendiri, bukan lewat `update({status})`: mengedit
sebuah entitas adalah urusan entitas itu, sedangkan menonaktifkannya bukan.

| Yang di-suspend | Yang berwenang                    |
| --------------- | --------------------------------- |
| Organisasi      | `Super Admin` saja                |
| Badko           | `Super Admin` / grant di **Organisasi** |
| Cabang          | `Super Admin` / grant di **Organisasi** |
| Korkom          | `Super Admin` / grant di **Cabang**     |
| Komisariat      | `Super Admin` / grant di **Cabang**     |

Perhatikan: **Badko tidak berwenang men-suspend Cabang-nya**, dan **Korkom tidak berwenang
men-suspend Komisariat-nya** — keduanya mengoordinasi, bukan menaungi. Hanya Organisasi dan
Cabang yang menaungi, masing-masing atas dua level di bawahnya.

## 4. Wujudnya di UI

| Halaman                                      | Tambah Akses                    | Revoke |
| -------------------------------------------- | ------------------------------- | ------ |
| Master → semua detail entitas                | ✅                              | ✅     |
| Pengaturan (kelima scope, entitas sendiri)   | ✅                              | ✅     |
| Org dashboard → detail Badko & Cabang        | ✅ (mati saat entitas `inactive`) | ❌   |
| Cabang dashboard → detail Korkom & Komisariat| ✅ (mati saat entitas `inactive`) | ❌   |
| Badko dashboard → detail Cabang              | ❌                              | ❌     |
| Korkom dashboard → detail Komisariat         | ❌                              | ❌     |

Dua baris terakhir kosong bukan karena belum dikerjakan, melainkan karena backend memang
menolaknya.

Penonaktifan tombol saat entitas `inactive` adalah aturan **frontend**, bukan backend: roster
tidak diubah-ubah selagi unitnya sedang dalam dinamika internal. `Super Admin` dikecualikan,
karena dialah yang menyelesaikan dinamika itu.

Semuanya dirender oleh satu komponen bersama, `components/admin/EntityAccessTab.tsx`, yang
memisahkan `canInvite` dan `canRevoke` persis karena backend menggatingnya berbeda.
