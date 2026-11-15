// DATA: POST /api/ask (fase akhir). Static sample until the RAG endpoint is live.
// TODO(PBS): "48 chunks" and "212 ms" must match the real corpus and latency once live.
export const ask = {
  title: "Ask my CV",
  description:
    "This box runs the pipeline I built for Antistun. Your question is embedded, the closest pieces of my CV are pulled, and the answer cites them. Anything outside my CV gets a fixed reply.",
  plotAlt:
    "3D embedding plot with axes dim 1, dim 2 and dim 3. The question point Q sits next to the three retrieved CV chunks, numbered 1 to 3, among the other chunks.",
  question: "What did you build for Antistun?",
  status: "Retrieved 3 of 48 chunks with hybrid search in 212 ms",
  answer: [
    {
      text: "I led the software team and built the AI assistant: a RAG pipeline on Gemini with pgvector hybrid search in Supabase",
      cite: 1,
    },
    {
      text: ". Every answer cites WHO or Kemenkes material and passes a faithfulness check, with a fixed template when it fails",
      cite: 2,
    },
    { text: ". We presented it at PIMNAS 39", cite: 3 },
    { text: "." },
  ],
  suggestion: "Try “Which embedding models have you used?” or “What is Shardfall?”",
  chunks: [
    {
      index: 1,
      source: "CV / Antistun",
      score: 0.84,
      text: "Built a RAG assistant on Gemini with pgvector hybrid search in Supabase.",
    },
    {
      index: 2,
      source: "CV / Antistun",
      score: 0.79,
      text: "Safety layers: question classification, WHO and Kemenkes citations, faithfulness check, template fallback.",
    },
    {
      index: 3,
      source: "CV / Awards",
      score: 0.71,
      text: "Presented the project at PIMNAS 39, the national student science week.",
    },
  ],
};

export const play = {
  title: "Prompt Defender",
  description:
    "Hallucinations are raining on the model. Fire citations, chain the blasts, and catch relevant chunks to reload. A small arcade game about grounding every answer.",
  meta: "Canvas 2D · desktop and mobile · four waves and a boss",
  previewAlt:
    "Prompt Defender gameplay preview: blue hallucinations fall toward the model while a citation beam fires upward. Wave 4, score 1770.",
  hud: { wave: "4", score: "1770", tag: "Preview · tap to fire · catch white chunks" },
  cta: "Play game",
  secondary: "How it works",
};

// In-game copy for Prompt Defender (src/components/canvas/PromptDefenderGame.tsx).
export const game = {
  eyebrow: "PBS / Playground",
  title: "Prompt Defender",
  rules: [
    "Hallucinations fall toward your documents and the LLM.",
    "Click or tap to fire a citation. Its blast chains through anything nearby.",
    "Blast the white chunks to reload three citations.",
    "Four waves, each with a new threat. The last one is a boss.",
    "Keyboard: arrows aim, Enter fires, Space pauses.",
  ],
  // banner shown at the start of each wave (index = wave number)
  waves: [
    "",
    "Hallucinations incoming",
    "New: confabulations split mid-air",
    "New: jailbreaks, thin and fast",
    "Boss: The Hallucinator",
  ],
  boss: "The Hallucinator",
  docs: ["Facts", "Sources", "Docs", "Citations"],
  base: "LLM",
  over: "Well grounded. Chain your blasts and save citations for the boss.",
  won: "Every wave grounded and The Hallucinator is down.",
  stats: { wave: "wave reached", grounded: "hallucinations grounded", chain: "best chain", best: "your best" },
  again: "Defend again",
  copy: "Copy my score",
  copied: "Copied",
  share: (score: number, url: string) =>
    `I scored ${score} in Prompt Defender, a small arcade game about grounding LLM answers. ${url}/#play`,
};
