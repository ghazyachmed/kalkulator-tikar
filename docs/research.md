# Sumber

Diperiksa 22 Oktober 2026. Harga hasil pencarian tidak otomatis menjadi harga toko.

| Sumber | Temuan | Pemakaian |
| --- | --- | --- |
| https://anekakarpetmasjid.com/produk/llam/ | Kalkulator ruangan/panjang, pengerjaan, mode pemasangan, model shaff, ilustrasi, dan CTA. Karpet LLAM Rp239.000/m. | Pola fungsi referensi; bukan tarif Toko Santri. Implementasi baru, tanpa menyalin kode/gambar. |
| https://tokosantri.co.id/tikar-plastik/ | Rol lebar 120 cm, panjang custom, tulisan nama, warna merah bata/hijau/biru/krem. Nomor toko 085105016189. | Spesifikasi dan kontak. Warna marun mengikuti brief pemilik. |
| https://tokosantri.co.id/tikar-plastik-murah-tulisan-nama/ | Halaman menyebut minimum 100 rol, 10 m/rol, lebar 90/120 cm. Tidak ada nominal harga. | Konfirmasi syarat terkini. Tidak menyamakan lebar 90 dengan 95 cm. |
| https://de.scribd.com/doc/228215125/Lampiran-Daftar-Harga-Tikar-Plastik-2012 | Hasil pencarian memuat daftar harga Mei 2012, termasuk Santri lebar 120 cm Rp17.600/m. | Arsip historis dari cuplikan indeks; isi penuh belum diverifikasi dan tidak dipakai sebagai harga terkini. |
| Brief pemilik | 120 cm Rp35.000 tanpa tulisan/Rp38.000 dengan tulisan; pilihan 95/120 cm. | Tarif awal dengan asumsi per meter panjang. Butuh konfirmasi satuan, tarif lainnya, serta minimum order. |
| https://www.indahonline.com/shipping/rates | Asal, tujuan, layanan, dan berat diperlukan pada cek tarif resmi. | Tautan resmi; belum ada integrasi API. |
| https://www.indahonline.com/company/terms | Rumus volume darat/laut 5000, udara 6000, kubikasi 1.000.000. | Bantuan berat volume; tidak menentukan biaya final. |
| https://ai.google.dev/gemini-api/docs/pricing | Gemini 2.5 Flash-Lite memuat free tier saat diperiksa. | Model konfigurabel, tidak menjanjikan kuota tetap atau ketersediaan selamanya. |
| https://ai.google.dev/gemini-api/docs/structured-output | Output terstruktur mendukung klasifikasi intent. | Enum hasil model divalidasi; bukan sumber harga. |
| https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/ | Limiter terkelola per lokasi, bukan global ketat. | Batas request provider, perlu kuota vendor untuk batas penggunaan. |
| https://developers.cloudflare.com/queues/platform/pricing/ | Pemakaian dihitung per operasi; retry menambah operasi. | Antrean opsional, tidak diaktifkan. |
| https://vercel.com/docs/plans/hobby | Paket Hobby untuk personal/nonkomersial. | Tidak menyarankan penggunaan bisnis pada Hobby tanpa memeriksa kelayakan. |

## Keputusan

Tarif publik terkini untuk keseluruhan produk Toko Santri belum ditemukan. Lebih tepat menampilkan status konfirmasi daripada memakai arsip 2012, promosi marketplace yang berbeda SKU, atau harga kompetitor. Integrasi Indah otomatis ditunda sampai ada akses resmi. Lokasi dimasukkan manual agar tidak memerlukan peta berbayar atau izin geolokasi.
