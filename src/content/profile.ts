// Single source for page copy, JSON-LD, sitemap and (later) the RAG corpus. Copy: PRD §Konten per section.

// TODO(PBS): final domain (PRD open question). Set NEXT_PUBLIC_SITE_URL in the hosting env.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const profile = {
  name: "Prihastomo Budi Satrio",
  alternateName: "PBS",
  jobTitle: "AI Engineer & Software Engineer",
  roleLine: "AI Engineer & Software Engineer, Yogyakarta",
  description:
    "AI and software engineer in Yogyakarta building RAG chatbots that cite their sources, from Figma to production. Ask my CV, see the work, get in touch.",
  email: "prihastomobudis@gmail.com",
  location: { city: "Yogyakarta", country: "ID", label: "Yogyakarta, Indonesia" },
  alumniOf: "Universitas Gadjah Mada",
  knowsAbout: ["Retrieval-augmented generation", "LLM applications", "BGE-M3", "pgvector", "Next.js", "UI/UX design"],
  // TODO(PBS): final LinkedIn / GitHub URLs. Empty = link hidden.
  linkedin: "",
  github: "",
  // TODO(PBS): add the PDF to public/ and set the path. Empty = "Download CV" goes to /cv.
  cvPdf: "",
  photo: {
    src: "/media/photo-prihastomo.jpg",
    alt: "Prihastomo Budi Satrio smiling at the camera, wearing glasses and a grey UGM shirt",
  },
  avatarPoster: {
    src: "/media/avatar-poster.png",
    alt: "3D cartoon avatar of Prihastomo waving, wearing glasses and a dark suit",
  },
  updated: "2026-11-14",
};

export const cvHref = profile.cvPdf || "/cv";

export const nav = [
  { label: "About", href: "/#about" },
  { label: "Stack", href: "/#stack" },
  { label: "Ask", href: "/#ask" },
  { label: "Play", href: "/#play" },
  { label: "Work", href: "/#work" },
  { label: "Contact", href: "/#contact" },
];

// Intro card (PRD §Intro "kartu intro biru"; copy from the intro recording).
export const introCard = {
  text: "I build RAG chatbots that answer from real sources and show where each answer came from.",
  cta: "Try it below",
  href: "/#ask",
};

export const statement = {
  text: "I build AI that shows its sources & interfaces people trust",
  lines: ["I BUILD AI", "THAT SHOWS", "ITS SOURCES", "*(", "& INTERFACES", "PEOPLE TRUST"],
  labels: [
    "RAG, end to end",
    "Gemini · pgvector · BGE-M3",
    "Yogyakarta, Indonesia",
    "From Figma to production",
    "Software Engineering, UGM",
  ],
};

export const about = {
  photoTag: "The real one, not the avatar",
  lead: "I’m Prihastomo, a software engineering student at Vocational School UGM who builds AI products from the first Figma frame to the deployed app.",
  body: "Most of my recent work is retrieval-augmented generation: chatbots that answer from real documents and show their sources. I led the software team behind Antistun, presented at PIMNAS 39, and built the RAG pipeline for the IKU Diktisaintek chatbot. I also design, from GDGOC visuals to a first-place poster at TEDI 2025, and I assist the Software Design lab.",
  facts: [
    { term: "Based in", value: "Yogyakarta, Indonesia" },
    { term: "Studying", value: "Software Engineering Technology, UGM" },
    { term: "Focus", value: "RAG, LLM apps, full-stack web" },
    { term: "Also", value: "UI/UX design, Blender 3D" },
    { term: "Open to", value: "AI engineer and software engineer roles" },
  ],
};

export const contact = {
  ask: "Looking for an AI or software engineer? Let’s talk.",
  title: "SAY HELLO",
  footerLeft: "Prihastomo Budi Satrio, 2026",
  footerRight: "Built with Next.js, Three.js and GSAP",
};
