import { LiveProvider, LivePreview, LiveEditor, LiveError } from "react-live";
import * as ui from "@conuti-das/prince-ui";

export function Example({ code }: { code: string }) {
  return (
    <LiveProvider code={code.trim()} scope={{ ...ui }} noInline={false}>
      <div className="docs-example">
        <div className="docs-example-preview"><LivePreview /></div>
        <LiveEditor className="docs-example-code" />
        <LiveError className="docs-example-error" />
      </div>
    </LiveProvider>
  );
}
