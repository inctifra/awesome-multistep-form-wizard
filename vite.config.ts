import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    dts({
      include: ["src"],
      outDirs: "dist",
      entryRoot: "src",
      insertTypesEntry: true,
    }),
  ],

  build: {
    emptyOutDir: true,

    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "WaMultiStep",
      fileName: "wa-multistep",
      formats: ["es", "cjs"],
    },

    rollupOptions: {
      external: ["@awesome.me/webawesome", "zod", "vest"],
    },
  },
});
