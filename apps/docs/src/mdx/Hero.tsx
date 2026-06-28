import type { ReactNode } from "react";

/**
 * Landing-Hero mit Gradient-Hintergrund. `children` nimmt die Button-Paare
 * (z. B. <a className="docs-btn docs-btn-primary">…</a>) auf.
 */
export function Hero({ title, eyebrow, lead, children }: {
  title: string;
  eyebrow?: string;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="docs-hero">
      {eyebrow && <p className="docs-hero-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {lead && <p className="docs-hero-lead">{lead}</p>}
      {children && <div className="docs-hero-actions">{children}</div>}
    </section>
  );
}
