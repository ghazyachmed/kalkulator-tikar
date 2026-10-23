# Verifikasi

22 Oktober 2026, pratinjau lokal. Tidak ada pengujian beban publik.

## Otomatis

29 tes lulus: harga integer, kebutuhan ruangan, varian tanpa tarif, ongkir manual, terbilang, validasi ukuran dan enum, intent aman, timeout provider, origin, body cap, token bucket, consumer antrean, dan volumetrik. Artifact ESM tervalidasi.

## Lighthouse

Simulasi mobile Lighthouse pada `http://127.0.0.1:4173/`:

| Metrik | Hasil |
| --- | --- |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| LCP | 1,9 detik |
| CLS | 0 |
| Total Blocking Time | 0 ms |

Laporan HTML dan JSON ada di folder ini. Pengujian pertama menemukan kontras teks sekunder dan nama aksesibel logo; keduanya diperbaiki. Font pihak ketiga dihilangkan agar tidak menambah rantai render. Hasil ini bukan data lapangan produksi atau jaminan semua kondisi aksesibilitas terpenuhi.

## Browser

- 2 rol × 5 m × Rp38.000 = Rp380.000, terbilang sesuai.
- Ongkir input Rp50.000 menghasilkan Rp430.000, ditandai input pelanggan.
- Lebar 95 cm menampilkan “perlu konfirmasi”, tidak mewarisi harga 120 cm.
- Chatbot merespons dari konfigurasi kalkulator dan menawarkan penerapan hasil.
- Tampilan 390 × 844 diperiksa; halaman tetap satu kolom tanpa luapan horizontal.
- Tombol WhatsApp memuat ringkasan, tidak mengirim pesan otomatis.

## Belum Terverifikasi

API Gemini live (belum ada secret), tarif Indah live via API, tarif 95 cm/produk lain/tambahan, deployment ke akun Cloudflare/Vercel milik pengguna, alarm/WAF khusus, R2/Queue produksi, dan load test lintas wilayah. Fitur simpan online opsional tidak ditampilkan sebagai fitur aktif.

## Revisi Kedua

41 tes lulus. Tikar lipat dihapus, harga 95 cm memakai benchmark Swan dengan label sumber, dan berat/ukuran paket dihitung otomatis. Browser desktop dan ponsel 390×844 memverifikasi dialog chat, tombol kirim, perhitungan Rp510.000 untuk 95 cm × 10 m × 2 rol, serta estimasi satu paket 95 cm × 10 m: sekitar 4,66 kg dengan packing dan 4,46 kg volume darat. Angka tersebut model benchmark, bukan hasil timbang.

Lighthouse revisi kedua (`lighthouse-v2.report.html/json`): Performance 97, Accessibility 100, Best Practices 100, SEO 100; LCP 2,2 detik, CLS 0, TBT 0 ms. Ini menggantikan hasil versi awal sebagai verifikasi antarmuka terbaru. Dialog chat juga diperiksa pada ponsel; pengujian Lighthouse di atas menggunakan halaman saat dialog tertutup.

Foto hijau dan marun berasal dari katalog resmi Toko Santri, disalin ke origin sendiri lalu dikompresi. URL modul/CSS memakai hash versi untuk mencegah cache aset lama tercampur versi HTML baru. Pengujian browser menangkap kondisi cache lama selama pengembangan dan perbaikan hash memastikan revisi baru dimuat bersama.

## Revisi 23 Oktober 2026

Pengiriman disatukan menjadi ambil di toko atau Indah Cargo; tautan lama courier dimigrasikan ke cargo. Urutan DOM dan layar HP: formulir, hasil, ilustrasi, chatbot. Tombol hasil memindahkan fokus ke ringkasan. Teks input 16 px dan catatan 14 px. Harga yang belum ada tetap tidak diisi nol. Halaman resmi tarif Indah diperiksa ulang; nominal tarif rute otomatis belum terintegrasi. Uji baru mengamankan tautan lama dan penghapusan ongkir saat ukuran chat berubah. Hasil Lighthouse sebelumnya berlaku untuk versi sebelumnya, bukan revisi ini.

Chat cepat: 46 pengujian lulus. Pertanyaan yang dikenali dijawab di browser tanpa request API; pertanyaan lainnya memakai server dengan batas 5,5 detik dan fallback lokal. Status proses diumumkan melalui aria-live, tombol dikunci selama proses, pemberitahuan lambat muncul setelah 1,8 detik. Animasi mengikuti prefers-reduced-motion.

Panduan chatbot: pembuka mengenalkan pilihan, dimensi ruangan diprioritaskan di atas kata warna, satuan cm/m dan desimal didukung. Ukuran disimpan sebagai draft dan lebar 95/120 ditanyakan lewat tombol sebelum hitungan baru. Konteks chat berlaku hanya pada sesi halaman, direset saat formulir berubah. Pengujian mencakup dua laporan pengguna, follow-up lebar/warna, serta dimensi tidak valid.

Tarif pemilik 23 Oktober: 95 cm Rp31.000/m polos, Rp37.000/m tulisan; 120 cm tetap Rp35.000/Rp38.000. Plisir dua ujung Rp20.000/rol. Packing Rp50.000/karung, kapasitas 6 rol panjang 10 m atau 10 rol panjang 6 m; panjang lain tidak diekstrapolasi. Biaya diketahui menyertakan tambahan yang valid walaupun ongkir belum ada.
