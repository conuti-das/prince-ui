import type { ReactNode } from "react";

export type Tone = "neutral" | "positive" | "info" | "critical" | "negative";

export function EnumBadge({ tone = "neutral", icon, children }: { tone?: Tone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="prn-bo-badge" data-tone={tone}>
      {icon}
      {children}
    </span>
  );
}
