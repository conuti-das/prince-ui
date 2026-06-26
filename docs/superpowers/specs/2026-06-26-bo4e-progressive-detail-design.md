# BO4E Viewer — Progressive-Detail-Umschalter (v2)

**Datum:** 2026-06-26
**Paket:** `packages/bo4e`
**Status:** Entwurf v2 — nach Validierung durch zwei UI-Agenten überarbeitet

## Problem / Ziel

Der heutige `CDocView` zeigt pro BO-Objekt eine kompakte Karte (Header + ~6
skalare Felder) mit *pro Karte* lokalem „+ Alle Details"/„Bearbeiten". Lücken:

1. **Kein globaler Schalter** — jede Karte klappt einzeln auf.
2. **Nur Skalare sichtbar** — `isScalarish` filtert verschachtelte Objekte
   (`partneradresse`) und Objekt-Arrays (`kontaktweg`, `marktlokationsTyp`) auf
   *jeder* Ebene weg.
3. **Schema kennt keine Struktur** — `bo4e-fields.json` trägt pro Feld nur
   `translation/description/example/pattern/enumRef`, kein `$ref`/`items`/`type`.

## Verifizierte Fakten (vor Designentscheidungen geprüft)

- **Primitives existieren bereits** und werden wiederverwendet:
  `SegmentedControl`/`Segment` (`packages/ui/src/primitives/navigation.tsx`),
  `Disclosure`/`DisclosureGroup` (`packages/ui/src/primitives/disclosure.tsx`,
  React-Aria, liefert `aria-expanded`/Labelling).
- **`bo4e-bos.json` `properties` ist nachweislich veraltet/falsch.** Für
  MARKTLOKATION sind 9 von 11 `properties` nicht in den echten Daten, **5 nicht
  einmal im Feld-Dict** (`adresse`, `kundengruppe`, `lieferrichtung`,
  `zaehlverfahren`, `zugeordneteMesslokationen`). `getFieldOrder` darf daher
  **nicht** blind auf `properties` für die Ghost-/Kandidatenliste setzen.
- **Daten verschachteln tief** (`marktrollen[]`, `partneradresse{}`,
  `marktlokationsTyp[obj]`) und enthalten viele **all-null Sub-Objekte**.

## Zielbild: zwei orthogonale Achsen (nicht ein 4-stufiger Linear-Schalter)

Beide Validierungs-Agenten widersprachen dem Linear-Modell: „wie viel zeige ich"
(Dichte) und „kann ich mutieren" (Edit) sind unabhängig. Ein Sachbearbeiter, der
in Stufe 2 *einen* falschen Wert sieht, soll nicht global in einen Anlege-Modus
springen müssen, der jede Karte mit leeren Ghosts flutet. Daher:

**Achse A — Dichte (`SegmentedControl`, global, oben in `CDocView`):**

| Stufe | Name | Zeigt |
|---|---|---|
| 1 | **Fachlich** (default) | Kompakte Karte: Header + wichtigste Skalare. = heute. |
| 2 | **Gefüllt** | Alle *tief-gefüllten* Elemente rekursiv & strukturiert — inkl. verschachtelter Objekte und Objekt-Arrays. All-null/leere Sub-Objekte werden **geprunt**. |
| 3 | **Alle Felder** | Zusätzlich jedes laut Feld-Dict mögliche, aber leere **Skalar**-Feld als Ghost. |

**Achse B — `Bearbeiten` (`Switch`/Toggle, global, aktiv ab Stufe ≥ 2):**
Orthogonal. Macht sichtbare Skalare editierbar, Ghosts anlegbar; auf Stufe 2 oder
3 nutzbar. Man editiert nur, was sichtbar ist → Toggle ist bei Stufe 1 disabled.

Das vom Nutzer gewünschte „oben umschalten → aufklappen → wieder umschalten →
bearbeiten" wird so vollständig abgebildet (Segmented-Control = die eskalierende
Hauptumschaltung, Bearbeiten = der separate Schalter), aber ohne die zwei Achsen
zu verschmelzen.

## Architektur

### State (in `CDocView`, single source of truth)

```ts
type Density = "fachlich" | "gefuellt" | "alle";
const [density, setDensity] = useState<Density>(defaultDensity ?? "fachlich");
const [editMode, setEditMode] = useState(false); // erzwungen false bei density==="fachlich"
```

- `density` + `editMode` werden an jede Karte gereicht.
- **`editMode` wird bei „fachlich" nur maskiert, nicht zurückgesetzt:** beim
  Wechsel fachlich→gefuellt lebt der vorherige `editMode`-Wert wieder auf, und
  der **Edit-Draft überlebt** einen Dichte-Bounce (fachlich↔gefuellt↔alle).
  Dichte ändert nie den Draft.
