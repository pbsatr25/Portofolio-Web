export const stack = {
  title: "Stack",
  description: "What I reach for, grouped by job. Each row slides the opposite way to the one above it as you scroll.",
  rows: [
    {
      label: "AI",
      tone: "accent",
      items: ["RAG", "BGE-M3", "pgvector", "ChromaDB", "Gemini API", "LLMs", "Machine learning"],
    },
    {
      label: "Web",
      tone: "light",
      items: ["Python", "Next.js", "React", "Tailwind CSS", "Supabase", "JavaScript", "GitHub"],
    },
    {
      label: "Design & 3D",
      tone: "muted",
      items: ["Three.js", "Figma", "Blender", "Illustrator", "Photoshop", "Solidity"],
    },
  ],
} as const;
