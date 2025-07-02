import { defineConfig } from "vite"

export default defineConfig({
    build: {
        target: ["esnext"],
        rollupOptions: {
            input: "src/run.ts", // run.jsのパス
            output: {
                entryFileNames: "run.js",
                dir: "dist",
            },
        },
        sourcemap: true,
    },
})