- **Per-Karten-Override:** nur **Einklappen unter** den globalen Level (eine
  einzelne Karte zuklappen). Anheben des globalen Levels **resettet** Overrides.
- **Nur Direction-/Tab-Wechsel** (`setTab(null)`) resettet Override, Edit-Draft
  **und** `editMode` — das ist der einzige Reset-Punkt.

### Rekursiver Renderer `NestedValue` (neu) — ersetzt das `isScalarish`-Filtern

Props: `{ schema, boTyp, fieldKey, value, density, editable, path, depth }`.

- **Dispatch ist 3-stufig und deep-empty-first** (nicht `isScalarish`-first —
  `isScalarish` liefert `true` für `null` *und* `[]`, würde also leere Container
  als "—"-Skalare durchrutschen lassen → Null-Sumpf auf dem Skalar-Pfad):
  1. **`isDeepEmpty(value)`** (deckt `null`, `[]`, `{}`, all-null-Bäume ab):
     - `density==="gefuellt"` → **prunen** (nicht rendern).
     - `density==="alle"` ohne Edit → als **Ghost** (leeres Skalar bzw. „leeres
       Array/Objekt").
     - `density==="alle"` + Edit → **anlegbar** (Skalar editierbar; Array „+
       Eintrag" *nur* mit `Bo4eStructure`; siehe unten).
  2. sonst **`isScalarish(value)`** → **Skalar** (`SchemaField` +
     `displayValue`/`EditableValue`).
  3. sonst **Container**:
     - **Objekt** → eigener **Full-Width-Block** (Disclosure), *außerhalb* der
       `.prn-bo-kv .v`-Zelle (die ist `nowrap/ellipsis` — würde Sub-Grids
       abschneiden). Rekursion über die Keys.
     - **Objekt-Array** → `DisclosureGroup` aus Sub-Karten, rekursiv.
  So ist Stufe-2 „nur tief-gefüllt" deterministisch; `null`/`[]` landen nie als
  Streu-„—"-Zeilen.
- **`boTyp`-Kontextwechsel:** hat ein Sub-Objekt selbst `boTyp` (z. B.
  `endkunde` → GESCHAEFTSPARTNER), werden dessen Kinder gegen diesen Typ
  aufgelöst (Popover/Label bleiben erhalten). Untypisierte Sub-Objekte
  (`partneradresse`) → generisch über eigene Keys, ehrlicher „kein Schema"-Zustand.
- **`isDeepEmpty(value)`:** Prädikat — „leer" = rekursiv nur `null`/leere
  Container. **`false`/`0`/`""` sind GEFÜLLT** (Fixture: `unterbrechbar:false`,
  `kosten:0`) — niemals auf falsy erweitern. Bei `density==="gefuellt"` werden
  deep-empty Zweige **geprunt** (sonst Null-Sumpf, siehe Fixture
  `datenDerBeteiligtenMarktrolle`). **Memoisiert**: einmal pro Knoten im selben
  Lade-Walk wie das Array-ID-Seeding berechnen (WeakMap), nicht pro Render
  re-walken (sonst ~O(n²) auf der MALO).
- **Tiefenlimit `MAX_DEPTH = 5`, zählt Objekt-/Array-Verschachtelungsebenen**
  (nicht Key-Hops, nicht skalare Blätter). Echte MALOs gehen real ~4 tief
  (`datenDerBeteiligtenMarktrolle[] → zaehlwerke[] → verwendungszwecke[] →
  zweck[]`); **diese sollen voll rendern**. Das Limit ist reiner Schutz gegen
  zyklische/pathologische Dokumente — erst *jenseits* echter Daten greift „… (N
  weitere Ebenen)". Die deepste *gefüllte* Branch der Fixture muss bei „gefuellt"
  vollständig sichtbar sein (Test).
- **Stabile Array-Keys:** synthetische IDs werden **einmalig beim Laden über den
  *vollständigen* Baum** geseedet (WeakMap auf den Item-Objekten), **vor** jedem
  density-abhängigen Prunen — Prunen/Umschalten re-seedet nie. So verrutscht
  Edit-State (Achse B) weder beim Hinzufügen/Löschen noch beim Dichte-Wechsel.
  Skalar-Arrays → Index-Key ok.
- **Lazy children:** Disclosure-Inhalt erst beim Öffnen rendern (Perf: sonst
  hunderte React-Aria-Inputs/Popover gleichzeitig).

### Ghost-Felder (Dichte „Alle Felder") — nur Skalare, nur dokumentierte

- Quelle = **Feld-Dict** (`schema.fields[boTyp]`), nicht `bos.properties`.
  Reihenfolge: `properties ∩ field-dict`, dann übrige Dict-Keys. So hat **jeder
  Ghost eine Doku** und es werden keine fiktiven Felder angeboten.
- Nur skalare Ghosts. **Keine generische Komponenten-/Array-Erzeugung** (siehe
  unten).

### Schema-Struktur-Blocker — Entscheidung

**Generisches „leeres Objekt anlegen" wird gestrichen** (v1). Begründung der
Agenten: Ohne Sub-Feld-Schema entsteht ein frei befüllbares Objekt, in das der
Sachbearbeiter falsche Wire-Keys tippt (`"PLZ"` statt `"postleitzahl"`) → still
ungültiges BO4E. Schlimmer als kein Feature.

- **Verschachteltes Anlegen ist strikt an eine optionale `Bo4eStructure`-Map
  gebunden.** Fehlt sie → **kein** Anlege-Button (Degradation zu *abwesend*, nicht
  zu frei-Form).
  ```ts
  type Bo4eStructure = Record<string /*boTyp*/, Record<string /*field*/,
    { kind: "scalar" | "object" | "array"; ref?: string /*ziel-boTyp*/ }>>;
  ```
  Eingehängt in `Bo4eSchema` (optionales Feld), plus `resolveFieldStructure(
  schema, boTyp, key)` neben `resolveField` in `load-schema.ts`.
- **Daten-Sample-Inferenz** als Fallback wird **gestrichen** (unzuverlässig, YAGNI).

### Custom-Renderer MARKTLOKATION

`SmartObjectView` routet MARKTLOKATION auf `MarktlokationHeader`/`MarktlokationBody`
— genau das BO mit der meisten Verschachtelung. `density`/`editable` werden
durchgereicht; der Body nutzt für seine rekursiven Teile `NestedValue`. Header
bleibt fachlich konstant über alle Stufen.

### Draft-Modell (Achse B)

- **Ein** path-gekeyter Draft-Baum pro Karte (Wurzel im Karten-Container,
  seed aus `obj`). Immutable Update-by-Path (`setIn(draft, path, value)`),
  damit `partneradresse.ort` oder `marktrollen[2].marktrolle` gezielt geändert
  werden. Kein verteilter State pro Sub-Komponente.
- **Löschen** ist Teil von Achse B: gefülltes Skalar → leeren; Array-Item →
  entfernen; angelegte Komponente → entfernen. Definiert als Draft-Mutation.
- Persistenz/Speichern bleibt Nicht-Ziel (lokaler Draft wie heute).

## Komponenten-Inventar (Dateien)

- `CDocView.tsx` — Lifted State + `SegmentedControl` + `Bearbeiten`-Switch.
- `view/NestedValue.tsx` *(neu)* — rekursiver Dispatcher.
- `view/FullDetail.tsx` — entkernt: delegiert Body an `NestedValue`; Ghost-/
  Kandidatenlogik in `useGhostFields(schema, boTyp, obj)` ausgelagert.
- `view/SmartObjectCard.tsx` — vom `density`/`editable`-Prop getrieben, lokaler
  Collapse-Override.
- `schema/load-schema.ts` — `structure?`, `resolveFieldStructure`, korrigierte
  `getFieldOrder`-Nutzung für Ghosts.
- `core/` — `isDeepEmpty`, `setIn`/path-utils, Array-ID-Seeding.
- `view/renderers/marktlokation.tsx` — `density`/`editable` durchreichen.

## Nicht-Ziele (YAGNI)

- Persistenz/Speichern editierter cDocs.
- Schema-Extraktion neu generieren (nur die optionale Plugin-Schnittstelle).
- Generische Komponentenerzeugung ohne `Bo4eStructure`.
- Daten-Sample-Inferenz von Sub-Objekt-Formen.

## Tests

- `isDeepEmpty`: `null`, `[]`, `{}`, all-null-Baum, tief-gefüllt; **`{unterbrechbar:false}`
  und `{kosten:0}` sind NICHT deep-empty** (falsy-Falle).
- `NestedValue`-Dispatch: `null`/`[]` werden bei „gefuellt" geprunt (keine
  „—"-Streuzeilen), bei „alle"+Edit als anlegbar; Skalar / Objekt / Objekt-Array
  / gemischtes Array / boTyp-Kontextwechsel; deepste *gefüllte* Fixture-Branch
  (~4 Ebenen) rendert vollständig bei „gefuellt".
- `useGhostFields`: Ghosts nur aus Feld-Dict, nie aus reinen `properties`.
- `CDocView`: Dichte-Umschaltung rendert erwartete Felder/Ghosts; `Bearbeiten`
  disabled bei „fachlich".
- Achse B: Skalar editieren, Array-Item add/remove (Keys verrutschen nicht —
  inkl. Dichte-Wechsel zwischendurch), Edit-Draft überlebt Dichte-Bounce,
  Komponente nur mit `Bo4eStructure` anlegbar.
- Bestehende Tests (`FullDetail`, `SmartObjectView`, `CDocView`) angepasst/grün.
