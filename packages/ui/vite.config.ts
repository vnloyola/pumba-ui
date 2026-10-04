import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
    },
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^lucide-react($|\/)/,
        /^@base-ui\/react($|\/)/,
      ],
    },
  },
});
