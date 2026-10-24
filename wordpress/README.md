# Kalkulator WordPress

Halaman aktif: https://tokosantri.co.id/kalkulator-produk/

Kalkulator dan chatbot untuk tikar maupun karpet berjalan langsung di halaman WordPress. Tidak memakai iframe, hosting ChatGPT, database tambahan, atau API untuk perhitungan.

## Perbarui

1. Edit modul sumber di `domain/`, `services/`, `web/`, atau tampilan karpet di `wordpress/`.
2. Jalankan `npm test`, `node scripts/build-wordpress.mjs`, dan `node --check wordpress/app-check.mjs`.
3. Salin `wordpress/page.html` ke editor kode halaman WordPress ID 2131, lalu simpan.
4. Periksa hasil, pilihan produk, chat, dan tautan WhatsApp.

Jangan mengedit hasil bundle sebagai sumber utama. WordPress harus mengizinkan blok HTML dengan script untuk admin yang mengelola halaman. Pertahankan blok HTML utuh.

## Harga Karpet

Harga per meter panjang dari daftar pemilik tahun 2026. Nomor 1–11 tinggi 120 cm, Medina 115 tinggi 115 cm, Medina 105/Gambar/Pilar tinggi 105 cm. Tarif titik pengerjaan tidak dihitung otomatis dari sudut atau luas. Ongkir radius <10 km Rp100.000; 10 km ke atas/luar kota belum diketahui. Stok tidak mengikat.

## Pemulihan

Isi halaman sebelum migrasi disimpan di `previous-page.html`. WordPress juga menyimpan revisi halaman. Situs ChatGPT lama tidak dihapus, tetapi halaman WordPress tidak bergantung padanya. Versi lama tersebut belum memiliki kalkulator karpet.

## Verifikasi

78 pengujian lulus. Pilihan produk hanya di bagian atas. Tombol chatbot tersedia pada kedua produk; panel chat karpet, penutupan panel, dan sinkronisasi hasil formulir sudah diperiksa di halaman terbit. Chat karpet Medina 115 ruangan 10 × 5 m dengan 4 obras, 2 sambungan, 3 tiang, dan pengiriman luar kota menghasilkan Rp6.750.000 belum ongkir. Di halaman WordPress, diverifikasi total Medina 105 panjang 10 m dengan 4 titik obras, 2 sambungan, 3 titik tiang, dan kirim lokal: Rp1.550.000. Ongkir luar kota ditandai belum termasuk. Mode ruangan Medina 115 ukuran 10 × 5 m menghasilkan 5 lajur/50 meter. Chat tikar 8 m × 20 rol menghasilkan 160 m dan Rp5.600.000 pada lebar 120 cm tanpa tulisan. Isi tautan WhatsApp diperiksa tanpa mengirim pesan.

Simulasi viewport ponsel pada browser bawaan tidak diterapkan (tetap 1280 px); pemeriksaan visual pada ukuran ponsel belum terverifikasi. CSS menggunakan container query dan input minimum 16 px untuk lebar sempit.

Dibantu AI untuk adaptasi WordPress, kalkulator karpet, dan pengujian. Tidak ada kredensial di bundle.

## Teks & Lokasi

Audit 24 Oktober: petunjuk berorientasi tindakan, contoh jumlah titik, istilah biaya lebih sederhana, panduan stok/ongkir, serta pengarahan chatbot ke produk yang tepat. Harga dan rumus tetap sama. `shared.css` menyamakan tipografi kedua produk.

Geolokasi karpet memakai `services/location.js`, `store-location.js`, dan `location-app.js`. Titik Gading dan Palur dicocokkan di Google Maps (nomor 085105016189). Pemilik menetapkan cabang terdekat sebagai asal tarif. Perhitungan Haversine berjalan lokal, tanpa API rute, database, atau pengiriman koordinat pelanggan ke toko. Ini radius garis lurus, bukan jarak jalan. Pelanggan menekan tombol lokasi dan mengizinkan akses browser, lalu memastikan tujuan dalam kota sebelum menerapkan Rp100.000. Tujuan di luar radius atau akurasi yang melintasi 10 km tetap meminta penawaran. Reset membatalkan hasil permintaan yang belum selesai. Lokasi tidak disertakan dalam tautan WhatsApp.

84 pengujian lulus, termasuk pilihan cabang terdekat, batas radius dengan akurasi GPS, koordinat tidak valid, izin ditolak, dan timeout. GPS perangkat sungguhan belum dipakai dalam verifikasi; kasus lokasi diuji dengan data simulasi. Ongkir Indah Cargo tikar tetap melalui cek tarif resmi, bukan API otomatis.
