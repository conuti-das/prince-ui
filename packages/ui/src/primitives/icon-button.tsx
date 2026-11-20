import type { ButtonProps as RACButtonProps } from "react-aria-components";
import { Button } from "./forms";
import { Tooltip } from "./overlays";
import { Icon, type IconName } from "../icons/icons";
import { useFieldSize, type FieldSize } from "./size";
import { cx } from "../utils";

/* ---------------- IconButton ----------------
 * Neutraler Icon-Knopf (grau, nie Leitfarbe) für Hilfsaktionen (aktualisieren, kopieren) und die Ansichtssteuerung
 * (Zoom, Einpassen, Info). Der Name für Vorleseprogramme ist Pflicht und ist zugleich der Text des Tooltips.
 * Auf dem Telefon (Touch oder < 600 px) ist die Trefferfläche mindestens 44 × 44 px; das Bild bleibt gleich groß.
 */
export interface IconButtonProps extends Omit<RACButtonProps, "className" | "children" | "aria-label" | "aria-labelledby"> {
  /** Icon aus dem prince-ui-Satz. */
  icon: IconName;
  /** Pflicht: Name für Vorleseprogramme (aria-label) und Text des Tooltips. Verb oder Gegenstand, z. B. „Aktualisieren“. */
  label: string;
  /** Abweichender Tooltip-Text (z. B. mit Tastenkürzel); `false` = kein Tooltip. Default: `label`. */
  tooltip?: string | false;
  /** Größe: s | m (Default) | l. Ohne Angabe greift der PrinceSizeProvider-Context. */
  size?: FieldSize;
  className?: string;
  "data-testid"?: string;
}

const ICON_GROESSE: Record<FieldSize, number> = { s: 16, m: 18, l: 20 };

export function IconButton({ icon, label, tooltip, size, className, ...props }: IconButtonProps) {
  const groesse = useFieldSize(size);
  const knopf = (
    <Button {...props} variant="plain" size={groesse} aria-label={label} className={cx("prn-iconbutton", className)}>
      <Icon name={icon} size={ICON_GROESSE[groesse]} />
    </Button>
  );
  if (tooltip === false) return knopf;
  return <Tooltip trigger={knopf}>{tooltip ?? label}</Tooltip>;
}
