import type { FieldDoc } from "../types";
import { isIsoDate, zonedLabelWithTz, toUtcLabel } from "../core/datetime";

export function SchemaPopoverBody({ fieldKey, doc, value }: { fieldKey: string; doc: FieldDoc; value: unknown }) {
  const isDate = isIsoDate(value);
  return (
    <div>
      <h4>{doc.translation}</h4>
      <div className="key">
        {fieldKey}
        {doc.enumRef ? ` · enum ${doc.enumRef}` : ""}
      </div>
      {doc.description ? (
        <div className="desc">{doc.description}</div>
      ) : (
        <div className="desc" data-nodoc="true">
          Keine Schema-Beschreibung hinterlegt – im echten Editor aus dem JSON-Schema-Repo.
        </div>
      )}
      {isDate ? (
        <>
          <div className="row">
            <span>Angezeigt (Berlin)</span>
            <span className="mono">{zonedLabelWithTz(value)}</span>
          </div>
          <div className="row">
            <span>Übermittelt (UTC)</span>
            <span className="mono">{toUtcLabel(value)}</span>
          </div>
        </>
      ) : (
        <>
          {doc.pattern ? (
            <div className="row">
              <span>Pattern</span>
              <span className="mono">{doc.pattern}</span>
            </div>
          ) : null}
          {doc.example ? (
            <div className="row">
              <span>Beispiel</span>
              <span className="mono">{doc.example}</span>
            </div>
          ) : null}
        </>
      )}
      {doc.enum ? (
        <>
          <div className="enh">Mögliche Werte</div>
          <div className="enums">
            {doc.enum.values.map((v) => (
              <span key={v} className="ev" data-on={v === value}>
                {v}
              </span>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
