import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { I18nProvider } from "react-aria-components";
import { MDXProvider } from "@mdx-js/react";
import "@conuti-das/prince-ui-tokens/tokens.css";
import "@conuti-das/prince-ui/styles.css";
// prince-ui-Wrapper-CSS der Schwer-Pakete (z. B. `.prn-bpmn-viewer { display:flex }`).
// Ohne diese bleibt die Editor-Canvas auf Inhaltshöhe (kein flex-fit) → wirkt leer.
import "@conuti-das/prince-ui-bpmn/styles.css";
import "@conuti-das/prince-ui-dmn/styles.css";
import "@conuti-das/prince-ui-forms/styles.css";
import "@conuti-das/prince-ui-bo4e/styles.css";

// Schwer-Editor-Canvas-Assets (bpmn-js/dmn-js/form-js). Die prince-ui-*-Pakete
// importieren diese CSS zwar in ihren Komponenten-Modulen, doch ihr gebündeltes
// dist/index.css trägt die `@import "bpmn-js/dist/assets/…"`-Referenzen nur als
// bare Specifier — die landen in der Doku (dist-Konsument) NICHT im Bundle. Daher
// hier global laden, mit gegen node_modules verifizierten Pfaden. Sonst rendern
// bpmn-/dmn-Canvas unstyled. Form-js-Editor-CSS lädt FormBuilder zwar dynamisch,
// wir laden es zur Sicherheit ebenfalls global mit.
import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn.css";
import "dmn-js/dist/assets/diagram-js.css";
import "dmn-js/dist/assets/dmn-js-shared.css";
import "dmn-js/dist/assets/dmn-js-drd.css";
import "dmn-js/dist/assets/dmn-js-decision-table.css";
import "dmn-js/dist/assets/dmn-js-decision-table-controls.css";
import "dmn-js/dist/assets/dmn-js-literal-expression.css";
import "dmn-js/dist/assets/dmn-font/css/dmn.css";
import "@bpmn-io/form-js/dist/assets/form-js.css";
import "@bpmn-io/form-js-editor/dist/assets/form-js-editor.css";

import "./chrome/theme.css";
import { AppLayout } from "./chrome/AppLayout";
import { mdxComponents } from "./mdx/components";
import { routeObjects } from "./routes";

const router = createBrowserRouter(
  [{ element: <AppLayout />, children: routeObjects }],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" },
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider locale="de-DE">
      <MDXProvider components={mdxComponents}>
        <RouterProvider router={router} />
      </MDXProvider>
    </I18nProvider>
  </React.StrictMode>,
);
