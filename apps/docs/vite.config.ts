import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

// base nur im Build setzen (Pages liegt unter /prince-ui/); lokal Root.
const base = process.env.DOCS_BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    { enforce: "pre", ...mdx({ remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug], providerImportSource: "@mdx-js/react" }) },
    react({ jsxRuntime: "automatic" }),
  ],
  resolve: {
    // form-js (Experten-Editor) rendert via Preact; zwei Preact-Versionen im Tree
    // brechen den Render-Kontext. Auf EINE Instanz zwingen (wie in .storybook/main.ts).
    dedupe: ["preact", "preact/hooks", "preact/jsx-runtime", "preact/compat"],
  },
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
});
