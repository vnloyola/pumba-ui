import { defineConfig } from "vite";

// JavaScript only: Vite bundles src/index.ts into one ESM file. Types come from tsc and the
// CSS files from scripts/build-css.mjs, so each tool does the one thing it is good at.
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    // dist/ also holds the declarations and CSS, so Vite must not clear them.
    emptyOutDir: false,
    // Readable output: the consumer's bundler minifies it.
    minify: false,
    rollupOptions: {
      // Dependencies and peers stay out of the bundle; the consumer installs them once.
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^lucide-react($|\/)/,
        /^@base-ui\/react($|\/)/,
      ],
    },
  },
});
