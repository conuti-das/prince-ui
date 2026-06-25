import type { ReactNode } from "react";

export interface IdentityHeaderProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
}

export function IdentityHeader({ icon, title, subtitle, trailing }: IdentityHeaderProps) {
  return (
    <div className="prn-bo-idh">
      {icon ? <span className="ico">{icon}</span> : null}
      <div>
        <div className="ttl">{title}</div>
        {subtitle ? <div className="sub">{subtitle}</div> : null}
      </div>
      {trailing ? <div className="pill">{trailing}</div> : null}
    </div>
  );
}
