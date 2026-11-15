# PRD — Portfolio Website Prihastomo (PBS)

Nov 14, 2026 · @Prihastomo Budi Satrio

## Ringkasan

Situs portfolio satu halaman untuk Prihastomo Budi Satrio (PBS), dibangun dengan Next.js, GSAP dan Three.js. Tujuannya membuat recruiter AI engineer dan software engineer bisa menilai skill dalam waktu kurang dari 60 detik, lalu menghubungi atau mengunduh CV. Desain final ada di Figma, page FIX: "Theme 1 · Cobalt / Desktop" (1440) dan "Theme 1 · Cobalt / Mobile" (390).

Prinsip utama: interaktif dan "wow" tetapi tetap cepat, terindeks penuh oleh Google, dan terbaca oleh mesin AI search. Semua teks penting dirender di server sebagai HTML; animasi dan WebGL hanya lapisan di atasnya.

**Target pengguna**

- Recruiter dan hiring manager (mayoritas membuka dari HP, lewat LinkedIn atau Google)
- Engineer yang menilai kedalaman teknis (Ask my CV, case study)
- Mesin pencari dan AI search (Google, Bing, ChatGPT search, Perplexity, Gemini)

**Metrik sukses**

| Metrik | Target | Cara ukur |
| --- | --- | --- |
| Peringkat query nama "Prihastomo Budi Satrio" | Posisi 1 dalam 4 minggu setelah rilis | Google Search Console |
| Halaman terindeks | 100% URL di sitemap | Search Console, laporan Pages |
| Core Web Vitals (mobile, p75) | LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 | CrUX / Vercel Speed Insights |
| Lighthouse mobile | Performance ≥ 90, SEO 100, Accessibility ≥ 95, Best Practices 100 | Lighthouse CI di setiap PR |
| Konversi kontak | ≥ 5% sesi klik email, LinkedIn atau Download CV | Event analytics |
| Pemakaian fitur | ≥ 15% sesi mencoba Ask my CV atau Prompt Defender | Event analytics |

## Desain final dan tema warna

Tema yang dipakai adalah Cobalt: aksen biru elektrik #3B5BFF di atas abu-abu netral dan section hitam. Acuan satu-satunya untuk development adalah page FIX di Figma; frame di page Design hanya arsip eksplorasi.

| Token | Hex | Dipakai untuk |
| --- | --- | --- |
| `bg` | #E4E4E1 | Latar section terang |
| `surface` | #EFEFEC | Kartu dan panel di section terang |
| `ink` | #111111 | Teks utama di latar terang |
| `ink-muted` | #55554F | Teks sekunder |
| `accent` | #3B5BFF | Section statement dan Prompt Defender, tombol email, tag, pixel divider |
| `on-accent` | #111111 (Figma) | Teks di atas aksen, lihat aturan kontras di bawah |
| `accent-on-dark` | #3B5BFF | Aksen di section gelap (baris Stack, chunk Ask my CV) |
| `dark` | #121212 | Section Stack, Work, Contact |
| `dark-raised` | #1E1E1D | Kartu di section gelap |
| `on-dark` | #F2F2EF | Teks di section gelap |
| `on-dark-muted` | #A3A39E | Teks sekunder di section gelap |
| `line` | #CBCBC7 | Garis di latar terang |
| `dark-line` | #2E2E2C | Garis di latar gelap |
| `photo-bg` | #1D1D1D | Latar foto dan avatar |

**Aturan implementasi warna**

- Token di atas menjadi CSS custom properties di `:root` (`--color-accent`, dst.), diambil dari collection Tokens mode Cobalt. Tidak ada hex yang ditulis langsung di komponen.
- Kontras teks hitam di atas #3B5BFF sekitar 4,0:1. Ini cukup untuk teks besar (≥ 24 px, atau ≥ 18,7 px bold), misalnya statement "I BUILD AI…" dan judul Prompt Defender.
- Teks kecil di atas aksen (label samping, body, chip) memakai putih #FFFFFF (kontras sekitar 4,8:1) lewat `on-accent`, agar lolos WCAG AA. Ini satu-satunya penyimpangan dari Figma.
- Font tetap Host Grotesk (teks) dan Silkscreen (pixel).

## Ruang lingkup dan struktur halaman

Situs tetap terasa satu halaman panjang, tetapi setiap project dan CV punya URL sendiri. Satu halaman saja hanya bisa bersaing untuk satu set kata kunci. URL terpisah memberi Google lebih banyak halaman untuk diindeks dan memberi recruiter link yang bisa dibagikan.

