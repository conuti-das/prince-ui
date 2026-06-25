import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  loader: { ".json": "json" },
  external: ["react", "react-dom", "react-aria-components", "@internationalized/date", "@conuti-das/prince-ui", "@conuti-das/prince-ui-tokens"],
});
