import { useEffect, useState, type ReactNode } from "react";
import { Button, Select, SelectItem } from "./forms";
import { TextArea } from "./textarea";
import { Modal, type ModalTone } from "./overlays";
import { Link } from "./breadcrumbs";
import { cx } from "../utils";
import "./decision-dialog.css";

/* ---------------- DecisionDialog: eine Entscheidung im Pop-up ----------------
 * Regelwerk, Abschnitt „Bearbeiten im Pop-up“ (entschieden 19.11.2026): Klärfälle und Störungen dort bearbeiten, wo man sie sieht, ohne Seitenwechsel.
 * Aufbau: Titel · Hinweistext · eine klare Frage mit den Antworten als Auswahlliste (Hinweis je Option; nie Freitext) · freiwillige Begründung ·
 * Fußzeile: links die Sprünge als Links mit „›“ („Zum Klärfall ›“, „Zum Vorgang ›“), rechts Abbrechen und die eine primäre Aktion.
 * Die primäre Aktion ist erst mit gewählter Antwort möglich. Gibt `onConfirm` ein Promise zurück, wartet der Dialog (Knöpfe gesperrt) und schließt bei Erfolg;
 * bei einem Fehler bleibt er offen (Fehlertext über `errorMessage`).
 */

export interface DecisionOption {
  id: string;
  label: string;
  /** Hinweis zur Antwort: was sie auslöst (zweite Zeile in der Liste, unter dem Feld für die gewählte Antwort). */
  hint?: ReactNode;
  "data-testid"?: string;
}

export interface DecisionLink {
  label: string;
  href: string;
  "data-testid"?: string;
}

export interface DecisionResult {
  option: string;
  reason: string;
}

export interface DecisionDialogProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Zustand am Titel (Zeichen und Farbe), z. B. `critical` für einen Klärfall. */
  tone?: ModalTone;
  /** Hinweistext über der Frage (Lage, was gerade fehlt). */
  notice?: ReactNode;
  /** Die eine Frage – zugleich Beschriftung der Auswahlliste. */
  question: string;
  options: DecisionOption[];
  placeholder?: string;
  defaultOption?: string;
  /** Beschriftung der Begründung. Default „Begründung (freiwillig)“. */
  reasonLabel?: string;
  /** Hinweis unter der Begründung. */
  reasonDescription?: ReactNode;
  /** Begründung Pflicht (Regel offen, Default freiwillig); dann mindestens `reasonMinLength` Zeichen. */
  reasonRequired?: boolean;
  reasonMinLength?: number;
  reasonMaxLength?: number;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: (r: DecisionResult) => void | Promise<unknown>;
  onCancel?: () => void;
  /** Sprünge zur Detailseite (Links mit „›“) in der Fußzeile links. */
  links?: DecisionLink[];
  /** Name der Link-Zeile für Vorleseprogramme. Default „Springen“. */
  linksLabel?: string;
  /** Text bei zu kurzer Pflicht-Begründung. Default „Mindestens {n} Zeichen“. */
  reasonTooShort?: (min: number) => string;
  /** Fehler vom Server (Dialog bleibt offen). */
  errorMessage?: ReactNode;
  /** Wartet von außen (z. B. Mutation läuft). */
  isPending?: boolean;
  size?: "s" | "m" | "l";
  "data-testid"?: string;
  selectTestId?: string;
  reasonTestId?: string;
  confirmTestId?: string;
  cancelTestId?: string;
}

export function DecisionDialog({
  isOpen, onOpenChange, title, subtitle, tone, notice, question, options, placeholder = "Bitte wählen", defaultOption,
  reasonLabel = "Begründung (freiwillig)", reasonDescription, reasonRequired = false, reasonMinLength = 5, reasonMaxLength = 500,
  confirmLabel, cancelLabel = "Abbrechen", onConfirm, onCancel, links, linksLabel = "Springen", reasonTooShort = (n) => `Mindestens ${n} Zeichen`, errorMessage, isPending, size = "m",
  "data-testid": testId, selectTestId, reasonTestId, confirmTestId, cancelTestId,
}: DecisionDialogProps) {
  const [option, setOption] = useState<string | null>(defaultOption ?? null);
  const [reason, setReason] = useState("");
  const [wartet, setWartet] = useState(false);
  // beim Öffnen zurücksetzen (derselbe Dialog für den nächsten Fall)
  useEffect(() => { if (isOpen) { setOption(defaultOption ?? null); setReason(""); setWartet(false); } }, [isOpen, defaultOption]);

  const gewaehlt = options.find((o) => o.id === option) ?? null;
  const reasonZuKurz = reasonRequired && reason.trim().length < reasonMinLength;
  const gesperrt = isPending || wartet;
  const bereit = !!gewaehlt && !reasonZuKurz && !gesperrt;

  const bestaetigen = async (close: () => void) => {
    if (!gewaehlt || reasonZuKurz) return;
    const r = onConfirm({ option: gewaehlt.id, reason: reason.trim() });
    if (r && typeof (r as Promise<unknown>).then === "function") {
      setWartet(true);
      try { await r; close(); } catch { /* bleibt offen; Fehler zeigt errorMessage */ } finally { setWartet(false); }
    } else close();
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} title={title} subtitle={subtitle} tone={tone} size={size} isDismissable={!gesperrt}
      isKeyboardDismissDisabled={gesperrt} data-testid={testId} className="prn-decision"
      footerStart={links && links.length > 0 ? (
        <nav className="prn-decision-links" aria-label={linksLabel}>
          {links.map((l) => <Link key={l.href} href={l.href} arrow data-testid={l["data-testid"]}>{l.label}</Link>)}
        </nav>
      ) : undefined}
      footer={({ close }) => (
        <>
          <Button variant="plain" isDisabled={gesperrt} onPress={() => { onCancel?.(); close(); }} data-testid={cancelTestId}>{cancelLabel}</Button>
          <Button variant="filled" isDisabled={!bereit} onPress={() => void bestaetigen(close)} data-testid={confirmTestId} aria-busy={gesperrt || undefined}>{confirmLabel}</Button>
        </>
      )}>
      <div className={cx("prn-decision-body")}>
        {notice && <div className="prn-decision-notice" role="note">{notice}</div>}
        <Select label={question} placeholder={placeholder} selectedKey={option} isDisabled={gesperrt} isRequired
          onSelectionChange={(k) => setOption(k == null ? null : String(k))} description={gewaehlt?.hint} data-testid={selectTestId}>
          {options.map((o) => (
            <SelectItem key={o.id} id={o.id} textValue={o.label} description={o.hint} data-testid={o["data-testid"]}>{o.label}</SelectItem>
          ))}
        </Select>
        <TextArea label={reasonLabel} description={reasonDescription} value={reason} onChange={setReason} rows={2} maxRows={6}
          maxLength={reasonMaxLength} showCount isRequired={reasonRequired} isDisabled={gesperrt} data-testid={reasonTestId}
          isInvalid={reasonRequired && reason.length > 0 && reasonZuKurz} errorMessage={reasonZuKurz ? reasonTooShort(reasonMinLength) : undefined} />
        {errorMessage && <div className="prn-decision-error" role="alert">{errorMessage}</div>}
      </div>
    </Modal>
  );
}
