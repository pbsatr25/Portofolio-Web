# Panduan Slicing UI PBS Portfolio V2 (untuk AI)

Tujuan: menerjemahkan desain Figma page **FIX** (tema **Cobalt**) menjadi kode Next.js yang setia pada desain,
cepat, dan terbaca penuh oleh mesin pencari. Lalu melapor dalam format tetap. Dokumen ini melengkapi
`AGENTS.md` dan `docs/PRD-web.md`. Slicing mengurus tampilan dan HTML statis. Motion, background, RAG live,
dan game dikerjakan di tahap terpisah sesuai urutan rilis PRD.

## Konteks proyek (baca dulu)

- **Next.js 16 (App Router, SSG) + React 19 + TypeScript strict + Tailwind v4 + GSAP/Lenis (tahap 3) + Canvas 2D
  + R3F (hanya plot Ask my CV, fase akhir).** Next 16 punya breaking changes. Jika menyentuh API framework, baca
  dulu `node_modules/next/dist/docs/`.
- **Scope:** satu halaman portofolio panjang (`/`) + `/work/[slug]` + `/cv` + `/play`. Lihat PRD §Ruang lingkup.
- **Sumber desain:** Figma file `82o7BWOuKPyWmOq7g0PFYr`, page **FIX**:
  - Desktop 1440: `62:13861`
  - Mobile 390: `62:15266`
  - Gunakan skill `figma-design-to-code` dengan node id section (tabel di bawah).
- **Urutan prioritas saat konflik:** **PRD (fungsi, SEO, a11y) → token Cobalt + aturan desain di dokumen ini → Figma
  FIX (tata letak) → selera pribadi.** Jika Figma melanggar a11y (mis. kontras), ikuti PRD dan catat sebagai deviasi.
- **Abaikan** frame di page **Design** sebagai acuan warna; itu arsip eksplorasi (tema oranye dan tema lain).
  Frame berikut hanya ada di page Design dan boleh dipakai untuk **tata letak** saja, dengan warna Cobalt:
  - Menu mobile terbuka: `56:468`
  - Popup Prompt Defender desktop: `50:1123`
  - Popup Prompt Defender mobile (fullscreen): `50:1374`

## Aturan keras: hanya sistem desain PBS

| Boleh | Dilarang |
|---|---|
| Token CSS Cobalt di `globals.css` (`var(--accent)`, dst.) dan utility Tailwind yang dipetakan ke token itu (`bg-accent`, `text-ink`) | Hex/rgb hardcode di komponen, nilai arbitrary `bg-[#...]`, palet default Tailwind (`zinc`, `slate`, `blue-500`) |
| Font **Host Grotesk** (teks) dan **Silkscreen** (pixel) lewat `next/font` | Inter, Geist, font ketiga apa pun |
| Skala type dari bagian Tipografi | `text-[37px]` atau ukuran bebas di luar skala |
| Spacing kelipatan 4 px (skala Tailwind default) | Nilai spacing ganjil di luar skala |
| Sudut tajam (0 px) untuk panel, kartu, foto, tombol | `rounded-xl`, pill, glassmorphism, `backdrop-blur` |
| Ikon SVG inline sederhana (panah ↗, ×, play) yang ada di Figma, sebagai komponen di `src/components/ui/icons.tsx` | Library ikon besar (`lucide-react`, `react-icons`) untuk 3–4 ikon, emoji |
| Tekstur yang sudah ada (grain, dither) sebagai gambar statis | Gradien dekoratif, `box-shadow` dekoratif, glow |
| Easing `expo.out`, durasi 420 ms (tahap 3) | Bounce, spring, durasi acak |

**Sebelum membuat komponen baru, cek dulu `src/components/ui/`.** Button, Tag, Chip dan PixelDivider dipakai di
banyak section; buat sekali, pakai ulang.

## Tema & token

Matikan palet default Tailwind dan petakan token Cobalt di `src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-*: initial;
  --color-bg: #E4E4E1;
  --color-surface: #EFEFEC;
  --color-ink: #111111;
  --color-ink-muted: #55554F;
  --color-accent: #3B5BFF;
  --color-on-accent: #FFFFFF;
  --color-accent-on-dark: #3B5BFF;
  --color-dark: #121212;
  --color-dark-raised: #1E1E1D;
  --color-on-dark: #F2F2EF;
  --color-on-dark-muted: #A3A39E;
  --color-line: #CBCBC7;
  --color-dark-line: #2E2E2C;
  --color-photo-bg: #1D1D1D;

  --font-text: var(--font-host-grotesk);
  --font-pixel: var(--font-silkscreen);
}
```

