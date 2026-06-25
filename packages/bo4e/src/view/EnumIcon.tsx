import { Icon, type IconName } from "@conuti-das/prince-ui";

const MAP: Record<string, Record<string, IconName>> = {
  SPARTE: { STROM: "bolt", GAS: "flame", WASSER: "droplet", ABWASSER: "droplet" },
  ENERGIERICHTUNG: { AUSSP: "arrow-down-right", EINSP: "arrow-up-right" },
};

export function EnumIcon({ enumName, value }: { enumName: string; value: string }) {
  const name = MAP[enumName]?.[value];
  if (!name) return null;
  return <Icon name={name} />;
}
