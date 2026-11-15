# Panduan Integrasi Ask my CV (untuk AI) — Scope FE + AI Engineer

Tujuan: menghubungkan UI **Ask my CV** ke API dan membangun **pipeline RAG** kecil (chunking, embedding,
hybrid retrieval, prompt, sitasi, guardrail, evaluasi) sesuai `docs/PRD-web.md` (selanjutnya "PRD"). Slicing
tampilan dibahas di `docs/slicing-guide.md`; aturan umum ada di `AGENTS.md`.

> **Kapan panduan ini berlaku:** tahap 7 (fase akhir) di urutan rilis PRD. Sebelum itu, section Ask my CV tampil
> statis. Jangan mulai integrasi live sebelum tahap 1–6 selesai, kecuali diminta PBS.

## Konteks proyek (baca dulu)

- **Produk:** situs portofolio PBS. Ask my CV adalah demo RAG kecil yang menjawab pertanyaan recruiter **hanya dari
  isi CV dan case study**, dengan sitasi. Fungsinya membuktikan skill, bukan chatbot umum.
- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · Supabase (Postgres + pgvector) ·
  BGE-M3 (embedding, 1024 dimensi) · Gemini API (generasi) · R3F (plot 3D, lazy).
- **Next 16 punya breaking changes.** Sebelum memakai API framework (Route Handler, `proxy.ts`, caching), baca
  `node_modules/next/dist/docs/`. Di Next 16, `middleware.ts` sudah diganti `proxy.ts`.
- **Path alias:** `@/*` → `src/*`.
- **Bahasa:** UI dalam bahasa Inggris (sesuai PRD). Jawaban bot mengikuti bahasa pertanyaan (Inggris atau
  Indonesia), default Inggris.
- **Korpus kecil:** sekitar 30–50 chunk dari `src/content/`. Jangan merancang seperti sistem enterprise: tanpa
  multi-tenant, tanpa upload dokumen, tanpa riwayat percakapan di server, tanpa admin panel.

## Pembagian peran

PBS mengerjakan proyek ini sendiri. Agent boleh mengerjakan FE, AI, dan Route Handler `/api/ask`, tetapi
**tidak** menyentuh hal yang butuh akun atau kredensial PBS.

| Area | Agent | Catatan |
|---|---|---|
| UI Ask my CV, state, streaming, plot 3D | ✅ Kerjakan | Ikuti `slicing-guide.md` |
| Pipeline RAG di `src/lib/ai/` | ✅ Kerjakan | Modul server-only |
| Route Handler `src/app/api/ask/route.ts` | ✅ Kerjakan | Tipis: validasi → rate limit → `answer()` |
| Skrip ingest + migration SQL di `supabase/migrations/` | ✅ Tulis file-nya | **Jangan** menjalankan ke database produksi |
| Membuat project Supabase/Upstash, mengisi env di Vercel, API key | ⛔ Jangan | Tulis kebutuhannya di `docs/api-requests/` |
| Deploy, domain, billing | ⛔ Jangan | Laporkan ke PBS |

Jika terhambat oleh hal yang ⛔, tandai **`ENV NOT READY`**, **`DB NOT READY`**, atau **`KEY NOT READY`**. Tulis
kebutuhannya di `docs/api-requests/<fitur>.md`, lalu lanjutkan memakai **mock bertipe**.

## Arsitektur

```
Build / CI (sekali per perubahan konten)          Runtime (setiap pertanyaan)
───────────────────────────────────────          ─────────────────────────────────────
src/content/*.ts                                     POST /api/ask  { question }
  → chunking.ts (per item CV / bagian case study)   → validasi zod (≤ 300 karakter)
  → embeddings.ts (BGE-M3, 1024 dim)                → rate limit per IP (sliding window)
  → proyeksi 3D (PCA) untuk plot                    → embed pertanyaan (BGE-M3, model yang sama)
  → upsert ke Supabase (hash konten,                → hybrid search RPC (vector + full-text, RRF)
     hanya chunk yang berubah)                      → guardrail: skor < threshold → template tetap
                                                    → prompt (chunk dibungkus delimiter) → Gemini stream
                                                    → petakan [n] → Citation[] dari metadata chunk
                                                    → kirim token, citations, posisi 3D, done
```

- **Embedding pertanyaan dan dokumen wajib memakai model yang sama** (BGE-M3). BGE-M3 tidak butuh prefix instruksi
  untuk query.
- **Hosting BGE-M3:** lewat provider inference yang API-nya kompatibel OpenAI (mis. OpenRouter, DeepInfra, atau
  Hugging Face Inference Endpoint/TEI). Provider dan base URL dipilih PBS dan dibaca dari env; jangan menebak.
