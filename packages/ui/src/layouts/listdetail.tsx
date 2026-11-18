import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "../primitives/forms";
import { Icon } from "../icons/icons";
import { cx } from "../utils";
import "./listdetail.css";

/* ---------------- ListDetailLayout ----------------
 * Liste mit Detail (Parität zum FlexibleColumnLayout für zwei Spalten):
 *  - ohne Detail: nur die Liste
 *  - mit Detail: Liste | Detail nebeneinander; `fullscreen` zeigt nur das Detail
 *  - Telefon (≤767 px): Liste und Detail nacheinander (das Detail ersetzt die Liste)
 * Tastatur: Öffnet sich das Detail, geht der Fokus auf seine Überschrift (`[data-detail-focus]`, sonst h1–h3);
 * Esc schließt es (`onClose`), danach kehrt der Fokus zum vorher fokussierten Element (z. B. der Zeile) zurück.
 * Esc gilt nicht, solange ein Overlay offen ist oder ein Eingabefeld außerhalb des Details den Fokus hat. */

export interface ListDetailLayoutLabels {
  /** aria-label der Liste. Default „Liste“. */
  list?: string;
  /** aria-label der Detailspalte. Default „Detail“. */
  detail?: string;
}

export interface ListDetailLayoutProps {
  /** Inhalt der Listenspalte (Seite mit Filter und Tabelle). */
  list: ReactNode;
  /** Inhalt der Detailspalte; `null`/`undefined` = kein Detail offen. */
  detail?: ReactNode;
  /** Nur das Detail zeigen (Vollbild). */
  fullscreen?: boolean;
  /** Esc im offenen Detail. Ohne Handler schließt Esc nichts. */
  onClose?: () => void;
  /**
   * Weitere Selektoren für offene Overlays, solange Esc das Detail nicht schließen soll – etwa Dialoge einer anderen
   * Bibliothek, deren Rolle im Shadow DOM liegt (z. B. `"ui5-dialog[open]"`). Dialoge, Menüs und Listboxen mit ARIA-Rolle
   * im DOM erkennt das Layout selbst.
   */
  overlaySelector?: string;
  /** Breiten der beiden Spalten als CSS-Grid-Werte. Default `["minmax(320px, 2fr)", "minmax(360px, 3fr)"]`. */
  columns?: [string, string];
  labels?: ListDetailLayoutLabels;
  className?: string;
  "data-testid"?: string;
}

const OVERLAY = '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]';
const EINGABE = /^(INPUT|TEXTAREA|SELECT)$/;

export function ListDetailLayout({ list, detail, fullscreen = false, onClose, overlaySelector, columns, labels, className, "data-testid": testId }: ListDetailLayoutProps) {
  const offen = detail != null && detail !== false;
  const spalte = useRef<HTMLDivElement>(null);
  const vorher = useRef<HTMLElement | null>(null);
  const war = useRef(offen);
  const zu = useRef(onClose);
  zu.current = onClose;
  const overlay = useRef(overlaySelector);
  overlay.current = overlaySelector;

  // Fokus: beim Öffnen auf die Überschrift des Details, beim Schließen zurück
  useEffect(() => {
    const warOffen = war.current;
    war.current = offen;
    if (offen && !warOffen) {
      const a = document.activeElement;
      vorher.current = a instanceof HTMLElement && a !== document.body ? a : null;
      let n = 0;
      let timer = 0;
      const versuch = () => {
        const s = spalte.current;
        if (!s) return;
        if (document.activeElement && s.contains(document.activeElement)) return; // Benutzer war schneller
        const ziel = s.querySelector<HTMLElement>("[data-detail-focus]") ?? s.querySelector<HTMLElement>("h1, h2, h3");
        if (ziel) {
          // ein noch verborgenes Ziel nimmt den Fokus nicht an – dann später noch einmal
          if (!ziel.hasAttribute("tabindex")) ziel.tabIndex = -1;
          ziel.focus({ preventScroll: true });
          if (document.activeElement === ziel) return;
        }
        if (++n < 40) timer = window.setTimeout(versuch, 50);
      };
      timer = window.setTimeout(versuch, 0);
      return () => window.clearTimeout(timer);
    }
    if (!offen && warOffen) {
      const z = vorher.current;
      vorher.current = null;
      if (z?.isConnected) z.focus({ preventScroll: true });
    }
  }, [offen]);

  // Esc auf Dokumentebene, solange das Detail offen ist
  useEffect(() => {
    if (!offen) return;
    const taste = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || !zu.current) return;
      if (document.querySelector(overlay.current ? `${OVERLAY}, ${overlay.current}` : OVERLAY)) return;
      const ziel = e.target instanceof HTMLElement ? e.target : null;
      const imDetail = !!ziel && !!spalte.current?.contains(ziel);
      if (!imDetail && ziel && EINGABE.test(ziel.tagName)) return;
      e.preventDefault();
      zu.current();
    };
    document.addEventListener("keydown", taste);
    return () => document.removeEventListener("keydown", taste);
  }, [offen]);

  const layout = !offen ? "list" : fullscreen ? "detail" : "split";
  const [lw, dw] = columns ?? ["minmax(320px, 2fr)", "minmax(360px, 3fr)"];
  return (
    <div
      className={cx("prn-listdetail", className)}
      data-layout={layout}
      data-testid={testId}
      style={{ ["--prn-listdetail-list" as string]: lw, ["--prn-listdetail-detail" as string]: dw }}
    >
      <section className="prn-listdetail-list" aria-label={labels?.list ?? "Liste"}>
        {list}
      </section>
      {offen && (
        <section ref={spalte} className="prn-listdetail-detail" aria-label={labels?.detail ?? "Detail"}>
          {detail}
        </section>
      )}
    </div>
  );
}

