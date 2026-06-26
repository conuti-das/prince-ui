import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { I18nProvider } from "react-aria-components";
import { MDXProvider } from "@mdx-js/react";
import "@conuti-das/prince-ui-tokens/tokens.css";
import "@conuti-das/prince-ui/styles.css";
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
