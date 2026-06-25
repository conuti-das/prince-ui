import type { Bo4eResolvers } from "../types";

export interface CodeResolvedProps {
  code: string;
  codetyp?: string;
  resolvers?: Bo4eResolvers;
}

export function CodeResolved({ code, codetyp, resolvers }: CodeResolvedProps) {
  const info = resolvers?.marktpartner?.(code, codetyp);
  return (
    <span className="prn-bo-code">
      {info ? <span className="nm">{info.name}</span> : <span>{code}</span>}
      {info ? <span className="raw">{code}</span> : null}
    </span>
  );
}
