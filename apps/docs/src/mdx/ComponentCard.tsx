import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Link-Kachel fürs Explore-Grid. `visual` nimmt ein Mini-SVG/Img auf;
 * `children` ist die Kurzbeschreibung.
 */
export function ComponentCard({ title, href, visual, children }: {
  title: string;
  href: string;
  visual?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Link to={href} className="docs-component-card">
      {visual && <div className="docs-component-card-visual">{visual}</div>}
      <h3>{title}</h3>
      {children && <div className="docs-component-card-body">{children}</div>}
    </Link>
  );
}
