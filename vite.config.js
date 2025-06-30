import { defineConfig } from "vite"

export default defineConfig({
    build: {
        rollupOptions: {
            input: "src/run.ts", // run.jsのパス
            output: {
                entryFileNames: "bundle.js",
                dir: "dist",
            },
        },
    },
})
