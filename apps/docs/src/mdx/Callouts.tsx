import type { ReactNode } from "react";

export function DoDont({ kind, children }: { kind: "do" | "dont"; children: ReactNode }) {
  return (
    <div className={`docs-dodont docs-dodont-${kind}`} role="note">
      <strong>{kind === "do" ? "✓ Do" : "✗ Don't"}</strong>
      <div>{children}</div>
    </div>
  );
}

export function Anatomy({ children }: { children: ReactNode }) {
  return <figure className="docs-anatomy">{children}</figure>;
}