- **Ground section:** setiap section memakai satu ground dari Figma: `bg` (terang), `accent` (biru), atau `dark`.
  Teks mengikuti pasangannya: `ink` di `bg`, `on-dark` di `dark`, `on-accent` di `accent`.
- **Kontras di atas biru (deviasi dari Figma):** Figma memakai teks hitam di atas `#3B5BFF` (≈ 4,0:1).
  - Teks ≥ 24 px (statement, judul) boleh `ink`.
  - Teks kecil (label samping, body, chip) wajib `on-accent` putih (≈ 4,8:1).
- **Aksen di ground gelap:** pakai `accent-on-dark`. Saat ini nilainya sama dengan `accent`, tapi tetap dipisah agar
  tema bisa diganti tanpa menyentuh komponen.

### Tipografi

Skala diambil dari text style Figma. Desktop dan mobile dihubungkan dengan `clamp()` agar mulus di tablet. Tulis
sebagai utility di `@theme` (`--text-display`, dst.), jangan ukuran bebas.

| Token | Desktop (1440) | Mobile (390) | Font | Dipakai di |
|---|---|---|---|---|
| `mega` | 232 | 104 | Host Grotesk | PortoFolio, SAY HELLO |
| `display` | 168 | 56 | Host Grotesk | Judul besar |
| `stack-word` | 128 | 40 | Host Grotesk | Statement bertumpuk |
| `marquee` | 120 | 56 | Host Grotesk | Baris Stack |
| `statement` | 88 | 40 | Host Grotesk | Kalimat statement |
| `heading` | 64 | 36 | Host Grotesk | Judul section (`<h2>`) |
| `pixel-xl` | 96 | 64 | Silkscreen | Angka tahun folder |
| `lead` | 24 | 20 | Host Grotesk | Lead paragraph |
| `body` | 18 | 16 | Host Grotesk | Body (min 16 di mobile) |
| `button` | 16 | 16 | Host Grotesk | Tombol |
| `small` | 14 | 14 | Host Grotesk | Meta, caption |
| `pixel` | 14 | 13 | Silkscreen | Tag, label pixel |

- Display: tracking sekitar −0,01em, leading 1,0. Body: leading 1,45, maks ~70ch.
- Ukuran di tabel adalah px desain. Verifikasi ulang dengan `figma-design-to-code` per section.

### Spacing, layout & breakpoint

- Spacing kelipatan 4 px. Margin luar 20 px (mobile) dan 48 px (desktop), sama kiri-kanan.
- Breakpoint:
  - **Mobile** ≤ 767 px (desain 390)
  - **Tablet** 768–1279 px (layout mobile yang diperlebar sampai frame tablet ada)
  - **Desktop** ≥ 1280 px (desain 1440, konten maks 1440 px)
- Pakai CSS Grid/Flex lewat utility Tailwind. Tidak ada `position: absolute` untuk layout utama, kecuali elemen
  dekoratif (avatar overlay, pixel divider, label samping statement).

## Pemetaan section (Figma FIX → kode)