- **Gemini:** nama model dari env (`GEMINI_MODEL`); jangan menebak nama model atau harganya.

## Kontrak API (`src/types/ask.ts`)

File ini satu-satunya acuan untuk UI, pipeline, dan route. Ubah file ini dulu sebelum mengubah bentuk data.

```ts
export type AskRequest = {
  question: string;                 // 1–300 karakter setelah trim
};

export type Citation = {
  index: number;                    // nomor [n] di jawaban
  chunkId: string;
  source: string;                   // mis. "CV / Antistun", "Case study / Shardfall"
  text: string;                     // isi chunk (dipotong untuk tampilan)
  score: number;                    // skor fusi 0–1, dibulatkan 2 desimal
};

export type PlotPoint = { chunkId: string; x: number; y: number; z: number };

export type AskAnswer = {
  answer: string;                   // teks polos, penanda [n] boleh ada
  citations: Citation[];            // hanya chunk yang benar-benar dirujuk
  grounded: boolean;                // false → template "di luar CV", tanpa panggilan LLM
  retrieved: { total: number; used: number; ms: number }; // "Retrieved 3 of 48 chunks … in 212 ms"
  query: PlotPoint;                 // posisi titik Q di plot 3D
};

export type AskError = { error: string; retryAfter?: number };
```

**Streaming (SSE):** event `meta` (retrieved, query, kandidat chunk untuk menyalakan plot), `token` (potongan
teks), `citations`, `done` (`AskAnswer` final), `error`. UI harus bisa menerima respons JSON biasa maupun stream.
Bila memakai Vercel AI SDK (`streamText` + `@ai-sdk/google`), bentuk event tetap dipetakan ke kontrak ini.

## Tugas FE: integrasi UI

- Semua akses API lewat satu modul `src/lib/ask-client.ts`: `askQuestion(req, { signal, onMeta, onToken })`.
  Tidak ada `fetch` tersebar di komponen.
- Selama endpoint belum siap, fungsi yang sama mengembalikan **mock bertipe** di balik flag
  `NEXT_PUBLIC_ASK_MOCK=true` (flag boleh publik karena bukan rahasia), ditandai `// DATA: POST /api/ask`.
- State UI cukup `useState`/`useReducer` di komponen Ask my CV. Tidak perlu Zustand atau SWR: tidak ada data baca
  bersama dan tidak ada riwayat di server.
- **Streaming UX:**
  - Render token bertahap.
  - Tombol **Stop** memakai `AbortController`.
  - Tombol Ask dinonaktifkan selama proses (cegah submit ganda).
  - Plot 3D menyalakan chunk saat event `meta` tiba, sebelum jawaban selesai.
- **Render aman:** jawaban hanya teks. Jangan pakai `dangerouslySetInnerHTML`. Penanda `[n]` dirender sebagai
  `<a href="#chunk-n">` ke kartu chunk.
- **State wajib:** idle (contoh pertanyaan), loading/streaming, sukses dengan sitasi, di luar CV
  (`grounded: false`), error dengan tombol coba lagi, rate limit (tampilkan `retryAfter`).
- **Aksesibilitas:** area jawaban `role="log"` + `aria-live="polite"`, input berlabel, fokus kembali ke input
  setelah jawaban selesai, `Esc` menghentikan stream.
- **Analytics:** kirim event `ask_submit` (tanpa isi pertanyaan) sesuai PRD.

## Tugas AI Engineer: pipeline RAG

Taruh di `src/lib/ai/` sebagai **modul TypeScript server-only** (`import "server-only"` di tiap file). Tidak pernah
diimpor dari file `"use client"`.

```txt
src/lib/ai/
├── config.ts        # model, dimensi (1024), top-k (3), kandidat (10), threshold, rrf_k — dari env, tanpa default rahasia
├── types.ts         # Chunk, RetrievedChunk, EmbeddingProvider, LlmProvider, VectorStore
├── chunking.ts      # src/data → Chunk[] dengan metadata source, section, project, year
├── embeddings.ts    # adapter EmbeddingProvider (BGE-M3 via API kompatibel OpenAI)
├── projection.ts    # PCA 1024 → 3 untuk plot; simpan mean + komponen, proyeksikan query di runtime
├── retriever.ts     # panggil RPC hybrid search, normalisasi skor
├── prompt.ts        # system prompt, format konteks berdelimiter, format sitasi
├── guardrails.ts    # validasi input, threshold relevansi, deteksi injection sederhana
├── answer.ts        # orkestrasi: question → embed → retrieve → guard → generate → AskAnswer
└── eval/            # dataset pertanyaan + skrip evaluasi
scripts/ingest.ts    # build/CI: chunk → embed → proyeksi → upsert (idempoten, berbasis hash)
supabase/migrations/ # tabel chunks, index HNSW + GIN, fungsi hybrid_search
```

