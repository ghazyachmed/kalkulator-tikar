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