| Route | Isi | Render | Prioritas |
| --- | --- | --- | --- |
| `/` | Semua section desain V2: loader, intro, statement, stack, about, Ask my CV, Prompt Defender preview, work, experience, contact | SSG | P0 |
| `/work/[slug]` | Case study per project: Antistun, IKU Chatbot, Shardfall, eGolek. Masalah, peran, arsitektur, hasil, stack | SSG | P0 |
| `/cv` | CV versi HTML lengkap + tombol unduh PDF | SSG | P0 |
| `/play` | Prompt Defender layar penuh, bisa dibagikan langsung | SSG (game dimuat di client) | P1 |
| `/notes/[slug]` | Tulisan teknis pendek tentang RAG, eval, dsb. dari pengalaman sendiri | SSG | P2 |
| `/api/ask` | Endpoint RAG untuk Ask my CV | Edge/Node function, `noindex` | P0 |
| `/opengraph-image`, `/sitemap.xml`, `/robots.txt` | File SEO otomatis Next.js | Build time | P0 |

**Di luar ruang lingkup v1:** CMS, versi bahasa Indonesia, login, komentar.

**Pertanyaan terbuka**

- Domain final: `prihastomo.dev`, `pbs.dev`, atau lainnya? Domain harus ditetapkan sebelum rilis karena dipakai di canonical, sitemap dan structured data.
- Bahasa utama konten: Inggris (asumsi PRD ini) atau dua bahasa?

## Kebutuhan fungsional per section

Setiap section wajib menampilkan teksnya sebagai HTML biasa sejak response pertama. Animasi, canvas dan WebGL hanya menghias teks yang sudah ada, tidak pernah menggantikannya.

| Section | Perilaku | Kriteria terima |
| --- | --- | --- |
| Loader | Hitungan 0–100 dan reveal ala cappen.com. Hanya tampil di kunjungan pertama per sesi; maksimal 1,2 s; tombol skip | Bukan elemen LCP. HTML intro sudah ada di DOM di bawah loader. Tidak tampil untuk bot dan `prefers-reduced-motion` |
| Intro | "Porto/Folio" besar, avatar 3D video (WebM alpha, MP4 untuk Safari), kartu intro biru Cobalt, nav | `<h1>` berisi nama dan peran. Poster avatar sebagai `<img>` dengan `fetchpriority=high`; video baru dimuat setelah idle |
| Statement | Kata bertumpuk masuk satu per satu, wajah dither di "\*( )" | Kalimat lengkap ada sebagai satu `<p>`; animasi per kata hanya pada `aria-hidden` |
| Stack | 3 baris marquee berlawanan arah | Daftar tech juga ada sebagai `<ul>` teks biasa. Marquee berhenti saat offscreen |
| About me | Foto asli, ringkasan, daftar fakta, Download CV, LinkedIn, GitHub | Foto `next/image` dengan alt deskriptif; fakta sebagai `<dl>` |
| Ask my CV | Plot 3D embedding yang bisa diputar + chat RAG yang mengutip chunk CV | WebGL dimuat lazy saat mendekati viewport. Pertanyaan contoh dan satu jawaban contoh dirender server-side sebagai teks |
| Prompt Defender | Preview video/canvas; Play membuka blackout + popup game layar penuh | Game hanya dimuat saat Play ditekan. Tap untuk mobile, mouse/keyboard untuk desktop. Scroll halaman dikunci saat main |
| Work | Dek kartu project yang naik saat scroll | Setiap kartu adalah `<a href="/work/slug">` asli |
| Experience | Folder per tahun, scroll horizontal ter-pin di mobile, file naik keluar | Semua posisi ada di DOM sebagai list; versi reduced-motion menampilkan list vertikal |
| Contact | SAY HELLO, tombol email, link sosial, footer | Email `mailto:`, link sosial memakai `rel="me"` |
| Background constellation | Titik dan garis k-nearest yang bereaksi ke kursor/tap, warna mengikuti section | Satu `<canvas>` fixed, DPR maks 2, pause saat tab tersembunyi, jumlah titik setengah di mobile |
| Pixel divider | Pixel dissolve antar section, 24 px desktop / 13 px mobile | SVG inline atau canvas kecil; muncul dengan `steps()` sekitar 300 ms; dekoratif (`aria-hidden`) |

**Ask my CV (RAG)**

- Korpus: CV dan case study, dipecah sekitar 29 chunk, embedding dengan BGE-M3, disimpan di Supabase pgvector.
- Retrieval hybrid (vector + keyword), top-k 3, jawaban dari LLM dengan sitasi `[n]` ke chunk.
- Batas: rate limit per IP, maksimal 300 karakter per pertanyaan, menolak pertanyaan di luar topik CV.
- Jawaban di-stream; chunk yang dipakai disorot di plot 3D.

## Konten per section

Semua teks di bawah diambil persis dari frame FIX · Theme 1 Cobalt / Desktop dan menjadi copy final v1 (bahasa Inggris). Konten disimpan sebagai data terstruktur (`content/*.ts` atau MDX), bukan di-hardcode di komponen, supaya halaman `/`, `/work/[slug]`, `/cv` dan JSON-LD membaca sumber yang sama.

### Intro

