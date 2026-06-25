export type Bo4eObject = { boTyp?: string } & Record<string, unknown>;
export type Stammdaten = Record<string, Bo4eObject[]>;

export interface DirectionDoc {
  stammdaten: Stammdaten;
  transaktionsdaten?: Bo4eObject;
  zusatzdaten?: Bo4eObject;
}

export interface CDoc {
  id: string;
  businessKey: string;
  content: Partial<Record<string, DirectionDoc>>;
}

export interface EnumDoc {
  description?: string;
  values: string[];
}

export interface FieldDoc {
  translation?: string;
  description?: string;
  example?: string;
  pattern?: string;
  enumRef?: string;
  enum?: EnumDoc;
}

export interface MarktpartnerInfo {
  name: string;
  rolle?: string;
}

export interface Bo4eResolvers {
  marktpartner?: (codenr: string, codetyp?: string) => MarktpartnerInfo | undefined;
  enumLabel?: (enumName: string, value: string) => string | undefined;
  obis?: (obis: string) => string | undefined;
  pruefId?: (pi: string) => string | undefined;
}
