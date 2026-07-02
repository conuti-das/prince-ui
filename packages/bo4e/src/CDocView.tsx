import { useMemo, useState } from "react";
import { SegmentedControl, Segment, Switch, PrinceSizeProvider } from "@conuti-das/prince-ui";
import type { Bo4eResolvers, Density } from "./types";
import type { Bo4eSchema } from "./schema/load-schema";
import { normalizeToCDoc, type CDocInput } from "./normalize";
import { scanAnomalies } from "./core/anomalies";
import { humanize } from "./core/humanize";
import { seedTree } from "./core/array-ids";
import { SmartObjectView } from "./view/SmartObjectView";
import "./view/bo4e.css";

const TRANS = "__TRANS__";
const ZUSATZ = "__ZUSATZ__";

const DENSITIES: { id: Density; label: string }[] = [
  { id: "fachlich", label: "Fachlich" },
  { id: "gefuellt", label: "Gefüllt" },
  { id: "alle", label: "Alle Felder" },
];

export interface CDocViewProps {
  /** Full cDoc, a single BO, or an array of BOs. */
  doc: CDocInput;
  schema: Bo4eSchema;
  resolvers?: Bo4eResolvers;
  now?: Date;
  defaultDensity?: Density;
}

export function CDocView({ doc, schema, resolvers, now, defaultDensity = "fachlich" }: CDocViewProps) {
  const cdoc = normalizeToCDoc(doc);
  // One full-tree id seed before any density-dependent pruning (stable array keys).
  useMemo(() => seedTree(cdoc), [cdoc]);
  const directions = Object.keys(cdoc.content);
  const [dir, setDir] = useState<string>(() => (directions.includes("OUTBOUND") ? "OUTBOUND" : (directions[0] ?? "")));
  const [tab, setTab] = useState<string | null>(null);
  const [density, setDensity] = useState<Density>(defaultDensity);
  const [editMode, setEditMode] = useState(false);

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

  const editable = editMode && density !== "fachlich";

  const renderActive = () => {
    if (active === TRANS && dd.transaktionsdaten) {
      return (
        <SmartObjectView
          schema={schema}
          obj={dd.transaktionsdaten}
          density={density}
          editable={editable}
          resolvers={resolvers}
          now={now}
        />
      );
    }
    if (active === ZUSATZ && dd.zusatzdaten) {
      return (
        <SmartObjectView
          schema={schema}
          obj={dd.zusatzdaten}
          density={density}
          editable={editable}
          resolvers={resolvers}
          now={now}
        />
      );
    }
    const list = dd.stammdaten[active] ?? [];
    return list.map((obj, i) => (
      <SmartObjectView
        key={i}
        schema={schema}
        obj={obj}
        density={density}
        editable={editable}
        resolvers={resolvers}
        now={now}
      />
    ));
  };

  return (
    <PrinceSizeProvider size="s">
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
                setEditMode(false);
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

      <div className="prn-bo-controls">
        <SegmentedControl
          aria-label="Detailgrad"
          selectedKeys={new Set([density])}
          onSelectionChange={(keys) => {
            const next = [...(keys as Set<string>)][0] as Density | undefined;
            if (next) setDensity(next);
          }}
        >
          {DENSITIES.map((d) => (
            <Segment key={d.id} id={d.id}>
              {d.label}
            </Segment>
          ))}
        </SegmentedControl>
        <Switch isSelected={editMode} isDisabled={density === "fachlich"} onChange={setEditMode}>
          Bearbeiten
        </Switch>
      </div>

      <div className="prn-bo-tabs" role="tablist" aria-label="Objekte">
        {tabs.map((t) => {
          const list = dd.stammdaten[t];
          const kind = t === TRANS ? "trans" : t === ZUSATZ ? "zusatz" : "stamm";
          return (
            <button
              key={t}
              type="button"
              className="prn-bo-tab"
              data-kind={kind}
              role="tab"
              aria-selected={t === active}
              onClick={() => {
                setTab(t);
                setEditMode(false);
              }}
            >
              {tabLabel(t)}
              {list ? ` (${list.length})` : ""}
            </button>
          );
        })}
      </div>

      <div>{renderActive()}</div>
    </div>
    </PrinceSizeProvider>
  );
}
