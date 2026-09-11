import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        core: resolve(import.meta.dirname, "src/core.ts"),
        provider: resolve(import.meta.dirname, "src/group-context.tsx"),
        index: resolve(import.meta.dirname, "src/index.ts"),
        legacy: resolve(import.meta.dirname, "src/legacy.tsx"),
      },
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      external: ["motion/react", "react", "react/jsx-runtime"],
    },
    sourcemap: true,
  },
});
