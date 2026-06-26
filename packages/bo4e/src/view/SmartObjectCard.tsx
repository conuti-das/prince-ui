import { useState, type ReactNode } from "react";
import type { Bo4eObject, Density } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { FullDetail } from "./FullDetail";

export interface SmartObjectCardProps {
  schema: Bo4eSchema;
  boTyp: string;
  obj: Bo4eObject;
  density: Density;
  editable: boolean;
  header?: ReactNode;
  children: ReactNode; // compact body (fachlich content, constant across levels)
}

export function SmartObjectCard({ schema, boTyp, obj, density, editable, header, children }: SmartObjectCardProps) {
  // local override: collapse a single card below the global level
  const [collapsed, setCollapsed] = useState(false);
  const showDetail = density !== "fachlich" && !collapsed;

  return (
    <div className="prn-bo-card">
      {header}
      {children}
      {density !== "fachlich" ? (
        <>
          <div className="prn-bo-detailbar">
            <button
              type="button"
              className="prn-bo-editbtn"
              aria-pressed={!collapsed}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? "Aufklappen" : "Einklappen"}
            </button>
          </div>
          {showDetail ? (
            <FullDetail schema={schema} boTyp={boTyp} obj={obj} density={density} editable={editable} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
