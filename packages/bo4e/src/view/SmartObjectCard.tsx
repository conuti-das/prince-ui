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
  const [edit, setEdit] = useState(false);

  return (
    <div className="prn-bo-card">
      {header}
      {children}
      {full ? (
        <>
          <div className="prn-bo-detailbar">
            <button type="button" className="prn-bo-editbtn" aria-pressed={edit} onClick={() => setEdit((e) => !e)}>
              {edit ? "Fertig" : "Bearbeiten"}
            </button>
          </div>
          <FullDetail schema={schema} boTyp={boTyp} obj={obj} editable={edit} />
        </>
      ) : (
        <button type="button" className="prn-bo-moreb" onClick={() => setFull(true)}>
          + Alle Details
        </button>
      )}
    </div>
  );
}
