import type { ReactNode } from "react";

/**
 * Feature-Kachel fürs Bento-Grid. `variant="dark"` ergibt eine dunkle Karte
 * (z. B. für Code-Snippets).
 */
export function FeatureCard({ title, icon, variant, children }: {
  title: string;
  icon?: ReactNode;
  variant?: "dark";
  children?: ReactNode;
}) {
  return (
    <div className={"docs-feature-card" + (variant === "dark" ? " is-dark" : "")}>
      {icon && <div className="docs-feature-card-icon" aria-hidden="true">{icon}</div>}
      <h3>{title}</h3>
      {children && <div className="docs-feature-card-body">{children}</div>}
    </div>
  );
}