/* ---------------- DetailHeader ----------------
 * Kopf der Detailspalte: Titel (h2, Fokusziel beim Öffnen), Aktionen, Vollbild und Schließen. */

export interface DetailHeaderLabels {
  /** Default „Vollbild“. */
  fullscreen?: string;
  /** Default „Vollbild beenden“. */
  exitFullscreen?: string;
  /** Default „Schließen“. */
  close?: string;
}

export interface DetailHeaderProps {
  title: ReactNode;
  /** Zeile unter dem Titel (z. B. Kennung, Zustand). */
  subtitle?: ReactNode;
  /** Neben dem Titel, z. B. Badge mit Zustand. */
  titleContent?: ReactNode;
  /** Aktionen vor Vollbild und Schließen. */
  actions?: ReactNode;
  fullscreen?: boolean;
  /** Ohne Handler kein Vollbild-Knopf. */
  onFullscreenChange?: (fullscreen: boolean) => void;
  /** Ohne Handler kein Schließen-Knopf. */
  onClose?: () => void;
  /** Ebene der Überschrift. Default 2. */
  level?: 1 | 2 | 3;
  labels?: DetailHeaderLabels;
  fullscreenTestId?: string;
  closeTestId?: string;
  className?: string;
}

export function DetailHeader({ title, subtitle, titleContent, actions, fullscreen = false, onFullscreenChange, onClose, level = 2, labels, fullscreenTestId, closeTestId, className }: DetailHeaderProps) {
  const H = `h${level}` as "h1" | "h2" | "h3";
  const vollText = fullscreen ? labels?.exitFullscreen ?? "Vollbild beenden" : labels?.fullscreen ?? "Vollbild";
  return (
    <header className={cx("prn-detailheader", className)}>
      <div className="prn-detailheader-row">
        <div className="prn-detailheader-titles">
          <div className="prn-detailheader-titleline">
            <H className="prn-detailheader-title" data-detail-focus tabIndex={-1}>{title}</H>
            {titleContent}
          </div>
          {subtitle != null && <div className="prn-detailheader-subtitle">{subtitle}</div>}
        </div>
        <div className="prn-detailheader-actions">
          {actions}
          {onFullscreenChange && (
            <Button variant="plain" className="prn-detailheader-icon" aria-label={vollText} onPress={() => onFullscreenChange(!fullscreen)} data-testid={fullscreenTestId}>
              <Icon name={fullscreen ? "minimize" : "maximize"} size={18} />
            </Button>
          )}
          {onClose && (
            <Button variant="plain" className="prn-detailheader-icon" aria-label={labels?.close ?? "Schließen"} onPress={onClose} data-testid={closeTestId}>
              <Icon name="x" size={18} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
