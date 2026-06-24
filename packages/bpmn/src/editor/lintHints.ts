/** Kuratierte, deutsche Erklärungen + Handlungsempfehlungen je bpmnlint-Regel.
 *  Portiert aus maco `BpmnEditor/lintHints.ts`. */
export interface LintHint {
  title: string;
  explanation: string;
  howto: string;
}

const HINTS: Record<string, LintHint> = {
  "label-required": {
    title: "Beschriftung fehlt",
    explanation:
      "Aufgaben, Ereignisse und Gateways brauchen einen sprechenden Namen, damit der Prozess lesbar bleibt.",
    howto: "Element anklicken und im Properties-Panel unter „Name“ eine Beschriftung eintragen.",
  },
  "no-disconnected": {
    title: "Element nicht verbunden",
    explanation:
      "Ein Element ist über keine Sequenzfluss-Kante erreichbar — der Prozessfluss bricht ab.",
    howto: "Eine Verbindung (Pfeil) vom vorherigen Element hierher und/oder weiter zum nächsten ziehen.",
  },
  "no-implicit-split": {
    title: "Impliziter Split",
    explanation:
      "Ein Element hat mehrere ausgehende Sequenzflüsse ohne explizites Gateway — das Verzweigungsverhalten ist mehrdeutig.",
    howto: "Ein Gateway (exklusiv/parallel) einfügen und die ausgehenden Flüsse darüber führen.",
  },
  "no-complex-gateway": {
    title: "Komplexes Gateway",
    explanation: "Komplexe Gateways sind schwer verständlich und in den MaKo-Prozessen unerwünscht.",
    howto: "Durch exklusive (XOR) oder parallele (AND) Gateways ersetzen.",
  },
};

const FALLBACK: LintHint = {
  title: "Validierungshinweis",
  explanation: "Der Linter hat ein Problem an diesem Element gemeldet.",
  howto: "Element prüfen und gemäß der Meldung korrigieren. Bei Unsicherheit den KI-Fix nutzen.",
};

export function lintHint(ruleId: string): LintHint {
  return HINTS[ruleId] ?? FALLBACK;
}