- Nav: PBS (logo) · About · Stack · Ask · Play · Work · Contact · tombol **Download CV**
- Wordmark: **PortoFolio** (dekoratif, `aria-hidden`)
- `<h1>`: **Prihastomo Budi Satrio** — AI Engineer & Software Engineer, Yogyakarta
- Petunjuk: Scroll

### Statement

- Kalimat utama (satu `<p>` untuk SEO, kata per kata untuk animasi): **I BUILD AI THAT SHOWS ITS SOURCES & INTERFACES PEOPLE TRUST**
- Label samping: RAG, end to end · Gemini · pgvector · BGE-M3 · Yogyakarta, Indonesia · From Figma to production · Software Engineering, UGM

### Stack

- Judul: **Stack**
- Deskripsi: What I reach for, grouped by job. Each row slides the opposite way to the one above it as you scroll.

| Baris | Isi |
| --- | --- |
| AI | RAG · BGE-M3 · pgvector · ChromaDB · Gemini API · LLMs · Machine learning |
| Web | Python · Next.js · React · Tailwind CSS · Supabase · JavaScript · GitHub |
| Design & 3D | Three.js · Figma · Blender · Illustrator · Photoshop · Solidity |

### About me

- Tag foto: The real one, not the avatar
- Lead: I’m Prihastomo, a software engineering student at Vocational School UGM who builds AI products from the first Figma frame to the deployed app.
- Body: Most of my recent work is retrieval-augmented generation: chatbots that answer from real documents and show their sources. I led the software team behind Antistun, presented at PIMNAS 39, and built the RAG pipeline for the IKU Diktisaintek chatbot. I also design, from GDGOC visuals to a first-place poster at TEDI 2025, and I assist the Software Design lab.
- Tombol: **Download CV** · LinkedIn · GitHub

| Fakta | Isi |
| --- | --- |
| Based in | Yogyakarta, Indonesia |
| Studying | Software Engineering Technology, UGM |
| Focus | RAG, LLM apps, full-stack web |
| Also | UI/UX design, Blender 3D |
| Open to | AI engineer and software engineer roles |

### Ask my CV

- Judul: **Ask my CV**
- Deskripsi: This box runs the pipeline I built for Antistun. Your question is embedded, the closest pieces of my CV are pulled, and the answer cites them. Anything outside my CV gets a fixed reply.
- Plot: sumbu dim 1, dim 2, dim 3; titik Q (pertanyaan) dan chunk 1–3 yang terambil.
- Contoh pertanyaan default: What did you build for Antistun? · tombol **Ask**
- Status: Retrieved 3 of 48 chunks with hybrid search in 212 ms
- Jawaban contoh: I led the software team and built the AI assistant: a RAG pipeline on Gemini with pgvector hybrid search in Supabase \[1\]. Every answer cites WHO or Kemenkes material and passes a faithfulness check, with a fixed template when it fails \[2\]. We presented it at PIMNAS 39 \[3\].
- Saran: Try “Which embedding models have you used?” or “What is Shardfall?”

| Chunk | Skor | Isi |
| --- | --- | --- |
| \[1\] CV / Antistun | 0.84 | Built a RAG assistant on Gemini with pgvector hybrid search in Supabase. |
| \[2\] CV / Antistun | 0.79 | Safety layers: question classification, WHO and Kemenkes citations, faithfulness check, template fallback. |
| \[3\] CV / Awards | 0.71 | Presented the project at PIMNAS 39, the national student science week. |

Sebelum fase akhir, pertanyaan, status dan jawaban contoh ini dirender statis. Angka "48 chunks" dan "212 ms" harus disesuaikan dengan korpus dan latensi nyata saat RAG live.

### Prompt Defender

- Judul: **Prompt Defender**
- Deskripsi: Hallucinations are raining on the model. Fire citations, chain the blasts, and catch relevant chunks to reload. A small arcade game about grounding every answer.
- Meta: Canvas 2D · desktop and mobile · four waves and a boss
- HUD preview: wave 4 · score 1770 · Preview · tap to fire · catch white chunks
- Tombol: **Play game** · How it works

### Work

Judul: **Work**. Setiap kartu menautkan ke `/work/[slug]` dengan tombol **Read the case study**.

| Project | Tahun | Peran | Deskripsi | Stack |
| --- | --- | --- | --- | --- |
| Antistun | 2026 | Head of Software, PKM-KC UGM | A health assistant that answers from WHO and Kemenkes sources, checks its own replies, and falls back to a safe template. Presented at PIMNAS 39. | Next.js · Tailwind CSS · Supabase · pgvector · Gemini API |
| Shardfall | 2026 | Developer & PM, Monad Blitz Jogja 2026 | A multiplayer battle royale in the browser. Tickets wait in escrow, maps are verified by commit–reveal, and the contract pays the winner. | React · Three.js · wagmi · Colyseus · Solidity |
| IKU Chatbot | 2025 | AI Engineer & Frontend, Diktisaintek Berdampak | Answers questions about the IKU Diktisaintek Berdampak programme from its own documents, from chunking to retrieval. | BGE-M3 · ChromaDB · RAG pipeline · Python |
| eGolek | 2025 | UX designer, FIND IT 2025 | An LLM-assisted way to report, search for and verify items lost in public places. | Figma · user flows · LLM concept |

