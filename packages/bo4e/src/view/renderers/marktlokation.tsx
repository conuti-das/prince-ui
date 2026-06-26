import type { ReactNode } from "react";
import type { Bo4eObject, Bo4eResolvers, Density } from "../../types";
import type { Bo4eSchema } from "../../schema/load-schema";
import { IdentityHeader } from "../IdentityHeader";
import { EnumIcon } from "../EnumIcon";
import { EnumBadge, type Tone } from "../EnumBadge";
import { ContactLine, type ContactPerson } from "../ContactLine";
import { AddressBlock, type Adresse } from "../AddressBlock";
import { MarktpartnerRow } from "../MarktpartnerRow";
import { SchemaField } from "../SchemaField";
import { validityStatus } from "../../core/validity";

interface Gz {
  enddatum?: string;
}

export function MarktlokationHeader({ schema, obj }: { schema: Bo4eSchema; obj: Bo4eObject }) {
  const typArr = obj.marktlokationsTyp as { typ?: string }[] | undefined;
  const typ = typArr?.[0]?.typ;
  const trailing = typ === "STANDARD_MARKTLOKATION" ? "Standard" : typ;
  return (
    <IdentityHeader
      icon={
        <SchemaField schema={schema} boTyp="MARKTLOKATION" fieldKey="sparte" value={obj.sparte}>
          <EnumIcon enumName="SPARTE" value={String(obj.sparte)} />
        </SchemaField>
      }
      title={`MaLo ${String(obj.marktlokationsId ?? "")}`}
      subtitle="Marktlokation"
      trailing={trailing}
    />
  );
}

export function MarktlokationBody({
  schema,
  obj,
  resolvers,
  now,
}: {
  schema: Bo4eSchema;
  obj: Bo4eObject;
  /** Kuratiertes Fachlich-Summary; Detailgrad/Editieren übernimmt FullDetail. */
  density?: Density;
  editable?: boolean;
  resolvers?: Bo4eResolvers;
  now?: Date;
}) {
  const rollen = (obj.marktrollen as Bo4eObject[] | undefined) ?? [];
  const expired = (r: Bo4eObject) =>
    validityStatus({ enddatum: (r.gueltigkeitszeitraum as Gz | undefined)?.enddatum }, now) === "abgelaufen" ? 1 : 0;
  const sorted = [...rollen].sort((a, b) => expired(a) - expired(b));
  const endkunde = obj.endkunde as (ContactPerson & { partneradresse?: Adresse }) | undefined;

  const badge = (key: string, tone: Tone, label: string, icon?: ReactNode) => (
    <SchemaField schema={schema} boTyp="MARKTLOKATION" fieldKey={key} value={obj[key]}>
      <EnumBadge tone={tone} icon={icon}>
        {label}
      </EnumBadge>
    </SchemaField>
  );

  return (
    <>
      <div className="prn-bo-grp prn-bo-badges">
        {obj.energierichtung
          ? badge(
              "energierichtung",
              "neutral",
              obj.energierichtung === "AUSSP" ? "Verbrauch" : "Erzeugung",
              <EnumIcon enumName="ENERGIERICHTUNG" value={String(obj.energierichtung)} />,
            )
          : null}
        {obj.bilanzierungsmethode ? badge("bilanzierungsmethode", "neutral", String(obj.bilanzierungsmethode)) : null}
        {obj.netzebene ? badge("netzebene", "neutral", String(obj.netzebene)) : null}
        {obj.sperrstatus
          ? badge("sperrstatus", obj.sperrstatus === "ENTSPERRT" ? "positive" : "negative", String(obj.sperrstatus).toLowerCase())
          : null}
      </div>
      {endkunde ? (
        <div className="prn-bo-grp">
          <div className="prn-bo-grph">Endkunde</div>
          <ContactLine person={endkunde} />
          {endkunde.partneradresse ? <AddressBlock adresse={endkunde.partneradresse} /> : null}
        </div>
      ) : null}
      {sorted.length ? (
        <div className="prn-bo-grp">
          <div className="prn-bo-grph">Marktrollen · {sorted.length}</div>
          {sorted.map((r, i) => (
            <MarktpartnerRow key={i} row={r} resolvers={resolvers} now={now} />
          ))}
        </div>
      ) : null}
    </>
  );
}
