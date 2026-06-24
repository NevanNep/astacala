Stress Testing Report - Astacala Rescue Reporting System
1. Tujuan Pengujian

Stress testing dilakukan untuk menguji kemampuan sistem Astacala Rescue Reporting System dalam menangani banyak pengguna secara bersamaan. Pengujian ini berfokus pada kestabilan halaman web dan waktu respons sistem saat menerima beban akses dari banyak virtual users.

Target utama pengujian adalah memastikan sistem mampu menangani minimal 50 concurrent users dengan response time yang masih berada di bawah batas yang ditentukan.

2. Tools Pengujian

Pengujian dilakukan menggunakan:

Tool: k6
Environment: Local
Base URL: http://localhost:3000
Jenis pengujian: Stress testing / load testing
Halaman yang diuji:
/
/berita
/login
3. Skenario Pengujian

Skenario pengujian dilakukan dengan menaikkan jumlah virtual users secara bertahap hingga mencapai 50 virtual users.

Tahap	Durasi	Jumlah Virtual Users
Ramp-up awal	30 detik	10 users
Beban utama	1 menit	50 users
Ramp-down	30 detik	0 users

Total durasi pengujian adalah sekitar 2 menit.

4. Threshold Pengujian

Threshold yang digunakan pada pengujian:

Metrik	Target
http_req_duration	p95 < 3000 ms
http_req_failed	error rate < 5%

Artinya, 95% request diharapkan selesai dalam waktu kurang dari 3 detik, dan jumlah request gagal harus kurang dari 5%.

5. Hasil Pengujian 50 Virtual Users

Hasil pengujian menggunakan k6:

Metrik	Hasil
Total requests	3553 requests
Failed requests	0 requests
Error rate	0.00%
Checks succeeded	100.00%
p95 response time	1.4 detik
Average response time	593.64 ms
Median response time	109.37 ms
Maximum virtual users	50 VUs

Detail checks:

Check	Status
Home page status 200	Pass
Berita page tidak error server	Pass
Login page tidak error server	Pass
6. Analisis Hasil

Berdasarkan hasil pengujian, sistem berhasil menangani beban hingga 50 virtual users tanpa adanya request yang gagal. Nilai http_req_failed sebesar 0.00% menunjukkan bahwa seluruh request berhasil diproses oleh sistem.

Nilai p95 response time sebesar 1.4 detik juga masih berada di bawah threshold 3 detik. Hal ini menunjukkan bahwa mayoritas request dapat diselesaikan dengan cepat pada beban 50 concurrent users.

Meskipun terdapat nilai maksimum response time yang lebih tinggi, nilai tersebut dianggap sebagai outlier karena metrik utama yang digunakan adalah p95 response time. Secara keseluruhan, performa sistem pada skenario 50 virtual users masih memenuhi target pengujian.

7. Pengujian Tambahan 150 Virtual Users

Selain pengujian utama 50 virtual users, dilakukan juga stress testing lanjutan hingga 150 virtual users untuk mengetahui batas performa sistem.

Hasil pengujian 150 virtual users:

Metrik	Hasil
Total requests	7746 requests
Failed requests	2 requests
Error rate	0.02%
p95 response time	8.88 detik
Maximum virtual users	150 VUs

Pada skenario 150 virtual users, sistem masih tergolong stabil karena error rate hanya 0.02%. Namun, p95 response time mencapai 8.88 detik sehingga melewati threshold 3 detik.

Hal ini menunjukkan bahwa sistem masih mampu melayani request dalam jumlah besar, tetapi performa mulai menurun pada beban tinggi di atas target minimum.

8. Kesimpulan

Berdasarkan stress testing yang telah dilakukan, sistem Astacala Rescue Reporting System berhasil memenuhi target performa untuk 50 concurrent users. Pada skenario tersebut, sistem memproses 3553 request tanpa kegagalan, dengan p95 response time sebesar 1.4 detik.

Dengan demikian, sistem dinyatakan lulus pada skenario pengujian 50 concurrent users.

Pengujian tambahan hingga 150 virtual users menunjukkan bahwa sistem masih stabil dari sisi error rate, tetapi response time mulai meningkat secara signifikan. Hal ini dapat menjadi bahan evaluasi untuk optimasi performa jika sistem nantinya perlu menangani jumlah pengguna yang lebih besar.