import type { ReactNode } from "react";

export function DoDont({ kind, children }: { kind: "do" | "dont"; children: ReactNode }) {
  return (
    <div className={`docs-dodont docs-dodont-${kind}`} role="note">
      <div className="docs-dodont-title">
        <span aria-hidden="true">{kind === "do" ? "✓" : "✕"}</span>
        {kind === "do" ? "Do" : "Don't"}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function Anatomy({ children }: { children: ReactNode }) {
  return <figure className="docs-anatomy">{children}</figure>;
}