### Experience

- Judul: **Experience**
- Deskripsi: Three folders, one per year. Scroll and each one slides up, its flap tips forward and the files rise out. Hover a file to lift it. (Mobile: One folder per year. Keep scrolling and the shelf slides sideways to the next one.)
- Tombol: **Download the full CV**

| Folder | Waktu | Peran | Organisasi |
| --- | --- | --- | --- |
| 2026 (4 files) | Jan – Nov | Head of Software | PKM-KC UGM Antistun |
| 2026 | Oct | Developer & Project Manager | Shardfall, Monad Blitz Jogja |
| 2026 | Jun | UI/UX Designer | RDK 1447H website |
| 2026 | Mar – Oct | Design subcoordinator | PIONIR PERMADANI 2026 |
| 2025 (4 files) | Aug – Dec | AI Engineer & Frontend | Chatbot IKU Diktisaintek |
| 2025 | Aug – now | Lab Assistant, Software Design | Vocational School UGM |
| 2025 | Oct – now | UI/UX, Website | Berbagi Bites Jogja |
| 2025 | Nov – Jun 2026 | UI/UX Designer | Google Developer Groups on Campus |
| 2024 (2 files) | Nov – now | Vice Head, Media & Info | KOMATIK |
| 2024 | Aug | Started Software Engineering | Universitas Gadjah Mada |

### Contact dan footer

- Ajakan: Looking for an AI or software engineer? Let’s talk.
- Judul besar: **SAY HELLO**
- Tombol: **prihastomobudis@gmail.com** (`mailto:`) · LinkedIn · GitHub · Download CV
- Footer: Prihastomo Budi Satrio, 2026 · Built with Next.js, Three.js and GSAP

### Meta SEO per halaman (draf)

| Route | Title | Meta description |
| --- | --- | --- |
| `/` | Prihastomo Budi Satrio — AI Engineer & Software Engineer | AI and software engineer in Yogyakarta building RAG chatbots that cite their sources, from Figma to production. Ask my CV, see the work, get in touch. |
| `/work/antistun` | Antistun: a RAG health assistant — Prihastomo Budi Satrio | How I led the software team behind Antistun, a Gemini + pgvector assistant that cites WHO and Kemenkes sources. Presented at PIMNAS 39. |
| `/work/shardfall` | Shardfall: browser battle royale on Monad — Prihastomo Budi Satrio | A multiplayer browser battle royale with escrowed tickets and commit–reveal maps, built with React, Three.js and Solidity at Monad Blitz Jogja 2026. |
| `/work/iku-chatbot` | IKU Diktisaintek Chatbot: RAG with BGE-M3 — Prihastomo Budi Satrio | Building the retrieval pipeline for the IKU Diktisaintek Berdampak chatbot, from chunking to BGE-M3 embeddings and ChromaDB search. |
| `/work/egolek` | eGolek: LLM-assisted lost and found — Prihastomo Budi Satrio | UX design for eGolek, an LLM-assisted way to report, search for and verify items lost in public places. FIND IT 2025. |
| `/cv` | CV — Prihastomo Budi Satrio | Experience, projects, skills and awards of Prihastomo Budi Satrio, AI and software engineer at UGM. Download the PDF. |
| `/play` | Prompt Defender — a small arcade game about grounding | Fire citations at falling hallucinations and catch relevant chunks to reload. A browser arcade game about RAG, playable on desktop and mobile. |

### Kerangka case study `/work/[slug]`

1. Ringkasan satu kalimat + peran, tim, tahun, durasi
2. Masalah: siapa penggunanya dan apa yang salah sebelumnya
3. Yang saya kerjakan: keputusan teknis dan alasannya
4. Arsitektur: diagram (gambar dengan alt) + penjelasan singkat
5. Hasil: angka nyata (akurasi, latensi, jumlah pengguna, penghargaan)
6. Yang saya pelajari / akan saya ubah
7. Stack + link (repo, demo, video, berita)

**Konten yang masih perlu dari PBS**

- [ ] URL LinkedIn dan GitHub final
- [ ] File CV PDF terbaru
- [ ] Untuk tiap project: angka hasil, link repo/demo, 2–4 gambar atau screenshot
- [ ] Daftar penghargaan lengkap untuk `/cv` (PIMNAS 39, TEDI 2025, dll.)
- [ ] Avatar video final (WebM alpha + MP4) dan foto asli resolusi penuh

## Spesifikasi intro, animasi dan background

Semua motion memakai satu bahasa gerak: masuk dengan ease-out kuat, tidak ada bounce, dan semuanya bisa dimatikan oleh `prefers-reduced-motion`. Prototipe yang sudah dibuat menjadi acuan perilaku, sedangkan Figma page FIX menjadi acuan tampilan.

