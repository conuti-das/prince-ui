# prince-ui-bo4e — BO4E cDoc Viewer/Editor · Design

- **Status:** Entwurf zur Freigabe
- **Datum:** 2026-06-25
- **Scope dieses Dokuments:** Milestone 1 = Slice 0 + 1 + 2 (Schema-Core → Smart-Viewer → Stammdaten-Tabs). Edit-Mode, Raw/JSON-Diagramm und Beziehungsgraph sind eigene spätere Slices und hier nur über ihre Schnittstellen berücksichtigt.

---

## 1. Kontext & Ziel

In „Prinz" (prince-ui) soll eine Komponentenfamilie entstehen, die **BO4E-Geschäftsobjekte** (Business Objects for Energy) der Marktkommunikation elegant, poliert und **sachbearbeiter-optimiert** darstellt und bearbeitet. Eingabe ist ein **cDoc** — die in MaCo verwendete Datenstruktur — sowie ein **JSON-Schema-Repo** (BO4E), das Feld-Beschreibungen, Enums und Beispiele liefert.

Die Komponente ist **datengetrieben und schema-gestützt**, nicht auf konkrete BO-Typen hartcodiert. Das Schema speist Popover-Dokumentation, Edit-Widgets und (später) Monaco-IntelliSense aus einer Quelle.

### Quellen der Wahrheit
- BO4E-Schema (lokal, als Fixture ins Paket gespiegelt):
  `finops-bo4e/frontend/src/modules/shared/bo4e/schemas/{bo4e-fields,bo4e-enums,bo4e-bos}.json`
- Versioniertes Schema-Repo: `github.com/conuti-gmbh/maco-api-doc-resources` (Tag `v202610`).
- Beispiel-cDoc (Fixture): `.superpowers/cdoc-example.json` (im Repo), wandert nach `packages/bo4e/src/__fixtures__/`.

---

## 2. Decomposition & Build-Reihenfolge

| # | Slice | Inhalt | hängt an |
|---|-------|--------|----------|
| **0** | Schema-Core | cDoc-Modell + Resolver (Feld→Doc, Enum, **Code→Name**), Gültigkeits-Engine, Auffälligkeiten-Scanner — reine Daten, kein React | — |
| **1** | Smart-Viewer | read-only Darstellung pro Objekt als **Smart-View** (Bausteine) + „+ Alle Details" (kompakte 2-Spalten-Vollsicht) | 0 |
| **2** | Stammdaten-Tabs / SydocView | `content` → Richtung → Gruppen-Tabs + Transaktions-/Zusatzdaten, auf ObjectPage/`iconTabBar` | 0, 1 |
| 3 | Beziehungsgraph | MaLo→MeLo→Geräte (React Flow), prince-native | 0 |
| 4 | Edit-Mode | schema-getriebene Inputs, „+ Feld hinzufügen", **Datums-/Zeit-Picker** | 0, 1 |
| 5 | Raw/JSON | todiagram-artige, faltbare Knotenansicht (echte Graph-Engine) | 0 |
| 6 | SyDoc-Container-Politur | Transaktionsdaten kompakt, Cross-Object-Checks | 1–5 |

**Milestone 1 = Slice 0 + 1 + 2.**

---

## 3. Paket & Technik

- Neues Workspace-Paket **`packages/bo4e` → `prince-ui-bo4e`** (parallel zu `-bpmn`/`-dmn`/`-forms`).
- Build: **tsup**, ESM, d.ts, sourcemaps (wie `-dmn`).
- Peers: `react`, `react-dom`, `react-aria-components`, **`prince-ui`** (Primitives/Composites), `prince-ui-tokens`.
- Dependency: **`ajv`** + `ajv-formats` (klein) für spätere Validierung; in Milestone 1 nur für Schema-Laden optional.
- **Keine** schweren Deps in Milestone 1 (Monaco erst Slice 5, React Flow erst Slice 3) — sonst zieht jeder Import sie mit.
- Styling: reines CSS mit `--prn-*`-Tokens, co-located `.css` je Komponente, `cx()`-Utility. Kein Tailwind/CSS-in-JS. 3-Mode-Theming (Light/Dark/Cu) erbt automatisch über Tokens.
- A11y über React Aria; Klickflächen ≥ `--prn-hit` (44px); `:focus-visible` nutzt `--prn-focus`.

---

## 4. Datenmodell — cDoc