| Section | Node desktop | Node mobile | Komponen | HTML semantik | Data | Client? |
|---|---|---|---|---|---|---|
| Intro | `62:13862` | `62:15267` | `sections/Intro.tsx` + `ui/Nav.tsx` | `<header>`, `<nav>`, `<h1>` nama + peran; wordmark `aria-hidden` | `content/profile.ts` | Tidak (avatar video = client kecil) |
| Statement | `62:14198` | `62:15315` | `sections/Statement.tsx` | Satu `<p>` berisi kalimat utuh; versi per kata `aria-hidden` | `content/profile.ts` | Tidak (tahap 3: ya) |
| Stack | `62:14064` | `62:15431` | `sections/Stack.tsx` | `<h2>` + `<ul>` per baris; marquee duplikat `aria-hidden` | `content/stack.ts` | Tidak (tahap 3: ya) |
| About me | `62:13906` | `62:15544` | `sections/About.tsx` | `<h2>`, `next/image` dengan alt, fakta sebagai `<dl>` | `content/profile.ts` | Tidak |
| Ask my CV | `62:14339` | `62:15636` | `sections/AskMyCV.tsx` | `<h2>`, `<form>` berlabel, contoh jawaban + sitasi sebagai teks | `content/ask-sample.ts` | Tidak (fase akhir: ya) |
| Prompt Defender | `62:14531` | `62:15768` | `sections/PromptDefender.tsx` | `<h2>`, preview `<video>`/`<img>` dengan alt, tombol Play | `content/game.ts` | Tidak (fase akhir: ya) |
| Work | `62:14778` | `62:15944` | `sections/Work.tsx` + `ui/WorkCard.tsx` | `<h2>`, `<ol>` kartu, tiap kartu `<article>` dengan `<a href="/work/slug">` | `content/work.ts` | Tidak (tahap 3: ya) |
| Experience | `62:14909` | `62:16015` | `sections/Experience.tsx` + `ui/Folder.tsx` | `<h2>`, satu `<section>` per tahun, posisi sebagai `<ol>` | `content/experience.ts` | Tidak (tahap 3: ya) |
| Contact + footer | `62:15078` | `62:16114` | `sections/Contact.tsx` | `<h2>` (SAY HELLO), `mailto:`, link `rel="me"`, `<footer>` | `content/profile.ts` | Tidak |
| Menu mobile | `56:468` (Design) | — | `ui/MobileMenu.tsx` | `<dialog>` atau panel dengan focus trap | `content/nav.ts` | Ya |
| Pixel divider | di tiap section | di tiap section | `motion/PixelDivider.tsx` | SVG inline `aria-hidden` | props `color`, `seed`, `size` | Tidak |

**Urutan section:** desktop FIX berurutan Intro → About me (foto) → Stack → Statement → Ask…, sedangkan mobile FIX
dan PRD berurutan Intro → Statement → Stack → About me. **Konfirmasi ke PBS sebelum slicing**; jangan menebak.

## Data & konten

- Semua teks ada di `src/content/*.ts` dengan tipe di `src/types/content.ts`. Copy final ada di PRD §Konten per section.
- Komponen hanya menerima props; tidak ada string konten di JSX selain label UI generik.
- Data yang sama dipakai halaman, JSON-LD, sitemap, `/work/[slug]`, dan korpus RAG.
- Titik yang nanti dinamis ditandai `// DATA: <endpoint/sumber nanti>`, mis. `// DATA: /api/ask (fase akhir)`.
- Slicing **tidak** memanggil `/api/*`, Supabase, Gemini, atau LLM apa pun.

## Ask my CV: slicing statis (sebelum fase akhir)

Saat slicing, section ini tampil sebagai **contoh yang sudah jadi**, bukan chat yang bisa dipakai:

| Bagian | Isi statis | State yang tetap harus didesain (untuk fase akhir) |
|---|---|---|
| Plot 3D | Gambar statis plot (export dari Figma) dengan alt teks | Plot R3F lazy, titik Q dan chunk 1–3 menyala |
| Input | `<input>` berlabel berisi "What did you build for Antistun?" + tombol **Ask** (disabled, dengan teks "Live soon") | idle, mengetik, terkirim |
| Status | "Retrieved 3 of 48 chunks…" | loading/streaming, error, tanpa konteks (template tetap) |
| Jawaban | Teks jawaban contoh dengan sitasi [1]–[3] | streaming, sukses dengan sitasi |
| Chunk | 3 kartu chunk (sumber, skor, isi) | chunk terpilih disorot |

- Daftar pesan nanti memakai `role="log"` + `aria-live="polite"`. Fokus kembali ke input setelah kirim.
- Pesan "di luar CV" berbeda secara visual dari jawaban normal, dan tidak hanya dibedakan dengan warna.

## Prompt Defender: slicing statis

- Section preview: gambar/video loop preview dengan alt, judul, deskripsi, meta, tombol **Play game** dan
  **How it works**.
- Popup (tata letak dari `50:1123` / `50:1374`) di-slice sebagai komponen kosong dengan state: blackout, popup
  terbuka, game over. Isi canvas game dikerjakan di fase akhir.
- Popup = dialog modal: focus trap, `Esc` menutup, fokus kembali ke tombol Play, scroll halaman dikunci.

## Jangan tiru pola ini

- `style={{…}}` inline untuk warna/spasi. Gunakan utility token. Inline style hanya untuk nilai dinamis (posisi
  hasil hitung, CSS variable per instance).
