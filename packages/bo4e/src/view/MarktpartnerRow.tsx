import type { Bo4eObject, Bo4eResolvers } from "../types";
import { CodeResolved } from "./CodeResolved";
import { ValidityRange } from "./ValidityRange";
import { validityStatus } from "../core/validity";

interface Gz {
  startdatum?: string;
  enddatum?: string;
}

export function MarktpartnerRow({ row, resolvers, now }: { row: Bo4eObject; resolvers?: Bo4eResolvers; now?: Date }) {
  const gz = (row.gueltigkeitszeitraum ?? {}) as Gz;
  const dim = validityStatus({ startdatum: gz.startdatum, enddatum: gz.enddatum }, now) === "abgelaufen";
  return (
    <div className="prn-bo-mpr" data-dim={dim}>
      <span className="rtag">{String(row.marktrolle ?? "—")}</span>
      <div className="mid">
        <div className="mnm">
          <CodeResolved
            code={String(row.rollencodenummer ?? "")}
            codetyp={row.rollencodetyp ? String(row.rollencodetyp) : undefined}
            resolvers={resolvers}
          />
        </div>
        {row.messstellenbetreiberEigenschaft ? <div className="meig">grundzuständig</div> : null}
      </div>
      {gz.startdatum || gz.enddatum ? <ValidityRange start={gz.startdatum} end={gz.enddatum} now={now} /> : null}
    </div>
  );
}
