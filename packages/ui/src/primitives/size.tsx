import { createContext, useContext, type ReactNode } from "react";

/** Feldgröße der prince-ui Form-Controls.
 *  s = kompakt (volle UIs), m = Default, l = groß/Touch. */
export type FieldSize = "s" | "m" | "l";

const FieldSizeContext = createContext<FieldSize>("m");

/** Löst die effektive Größe auf: explizite Prop schlägt Context, Context schlägt Default ("m"). */
export function useFieldSize(explicit?: FieldSize): FieldSize {
  const ctx = useContext(FieldSizeContext);
  return explicit ?? ctx;
}

export interface PrinceSizeProviderProps {
  /** Default-Größe für alle prince-ui Felder im Teilbaum. */
  size: FieldSize;
  children: ReactNode;
}

/** Setzt die Default-Größe (s|m|l) für alle prince-ui Felder im Teilbaum –
 *  analog zu React Spectrums Provider. Einzelne Felder überschreiben per eigener `size`-Prop. */
export function PrinceSizeProvider({ size, children }: PrinceSizeProviderProps) {
  return <FieldSizeContext.Provider value={size}>{children}</FieldSizeContext.Provider>;
}
