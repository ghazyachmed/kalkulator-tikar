# Toko Santri

Kalkulator tikar dan asisten pada satu halaman. Tanpa database, tanpa dependensi runtime. Sumber modular JavaScript, kelas layanan kecil, dan pengujian dengan test runner bawaan Node.

## Jalankan

Node 22 atau lebih baru:

```sh
npm test
npm run build
npm run validate
npm run dev
```

Pratinjau di `http://127.0.0.1:4173`. Jalankan ulang pratinjau setelah build baru.

## Deploy

**Cloudflare Workers (disarankan)**: `npx wrangler deploy`. Konfigurasi `wrangler.jsonc` menyajikan berkas statis melalui Workers Assets dan menjalankan fungsi hanya untuk `/api/*`. Tidak memakai D1 atau database lain. Akun Cloudflare dan login pemilik diperlukan; tidak ada kredensial Cloudflare yang disertakan.

**Cloudflare Pages**: build `npm run build`, output `public`. Kalkulator, tautan, unduh, cetak, dan chatbot aturan berjalan statis. Gemini memerlukan Worker terpisah pada origin yang sama atau Pages Function; versi Pages statis tidak mengaktifkan Gemini.

**Vercel**: impor repositori dengan `vercel.json` yang disediakan. Versi ini statis dan chatbot memakai aturan lokal. API Gemini belum disediakan untuk Vercel. Periksa ketentuan paket untuk penggunaan bisnis; Vercel Hobby ditujukan untuk penggunaan personal nonkomersial. Cloudflare lebih sesuai sebagai target awal toko.

**Sites**: `.openai/hosting.json` menyimpan identitas deployment pratinjau. Jangan memindahkan identitas ini ke proyek Sites lain. Default tidak ada binding DB atau R2.

## Harga

Ubah `domain/pricing.js`, tambahkan tes sebelum perubahan, naikkan `catalog.version`, lalu build dan deploy ulang. Klien dan server memakai mesin harga yang sama. Tidak ada panel admin publik atau kunci rahasia di browser.

- 120 cm: Rp35.000 tanpa tulisan, Rp38.000 dengan tulisan dari brief pemilik.
- Satuan **diasumsikan per meter panjang**, masih perlu konfirmasi pemilik.
- 95 cm: benchmark produsen Swan Rp25.500/m dengan minimum pada sumber 500 m. Untuk tulisan, simulasi Rp28.500/m memakai asumsi tambahan Rp3.000, bukan tarif resmi Swan/Toko Santri.
- Karpet, plisir, dan packing tambahan belum ada tarif tervalidasi. Tikar lipat dikeluarkan karena ukurannya tetap.
- Ongkir manual diberi label input pelanggan, tidak menjadi tarif resmi. Nol hanya sah jika benar ada penawaran tanpa ongkir.
- Seluruh hasil estimasi, bukan invoice. Jika komponen belum diketahui, total akhir tidak ditampilkan.

Tautan berbagi menyimpan konfigurasi ukuran dan pilihan dalam URL, bukan alamat tujuan. URL dapat diedit dan selalu dihitung ulang menggunakan tarif terbaru; bukan penawaran harga yang ditandatangani.

## Gemini

Chatbot aturan bekerja tanpa API key. Untuk pemahaman pertanyaan yang lebih luas pada Cloudflare Workers, atur secret melalui terminal milik pemilik:

```sh
npx wrangler secret put geminiApiKey
```

Gunakan proyek Google AI Studio free tier tanpa billing. Secret saja tidak cukup: binding `chatLimit` wajib tersedia, jika tidak server tetap memakai aturan. Model default `gemini-2.5-flash-lite`; cek ketersediaan dan kuota akun sebelum mengaktifkan.

Gemini hanya mengklasifikasi intent ke enum yang diizinkan. Teks keluaran model tidak ditampilkan. Semua angka dan tarif berasal dari `QuoteService`/`ShippingService`, jawaban memakai template. Benchmark dan asumsi dinyatakan dalam jawaban. Permintaan dibatasi 800 karakter, body 4 KB, output 120 token, timeout 4,5 detik, tanpa retry otomatis. Pertanyaan yang dipahami aturan tidak memanggil Gemini. Jika provider gagal, kalkulator dan asisten aturan tetap bekerja.

Rate limit Cloudflare bersifat per lokasi jaringan, bukan batas global tagihan. Token bucket memori juga hanya per isolate. Jangan menganggap keduanya sebagai kuota global. Kuota provider free tier dan status billing harus diperiksa pemilik. Jangan kirim alamat atau data pribadi melalui chat; lokasi pengiriman hanya dimasukkan ke pesan WhatsApp setelah pelanggan memilih tombol pesan.

## Indah Cargo

Lokasi manual disertakan ke draft WhatsApp. Berat dan dimensi paket diperkirakan otomatis dari ukuran/jumlah rol; pelanggan tidak diminta mengisi berat. Basis massa benchmark katalog Swan 3 kg/6,8 × 0,95 m. Tebal 1,2 mm, inti 4 cm, pelindung 2 cm, allowance panjang 4 cm, packing 0,25 kg, dan pembagian tiap 20 m adalah asumsi, bukan spesifikasi terverifikasi Toko Santri. Model menghasilkan maksimum dua kelompok paket sehingga pesanan besar tidak membuat ribuan objek. Rumus volume resmi ditampilkan pada bantuan: darat/laut `P×L×T/5000`, udara `/6000`, dalam cm. Berat terbesar adalah acuan, bukan keputusan berat tagihan. Minimum layanan, pembulatan, asuransi, surcharge, dan penawaran akhir ditentukan Indah.

Dokumentasi API publik resmi belum ditemukan. Versi ini menyediakan tautan cek tarif resmi dan input nominal hasil penawaran; **tidak mengklaim tarif otomatis**. Tidak memakai scraping endpoint internal atau tarif per km buatan. Integrasi otomatis memerlukan dokumentasi/akses resmi atau agregator yang mendukung layanan Indah dan izin pemilik untuk biaya layanan.

## Penyimpanan Opsional

Object storage dan antrean disiapkan pada `EventService`, namun **tidak diaktifkan pada deployment awal**. Tidak diperlukan untuk kalkulator, tautan, unduh, dan cetak. Jika diperlukan nanti, ikat R2 sebagai `BUCKET` dan Queue sebagai `EVENTS`; `/api/quotes` menerima konfigurasi tanpa identitas pribadi. Producer mengembalikan 202 setelah antrean mengakui pesan. Consumer menyimpan objek berdasarkan ID agar pengiriman ulang idempoten, ack sesudah berhasil, retry setelah gagal. Atur dead letter queue, retensi, rate limit endpoint, lifecycle R2, dan batas pemakaian sebelum mengaktifkan endpoint publik. R2/Queues punya kuota dan syarat akun; tidak dijamin gratis tanpa batas.

Tidak ada migrasi atau SQL. Detail rancangan, status fitur, dan verifikasi tersedia di `docs/architecture.md` dan `docs/research.md`.

## Konvensi

Variabel/fungsi memakai lowerCamelCase, kelas PascalCase. Nama binding `BUCKET`/`EVENTS` dan properti milik platform seperti `project_id`, `max_age`, serta `namespace_id` mengikuti kontrak aslinya. Tidak mengganti nama API pihak ketiga demi konsistensi gaya. Komentar ringkas dalam bahasa Indonesia bila menjelaskan alasan.

Bantuan AI: riset, rancangan, kode, dan pengujian dibantu Codex. Catatan juga terdapat pada komentar sumber domain; proyek ini tidak memakai notebook.
