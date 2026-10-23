# Integrasi Ongkir

Diperiksa 23 Oktober 2026. Analisis dan dokumentasi dibantu AI (Codex).

## Temuan

Form resmi https://www.indahonline.com/shipping/rates memakai POST ke halaman yang sama, CSRF, serta Cloudflare Turnstile dengan action cektarif. Tombol pengiriman diaktifkan setelah callback mengisi CekTarif[token]. Tidak dilakukan pengiriman tanpa validasi atau upaya melewati proteksi.

Pencarian kota yang dirujuk HTML: /services/listkota?q=teks. Endpoint daftar kota bukan endpoint harga. Rumus P×L×T/5000 (darat/laut) atau /6000 (udara) hanya menentukan berat volume; tidak menentukan tarif rupiah, minimum, cakupan, maupun biaya rute.

## Jalur Resmi

Dibutuhkan akses API Indah yang diizinkan untuk integrasi pihak ketiga, atau penyedia yang benar-benar mengaktifkan Indah pada akun toko.

Biteship memiliki API lokasi dan harga dengan autentikasi:

- https://biteship.com/en/docs/api/maps/search_area
- https://biteship.com/en/docs/api/rates/retrieve
- https://biteship.com/en/docs/api/couriers/overview

Pusat bantuan menyebut Indah Cargo, tetapi daftar kode kurir publik tidak mencantumkan Indah saat diperiksa. Jangan mengarang courier code atau menjanjikan dukungan sebelum akun/API mengonfirmasinya:
https://help.biteship.com/hc/id/articles/43305255807641-Mengapa-Kurir-Cargo-Tidak-Muncul-di-Response-API-atau-Halaman-Checkout

## Implementasi Berikutnya

Setelah provider dan akses tersedia: pencarian wilayah menggunakan ID hasil API; asal toko ditetapkan pemilik; server menghitung paket dari ukuran; server meminta tarif dengan credential rahasia; pelanggan memilih layanan; nominal dan identitas tarif dijumlahkan ke kalkulator. Perubahan ukuran/tujuan menghapus tarif lama. Tambahkan timeout, rate limit, pembatasan biaya dan caching sesuai ketentuan provider. Tidak perlu DB atau pembuatan pesanan pengiriman.

Tarif live dan ketersediaan Indah belum dapat diuji tanpa akses provider. Credential tidak boleh disimpan di JavaScript browser atau dikirim melalui chat.
