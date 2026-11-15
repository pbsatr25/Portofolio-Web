// Case study bodies follow PRD §Kerangka case study. Sections without real material yet stay out
// of the page instead of being invented. TODO(PBS): numbers, links, screenshots per project.

export type Project = {
  slug: string;
  name: string;
  year: number;
  role: string;
  summary: string;
  stack: string[];
  seoTitle: string;
  seoDescription: string;
  imageAlt: string;
  award?: string;
};

export const work = {
  title: "Work",
  cta: "Read the case study",
};

// Ordered newest first; the deck shows the first item in front.
export const projects: Project[] = [
  {
    slug: "antistun",
    name: "Antistun",
    year: 2026,
    role: "Head of Software, PKM-KC UGM",
    summary:
      "A health assistant that answers from WHO and Kemenkes sources, checks its own replies, and falls back to a safe template. Presented at PIMNAS 39.",
    stack: ["Next.js", "Tailwind CSS", "Supabase", "pgvector", "Gemini API"],
    seoTitle: "Antistun: a RAG health assistant",
    seoDescription:
      "How I led the software team behind Antistun, a Gemini + pgvector assistant that cites WHO and Kemenkes sources. Presented at PIMNAS 39.",
    imageAlt: "Antistun chat screen",
    award: "PIMNAS 39",
  },
  {
    slug: "shardfall",
    name: "Shardfall",
    year: 2026,
    role: "Developer & PM, Monad Blitz Jogja 2026",
    summary:
      "A multiplayer battle royale in the browser. Tickets wait in escrow, maps are verified by commit–reveal, and the contract pays the winner.",
    stack: ["React", "Three.js", "wagmi", "Colyseus", "Solidity"],
    seoTitle: "Shardfall: browser battle royale on Monad",
    seoDescription:
      "A multiplayer browser battle royale with escrowed tickets and commit–reveal maps, built with React, Three.js and Solidity at Monad Blitz Jogja 2026.",
    imageAlt: "Shardfall gameplay",
  },
  {
    slug: "iku-chatbot",
    name: "IKU Chatbot",
    year: 2025,
    role: "AI Engineer & Frontend, Diktisaintek Berdampak",
    summary:
      "Answers questions about the IKU Diktisaintek Berdampak programme from its own documents, from chunking to retrieval.",
    stack: ["BGE-M3", "ChromaDB", "RAG pipeline", "Python"],
    seoTitle: "IKU Diktisaintek Chatbot: RAG with BGE-M3",
    seoDescription:
      "Building the retrieval pipeline for the IKU Diktisaintek Berdampak chatbot, from chunking to BGE-M3 embeddings and ChromaDB search.",
    imageAlt: "IKU chatbot screen",
  },
  {
    slug: "egolek",
    name: "eGolek",
    year: 2025,
    role: "UX designer, FIND IT 2025",
    summary: "An LLM-assisted way to report, search for and verify items lost in public places.",
    stack: ["Figma", "user flows", "LLM concept"],
    seoTitle: "eGolek: LLM-assisted lost and found",
    seoDescription:
      "UX design for eGolek, an LLM-assisted way to report, search for and verify items lost in public places. FIND IT 2025.",
    imageAlt: "eGolek app flow",
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
