import type { Bo4eObject, Bo4eResolvers, Density } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { SmartObjectCard } from "./SmartObjectCard";
import { GenericBody } from "./renderers/generic";
import { MarktlokationHeader, MarktlokationBody } from "./renderers/marktlokation";
import "./bo4e.css";

export interface SmartObjectViewProps {
  schema: Bo4eSchema;
  obj: Bo4eObject;
  density: Density;
  editable: boolean;
  resolvers?: Bo4eResolvers;
  now?: Date;
}

export function SmartObjectView({ schema, obj, density, editable, resolvers, now }: SmartObjectViewProps) {
  const boTyp = obj.boTyp ?? "UNKNOWN";
  if (boTyp === "MARKTLOKATION") {
    return (
      <SmartObjectCard
        schema={schema}
        boTyp={boTyp}
        obj={obj}
        density={density}
        editable={editable}
        header={<MarktlokationHeader schema={schema} obj={obj} />}
      >
        <MarktlokationBody schema={schema} obj={obj} density="fachlich" editable={false} resolvers={resolvers} now={now} />
      </SmartObjectCard>
    );
  }
  return (
    <SmartObjectCard schema={schema} boTyp={boTyp} obj={obj} density={density} editable={editable}>
      <GenericBody schema={schema} boTyp={boTyp} obj={obj} density="fachlich" />
    </SmartObjectCard>
  );
}
