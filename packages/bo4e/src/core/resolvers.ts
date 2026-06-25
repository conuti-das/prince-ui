import type { Bo4eResolvers } from "../types";

export const defaultResolvers: Bo4eResolvers = {
  marktpartner: () => undefined,
  enumLabel: () => undefined,
  obis: () => undefined,
  pruefId: () => undefined,
};

export function withDefaults(r?: Bo4eResolvers): Required<Bo4eResolvers> {
  return {
    marktpartner: r?.marktpartner ?? (() => undefined),
    enumLabel: r?.enumLabel ?? (() => undefined),
    obis: r?.obis ?? (() => undefined),
    pruefId: r?.pruefId ?? (() => undefined),
  };
}