```ts
// Ein BO4E-Objekt: Diskriminator boTyp + freie Felder (schema-validiert, nicht hartcodiert)
type Bo4eObject = { boTyp?: string } & Record<string, unknown>;

// Stammdaten: Gruppenschlüssel -> Array von BOs.  WICHTIG: Gruppenschlüssel != boTyp
//   z.B. { NETZNUTZUNGSVERTRAG: [ { boTyp: "VERTRAG", ... } ] }
type Stammdaten = Record<string, Bo4eObject[]>;

interface DirectionDoc {
  stammdaten: Stammdaten;
  transaktionsdaten?: Bo4eObject;   // einzelnes Objekt (Briefkopf der Nachricht)
  zusatzdaten?: Bo4eObject;         // EDI-Metadaten
}

interface CDoc {
  id: string;
  businessKey: string;
  content: Partial<Record<"INBOUND" | "OUTBOUND" | string, DirectionDoc>>;
}
```

Beobachtete Strukturmerkmale aus den Realdaten, die das Modell tragen muss:
- **Richtungsebene** `INBOUND`/`OUTBOUND` (offen für weitere Schlüssel).
- **Gruppenschlüssel ≠ boTyp** → Tab-/Sektions-Überschrift kommt aus dem Gruppenschlüssel, der Renderer aus `boTyp` (bzw. `vertragsart`).
- Tiefe Verschachtelung: COM-Objekte (Adresse, Gültigkeitszeitraum), Sub-BO-Arrays (`marktrollen` = N × MARKTTEILNEHMER, `zaehlwerke`, `verbrauchsmenge`), eingebettete BOs (`endkunde`/`eigentuemer`/`hausverwalter` = GESCHAEFTSPARTNER).
- Viele `null`-Felder und Platzhalter (`#parameter1#`, `#CONTRL_REFERENCE#`).

---

## 5. Schicht 0 — Schema-Core (reine Daten, voll testbar)

### 5.1 Schema-Laden & Feld-Auflösung
```ts
loadBo4eSchema(src: { bos; fields; enums }): Bo4eSchema
resolveField(schema, boTyp, fieldKey): FieldDoc
// FieldDoc = { translation?, description?, example?, pattern?, enum?: { description, values: string[] }, isRef, isCom }
getFieldOrder(boTyp): string[]          // kuratierte Wichtig-zuerst-Reihenfolge (Tab-Reihenfolge folgt den Gruppenschlüsseln des cDoc)
```

