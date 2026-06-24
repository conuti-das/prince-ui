import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Props/API-Tabellen aus den TS-Interfaces ziehen (statt magerem react-docgen).
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Geerbte DOM-/RAC-Props ausblenden → Tabelle zeigt prince-ui-Props.
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  // Subpath-Hosting: alle Assets unter /storybook/ referenzieren, damit der
  // Storybook-Build hinter demo.macoapp.de/storybook funktioniert.
  // Lokal (pnpm storybook) bleibt es root, weil nur der Build base setzt.
  viteFinal: async (config) => {
    if (process.env.STORYBOOK_BASE_PATH) {
      config.base = process.env.STORYBOOK_BASE_PATH;
    }
    // Root-Level Dateien (stories/, .storybook/) werden von KEINER tsconfig.json
    // erfasst — es existiert nur tsconfig.base.json, die esbuild nicht per Name
    // findet. Dadurch fällt esbuild auf den klassischen JSX-Transform
    // (React.createElement) zurück → Laufzeitfehler "React is not defined".
    // Automatic Runtime erzwingen, passend zu `jsx: "react-jsx"` der Quelle.
    config.esbuild = {
      ...(typeof config.esbuild === "object" && config.esbuild ? config.esbuild : {}),
      jsx: "automatic",
      jsxImportSource: "react",
    };
    return config;
  },
};

export default config;
