import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    // shortcut: forks/threads pools crash on Node 26 ("reading 'config'"); switch back once Vitest supports it.
    pool: "vmThreads",
  },
});