### 5.2 Resolver-Dienste (pluggbar, injizierbar)
Der größte fachliche Mehrwert (Konsens aller drei Experten) ist **Code→Name**. Resolver werden als Funktionen injiziert, damit das Paket keine Datenbank-Kopplung hat:
```ts
interface Bo4eResolvers {
  marktpartner?: (codenr: string, codetyp?: string) => MarktpartnerInfo | undefined; // BDEW-Codenummern-DB
  enumLabel?:    (enumName: string, value: string) => string | undefined;            // Klartext für Enums
  obis?:         (obis: string) => string | undefined;                               // OBIS-Kennzahl → Messgröße
  pruefId?:      (pi: string) => string | undefined;                                 // Prüfidentifikator → Prozessname
}
```
Default-Resolver: Identity/Fallback (zeigt rohen Code, markiert „nicht aufgelöst"). Echte Resolver kommen vom Consumer (finops liefert die BDEW-DB).

### 5.3 Gültigkeits-Engine
```ts
validityStatus(range: { startdatum?; enddatum? }, now: Date): "zukuenftig" | "aktiv" | "laeuftBald" | "abgelaufen"
```
- `laeuftBald` = Ende < now + 30 Tage. Stichtag (`now`) ist injizierbar (Default: aktuelles Datum), damit stichtagsbezogene Sichten möglich sind.
- Vergleich auf absoluter Zeit (UTC-Epoch) → DST-unabhängig.

### 5.4 Auffälligkeiten-Scanner
Generischer Objekt-Walk, der Datenqualitäts-Signale sammelt (read-only-Review ist oft genau dafür da):
```ts
scanAnomalies(node: unknown, opts): Anomaly[]
// Anomaly = { severity: "warn"|"error", path: string, value, rule, message }
```
Regeln: Platzhalter `#…#`; Default-/Dummy-Werte (`00000000`, Datum-Jahr ≤ 1950); Platzhalter-Objekte (Geo/Kataster mit lauter „1"); verdächtige Zeichen in Namensfeldern (`<`,`>`); abgelaufene Gültigkeit (über Gültigkeits-Engine). Identische Treffer (gleiche Regel + Wert) werden dedupliziert. „Leere Pflichtbereiche" braucht Schema-`required`-Info und ist einer späteren Slice vorbehalten. Ergebnis speist die **Auffälligkeiten-Leiste** oben in der View.

### 5.5 Datums-/Zeit-Formatierung (verbindlich)
ISO-Zeitstempel kommen in **UTC** (`…Z` / `+0000`). Anzeige IMMER in **Europe/Berlin**, deutsch:
```ts
formatDateDE(iso: string, { withTime?: boolean }): string  // Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", … })
//   "2026-05-06T09:46:00Z"      -> "06.05.2026 11:46"  (MESZ)
//   "2022-12-31T23:00:00Z"      -> "01.01.2023 00:00"  (MEZ)  ← Tag/Jahr verschieben sich bewusst!
toUtcLabel(iso): string                                     // "2026-05-06T09:46:00Z" (Original, für Popover)
zonedLabelWithTz(iso): string                               // "06.05.2026, 11:46 MESZ"
```
- Sommerzeit/MEZ-MESZ automatisch über `Intl` + `timeZone: "Europe/Berlin"`.
- **Datums-Popover** (Klick auf ein Datumsfeld) zeigt beide Werte:
  - „Angezeigt (Berlin): 06.05.2026, 11:46 MESZ"
  - „Übermittelt (UTC): 2026-05-06T09:46:00Z"
  - plus Schema-Beschreibung des Feldes.
- **Edit (Slice 4):** Datums-/Zeitfelder nutzen die prince-ui-Eingabehilfe `DatePicker`/`DateField`/`TimeField` (React Aria, de-DE); der Bearbeitungswert wird in lokaler Zeit angeboten und beim Speichern nach **ISO-UTC** zurückgerechnet.

---

## 6. Schicht 1 — Smart-Viewer

Zwei Render-Modi pro Objekt, umgeschaltet über `SmartObjectCard`:
1. **Smart-View** (Default): fachlich verdichtete, intuitive Darstellung (Komposition der Bausteine).
2. **„+ Alle Details"**: vollständige, kompakte **2-Spalten-Label/Wert-Sicht** (rechtsbündige Labels, fette Werte, Komponenten eingerückt) — die SAP-artige Vollansicht. Lange Texte werden abgeschnitten; Volltext im Feld-Popover.

Jedes Feld/Icon ist klickbar → **Schema-Popover** (`SchemaField`): Was ist das Feld? (Schema-`description`) · Woher kommt der Wert? (Pfad/Herkunft) · Was bedeutet er? (Enum-Werte / Code→Name / Datums-UTC).

### 6.1 Wiederverwendbare Bausteine (~10) — der eigentliche Kern
Smart-Views = Komposition weniger Bausteine, **nicht** N Sonderlösungen.

| Baustein | Props (Skizze) | Zweck |
|----------|----------------|-------|
| `SchemaField` | `{ boTyp, path, value, children }` | macht jeden Wert klickbar → `SchemaPopover`; zentrale Klick-Konvention |
| `IdentityHeader` | `{ icon?, title, subtitle?, trailing?, avatar? }` | Kopfzeile (MaLo, Geschäftspartner, Vertrag) |
| `EnumIcon` | `{ enumName, value, size? }` | Enum→Icon (Sparte ⚡, Energierichtung ↘/↗); Klick → Enum-Popover |
| `EnumBadge` | `{ enumName, value, toneMap? }` | Enum→getöntes Badge nach Regel (Status/Sperre/Messwertstatus) |
| `MarktpartnerRow` | `{ marktrolle?, rollencodenummer, rollencodetyp?, eigenschaft?, validity?, gewerbe? }` | „MSB · 9906464000001 · grundzuständig · gültig bis 01.07.2026" + Code→Name |
| `AddressBlock` | `{ adresse, compact? }` | echter Adressblock statt Label/Wert-Liste |
| `ContactLine` | `{ name, rollen?, eMail?, kontaktweg? }` | Name-Merge + Mail/Telefon-Icons + Kontaktweg-Chips |
| `ValidityRange` | `{ start?, end?, now? }` | „01.01.2023 – 01.07.2026" + Aktiv/Bald/Abgelaufen-Punkt (DE-Datum) |
| `CodeResolved` | `{ code, resolver?, mono? }` | Codenummer mono + aufgelöster Klartext (Marktpartner/OBIS/PrüfId) |
| `SmartObjectCard` | `{ boTyp, gruppenSchluessel, header, children, detailFields }` | **Brücke**: Smart-Body + Disclosure „+ Alle Details" → 2-Spalten-Vollsicht |

### 6.2 Per-Objekt-Smart-Views (Konsens der drei Experten)
Kurzfassung; Detail-Reports liegen in der Brainstorming-Historie. Default zeigt 4–6 entscheidende Felder, Rest hinter „+ Alle Details".

- **MARKTLOKATION** (Hero): IdentityHeader (⚡ + MaLo-ID + „Standard"-Pill) · Badge-Reihe (Energierichtung als Pfeil, Bilanzierungsmethode, Netzebene, messtechn. Einordnung, Sperrstatus) · Body: Endkunde (`ContactLine`+`AddressBlock`), Marktrollen (`MarktpartnerRow`-Liste, aktiv→abgelaufen sortiert), Zählwerk (Mess-Chip OBIS/HT/Richtung/Einheit), Verbrauchsmenge (Wert+Einheit+Prognose-Badge), zugehörige MeLo (`CodeResolved`+`ValidityRange`). Rest (`netzbetreiberCodeNr`, `bilanzierungsgebiet`, Kataster/Geo, `eigentuemer`/`hausverwalter`, Abrechnungsdaten) → „+ Alle Details".
- **VERTRAG** (Netznutzungs-/Energieliefer): Header (Vertragsart + Sparte) · `ValidityRange` (Beginn–Ende, „endet bald"/„abgelaufen") · Konditions-Chips (Kündigungsfrist, Abrechnungsintervall) · Vertragspartner-Chip. Warnung bei `lokationsId`=Platzhalter.
- **STATUSBERICHT**: Ampel-Banner (`status` positiv/negativ) + `pruefgegenstand` + Prüfdatum; Fehlerblock nur bei Fehler.
- **GESCHAEFTSPARTNER** (Endkunde/Eigentümer/Hausverwalter/Vertragspartner): `IdentityHeader` mit Initialen-Avatar + Name-Merge + Rollen-Pills · `ContactLine` (Mail-Action + Kontaktweg-Icons, nur erlaubte aktiv) · `AddressBlock`. Privat/Gewerbe als Glyph. Identische Person/Adresse bündeln (Dedup).
- **MARKTTEILNEHMER** (Marktrolle/Absender/Empfänger): `MarktpartnerRow` mit Rollen-Tag, Code→Name, MSB-Eigenschaft, `ValidityRange`. Absender→Empfänger als „Von → An"-Fluss in der Prozess-Kopfzeile.
- **ZAEHLWERK**: Mess-Chip (Bezeichnung HT/NT · OBIS+Klartext · Richtung · Einheit · Stellen) + Verwendungszweck-Chips.
- **ADRESSE**: `AddressBlock`; Lokations-/Partneradresse dedup („identisch").
- **zugehörige MESSLOKATION**: `CodeResolved`(MeLo-ID, mittig gekürzt) + Arithmetik-Operator + `ValidityRange`.
- **VERBRAUCHSMENGE**: großer Wert + Einheit + Zeitraum + Messwertstatus-Badge (PROGNOSE=kritisch/geschätzt, ABGELESEN=positiv).
- **Gültigkeitszeitraum / marktlokationsTyp**: Querschnitts-`ValidityRange` bzw. Typ-Pill im Header.
- **TRANSAKTIONSDATEN**: Prozess-Kopfzeile (Absender→Empfänger aufgelöst, PrüfId/Grund/Kategorie/Sparte als Chips) — rahmt das Richtungs-Panel.
- **ZUSATZDATEN**: dezente EDI-Metazeile (ediTyp/Version, Marktpartner-Rolle, Empfangsdatum).

### 6.3 Auffälligkeiten-Leiste
Über den Tabs: aufklappbare Leiste mit den Treffern aus `scanAnomalies` (Platzhalter, Defaults, Mojibake, abgelaufene Zuordnungen). Jeder Eintrag verlinkt auf Objekt/Pfad.

### 6.4 Querschnitts-Prinzipien (Konsens)
1. Codes/Enums nie nackt — Icon + Klartext; roher Wert nur im Popover.
2. Code→Name überall, wo eine BDEW-Codenummer steht.
3. Gültigkeit/Stichtag durchgängig als `ValidityRange` mit Ampel.
4. Datenqualität sichtbar machen (Leiste + Inline-Marker).
5. Personen/Adressen verdichten und Duplikate bündeln.
6. Progressive Disclosure strikt (4–6 Felder default, Technik hinter „+").
7. Gruppenschlüssel ≠ boTyp respektieren.
8. Töne sparsam (kein Badge für neutrale/`false`-Werte).
9. Datumsanzeige immer Europe/Berlin; UTC im Popover.

---

## 7. Schicht 2 — SydocView / StammdatenTabs

- `<SydocView doc resolvers now>` rendert pro Richtung (`INBOUND`/`OUTBOUND`, Umschalter) eine `ObjectPage` im **`iconTabBar`-Mode**: je ein Tab pro Stammdaten-Gruppe (Label = Gruppenschlüssel, Badge = Anzahl) plus Tabs „Transaktionsdaten" und „Zusatzdaten".
- Normalizer akzeptiert: einzelnes BOE · `Bo4eObject[]` · volles `CDoc`.
- Komponiert `SmartObjectCard` je Objekt (Schicht 1).

---

## 8. Editor & weitere Slices (nur Schnittstellen in Milestone 1)

Die Bausteine bekommen saubere Props-Grenzen, damit Edit (4), Raw/Diagramm (5) und Graph (3) ohne Umbau andocken:
- Edit: `SchemaField` rendert im Edit-Modus Inputs/Selects; `EnumIcon`/`EnumBadge` werden zu Dropdowns; **Datums-/Zeitfelder → `DatePicker`/`TimeField`** (de-DE, Rückrechnung nach ISO-UTC); „+ Feld hinzufügen" ergänzt im Schema vorhandene, noch nicht gesetzte Felder.
- Raw/JSON: faltbarer todiagram-artiger Knotenbaum (echte Graph-Engine).
- Graph: MaLo→MeLo→Geräte (React Flow), nutzt eine BO4E-Beziehungs-Map.

---

## 9. Icon-Set-Erweiterung
`packages/ui/src/icons/icons.tsx` um benötigte Namen ergänzen (lucide-/Tabler-Stil, `currentColor`): u. a. `phone`, `clock`, `lock`/`lock-open`, `gauge`, `link`, `arrow-right`, `arrow-down-right`/`arrow-up-right`, `droplet`, `file-text`, `file-code`, `map-pin`, `alert-triangle`, `trending-up`. Ein Enum-Wert → genau ein Icon (Single Source `EnumIcon`). **Keine Emoji.**

---

## 10. Tests
- **Schicht 0 (Unit, ohne DOM):** `resolveField`, `getFieldOrder`, `normalizeToCDoc` (3 Eingabeformen), `validityStatus` (inkl. Grenzfälle/Stichtag), `scanAnomalies` (jede Regel), `formatDateDE`/`toUtcLabel` (DST-Wechsel: Mai=MESZ, Dez=MEZ; Tagesgrenze `2022-12-31T23:00Z`→`01.01.2023`).
- **Schicht 1 (Smoke/RTL):** Smart-View rendert entscheidende Felder; Popover öffnet; Enum→Icon/Badge; `MarktpartnerRow` löst Code→Name via injiziertem Resolver; abgelaufene Gültigkeit wird gedimmt; „+ Alle Details" zeigt Vollsicht; Datums-Popover zeigt Berlin + UTC.
- **Schicht 2:** Tabs aus Gruppenschlüsseln; Richtungs-Umschalter; Normalizer-Pfade.

## 11. Storybook
Stories für `SchemaField`, `MarktpartnerRow`, `AddressBlock`, `ContactLine`, `ValidityRange`, `SmartObjectCard`, `SydocView` mit dem cDoc-Fixture. Theme-Toolbar deckt Light/Dark/Cu ab. Eine Story mit absichtlich „kaputtem" Datensatz zeigt die Auffälligkeiten-Leiste.

## 12. Bewusst außerhalb Milestone 1
Edit-Mode (4), Raw/JSON-Diagramm (5), Beziehungsgraph (3), echte BDEW-/OBIS-/PrüfId-Resolver (kommen vom Consumer), Monaco/ajv-IntelliSense.

## 13. Offene Punkte / Datenabhängigkeiten
- **Resolver-Bezug:** BDEW-Codenummern-, OBIS-, Prüfidentifikator-Auflösung wird vom Consumer (finops) injiziert; Paket liefert nur Interface + Fallback.
- **Stichtag:** Default = „heute"; ob ein expliziter Stichtag-Umschalter in die View gehört, ist offen (Vorschlag: erst bei Bedarf).
- **Cross-Object-Checks** (z. B. `endezumtermin` ↔ `vertragsende`, OBIS Zählwerk ↔ Verbrauchsmenge, INBOUND ↔ OUTBOUND) sind in Slice 6 angesiedelt, nicht Milestone 1.
