import { useState, type ReactNode } from "react";
import type { Bo4eObject } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { FullDetail } from "./FullDetail";

export interface SmartObjectCardProps {
  schema: Bo4eSchema;
  boTyp: string;
  obj: Bo4eObject;
  header?: ReactNode;
  children: ReactNode;
}

export function SmartObjectCard({ schema, boTyp, obj, header, children }: SmartObjectCardProps) {
  const [full, setFull] = useState(false);
  return (
    <div className="prn-bo-card">
      {header}
      {children}
      {full ? (
        <FullDetail schema={schema} boTyp={boTyp} obj={obj} />
      ) : (
        <button type="button" className="prn-bo-moreb" onClick={() => setFull(true)}>
          + Alle Details
        </button>
      )}
    </div>
  );
}
