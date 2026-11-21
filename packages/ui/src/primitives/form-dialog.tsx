import { useCallback, useState, type ReactNode } from "react";
import { Button } from "./forms";
import { TextArea } from "./textarea";
import { Modal, type ModalSize, type ModalTone } from "./overlays";
import { Notice } from "../composites/composites";
import "./form-dialog.css";

/* ---------------- FormDialog ----------------
 * Formular im Modal mit Laufzustand (Parität zu einem UI5-Dialog mit Formular und Senden):
 *  · Fußzeile: „Abbrechen“ links, die Hauptaktion rechts (gefüllt; rot nur bei Rücknahme mit `destructive`), davor optional `extraActions`.
 *  · Während `isBusy`: weder Esc noch Klick daneben schließen, beide Knöpfe sind gesperrt, die Hauptaktion zeigt `busyLabel` und `data-busy`.
 *  · `error`: Fehler des Servers bleibt im Dialog (Notice, role=alert) unter dem Inhalt.
 *  · `disabledReason`: warum die Hauptaktion gesperrt ist – steht links in der Fußzeile (nie nur im Tooltip).
 * Prüfen beim Absenden ist Sache der Seite: `onSubmit` prüft und sendet; der Dialog bleibt offen, bis die Seite ihn schließt (`isOpen`). */

export interface FormDialogProps {
  isOpen?: boolean;
  /** Schließen über Esc, Klick daneben oder „Abbrechen“ (nicht während `isBusy`). */
  onClose: () => void;
  /** Hauptaktion; die Seite prüft und sendet. */
  onSubmit: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  tone?: ModalTone;
  size?: ModalSize;
  /** Text der Hauptaktion. */
  submitLabel: ReactNode;
  /** Text der Hauptaktion, solange `isBusy` (Default `submitLabel`). */
  busyLabel?: ReactNode;
  /** Default „Abbrechen“. */
  cancelLabel?: ReactNode;
  /** Rücknahme (ablehnen, stoppen, verwerfen): Hauptaktion rot. */
  destructive?: boolean;
  /** Hauptaktion gesperrt – nur wenn sie grundsätzlich nicht geht; Eingabefehler zeigt das Feld nach dem Absenden. */
  isSubmitDisabled?: boolean;
  /** Grund für die Sperre, links in der Fußzeile. */
  disabledReason?: ReactNode;
  /** Eine Aktion läuft: Dialog bleibt offen, Knöpfe gesperrt. */
  isBusy?: boolean;
  /** Fehler des Servers (bleibt im Dialog). */
  error?: ReactNode;
  /** Weitere Knöpfe links neben „Abbrechen“ (z. B. „Prüfen“). */
  extraActions?: ReactNode;
  /** Links in der Fußzeile (Fortschritt, Hinweis); ersetzt `disabledReason`. */
  footerStart?: ReactNode;
  children?: ReactNode;
  "data-testid"?: string;
  submitTestId?: string;
  cancelTestId?: string;
  /** testid der Fehlerfläche (Default `<data-testid>-fehler`). */
  errorTestId?: string;
  /** testid des Sperrgrunds (Default `<data-testid>-sperrgrund`). */
  disabledReasonTestId?: string;
  className?: string;
}