- Satu file section raksasa. Pecah kartu, folder, chip, tombol ke `ui/` setelah dipakai sekitar 3 kali.
- Teks yang hanya ada di canvas, `::before`, atau gambar. Semua teks penting harus berupa teks HTML.
- `div` dengan `onClick` sebagai link/tombol. Pakai `<a>` / `<button>`.
- Animasi di tahap slicing. Slicing menghasilkan HTML statis; motion masuk di tahap 3 tanpa mengubah struktur DOM.

## Responsif & aksesibilitas (PRD §Aksesibilitas)

- Mobile-first: rapi di 360–390 px. Experience di mobile disiapkan sebagai track horizontal (folder 300 px, gap 32,
  folder berikutnya mengintip), tetapi tetap bisa di-scroll native tanpa JS.
- Target sentuh ≥ 44×44 px. Menu mobile layar penuh dengan focus trap, `Esc` menutup.
- Landmark lengkap, satu `<h1>`, heading berurutan, skip link ke `<main>`.
- Gambar dekoratif `alt=""`; foto dan avatar punya alt deskriptif.
- Kontras mengikuti aturan Tema & token. Jangan menurunkan opacity teks di bawah kontras 4,5:1.

## Refine akhir (checklist)

- **Setia Figma:** bandingkan screenshot `localhost:3000` (1440 dan 390) dengan frame FIX. Jarak, ukuran type, dan
  urutan elemen harus sama, kecuali deviasi tercatat.
- **Layout:** margin kiri-kanan sama, tidak ada teks menempel tepi, tidak ada ruang kosong > setengah layar.
- **Typeset:** hanya token type, headline maks 2 baris di 1440 dan 390, body ≥ 16 px.
- **Consistency:** tidak ada hex, palet default Tailwind, nilai arbitrary, inline style warna, atau komponen
  duplikat.
- **SEO:** View Source berisi semua teks section; metadata dan JSON-LD halaman sesuai PRD §SEO.

## Verifikasi (jalankan setelah tiap section)

```bash
npm run check        # lint (0 warning), typecheck, format, vitest, build
npm run test:e2e     # desktop + mobile, axe, console error, reduced-motion
```

Pemeriksaan cepat untuk file yang diubah:

```bash
git diff --name-only | xargs grep -nE "#[0-9a-fA-F]{3,6}\b|\[#|style=\{\{[^}]*(color|margin|padding)|(zinc|slate|gray|blue|cyan)-[0-9]{2,3}|lucide-react|rounded-(lg|xl|2xl|full)"
```

Hasilnya harus kosong untuk kode baru, kecuali `globals.css` (tempat token).

Target: 0 error TS/lint, build sukses, semua route SSG, rapi di 360/390/1440 px, teks lengkap di View Source,
hanya token Cobalt dan dua font.

## Format laporan akhir

```
Section/halaman: <nama section atau route>
Node Figma: <id desktop> / <id mobile>

Changed files:
- path/file1
- path/file2

Komponen dibuat / dipakai ulang:
- Dibuat: src/components/<folder>/<nama>: <fungsi singkat>
- Dipakai ulang: <Button, Tag, PixelDivider, …>

Token & type dipakai:
- <bg-dark, text-on-dark, text-heading, …>

Deviasi dari Figma (demi PRD/a11y/SEO):
- <mis. teks kecil di atas biru → on-accent putih> — atau "tidak ada"

Data:
- <file data yang dipakai + titik // DATA: untuk tahap berikutnya>

Verifikasi:
- npm run check: OK/error (tempel ringkasan output)
- npm run test:e2e: OK/gagal
- View Source teks lengkap: OK/catatan
- 360/390/1440 px: OK/catatan
- a11y (keyboard, landmark, kontras, alt): OK/catatan

Catatan / lanjutan:
- <pertanyaan ke PBS, aset yang belum ada, kebutuhan untuk tahap motion>
```

Kriteria sukses:

- Setia pada Figma FIX dan hanya memakai token Cobalt, dua font, dan skala type/spacing di dokumen ini.
- Semua teks ada di HTML statis; metadata dan JSON-LD sesuai PRD.
- Tidak ada duplikasi komponen dan tidak ada inline style warna/spasi.
- Responsif sampai 360 px dan aksesibel (WCAG 2.2 AA).
- Tidak menyentuh API/DB/LLM. Bagian dinamis masih statis bertanda `// DATA:`.