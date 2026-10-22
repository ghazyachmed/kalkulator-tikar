# Rancangan

## Alur Utama

Browser → aset CDN → `QuoteService` lokal → hasil, terbilang, URL berbagi, TXT, cetak, atau draft WhatsApp. Kalkulator tidak menghubungi server setiap input.

Browser → `/api/chat` → validasi origin/body → token bucket → jawaban aturan. Pertanyaan yang belum dipahami dapat melewati limiter Cloudflare → Gemini intent enum → validasi enum → template aman. Kalkulator tetap bekerja jika API mati. Pada hosting statis, frontend langsung memakai fallback aturan saat endpoint tidak tersedia.

Opsional: konfigurasi valid → `/api/quotes` → Queue → consumer → R2. Tidak ada DB. Opsional ini belum diprovisioning atau diuji di akun Cloudflare pengguna.

## Modul

| Bagian | Tanggung Jawab |
| --- | --- |
| `domain/pricing.js` | Validasi, katalog versi, harga, kebutuhan rol/lajur, keliling plisir, rupiah, terbilang. |
| `domain/shipping.js` | Model otomatis massa/diameter gulungan dari pesanan dan benchmark berat, tanpa tarif ongkir buatan. |
| `services/assistant.js` | Intent, adapter Gemini melalui dependency injection fetch, jawaban template. |
| `services/security.js` | Header keamanan, streaming body cap, token bucket memori dengan eviction. |
| `services/events.js` | Antrean dan object storage opsional, ack/retry, kunci idempoten. |
| `worker/index.js` | Routing HTTP dan penyusunan layanan. |
| `web/` | HTML semantik, CSS responsif, interaksi. |
| `scripts/build.mjs` | Menggabungkan modul menjadi artefak Worker; sumber tetap terpisah. |

Kelas berukuran kecil mengikuti pemisahan tanggung jawab, adapter untuk provider, dan injeksi dependency pada mesin harga. Tidak perlu microservice terpisah untuk beban ini.

## Performa

Hitungan memakai integer sentimeter dan integer rupiah; tidak memakai model AI untuk aritmetika. Pencarian tarif langsung melalui object key. Operasi harga O(1); ilustrasi maksimum delapan lajur walau input besar. Memori limiter maksimum 1.024 key, chat maksimum 30 elemen, Blob URL unduhan dilepas. Tidak ada render framework, hydration, database, atau event per keystroke ke server.

Aset ETag + cache edge, CSS/JS terpisah, ruang ilustrasi dan kartu ditetapkan, animasi mengikuti reduced motion. Semua I/O provider/storage async. Timeout provider 4,5 detik, fallback frontend 6,5 detik. Tidak ada retry interaktif yang memperbesar burst.

## Keamanan

Validasi enum/angka, bounded stream, same-origin POST, CSP, HSTS pada HTTPS, nosniff, referrer policy, dan pembatasan izin browser. Teks chat dimasukkan dengan `textContent`, bukan HTML. Tidak ada SQL atau endpoint query. Tarif client tidak dipercaya oleh server; server hitung ulang. Tidak menyimpan alamat/IP/pesan chat pada log aplikasi. Log hanya route, requestId, dan durasi; fallback provider memakai alasan tetap.

Gemini tidak menghasilkan jawaban bebas; tidak punya tool pemesanan, perubahan katalog, atau pembayaran. API key hanya server secret. Parser aturan mengambil ukuran dan enum terbatas, tidak mengambil harga dari pesan.

Token bucket memori merupakan perlindungan tambahan per isolate, bukan limiter global. Binding Cloudflare memberi limiter per lokasi jaringan dan approximate. Distributed attack lintas IP/lokasi masih memerlukan WAF/rule provider, kuota model free tier, dan batas penggunaan akun. Tidak ada klaim kebal DDoS, tagihan nol pada traffic tak terbatas, atau availability 100%.

Default R2/Queue tidak aktif sehingga endpoint simpan mengembalikan 503 yang jujur. Sebelum diaktifkan, terapkan limiter terkelola untuk endpoint tersebut, TTL/lifecycle, dead letter queue, dan monitor backlog. Tidak membuka endpoint membaca objek tersimpan kepada publik.

## Operasi

Cloudflare Workers menangani replika dan distribusi jaringan; tidak mengoperasikan single VM. Konfigurasi Workers Assets menghindari pemanggilan Worker untuk aset normal pada deployment Cloudflare langsung. Situs pratinjau Sites memakai respons Worker dengan header cache; metrik biaya jaringan perlu diperiksa di provider.

Pantau status provider, 429/5xx, p95 durasi, fallback Gemini, kuota Worker/AI, dan storage/queue jika aktif. Structured logs sudah tersedia. Alarm, dashboard, synthetic uptime check, WAF rules, custom domain, SLA, dan uji beban lintas wilayah belum dikonfigurasi di akun pengguna. Jangan menyebutnya terpasang.

## Verifikasi

Tes ditulis sebelum fitur inti: harga, unknown fees, ongkir manual, assistant, validasi server, volumetrik. Token bucket, input stream, dan consumer juga diuji. Pengujian browser mencakup nominal dan terbilang, konfigurasi tulisan/ongkir, varian tanpa harga, dan respons ponsel. Hasil Lighthouse disimpan terpisah; hasil lokal bukan jaminan performa produksi atau lapangan. Pengujian beban publik belum dilakukan.

## Revisi Antarmuka

Foto asli disajikan dari origin sendiri, bukan hotlink. Build memberi versi hash pada URL CSS dan modul browser agar pembaruan tidak tercampur cache versi lama. Chat tampil di atas ringkasan dan dapat dibuka sebagai dialog aksesibel dari tombol tetap; node percakapan dipindah tanpa menduplikasi state. Dialog mengembalikan fokus, mendukung Escape, dan input chat mendukung Enter/Shift+Enter. Pilihan layanan cargo disimpan dalam tautan. Perubahan ukuran/tujuan mengosongkan ongkir manual agar tarif rute/paket lama tidak diam-diam dipakai lagi.
