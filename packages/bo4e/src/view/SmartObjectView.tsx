import type { Bo4eObject, Bo4eResolvers } from "../types";
import type { Bo4eSchema } from "../schema/load-schema";
import { SmartObjectCard } from "./SmartObjectCard";
import { GenericBody } from "./renderers/generic";
import { MarktlokationHeader, MarktlokationBody } from "./renderers/marktlokation";
import "./bo4e.css";

export interface SmartObjectViewProps {
  schema: Bo4eSchema;
  obj: Bo4eObject;
  resolvers?: Bo4eResolvers;
  now?: Date;
}

export function SmartObjectView({ schema, obj, resolvers, now }: SmartObjectViewProps) {
  const boTyp = obj.boTyp ?? "UNKNOWN";
  if (boTyp === "MARKTLOKATION") {
    return (
      <SmartObjectCard
        schema={schema}
        boTyp={boTyp}
        obj={obj}
        header={<MarktlokationHeader schema={schema} obj={obj} />}
      >
        <MarktlokationBody schema={schema} obj={obj} resolvers={resolvers} now={now} />
      </SmartObjectCard>
    );
  }
  return (
    <SmartObjectCard schema={schema} boTyp={boTyp} obj={obj}>
      <GenericBody schema={schema} boTyp={boTyp} obj={obj} />
    </SmartObjectCard>
  );
}