**Aturan umum motion**

- Easing default `expo.out` (GSAP), durasi masuk 420 ms, stagger 40–60 ms per kata/baris.
- Smooth scroll dengan Lenis (`lerp` sekitar 0,1), terhubung ke `ScrollTrigger.update`. Di touch device, Lenis memakai scroll native (`syncTouch: false`) agar tidak terasa berat.
- Yang dianimasikan hanya `transform` dan `opacity` (dan `clip-path` untuk reveal). Tidak menganimasikan `width`, `height`, `top` atau `left`.
- Setiap ScrollTrigger dibuat di dalam `gsap.context()` / `useGSAP` dan dibersihkan saat unmount.
- `ScrollTrigger.matchMedia` memisahkan perilaku desktop (≥ 1280) dan mobile (≤ 767).

**Loader dan intro** (acuan: [prototipe loader](https://claude.ai/artifact/CzFFFUbTu9HJJd2QwJjiD8), frame Intro storyboard di Figma)

1. Loader: hitungan 0–100 dengan angka pixel, lalu panel terbuka seperti tirai. Total maksimal 1,2 s, hanya kunjungan pertama per sesi, tombol skip.
2. Tulisan "Porto/Folio" naik per baris dari balik mask (masked line rise).
3. Avatar muncul (poster dulu, lalu video WebM alpha diputar setelah idle). Posisi setengah badan, sedikit zoom out.
4. Nav dan kartu intro biru masuk terakhir dari bawah.
5. Saat scroll: avatar bergerak lebih lambat dari teks (parallax sekitar 0,6) dan sedikit mengecil. Kartu intro tetap menempel di bawah sampai section berikutnya masuk.

**Per section saat scroll**

| Section | Gerak | Trigger |
| --- | --- | --- |
| Statement | Kata bertumpuk masuk satu per satu, wajah dither di "\*( )" muncul terakhir | `scrub`, section di-pin selama sekitar 1 layar |
| Stack | 3 baris marquee berlawanan arah; kecepatan bertambah mengikuti kecepatan scroll lalu kembali normal | Loop terus selama terlihat, pause offscreen |
| About me | Foto terbuka dengan `clip-path` dari bawah; fakta masuk bertahap | Sekali saat masuk viewport |
| Ask my CV | Plot 3D berputar pelan sendiri; kartu chat naik | Sekali saat masuk viewport |
| Prompt Defender | Preview berputar sebagai video/canvas loop; Play → layar menghitam 300 ms lalu popup game membesar dari tengah | Klik Play |
| Work | Dek kartu: kartu berikutnya naik menutupi yang sebelumnya; progress segmen mengikuti | `scrub`, section di-pin selama jumlah kartu × 1 layar |
| Experience | Desktop: folder terbuka dan file naik keluar. Mobile: deretan folder digeser horizontal, lalu file naik | `scrub` + pin; versi mobile memakai pin horizontal |
| Contact | "SAY HELLO" naik per huruf; band pixel bergeser | Sekali saat masuk viewport |
| Pixel divider | Pixel muncul baris demi baris dari atas, `steps(4)`, sekitar 300 ms | Sekali saat batas section masuk viewport |

**Background: Embedding constellation** (acuan: [prototipe constellation](https://claude.ai/artifact/NVrtBCiMpbNzdskWnNf9qu))

- Satu `<canvas>` fixed di belakang semua konten (`aria-hidden`, `pointer-events: none` kecuali untuk input kursor yang dibaca dari `window`).
- Titik-titik melayang pelan seperti vektor embedding. Garis digambar dari kursor atau titik tap ke k titik terdekat, meniru pencarian nearest neighbour di RAG.
- Klik atau tap mengirim gelombang yang mendorong titik sesaat.
- Saat scroll, lapisan titik bergerak dengan parallax ringan.
- Warna ikut ground section yang sedang terlihat (abu-abu, biru Cobalt, hitam) dan berganti dengan crossfade sekitar 400 ms.
- Jumlah titik di mobile setengah dari desktop, DPR maksimal 2, berhenti saat tab tersembunyi. Nilai awal jumlah titik, k dan kecepatan diambil dari panel Tweak di prototipe, lalu disetel ulang saat QA perangkat.
- `prefers-reduced-motion`: titik diam, tanpa garis interaktif.

## Arsitektur teknis

Semua halaman dibangun statis dan dikirim dari CDN, jadi crawler dan pengunjung menerima HTML yang sama. Satu-satunya bagian dinamis adalah `/api/ask` untuk Ask my CV.

&#91;embedded content: arsitektur · HTML statis di edge, modul berat dimuat lazy\]

Pengunjung dan crawler membaca HTML yang sama dari edge. Modul berat baru dimuat di browser, dan hanya Ask my CV yang memanggil server.

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Framework | Next.js (App Router), TypeScript, SSG | Metadata API, sitemap/robots/OG bawaan, HTML lengkap di build |
| Styling | CSS Modules atau Tailwind + token dari Figma (variabel Tokens) | Token sama dengan desain |
| Motion | GSAP + ScrollTrigger, Lenis | Pin, scrub dan stagger sesuai storyboard |
| 3D | React Three Fiber + drei, dimuat dengan `next/dynamic` (`ssr:false`) | Hanya untuk plot Ask my CV |
| Canvas 2D | Constellation, game Prompt Defender, pixel divider | Lebih ringan dari WebGL untuk efek 2D |
| RAG | Supabase pgvector, BGE-M3, LLM API, streaming | Sama dengan stack project nyata PBS |
| Hosting | Vercel (atau Cloudflare Pages) | Edge CDN, preview per PR, Speed Insights |
| Kualitas | ESLint, Playwright, Lighthouse CI | Mencegah regresi SEO dan performa |

## SEO

SEO situs ini bertumpu pada tiga hal: HTML yang lengkap dari server, satu entitas "Prihastomo Budi Satrio" yang konsisten di seluruh web, dan konten case study yang hanya bisa ditulis oleh PBS sendiri. Google menyatakan AI Overviews dan AI Mode memakai indeks dan sistem ranking Search yang sama, jadi tidak ada trik AEO/GEO terpisah yang perlu dikejar ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).

### 1. Rendering dan crawlability

- Semua route dirender statis (SSG) dengan App Router. Konten teks lengkap ada di HTML awal, sebelum JavaScript berjalan.
- Googlebot tidak merender WebGL dan tidak mengklik objek di scene, jadi konten di dalam canvas tidak terbaca ([three.js forum](https://discourse.threejs.org/t/seo-for-three-js-sites/10064)). Plot 3D, game dan constellation selalu punya padanan teks di DOM.
- Navigasi memakai `<a href>` asli, bukan `onClick`. Anchor section memakai id (`/#work`), bukan hash routing.
- Jangan blokir `/_next/` atau file JS/CSS di robots.txt. Blokir hanya `/api/`.
- Teks yang disembunyikan untuk animasi (opacity 0, `clip-path`) harus tetap ada di DOM dan muncul tanpa interaksi. Tidak ada konten yang hanya muncul setelah scroll-trigger berjalan.
- Halaman 404 mengembalikan status 404 asli; tidak ada soft 404.

### 2. Metadata (Next.js Metadata API)

- `metadataBase` dan `title.template` ("%s — Prihastomo Budi Satrio") di root layout. Jangan campur dengan `next-seo`.
- `alternates.canonical` di setiap route, URL absolut, tanpa trailing slash, satu versi domain (redirect 301 dari `www` atau sebaliknya).
- Title unik per halaman, maksimal sekitar 60 karakter. Contoh home: "Prihastomo Budi Satrio — AI Engineer & Software Engineer".
- Meta description unik, 140–160 karakter, menyebut RAG, Next.js, dan Yogyakarta.
- Open Graph dan Twitter card lengkap. Gambar OG 1200×630 per route dibuat dengan `opengraph-image.tsx` (`ImageResponse`) memakai palet dan font situs.
- `<html lang="en">`, `viewport` dan `themeColor` lewat `generateViewport`.
- Favicon, `apple-icon` dan `icon` lewat file convention.

### 3. Structured data (JSON-LD)

Satu `@graph` di root dengan `@id` stabil, lalu dirujuk dari halaman lain. Semua isi markup harus terlihat juga di halaman, dan divalidasi dengan Rich Results Test ([Google](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search)).

| Halaman | Tipe | Properti utama |
| --- | --- | --- |
| `/` | `ProfilePage` dengan `mainEntity` = `Person` | `name`, `alternateName` ("PBS"), `jobTitle`, `image`, `url`, `sameAs` (LinkedIn, GitHub), `knowsAbout` (RAG, LLM, Next.js, …), `alumniOf`, `address` (Yogyakarta), `dateModified` |
| `/` | `WebSite` | `name`, `url`, `publisher` → `@id` Person |
| `/work/[slug]` | `CreativeWork` atau `SoftwareApplication` + `BreadcrumbList` | `name`, `description`, `author` → `@id` Person, `dateCreated`, `image`, `award` (mis. PIMNAS) |
| `/cv` | `ProfilePage` + `BreadcrumbList` | `mainEntity` → `@id` Person, `hasOccupation`, `hasCredential` |
| `/notes/[slug]` | `Article` + `BreadcrumbList` | `headline`, `author` → `@id` Person, `datePublished`, `dateModified` |

`ProfilePage` mewajibkan `mainEntity` berupa Person atau Organization dengan `name` ([Google](https://developers.google.com/search/docs/appearance/structured-data/profile-page)).

### 4. Entitas dan E-E-A-T

- Nama ditulis persis sama di situs, LinkedIn, GitHub, Google Scholar (jika ada), dan CV PDF.
- Situs ditautkan dari bio LinkedIn, profil GitHub, README pinned repo, dan halaman kampus/lomba jika memungkinkan.
- Link keluar ke profil sendiri memakai `rel="me"`.
- Setiap case study menyebut peran nyata, tim, tahun, dan bukti (repo, demo, sertifikat, berita).

### 5. Konten

- Google menekankan konten "non-commodity": sudut pandang dan pengalaman langsung yang tidak bisa diulang orang lain ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)). Case study harus berisi keputusan teknis, angka eval, dan kegagalan yang dialami sendiri.
- Struktur per case study: masalah → peran → arsitektur (diagram sebagai gambar dengan alt) → hasil terukur → stack → link.
- Satu `<h1>` per halaman, heading berurutan, paragraf pendek.
- Kata kunci target: nama lengkap, "AI engineer Yogyakarta", "RAG engineer portfolio", nama project. Jangan membuat banyak halaman tipis untuk variasi kata kunci.
- Gambar dan video relevan dengan alt dan nama file deskriptif, karena fitur AI Search juga menampilkan gambar dan video.

### 6. Sitemap, robots, dan indexing

- `app/sitemap.ts` memuat semua route publik dengan `lastModified` yang akurat (tanggal konten benar-benar berubah).
- `app/robots.ts`: allow semua, disallow `/api/`, cantumkan URL sitemap.
- `/api/*` mengirim header `X-Robots-Tag: noindex`.
- Daftarkan domain di Google Search Console dan Bing Webmaster Tools, submit sitemap, minta indexing untuk `/`.
- Pastikan situs tidak dikeluarkan dari fitur generative AI di Search Console. Situs harus termasuk di sana agar bisa tampil di AI Overviews dan AI Mode ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).

### 7. AI search di luar Google

- robots.txt tidak memblokir crawler pencarian AI (mis. `OAI-SearchBot`, `PerplexityBot`, `Bingbot`).
- `llms.txt` opsional. Google Search mengabaikannya: tidak membantu dan tidak merugikan ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)). Boleh dibuat (ringkasan profil + link case study) untuk layanan lain, prioritas P2.
- Memantau tampilan di AI Overviews lewat laporan performa Generative AI di Search Console.

### 8. Yang tidak dilakukan

- Tidak memecah konten jadi potongan kecil khusus AI, dan tidak mengejar mention palsu. Google menyebut keduanya tidak perlu ([Google](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)).
- Tidak memakai `display:none` untuk menyembunyikan teks kata kunci.
- Tidak memakai hash routing, iframe untuk konten utama, atau loader yang memblokir HTML.

## Performa dan Core Web Vitals

Target mengikuti ambang resmi Google di persentil 75, dipisah mobile dan desktop: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 ([web.dev](https://web.dev/articles/vitals)). Ambang ini tidak berubah di 2026. Beberapa artikel menyebut INP 150 ms, tetapi dokumentasi resmi tetap 200 ms; tim boleh membidik 150 ms sebagai margin.

**Budget**

| Item | Budget (mobile) |
| --- | --- |
| JS awal halaman `/` (gzip) | ≤ 170 KB, tanpa Three.js |
| Three.js + R3F (chunk lazy Ask my CV) | ≤ 250 KB gzip, dimuat saat section mendekati viewport |
| Game Prompt Defender | ≤ 80 KB gzip, dimuat saat tombol Play ditekan |
| Font | 2 keluarga (Host Grotesk, Silkscreen), WOFF2, subset Latin, `next/font` dengan `display: swap` |
| Poster avatar (elemen LCP) | ≤ 120 KB AVIF/WebP, `priority`, ukuran tetap |
| Video avatar | ≤ 1,5 MB, dimuat setelah `requestIdleCallback`, tidak autoplay di Save-Data |
| TTFB | ≤ 600 ms (CDN edge, halaman statis) |

**Aturan implementasi**

- LCP: elemen LCP adalah poster avatar atau `<h1>`, bukan canvas atau video. Loader tidak boleh menutupinya lebih dari 1,2 s.
- INP: handler scroll dan pointer ringan. Pekerjaan berat (embedding plot, simulasi game) di `requestAnimationFrame` atau Web Worker. GSAP ScrollTrigger dengan `scrub` memakai transform/opacity saja.
- CLS: semua gambar, video, canvas dan embed punya ukuran atau `aspect-ratio`. Font memakai `size-adjust` fallback. Elemen yang di-pin tidak menggeser layout.
- Animasi dan WebGL berhenti saat offscreen (IntersectionObserver) dan saat tab tersembunyi.
- `prefers-reduced-motion` dan `Save-Data`: matikan loader, video, constellation dan scroll-pin; tampilkan versi statis.
- Ukur di lapangan dengan library `web-vitals` (versi attribution) dan kirim ke analytics, karena Lighthouse tidak bisa mengukur INP dan memakai TBT sebagai pengganti ([web.dev](https://web.dev/articles/vitals)).

## Aksesibilitas dan responsif

Target WCAG 2.2 AA. Aksesibilitas juga membantu SEO, karena semantic HTML yang sama dibaca oleh screen reader, crawler, dan agen browser AI.

- Landmark: `<header>`, `<nav>`, `<main>`, satu `<section aria-labelledby>` per section, `<footer>`.
- Kontras teks minimal 4,5:1 (3:1 untuk teks ≥ 24 px). Cek khusus teks di atas biru Cobalt #3B5BFF (lihat aturan di bagian Desain final) dan teks abu di atas dark.
- Fokus keyboard terlihat di semua tombol dan link. Popup game dan menu mobile menjebak fokus lalu mengembalikannya saat ditutup; tombol Esc menutup.
- Ask my CV: input berlabel, jawaban di region `aria-live="polite"`.
- Plot 3D dan game punya deskripsi teks; canvas dekoratif memakai `aria-hidden`.
- Target sentuh minimal 44×44 px di mobile.
- `prefers-reduced-motion`: tanpa loader, tanpa pin, tanpa marquee; transisi hanya fade.

**Breakpoint**

| Lebar | Acuan desain | Catatan |
| --- | --- | --- |
| ≤ 767 px | FIX · Theme 1 Cobalt / Mobile (390) | Experience scroll horizontal, menu layar penuh, constellation setengah titik |
| 768–1279 px | Belum didesain | Pakai layout mobile yang diperlebar sampai frame tablet dibuat |
| ≥ 1280 px | FIX · Theme 1 Cobalt / Desktop (1440) | Konten maksimal 1440, margin 24–48 px |

## Analytics, QA dan rilis

**Event analytics** (Vercel Analytics atau Plausible, tanpa cookie banner)

| Event | Kapan |
| --- | --- |
| `cv_download` | Klik Download CV di mana pun |
| `contact_click` | Klik email, LinkedIn atau GitHub (dengan properti `channel`) |
| `ask_submit` | Pertanyaan dikirim di Ask my CV |
| `game_start`, `game_over` | Play ditekan; game selesai (dengan skor) |
| `case_study_view` | Halaman `/work/[slug]` dibuka |
| `web_vitals` | LCP, INP, CLS per sesi dari library `web-vitals` |

**Checklist QA sebelum rilis**

- [ ] Lighthouse CI di setiap PR: Performance ≥ 90 (mobile), SEO 100, Accessibility ≥ 95, Best Practices 100
- [ ] View Source di setiap route menampilkan judul, deskripsi, `<h1>` dan teks utama tanpa JS
- [ ] URL Inspection di Search Console: halaman yang dirender Google berisi semua section
- [ ] Rich Results Test lolos untuk `ProfilePage`, `BreadcrumbList`, `Article`
- [ ] Preview OG dicek di LinkedIn Post Inspector, X, WhatsApp
- [ ] Canonical, sitemap, robots dan redirect domain benar
- [ ] Uji perangkat nyata: Android kelas menengah (Chrome), iPhone (Safari), desktop Chrome/Firefox/Safari
- [ ] Uji keyboard-only dan screen reader (VoiceOver, TalkBack)
- [ ] Uji `prefers-reduced-motion` dan jaringan Slow 4G
- [ ] Game dan Ask my CV bisa dipakai penuh di mobile

**Urutan rilis**

1. Fondasi: Next.js App Router, token Cobalt, font, layout semantik, metadata, JSON-LD, sitemap, robots. Deploy ke domain final sejak awal (preview `noindex`).
2. Konten statis semua section dan halaman `/work/[slug]`, `/cv`, tanpa animasi. Section Ask my CV dan Prompt Defender sementara tampil statis: contoh pertanyaan dan jawaban, plus video preview gameplay. Lolos Lighthouse dan URL Inspection.
3. Intro dan motion: loader, intro avatar, GSAP + Lenis, scroll-pin per section, Experience horizontal, pixel divider.
4. Background: embedding constellation dengan palet per section.
5. Polish: reduced-motion, a11y, budget performa, OG image per route.
6. Rilis v1: Search Console + Bing, submit sitemap, update link di LinkedIn/GitHub/CV, pantau CWV dan indexing 4 minggu.
7. Fase akhir: Ask my CV (RAG API + plot 3D) dan Prompt Defender (popup game + `/play`), menggantikan versi statis dari tahap 2.
8. Lanjutan (P2): `/notes`, `llms.txt`, frame tablet, versi bahasa Indonesia.

## Sumber

- [Optimizing your website for generative AI features on Google Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) — Google Search Central
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) — Google Search Central
- [Top ways to ensure your content performs well in Google's AI experiences](https://developers.google.com/search/blog/2025/05/succeeding-in-ai-search) — Google Search Central Blog
- [Profile page (ProfilePage) structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page) — Google Search Central
- [Web Vitals](https://web.dev/articles/vitals) — web.dev
- [SEO for Three.js sites](https://discourse.threejs.org/t/seo-for-three-js-sites/10064) — three.js forum
