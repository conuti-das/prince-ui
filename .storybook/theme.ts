import { create } from "@storybook/theming";

/** Prince-Optik fürs Storybook-Manager-UI + Docs. Werte sind hart kodiert,
 *  weil das Manager-UI außerhalb des data-theme-Scopes der Tokens läuft. */
export default create({
  base: "dark",
  brandTitle: "@conuti-das/prince-ui",
  brandUrl: "https://conuti-das.github.io/prince-ui/",

  colorPrimary: "#a0d22b",
  colorSecondary: "#a0d22b",

  appBg: "#222a31",
  appContentBg: "#1e252b",
  appPreviewBg: "#222a31",
  appBorderColor: "rgba(255,255,255,0.1)",
  appBorderRadius: 12,

  textColor: "#f3f4f2",
  textInverseColor: "#222a31",
  textMutedColor: "#9b9f9a",

  barTextColor: "#9b9f9a",
  barSelectedColor: "#a0d22b",
  barHoverColor: "#a0d22b",
  barBg: "#1e252b",

  inputBg: "#2a333b",
  inputBorder: "rgba(255,255,255,0.12)",
  inputTextColor: "#f3f4f2",
  inputBorderRadius: 8,

  fontBase: 'system-ui, sans-serif',
  fontCode: 'ui-monospace, Menlo, monospace',
});