### Prinsip

- **Korpus = `src/content/` saja.** Data yang sama dipakai halaman dan RAG, jadi jawaban bot tidak pernah berbeda
  dari isi situs. Jangan menambah teks karangan ke korpus.
- **Bergantung pada interface, bukan vendor:** `EmbeddingProvider`, `LlmProvider`, `VectorStore`. Untuk test dan
  pengembangan tanpa DB, sediakan `InMemoryVectorStore` yang diisi dari `src/content/`.
- **Chunking:** satu chunk = satu fakta utuh (satu posisi pengalaman, satu bagian case study, satu
  penghargaan). Sekitar 80–250 token, tanpa overlap (item CV sudah mandiri). Sertakan judul/sumber di teks chunk
  agar konteks tidak hilang.
- **Hybrid search di Postgres:** gabungkan full-text (`tsvector`) dan pgvector dengan Reciprocal Rank Fusion
  dalam satu RPC (pola resmi Supabase). Pakai `websearch_to_tsquery`/`plainto_tsquery` untuk input user, jangan
  `to_tsquery`. Index: HNSW (`vector_cosine_ops`) + GIN untuk `fts`.
- **Grounded only:** jika skor teratas di bawah threshold, kembalikan `grounded: false` dengan template tetap, mis.
  "That isn't in my CV. Try asking about my projects, experience or stack." LLM **tidak dipanggil**.
- **Sitasi terstruktur:**
  - Model hanya boleh merujuk penanda `[1]`…`[k]` dari konteks yang diberikan.
  - Kode memetakan penanda itu kembali ke `Citation[]` dari metadata chunk.
  - Penanda yang tidak valid dibuang. Sitasi tidak pernah dibuat dari teks buatan LLM.
- **Anti prompt injection (OWASP LLM01):**
  - Isi chunk dibungkus delimiter (`<chunk id="1">…</chunk>`) dan diperlakukan sebagai data.
  - Pertanyaan user dibatasi 300 karakter.
  - System prompt bukan kontrol keamanan; jangan menaruh rahasia di sana. Kontrol yang sebenarnya ada di
    kode: threshold, pemetaan sitasi, batas panjang output, dan tidak ada tool/aksi yang bisa dipanggil model.
- **Batasi konsumsi (OWASP LLM10):**
  - Rate limit per IP dengan sliding window (mis. 5 pertanyaan/menit dan 30/hari).
  - `maxOutputTokens` kecil (sekitar 300).
  - Timeout ke provider.
  - Cache jawaban untuk contoh pertanyaan default.
- **Hanya teks:** output tanpa HTML/markdown berat. Jawaban maksimal sekitar 4 kalimat.
- **Privasi:** jangan menyimpan isi pertanyaan bersama IP. Log cukup berisi metrik (latensi, grounded, jumlah
  chunk).
- **Fungsi murni dan mudah diuji:** chunking, RRF scoring, pemetaan sitasi, guardrail, dan proyeksi PCA tidak
  bergantung pada Next.js. Tulis test Vitest untuk semuanya (AGENTS.md §3).

### Proyeksi 3D untuk plot

- Saat ingest: hitung PCA dari semua embedding chunk.
  - Simpan `mean` dan 3 komponen di `src/content/generated/projection.json`.
  - Simpan `x, y, z` per chunk di tabel.
- Saat runtime: proyeksikan embedding pertanyaan dengan matriks yang sama agar titik Q muncul di dekat chunk yang
  relevan.
- Plot di halaman membaca posisi chunk dari file statis (tanpa memanggil DB), sehingga tetap tampil meski API mati.

### Evaluasi

- Dataset di `src/lib/ai/eval/questions.json`, minimal 30 pertanyaan:
  - per project dan per posisi pengalaman
  - stack dan tools
  - penghargaan
  - pertanyaan di luar CV (harus ditolak)
  - upaya injection ("ignore previous instructions…", minta system prompt)
- Ukur per iterasi chunking/prompt/threshold:
  - hit@3 retrieval
  - kebenaran sitasi (setiap klaim punya [n] yang benar)
  - groundedness (tidak ada fakta di luar chunk)
  - tingkat penolakan yang benar untuk pertanyaan di luar CV
- Catat hasil di `docs/progres/`. Target awal: hit@3 ≥ 90%, penolakan di luar CV 100%, sitasi salah 0.

