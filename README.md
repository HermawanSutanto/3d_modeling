# Stylized 3D Game Character — Master Model V1 (Three.js)

Proyek 3D karakter bergaya game simulasi kehidupan (*Animal Crossing Villager*) yang dibuat menggunakan **HTML5**, **CSS3**, dan **Three.js**.

Model ini merepresentasikan karakter anak laki-laki dengan:
- **Kaos Merah** dengan badge cyan dan angka putih "**1**" di dada
- **Celana Pendek Navy** (*medium-to-dark blue shorts*)
- **Sepatu Sneaker Biru** dengan sol karet putih tebal (*white soles*)
- **Rambut Mangkok Cokelat Tua** (*dark chocolate bowl-cut*) dengan 3 gerigi poni khas di dahi
- **Proporsi Kepala & Tubuh Stylized** (Total 100 relative units: Kepala ~36 unit, Torso ~25 unit, Kaki ~32 unit)
- **Mata Oval Hitam** dengan bintik kilau putih, hidung mungil, dan senyuman ramah
- **Material Matte Lembut** (*MeshStandardMaterial*) dengan pencahayaan studio netral dan *soft contact shadow*

---

## 🚀 Cara Menjalankan

### Cara 1: Buka Langsung di Browser
Cukup klik ganda atau buka file `index.html` menggunakan browser modern apa pun (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari):
```bash
# Contoh di Linux / Ubuntu:
google-chrome index.html
# atau
xdg-open index.html
```

### Cara 2: Menjalankan dengan Local Web Server (Direkomendasikan)
Anda dapat menggunakan Python untuk menjalankan web server lokal:
```bash
cd /home/larona/Desktop/Proyek/barucoba
python3 -m http.server 8080
```
Lalu buka browser di alamat:
👉 **`http://localhost:8080`**

---

## 🎮 Fitur Interaktif pada Antarmuka (UI)

1. **Preset Sudut Kamera:**
   - 🎥 **3/4 Sudut**: Sudut tiga perempat standar spesifikasi (15–20° turn)
   - 👤 **Depan**: Tampak depan lurus (*front view*)
   - 🔄 **Samping**: Profil samping (*side view*)
   - 🔙 **Belakang**: Tampak belakang untuk melihat siluet rambut mangkok
   - 🔍 **Wajah**: *Close-up* ekspresi wajah, mata, dan senyum
2. **Kontrol Kamera Orbit (Mouse/Touch):**
   - **Klik Kiri + Geser**: Memutar kamera 360 derajat
   - **Klik Kanan + Geser**: Menggeser posisi pandangan (*Pan*)
   - **Scroll Mouse**: *Zoom in* dan *Zoom out*
3. **Animasi Procedural:**
   - Pernapasan santai (*idle breathing*)
   - Ayunan lengan halus (*arm sway*)
   - Kedipan mata alami (*blinking*)
   - Gerakan kepala dinamis (*head tilt*)
   - Tombol **Pause/Resume Motion**
4. **Preset Pencahayaan (Lighting):**
   - 💡 **Studio**: Studio netral soft key light sesuai spec
   - 🌅 **Hangat**: Suasana matahari sore keemasan
   - 🏝️ **Pulau**: Pencahayaan siang hari tropis cerah
5. **Mode Wireframe:**
   - Memeriksa kerapian topologi geometri poligon 3D
6. **Putar Otomatis (Auto-Rotate):**
   - Karakter berputar halus untuk presentasi 360°
7. **Tangkapan Layar (Screenshot):**
   - Tombol 📸 untuk mengunduh render gambar PNG resolusi tinggi secara langsung
8. **Drawer Spesifikasi:**
   - Panel samping yang merinci ke-14 kriteria penerimaan visual, tabel proporsi, dan palet warna resmi

---

## 🧪 Pengujian Otomatis dengan Playwright

Proyek ini telah dilengkapi dengan skrip pengujian otomatis berbasis **Playwright** ([`test_e2e.js`](file:///home/larona/Desktop/Proyek/barucoba/test_e2e.js)):

Untuk menjalankan pengujian dan mengambil screenshot render otomatis:
```bash
npm test
# atau
node test_e2e.js
```

Skrip ini secara otomatis memverifikasi:
- Status pemuatan WebGL Canvas (1280x800)
- Inisialisasi Three.js dan generator model karakter
- Tidak ada error pada browser console (*Clean Console*)
- Pengujian interaksi preset kamera (3/4 Sudut, Depan, Wajah)
- Pengujian toggle Drawer Spesifikasi dan Wireframe
- Menyimpan hasil tangkapan layar verifikasi:
  - `screenshot_3d_perspective.png`
  - `screenshot_front.png`
  - `screenshot_face.png`
  - `screenshot_wireframe.png`

---

## 📁 Struktur Berkas

```
barucoba/
├── index.html        # Halaman utama aplikasi WebGL
├── style.css         # Desain antarmuka modern glassmorphism
├── character.js      # Generator geometri 3D, material, badge kanvas & rigging
├── app.js            # Inisialisasi Three.js, studio lighting, loop animasi & event UI
├── scene.gltf         # Referensi model 3D kepala & telinga master
├── scene_data.js     # Data glTF tertanam untuk pemuatan instan & offline
├── test_e2e.js       # Pengujian otomatis Playwright end-to-end
├── vendor/           # Pustaka lokal Three.js, OrbitControls, & GLTFLoader
├── package.json      # Konfigurasi npm & Playwright dependencies
└── README.md         # Dokumentasi proyek
```

