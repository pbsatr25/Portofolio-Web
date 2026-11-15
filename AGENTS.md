<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Aturan AI — PBS Portfolio V2

File ini adalah sumber aturan untuk semua AI assistant di repo ini (Claude Code, Codex, Copilot, Gemini).
`CLAUDE.md` dan `GEMINI.md` hanya mengimpor file ini. Ubah aturan **di sini saja**.

## 1. Konteks project

Portofolio Prihastomo Budi Satrio (PBS), AI Engineer & Software Engineer, Yogyakarta. Satu halaman panjang yang
interaktif (GSAP, Lenis, canvas), tetapi setiap project dan CV punya URL sendiri untuk SEO.
Target pembaca: recruiter (≤ 60 detik, mayoritas dari HP), engineering manager, mesin pencari dan AI search.
**Semua teks penting harus ada di HTML dari server**, terbaca tanpa JavaScript, canvas, atau WebGL.

- PRD: [`docs/PRD-web.md`](docs/PRD-web.md) (asli: https://claude.ai/artifact/SJFEbcA9LzR9wXYjCMzcrh)
- Desain final: Figma page **FIX** — tema **Cobalt**
  - Desktop 1440: https://www.figma.com/design/82o7BWOuKPyWmOq7g0PFYr?node-id=62-13861
  - Mobile 390: https://www.figma.com/design/82o7BWOuKPyWmOq7g0PFYr?node-id=62-15266
  - Frame di page Design hanya arsip eksplorasi; jangan dijadikan acuan.
- Prototipe perilaku (acuan gerak, bukan kode produksi):
  - Loader + intro: https://claude.ai/artifact/CzFFFUbTu9HJJd2QwJjiD8
  - Background constellation: https://claude.ai/artifact/NVrtBCiMpbNzdskWnNf9qu
  - Plot 3D Ask my CV: https://claude.ai/artifact/ToKGxytV6kDB574vHPuafr
  - Prompt Defender: https://claude.ai/artifact/W8SUZC2vkQ59acninTncDw
- Avatar hero: video AI (WebM alpha + MP4 untuk Safari + poster PNG), lihat [`docs/avatar-video-pipeline.md`](docs/avatar-video-pipeline.md).
- Baca PRD dari folder `docs/` dulu; tautan asli hanya bisa dibuka di browser.
- Jika PRD, Figma, dan kode bertentangan, **berhenti dan tanyakan**; jangan menebak.

Stack: Next.js 16 (App Router, Turbopack, SSG) · React 19 · TypeScript strict · Tailwind v4 · GSAP + ScrollTrigger +
`@gsap/react` · Lenis · Canvas 2D (constellation, pixel divider, game) · three + R3F + drei (hanya plot Ask my CV) ·
Gemini API · Supabase (pgvector) · BGE-M3. Node ≥ 20.9.

### Urutan rilis (PRD §Analytics, QA dan rilis)

1. Fondasi: token, font, layout semantik, metadata, JSON-LD, sitemap, robots
2. Konten statis semua section + `/work/[slug]` + `/cv` (Ask my CV & Prompt Defender tampil statis)
3. Intro dan motion: loader, avatar, GSAP + Lenis, pin per section, Experience horizontal di mobile, pixel divider
4. Background embedding constellation
5. Polish: reduced-motion, a11y, budget performa, OG image per route
6. Rilis v1 + Search Console
7. **Fase akhir:** Ask my CV (RAG live + plot 3D) dan Prompt Defender (`/play`)

Jangan mengerjakan tahap 7 sebelum tahap 1–6 selesai, kecuali diminta.

## 2. Skill yang wajib dipakai

Muat skill yang cocok **sebelum** mulai mengerjakan. Satu tugas boleh memakai lebih dari satu skill.

| Kapan                                   | Skill                                                                  | Kegunaan                                                         |
| --------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Semua tugas coding                      | `ponytail`                                                             | Perubahan terkecil yang menyelesaikan tugas; tanpa dependency berlebih |
| Implementasi section dari Figma         | `figma-design-to-code`, `figma-implement-motion`                       | Ambil layout, token, dan teks dari page FIX                      |
| Membuat / merombak tampilan             | `frontend-design`, `ui-designer`                                       | Tetap setia pada desain FIX                                      |
| Hindari tampilan "AI slop"              | `vectorlab-ux-skills:anti-slop`                                        | Tanpa glassmorphism, gradien, shadow dekoratif                   |
| Spacing & tipografi                     | `vectorlab-ux-skills:spacing`, `vectorlab-ux-skills:typography`        | Ritme 4/8 pt, skala tipe Host Grotesk + Silkscreen               |
| Animasi, motion, shader                 | Lihat §2.1 di bawah                                                    | Pilih skill motion sesuai situasi                                |
| Responsif                               | `vectorlab-ux-skills:viewports`                                        | Aman dari 375 px sampai 1440 px                                  |
| Keyboard & fokus                        | `vectorlab-ux-skills:keyboard`                                         | Focus ring, skip link, trap fokus di menu, popup game, chat      |
| Loading state (chat, game, video)       | `vectorlab-ux-skills:loaders`                                          | Skeleton vs spinner sesuai durasi                                |
| Teks UI, CTA, pesan error chat          | `ux-copywriter` / `ux-writing`                                         | Microcopy jelas, kata kerja di tombol                            |
| SEO, metadata, JSON-LD                  | `google-dev-docs` + PRD §SEO                                           | Metadata API, ProfilePage, sitemap                               |
| Audit aksesibilitas                     | `design-skills:accessibility-audit` atau `design:accessibility-review` | WCAG 2.2 AA                                                      |
| Review sebelum section dianggap selesai | `ui-ux-critic`, `vectorlab-ux-skills:ux-audit`                         | Skor per metrik + daftar perbaikan                               |
| Cek visual di browser                   | `built-in-browser` atau `chrome-browser`                               | Buka `localhost:3000`, screenshot 1440 + 390, bandingkan dengan FIX |
| Avatar hero (video)                     | `docs/avatar-video-pipeline.md`                                        | Encode WebM alpha + MP4, poster, anggaran ≤ 1,5 MB               |
| Update PRD / dokumentasi                | `docs`, `google-dev-docs`                                              | Dokumen yang konsisten                                           |

Nama skill bisa berbeda prefiks di tiap tool; cari dengan kata kuncinya. Jika skill tidak tersedia, ikuti
isi aturan di file ini dan sebutkan bahwa skill tersebut tidak ada.

### 2.1 Skill motion & animasi

Tujuannya animasi yang terasa keren dan halus, bukan animasi sebanyak mungkin. Untuk setiap tugas yang
menyentuh gerak, pilih skill dari tabel ini sesuai tahapnya, muat sebelum menulis kode, dan sebutkan di laporan
skill mana yang dipakai.

| Tahap | Situasi | Skill |
| --- | --- | --- |
| 1. Putuskan | Perlu dianimasikan atau tidak, tujuan geraknya, kurva dan durasi | `animate`, `motion-design` |
| 1. Putuskan | Polish detail interaksi (hover, press, popover, clip-path, transisi vs keyframe) | `emil-design-eng` |
| 1. Putuskan | Gerak "fisik" yang bisa diinterupsi, spring, momentum, kedalaman | `apple-design` |
| 1. Putuskan | Butuh nama efek yang tepat dari deskripsi samar | `animation-vocabulary` |
| 2. Bangun | GSAP di React/Next (`useGSAP`, ref, cleanup) — **selalu** untuk kode GSAP | `gsap-react` |
| 2. Bangun | Tween, easing, stagger, `gsap.matchMedia()` desktop/mobile/reduced-motion | `gsap-core` |
| 2. Bangun | Urutan dan posisi di timeline (loader, intro, Statement) | `gsap-timeline` |
| 2. Bangun | Scroll: pin, scrub, parallax, marquee, Experience horizontal | `gsap-scrolltrigger` |
| 2. Bangun | Plugin (SplitText, Flip, Observer, CustomEase, ScrollTo) dan `gsap.utils` | `gsap-plugins`, `gsap-utils` |
| 2. Bangun | Beberapa elemen bergerak bersama (hero entrance, stagger, swap konten) | `choreograph` |
| 2. Bangun | Drag, swipe, sheet, tap di game/kanvas | `gestures` |
| 2. Bangun | Shader GLSL / efek WebGL (plot Ask my CV, efek kanvas lanjutan) | `shader-dev` (plugin minimax-skills) |
| 3. Rasakan di HP | Tap highlight, 100vh, scroll mobile, sentuhan terasa native | `mobile-native` |
| 4. Performa | Jank, frame drop, pilih properti composite-only, `will-change` | `animation-performance`, `gsap-performance` |
| 5. Review | Review gerak satu section/diff sebelum dianggap selesai | `review-animations` |
| 5. Review | Audit semua motion di repo dan rencana perbaikan | `improve-animations` |
| 5. Review | Terasa lambat atau berlebihan → kurangi | `remove-animations` |
| 5. Review | Cari tempat yang seharusnya bergerak tapi belum | `find-animation-opportunities` |
| Selalu | Fallback reduced-motion | `vectorlab-ux-skills:reduced-motion` |

Aturan pemilihan:

- Minimal satu skill tahap 1 dan satu skill tahap 2 untuk setiap animasi baru; `gsap-react` wajib bila kode memakai
  GSAP. Tambahkan `choreograph` bila lebih dari dua elemen bergerak bersama.
- Sebelum section dengan motion dianggap selesai: `review-animations`, lalu `animation-performance` bila ada scroll,
  pin, kanvas, atau shader.
- Shader dan WebGL hanya untuk plot Ask my CV dan efek yang tetap dalam anggaran performa (§5); konten di
  kanvas/WebGL tetap wajib punya padanan teks HTML.
- Bila saran skill bertentangan dengan aturan proyek, **aturan proyek menang**: hanya `transform`/`opacity`/
  `clip-path`, easing default `expo.out`, durasi masuk 420 ms, tanpa bounce, `prefers-reduced-motion` dan
  `Save-Data` mematikan pin, loader, dan video (§5 Motion). Tanyakan ke PBS bila ingin melanggarnya.

## 3. Alur kerja setiap tugas

1. **Pahami** — baca bagian PRD terkait, frame Figma FIX yang relevan, dan file yang akan diubah. Untuk API Next.js, baca `node_modules/next/dist/docs/`.
2. **Rencanakan singkat** — sebutkan file yang akan diubah dan cara mengujinya. Tugas besar: pecah jadi langkah kecil.
3. **Tulis test dulu** jika menyentuh logika (util, data loader, sitemap/JSON-LD, API route, parser RAG, logika game).
4. **Implementasi** dengan skill yang relevan dari bagian 2. HTML statis dulu, animasi sesudahnya.
5. **Verifikasi** — jalankan quality gate (bagian 4). Untuk perubahan UI, cek juga di browser (1440 + 390), dengan
   `prefers-reduced-motion`, dan lewat View Source (teks harus ada tanpa JS).
6. **Laporkan** — apa yang berubah, hasil perintah verifikasi, dan apa yang belum dicek. Jangan klaim "sudah jalan"
   tanpa output perintahnya.

## 4. Quality gate (wajib lolos sebelum selesai)

| Perintah               | Mengecek                                                                 |
| ---------------------- | ------------------------------------------------------------------------ |
| `npm run lint`         | ESLint, **0 warning**                                                    |
| `npm run typecheck`    | TypeScript tanpa error                                                   |
| `npm run format:check` | Prettier (perbaiki dengan `npm run format`)                              |
| `npm test`             | Unit test Vitest (`src/**/*.test.ts(x)`)                                 |
| `npm run build`        | Build produksi Next.js (semua route publik harus SSG)                    |
| `npm run check`        | Semua di atas sekaligus                                                  |
| `npm run test:e2e`     | Playwright: desktop + mobile, a11y axe, console error, reduced-motion, teks ada tanpa JS |
| `npm run lhci`         | Lighthouse CI: Performance ≥ 90 (mobile), SEO 100, Accessibility ≥ 95, Best Practices 100 |

- Jalankan `npm run check` setelah setiap perubahan kode. Jalankan `npm run test:e2e` setelah perubahan UI, routing,
  animasi, atau canvas. Jalankan `npm run lhci` sebelum merge ke `main`.
- Pertama kali di mesin baru: `npx playwright install chromium`.
- **Dilarang** mematikan test, menambah `eslint-disable`, `@ts-ignore`, `any`, atau `.skip` untuk meloloskan gate.
  Jika memang perlu, tulis alasannya di komentar dan sebutkan di laporan.
- Bug yang diperbaiki harus disertai test yang gagal sebelum perbaikan.

## 5. Aturan kode

**Umum**

- TypeScript strict, tanpa `any`. Import pakai alias `@/`.
- Server Component secara default; `"use client"` hanya untuk komponen yang butuh state, efek, GSAP, atau canvas.
- Konten (teks, proyek, pengalaman, stack, meta SEO) hanya di `src/content/`; jangan hardcode di komponen.
  Data ini dipakai bersama oleh halaman, JSON-LD, sitemap, dan korpus RAG. Copy final ada di PRD §Konten per section.
- Jangan tambah dependency baru tanpa alasan tertulis (ukuran bundle, alternatif yang sudah ada).

**SEO** (PRD §SEO)

- Semua route publik SSG. Judul, `<h1>`, dan semua teks section ada di HTML awal.
- Metadata hanya lewat Metadata API (`metadata`/`generateMetadata`), `metadataBase` + `title.template` di root layout,
  `alternates.canonical` di setiap route. Jangan pakai `next-seo`.
- JSON-LD: `ProfilePage` + `Person` di `/`, `CreativeWork` + `BreadcrumbList` di `/work/[slug]`. Isi markup harus
  sama dengan teks yang terlihat.
- Navigasi pakai `<a href>` / `next/link`, bukan `onClick`. Anchor section pakai id (`/#work`).
- Teks yang dianimasikan tetap di DOM dan terlihat tanpa interaksi. Konten di canvas/WebGL wajib punya padanan teks.
- `/api/*` kirim `X-Robots-Tag: noindex` dan di-disallow di robots.

**Motion** (PRD §Spesifikasi intro, animasi dan background)

- GSAP lewat `useGSAP()` (`@gsap/react`) agar otomatis cleanup. Pisahkan desktop/mobile dengan `ScrollTrigger.matchMedia`.
- Hanya animasikan `transform`, `opacity`, dan `clip-path`. Easing default `expo.out`, durasi masuk 420 ms.
- Lenis terhubung ke `ScrollTrigger.update` dan `gsap.ticker`; di touch device pakai scroll native.
- Loader maksimal 1,2 s, sekali per sesi, ada tombol skip, tidak menutupi elemen LCP.
- `prefers-reduced-motion` atau `Save-Data` → tanpa loader, tanpa pin/scroll-jacking, tanpa video, constellation
  diam; transisi hanya fade. Semua konten tetap tampil.

**Canvas, 3D & performa** (PRD §Performa dan Core Web Vitals)

- Background constellation: satu `<canvas>` fixed, `aria-hidden`, DPR maks 2, jumlah titik setengah di mobile,
  berhenti saat offscreen atau tab tersembunyi.
- WebGL hanya untuk plot Ask my CV: satu `<Canvas>` R3F, dimuat dengan `next/dynamic` saat section mendekati viewport.
- Prompt Defender (Canvas 2D) dimuat hanya saat tombol Play ditekan; scroll halaman dikunci selama main.
- Tidak boleh membuat objek baru (`new Vector3`, array, dll.) di dalam loop `requestAnimationFrame`/`useFrame`.
- Nilai yang berubah tiap frame ditulis ke `ref`/uniform, bukan React state.
- Dispose geometri, material, dan tekstur saat unmount.
- Semua gambar, video, dan canvas punya ukuran atau `aspect-ratio` (CLS ≤ 0,1).
- Anggaran: JS awal halaman `/` ≤ 170 KB gzip (tanpa three), chunk three + R3F ≤ 250 KB gzip, game ≤ 80 KB gzip,
  poster avatar ≤ 120 KB, video avatar ≤ 1,5 MB, LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 (p75 mobile).

**Aksesibilitas** (WCAG 2.2 AA)

- HTML semantik, satu `h1` per halaman, label terlihat di semua input, kontras ≥ 4,5:1.
- Teks kecil di atas aksen biru memakai `--on-accent` (putih); teks hitam di atas aksen hanya untuk teks ≥ 24 px.
- Semua interaksi bisa dipakai dengan keyboard; focus ring jangan dihapus. Menu mobile dan popup game menjebak fokus,
  Esc menutup.
- Target sentuh ≥ 44×44 px. Canvas dekoratif `aria-hidden`.

**Desain**

- Warna hanya lewat token CSS tema Cobalt di `globals.css`; tanpa hex di komponen:
  `--bg #E4E4E1` · `--surface #EFEFEC` · `--ink #111111` · `--ink-muted #55554F` · `--accent #3B5BFF` ·
  `--on-accent #FFFFFF` · `--accent-on-dark #3B5BFF` · `--dark #121212` · `--dark-raised #1E1E1D` ·
  `--on-dark #F2F2EF` · `--on-dark-muted #A3A39E` · `--line #CBCBC7` · `--dark-line #2E2E2C` · `--photo-bg #1D1D1D`
- Font: Host Grotesk (teks) dan Silkscreen (pixel) lewat `next/font`. Tidak ada font ketiga.
- Tanpa gradien, shadow dekoratif, glassmorphism, atau emoji. Pembatas antar section = pixel dissolve
  (24 px desktop, 13 px mobile).

**AI / RAG & keamanan** (PRD §Kebutuhan fungsional, Ask my CV)

- API key hanya di server (`src/app/api/**`). Jangan pernah memakai prefiks `NEXT_PUBLIC_` untuk secret.
- Jangan commit `.env.local`. Tambah variabel baru ke `.env.example`.
- Validasi semua input API (maks 300 karakter, tipe). Rate limit per IP wajib sebelum `/api/ask` dipublikasikan.
- Jawaban bot hanya dari korpus `src/content/`, wajib sitasi `[n]`; jika tidak ada di korpus, balas dengan template tetap.

## 6. Git

- Branch per fitur: `feat/intro-loader`, `feat/experience-horizontal`, `fix/ask-validation`.
- Pesan commit Conventional Commits: `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`.
- Satu commit = satu perubahan logis. `npm run check` lolos sebelum commit.
- Jangan push, force-push, atau hapus branch tanpa diminta.

## 7. Struktur folder

```
docs/                    PRD web + pipeline avatar (sumber kebenaran fitur)
src/app/                 route (/, /work/[slug], /cv, /play), layout, sitemap.ts, robots.ts,
                         opengraph-image.tsx, api/ask
src/components/sections/ Intro, Statement, Stack, About, AskMyCV, PromptDefender, Work, Experience, Contact
src/components/motion/   SmoothScroll (Lenis), Loader, PixelDivider, Constellation
src/components/ui/       Nav, Button, Tag, MobileMenu
src/components/canvas/   AskPlot (R3F), game Prompt Defender
src/content/                semua konten, meta SEO, korpus RAG
e2e/                     Playwright
tests/                   setup Vitest
public/media/            avatar (webm, mp4, poster), foto, OG statis
art/                     file sumber lokal (video referensi, foto mentah); di-.gitignore, tidak di-commit
```

## 8. Definition of done

- [ ] Sesuai PRD (sebutkan bagian yang diacu) dan frame Figma FIX
- [ ] `npm run check` lolos; `npm run test:e2e` lolos untuk perubahan UI/animasi/canvas
- [ ] Dicek di 1440 px, 390 px, 375 px, dan dengan `prefers-reduced-motion`
- [ ] View Source menampilkan semua teks section tanpa JS
- [ ] Tidak ada error di console, tidak ada pelanggaran a11y serius
- [ ] Anggaran performa tidak terlampaui
- [ ] Laporan berisi hasil perintah verifikasi dan hal yang belum dicek