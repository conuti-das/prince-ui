import { useMemo, useState } from "react";
import type { Bo4eResolvers } from "./types";
import type { Bo4eSchema } from "./schema/load-schema";
import { normalizeToCDoc, type SydocInput } from "./normalize";
import { scanAnomalies } from "./core/anomalies";
import { humanize } from "./core/humanize";
import { SmartObjectView } from "./view/SmartObjectView";
import "./view/bo4e.css";

const TRANS = "__TRANS__";
const ZUSATZ = "__ZUSATZ__";

export interface SydocViewProps {
  /** Full cDoc, a single BO, or an array of BOs. */
  doc: SydocInput;
  schema: Bo4eSchema;
  resolvers?: Bo4eResolvers;
  now?: Date;
}

export function SydocView({ doc, schema, resolvers, now }: SydocViewProps) {
  const cdoc = normalizeToCDoc(doc);
  const directions = Object.keys(cdoc.content);
  const [dir, setDir] = useState<string>(() => (directions.includes("OUTBOUND") ? "OUTBOUND" : (directions[0] ?? "")));
  const [tab, setTab] = useState<string | null>(null);

  const dd = cdoc.content[dir];
  const anomalies = useMemo(() => (dd ? scanAnomalies(dd, { now }) : []), [dd, now]);

  if (!dd) return null;

  const tabs = [
    ...Object.keys(dd.stammdaten),
    ...(dd.transaktionsdaten ? [TRANS] : []),
    ...(dd.zusatzdaten ? [ZUSATZ] : []),
  ];
  const active = tab && tabs.includes(tab) ? tab : (tabs[0] ?? "");

  const tabLabel = (t: string) => (t === TRANS ? "Transaktionsdaten" : t === ZUSATZ ? "Zusatzdaten" : humanize(t));

  const renderActive = () => {
    if (active === TRANS && dd.transaktionsdaten) {
      return <SmartObjectView schema={schema} obj={dd.transaktionsdaten} resolvers={resolvers} now={now} />;
    }
    if (active === ZUSATZ && dd.zusatzdaten) {
      return <SmartObjectView schema={schema} obj={dd.zusatzdaten} resolvers={resolvers} now={now} />;
    }
    const list = dd.stammdaten[active] ?? [];
    return list.map((obj, i) => <SmartObjectView key={i} schema={schema} obj={obj} resolvers={resolvers} now={now} />);
  };

  return (
    <div className="prn-bo-app">
      {directions.length > 1 ? (
        <div className="prn-bo-tabs" role="tablist" aria-label="Richtung">
          {directions.map((d) => (
            <button
              key={d}
              type="button"
              className="prn-bo-tab"
              role="tab"
              aria-selected={d === dir}
              onClick={() => {
                setDir(d);
                setTab(null);
              }}
            >
              {d}
            </button>
          ))}
        </div>
      ) : null}

      {anomalies.length ? (
        <details className="prn-bo-warn">
          <summary>{anomalies.length} Auffälligkeiten erkannt</summary>
          <ul>
            {anomalies.map((a, i) => (
              <li key={i}>
                {a.message} <code>— {a.path}</code>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="prn-bo-tabs" role="tablist" aria-label="Objekte">
        {tabs.map((t) => {
          const list = dd.stammdaten[t];
          return (
            <button
              key={t}
              type="button"
              className="prn-bo-tab"
              role="tab"
              aria-selected={t === active}
              onClick={() => setTab(t)}
            >
              {tabLabel(t)}
              {list ? ` (${list.length})` : ""}
            </button>
          );
        })}
      </div>

      <div>{renderActive()}</div>
    </div>
  );
}