export function FormDialog({
  isOpen = true, onClose, onSubmit, title, subtitle, tone, size = "m", submitLabel, busyLabel, cancelLabel = "Abbrechen", destructive, isSubmitDisabled, disabledReason,
  isBusy = false, error, extraActions, footerStart, children, "data-testid": testId, submitTestId, cancelTestId, errorTestId, disabledReasonTestId, className,
}: FormDialogProps) {
  const grund = footerStart ?? (isSubmitDisabled && disabledReason != null
    ? <span className="prn-form-dialog-reason" data-testid={disabledReasonTestId ?? (testId ? `${testId}-sperrgrund` : undefined)}>{disabledReason}</span>
    : undefined);
  return (
    <Modal isOpen={isOpen} onOpenChange={(offen) => { if (!offen && !isBusy) onClose(); }} title={title} subtitle={subtitle} tone={tone ?? (destructive ? "negative" : undefined)} size={size}
      isDismissable={!isBusy} isKeyboardDismissDisabled={isBusy} data-testid={testId} className={className} footerStart={grund}
      footer={<>
        {extraActions}
        <Button variant="plain" isDisabled={isBusy} onPress={onClose} data-testid={cancelTestId}>{cancelLabel}</Button>
        <Button variant="filled" destructive={destructive} isDisabled={isBusy || isSubmitDisabled} onPress={onSubmit} data-testid={submitTestId} data-busy={isBusy || undefined}>
          {isBusy ? busyLabel ?? submitLabel : submitLabel}
        </Button>
      </>}>
      <div className="prn-form-dialog-body">
        {children}
        {error != null && error !== false && error !== "" ? (
          <Notice tone="negative" role="alert" data-testid={errorTestId ?? (testId ? `${testId}-fehler` : undefined)}>{error}</Notice>
        ) : null}
      </div>
    </Modal>
  );
}

/* ---------------- useSubmitState ----------------
 * Laufzustand eines sendenden Dialogs: `submit(f)` setzt `isBusy`, fängt einen Fehler als Text (`error`) und liefert true, wenn f ohne Fehler endete.
 * `attempted` merkt den ersten Versuch (Felder zeigen ihre Fehler erst danach). */

export function useSubmitState(errorText: (e: unknown) => string = (e) => String((e as Error)?.message ?? e)) {
  const [isBusy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const submit = useCallback(async (f: () => Promise<unknown>) => {
    setBusy(true); setError(null);
    try { await f(); return true; } catch (e) { setError(errorText(e)); return false; } finally { setBusy(false); }
  }, [errorText]);
  return { isBusy, error, setError, attempted, setAttempted, submit };
}

/* ---------------- ReasonField ----------------
 * Begründung (Vier-Augen, Rücknahme, Freigabe): Pflicht mit Mindestlänge (Default 5), Zähler bis `maxLength`, Fehler erst nach dem Absenden (`showError`).
 * Ohne `isRequired` darf das Feld leer bleiben; ein angefangener Text muss die Mindestlänge haben. */

export interface ReasonFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Mindestlänge ohne Leerzeichen am Rand (Default 5). */
  minLength?: number;
  /** Default 500. */
  maxLength?: number;
  /** Default true. */
  isRequired?: boolean;
  /** Fehler zeigen (nach dem ersten Absenden). */
  showError?: boolean;
  /** Default „Begründung“. */
  label?: ReactNode;
  /** Hinweis unter dem Feld, solange kein Fehler steht (Default: `tooShort(minLength)`). */
  description?: ReactNode;
  /** Text für „zu kurz“ (Default „Mindestens n Zeichen“). */
  tooShort?: (min: number) => string;
  isDisabled?: boolean;
  rows?: number;
  maxRows?: number;
  "data-testid"?: string;
  className?: string;
}

/** true, wenn die Begründung die Mindestlänge erfüllt (ohne `isRequired`: leer ist auch gültig). */
export function reasonValid(value: string, minLength = 5, isRequired = true) {
  const n = value.trim().length;
  return isRequired ? n >= minLength : n === 0 || n >= minLength;
}

const ZU_KURZ = (min: number) => `Mindestens ${min} Zeichen`;

export function ReasonField({
  value, onChange, minLength = 5, maxLength = 500, isRequired = true, showError, label = "Begründung", description, tooShort = ZU_KURZ, isDisabled, rows = 3, maxRows = 8,
  "data-testid": testId, className,
}: ReasonFieldProps) {
  const fehler = showError && !reasonValid(value, minLength, isRequired) ? tooShort(minLength) : undefined;
  return (
    <TextArea label={label} isRequired={isRequired} value={value} onChange={onChange} rows={rows} maxRows={maxRows} maxLength={maxLength} showCount isDisabled={isDisabled}
      description={fehler ? undefined : description ?? tooShort(minLength)} isInvalid={!!fehler} errorMessage={fehler} data-testid={testId} className={className} />
  );
}
