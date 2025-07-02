import * as esbuild from "esbuild"
import { glob } from "glob"

// `src/**/*.ts` をすべて取得
const files = glob.sync("src/**/*.ts").filter((path) => !path.endsWith(".d.ts"))

const ctx = await esbuild.context({
    entryPoints: files,
    outdir: "/dist",
    minify: true,
})

await ctx.watch()
