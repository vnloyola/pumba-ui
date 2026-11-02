import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
  },
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      output: { banner: '"use client";' },
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^lucide-react($|\/)/,
        /^@base-ui\/react($|\/)/,
      ],
    },
  },
});