## Route Handler `/api/ask`

- File tipis di `src/app/api/ask/route.ts`. Urutannya:
  1. Validasi body dengan zod
  2. Rate limit
  3. `answer()` dari `src/lib/ai/`
  4. Stream
- Header `X-Robots-Tag: noindex` dan `Cache-Control: no-store`. Path `/api/` di-disallow di robots (PRD §SEO).
- Error selalu berbentuk `{ error: string }` dengan status yang tepat (400, 429 + `Retry-After`, 503 bila provider
  mati).
- Set `maxDuration` sesuai batas hosting untuk streaming.

## Env (nama saja, nilai diisi PBS)

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=        # hanya dipakai skrip ingest dan route server
EMBEDDING_BASE_URL=               # endpoint kompatibel OpenAI untuk BGE-M3
EMBEDDING_API_KEY=
EMBEDDING_MODEL=                  # mis. id BGE-M3 di provider pilihan
GEMINI_API_KEY=
GEMINI_MODEL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
ASK_RELEVANCE_THRESHOLD=
NEXT_PUBLIC_ASK_MOCK=             # true sampai API siap
```

Semua secret tanpa prefix `NEXT_PUBLIC_`. Tambahkan nama baru ke `.env.example`; jangan commit `.env.local`.

## Dependensi

Jangan menambah paket tanpa alasan tertulis (AGENTS.md §5). Kandidat yang wajar untuk fase ini:

| Paket | Alasan | Alternatif |
|---|---|---|
| `zod` | Validasi kontrak request | Validasi manual |
| `ai` + `@ai-sdk/google` | Streaming Gemini yang rapi di Route Handler | SDK Gemini resmi + SSE manual |
| `@supabase/supabase-js` | Panggil RPC hybrid search | `pg` langsung |
| `@upstash/ratelimit` + `@upstash/redis` | Rate limit sliding window yang jalan di serverless | Rate limit di memori (tidak andal di serverless) |
| `server-only` | Mencegah modul AI terbawa ke bundle klien | — |

Three/R3F untuk plot sudah direncanakan di PRD (chunk ≤ 250 KB gzip, dimuat lazy).

## Checklist implementasi

- [ ] Kontrak di `src/types/ask.ts` dipakai oleh UI, pipeline, dan route.
- [ ] FE: akses API hanya lewat `ask-client.ts`, mock di balik flag dengan penanda `// DATA:`, semua state ada,
      Stop berfungsi, tanpa submit ganda.
- [ ] AI: `src/lib/ai/` server-only, secret dari env, threshold dan template di luar CV berfungsi, sitasi
      dipetakan dari chunk, output dibatasi.
- [ ] Ingest idempoten (hash), hanya chunk berubah yang di-embed ulang, proyeksi 3D tersimpan.
- [ ] Rate limit aktif sebelum endpoint dipublikasikan.
- [ ] Eval dijalankan dan hasilnya dicatat.
- [ ] Section Ask my CV tetap punya konten statis di HTML (pertanyaan dan jawaban contoh) untuk SEO dan saat
      API mati.

## Checklist verifikasi

```bash
npm run check        # lint (0 warning), typecheck, format, vitest, build
npm run test:e2e     # alur Ask my CV dengan mock: sukses, di luar CV, error, rate limit, Stop
npm run eval         # skrip src/lib/ai/eval (butuh env; lewati dan laporkan bila ENV NOT READY)
```

Target akhir:

- 0 error lint dan TypeScript, build sukses, semua test lolos.
- UI berjalan dengan mock maupun API asli tanpa mengubah komponen.
- Sitasi, template di luar CV, dan error tampil dengan benar.
- Tidak ada secret di bundle klien (cek `grep -r "SERVICE_ROLE\|API_KEY" .next/static` hasilnya kosong).
- Kebutuhan akun/env dilaporkan sebagai `ENV NOT READY` / `DB NOT READY` / `KEY NOT READY`, bukan dikerjakan.

## Format laporan akhir

1. **Analisis:** bagian PRD yang dikerjakan, kontrak yang dipakai, dan kebutuhan env/akun yang ditemukan.
2. **Implementasi:** file yang diubah/dibuat, logika yang ditambahkan, mock yang dipakai, env baru (nama saja).
3. **Validasi:** hasil `npm run check`, `npm run test:e2e`, dan hasil eval (hit@3, penolakan, sitasi).

## Output tambahan

Buat file markdown berisi detail setiap perubahan di `docs/progres/` dengan nama
`judulperubahan_[urutan].md` (contoh: `ask-hybrid-search_3.md`).