import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../utils";
import "./data.css";
import "./objectpage.css";

/* =================================================================
 * ObjectPage — SAP-UI5-äquivalenter Floorplan
 *
 * Kanonisches Modell: Kompositions-API über <ObjectPageSection> /
 * <ObjectPageSubSection> als children. Das alte deklarative
 * `sections`-Array bleibt als Adapter erhalten (Rückwärtskompat.).
 * ================================================================= */

/* ---------------- Status-Badge (eigenständig) ---------------- */

export type StatusTone = "positive" | "critical" | "negative" | "info" | "neutral";

export interface StatusBadge {
  label: ReactNode;
  tone?: StatusTone;
}

/* ---------------- KPI ---------------- */

export interface ObjectPageKpi {
  label: ReactNode;
  value: ReactNode;
  /** Färbt den Wert (z. B. positive/negative Kennzahl). */
  tone?: "positive" | "critical" | "negative";
}

/* ---------------- Feld / Sektion (Legacy-Adapter) ---------------- */

export interface ObjectField {
  label: ReactNode;
  value: ReactNode;
  /** Zahl-Wert → tabular-nums + rechtsbündige Ziffern. */
  numeric?: boolean;
}

export interface ObjectSection {
  title?: ReactNode;
  fields: ObjectField[];
}

/* =================================================================
 * A1 — Kompositions-Subkomponenten
 * ================================================================= */

export type ObjectPageMode = "default" | "iconTabBar";

/** Heading-Level → aria-level / Tag. */
export type TitleTextLevel = "H1" | "H2" | "H3" | "H4" | "H5" | "H6";

export interface ObjectPageSectionProps {
  /** Eindeutige ID — Anker-Ziel & Selektions-Schlüssel. (Pflicht) */
  id: string;
  /** Sichtbarer Titel der Sektion. (Pflicht) */
  titleText: string;
  children?: ReactNode;
  /** Titel ausblenden (Anchor-Bar nutzt weiterhin titleText). */
  hideTitleText?: boolean;
  /** Titel in Großbuchstaben darstellen. */
  titleTextUppercase?: boolean;
  /** Langen Titel umbrechen statt kürzen. */
  wrapTitleText?: boolean;
  /** Überschriften-Level (H1..H6) → aria-level + Tag. Default H3. */
  titleTextLevel?: TitleTextLevel;
  /** Custom-Header-Inhalt rechts neben dem Titel. */
  header?: ReactNode;
  className?: string;
}

/**
 * Top-Level-Informationscontainer. Wird ausschließlich als child der
 * ObjectPage gerendert; standalone ist es ein neutraler Container.
 */
export function ObjectPageSection(props: ObjectPageSectionProps) {
  const { id, titleText, children, hideTitleText, titleTextUppercase, wrapTitleText, titleTextLevel = "H3", header, className } =
    props;
  const level = levelToAria(titleTextLevel);
  return (
    <section
      className={cx("prn-op-section", className)}
      data-section-id={id}
      role="region"
      aria-label={titleText}
    >
      {!hideTitleText && (
        <div className="prn-op-section-head">
          <div
            role="heading"
            aria-level={level}
            className="prn-op-section-title"
            data-uppercase={titleTextUppercase ? "" : undefined}
            data-wrap={wrapTitleText ? "" : undefined}
          >
            {titleText}
          </div>
          {header && <div className="prn-op-section-header-content">{header}</div>}
        </div>
      )}
      <div className="prn-op-section-body">{children}</div>
    </section>
  );
}

export interface ObjectPageSubSectionProps {
  /** Eindeutige ID. (Pflicht) */
  id: string;
  /** Sichtbarer Titel. (Pflicht) */
  titleText: string;
  children?: ReactNode;
  /** Aktionen rechts im SubSection-Kopf. */
  actions?: ReactNode;
  /** Titel ausblenden. */
  hideTitleText?: boolean;
  className?: string;
}

/** Zweite Ebene innerhalb einer Section. */
export function ObjectPageSubSection(props: ObjectPageSubSectionProps) {
  const { id, titleText, children, actions, hideTitleText, className } = props;
  return (
    <div className={cx("prn-op-subsection", className)} data-subsection-id={id} role="group" aria-label={titleText}>
      {!hideTitleText && (
        <div className="prn-op-subsection-head">
          <div role="heading" aria-level={4} className="prn-op-subsection-title">
            {titleText}
          </div>
          {actions && <div className="prn-op-subsection-actions">{actions}</div>}
        </div>
      )}
      <div className="prn-op-subsection-body">{children}</div>
    </div>
  );
}

function levelToAria(level: TitleTextLevel): number {
  return Number(level.slice(1));
}

/* =================================================================
 * A6 — Accessibility-Attribute
 * ================================================================= */

export interface ObjectPageAccessibilityAttributes {
  objectPageTopHeader?: { role?: string; "aria-label"?: string };
  objectPageAnchorBar?: { role?: string; "aria-label"?: string };
  objectPageFooterActions?: { role?: string; "aria-label"?: string };
}

/* =================================================================
 * Imperative API (A2)
 * ================================================================= */

export interface ObjectPageHandle {
  /** Snappt/entsnappt den Header. Ohne Argument: Toggle. */
  toggleHeaderArea: (snapped?: boolean) => void;
}

/* =================================================================
 * Navigations-Event (A1)
 * ================================================================= */

export interface SelectedSectionChangeDetail {
  selectedSectionIndex: number;
  selectedSectionId: string;
}

export interface BeforeNavigateDetail {
  sectionId: string;
  sectionIndex: number;
  /** Bricht die Navigation ab. */
  preventDefault: () => void;
}

/* =================================================================
 * ObjectPage
 * ================================================================= */

export interface ObjectPageProps {
  /* --- A3 Title-Bereich --- */
  title: ReactNode;
  subtitle?: ReactNode;
  /** Status-Badge rechts im Kopf. */
  status?: StatusBadge;
  /** KPI-Reihe im Title-Bereich. */
  kpis?: ObjectPageKpi[];
  /** Aktionen rechts im Kopf (actionsBar). */
  actions?: ReactNode;
  /** Breadcrumb-Slot über dem Titel. */
  breadcrumbs?: ReactNode;
  /** Frei komponierbarer Kopf-/Unterkopf (überschreibt title/subtitle, wenn gesetzt). */
  header?: ReactNode;
  subHeader?: ReactNode;
  /** Alternative Darstellung im kollabierten (snapped) Zustand. */
  snappedHeader?: ReactNode;
  snappedSubHeader?: ReactNode;
  /** Inhalt nur im expandierten bzw. nur im snapped Zustand. */
  expandedContent?: ReactNode;
  snappedContent?: ReactNode;
  /** Aktionsleiste (Alias zu actions; actions hat Vorrang). */
  actionsBar?: ReactNode;
  /** Navigations-Aktionen, responsiv positioniert. */
  navigationBar?: ReactNode;
  /** „Liquid Glass"-Optik auf der Title-/Top-Header-Leiste (transluzent + Blur). */
  glass?: boolean;

  /* --- A2 Header-Area / Snapping --- */
  /** Expandierbarer Header-Content unter dem Title. */
  headerArea?: ReactNode;
  /** Header fixiert (nicht kollabierbar beim Scrollen). */
  headerPinned?: boolean;
  /** Pin-Button ausblenden. */
  hidePinButton?: boolean;
  /** Klick auf Title togglet den Header nicht. */
  preserveHeaderStateOnClick?: boolean;
  onToggleHeaderArea?: (visible: boolean) => void;
  onPinButtonToggle?: (pinned: boolean) => void;

  /* --- A4 Medien / Footer / Platzhalter --- */
  /** Bild/Avatar im Kopf — URL-String oder beliebiger Node. */
  image?: string | ReactNode;
  /** Bild rund darstellen. */
  imageShapeCircle?: boolean;
  /** Schwebende Footer-Aktionsleiste. */
  footerArea?: ReactNode;
  /** Ersetzt den gesamten Inhalt (z. B. „nicht ladbar"). */
  placeholder?: ReactNode;

  /* --- A1 Navigation --- */
  /** `default` = alle Sektionen scrollbar, `iconTabBar` = nur aktive sichtbar. */
  mode?: ObjectPageMode;
  /** Controlled aktive Sektion. */
  selectedSectionId?: string;
  /** Controlled aktive SubSection (nur Markierung). */
  selectedSubSectionId?: string;
  onSelectedSectionChange?: (detail: SelectedSectionChangeDetail) => void;
  /** Cancelable vor jeder Navigation. */
  onBeforeNavigate?: (detail: BeforeNavigateDetail) => void;

  /* --- A6 / Sonstiges --- */
  accessibilityAttributes?: ObjectPageAccessibilityAttributes;

  /** Detail-Sektionen (Legacy-Adapter → ObjectPageSection). */
  sections?: ObjectSection[];
  /** Kompositions-children (ObjectPageSection-Elemente) bzw. freier Inhalt. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface NormalizedSection {
  id: string;
  titleText: string;
  node: ReactNode;
}

export const ObjectPage = forwardRef<ObjectPageHandle, ObjectPageProps>(function ObjectPage(props, ref) {
  const {
    title,
    subtitle,
    status,
    kpis,
    actions,
    breadcrumbs,
    header,
    subHeader,
    snappedHeader,
    snappedSubHeader,
    expandedContent,
    snappedContent,
    actionsBar,
    navigationBar,
    headerArea,
    headerPinned,
    hidePinButton,
    preserveHeaderStateOnClick,
    onToggleHeaderArea,
    onPinButtonToggle,
    image,
    imageShapeCircle,
    footerArea,
    placeholder,
    mode = "default",
    selectedSectionId,
    selectedSubSectionId,
    onSelectedSectionChange,
    onBeforeNavigate,
    accessibilityAttributes,
    sections,
    children,
    glass,
    className,
    style,
  } = props;

  const reactId = useId();

  /* ---- Sektionen normalisieren: Komposition + Legacy-Adapter ---- */
  const normalizedSections = useMemo<NormalizedSection[]>(() => {
    const out: NormalizedSection[] = [];

    // 1) Kompositions-children (ObjectPageSection-Elemente)
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === ObjectPageSection) {
        const p = (child as ReactElement<ObjectPageSectionProps>).props;
        out.push({ id: p.id, titleText: p.titleText, node: child });
      }
    });

    // 2) Legacy `sections`-Array → ObjectPageSection-Adapter
    if (sections && sections.length > 0) {
      sections.forEach((section, i) => {
        const id = `legacy-section-${i}`;
        const titleText = typeof section.title === "string" ? section.title : `Abschnitt ${i + 1}`;
        out.push({
          id,
          titleText,
          node: (
            <ObjectPageSection key={id} id={id} titleText={titleText} hideTitleText={section.title == null}>
              <dl className="prn-field-grid">
                {section.fields.map((field, j) => (
                  <div className="prn-field-row" key={j}>
                    <dt className="prn-field-key">{field.label}</dt>
                    <dd className="prn-field-val" data-numeric={field.numeric ? "" : undefined}>
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </ObjectPageSection>
          ),
        });
      });
    }

    return out;
  }, [children, sections]);

  /* ---- Freier (Nicht-Section-)Inhalt aus children ---- */
  const freeChildren = useMemo(() => {
    const out: ReactNode[] = [];
    Children.forEach(children, (child) => {
      if (isValidElement(child) && child.type === ObjectPageSection) return;
      out.push(child);
    });
    return out;
  }, [children]);

  const hasAnchorBar = normalizedSections.length > 1;

  /* ---- A1: Selection-State (controlled/uncontrolled) ---- */
  const [internalActiveId, setInternalActiveId] = useState<string | undefined>(
    selectedSectionId ?? normalizedSections[0]?.id,
  );
  const activeId = selectedSectionId ?? internalActiveId ?? normalizedSections[0]?.id;

  // Selektion stabil halten, wenn sich Sektionen ändern.
  useEffect(() => {
    if (selectedSectionId != null) return;
    if (!normalizedSections.some((s) => s.id === internalActiveId)) {
      setInternalActiveId(normalizedSections[0]?.id);
    }
  }, [normalizedSections, internalActiveId, selectedSectionId]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const registerSection = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) sectionRefs.current.set(id, el);
    else sectionRefs.current.delete(id);
  }, []);

  /* ---- Navigation auslösen (mit onBeforeNavigate-Guard) ---- */
  const navigateTo = useCallback(
    (id: string, opts: { scroll?: boolean } = { scroll: true }) => {
      const index = normalizedSections.findIndex((s) => s.id === id);
      if (index < 0) return;

      let cancelled = false;
      onBeforeNavigate?.({
        sectionId: id,
        sectionIndex: index,
        preventDefault: () => {
          cancelled = true;
        },
      });
      if (cancelled) return;

      if (selectedSectionId == null) setInternalActiveId(id);
      onSelectedSectionChange?.({ selectedSectionIndex: index, selectedSectionId: id });

      if (opts.scroll && mode === "default") {
        const el = sectionRefs.current.get(id);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [normalizedSections, onBeforeNavigate, onSelectedSectionChange, selectedSectionId, mode],
  );

  /* ---- A1: Scroll-Spy via IntersectionObserver (nur default-mode) ---- */
  useEffect(() => {
    if (mode !== "default" || !hasAnchorBar) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // wähle den am stärksten sichtbaren Eintrag
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (!top) return;
        const id = (top.target as HTMLElement).dataset.sectionAnchor;
        if (id && id !== activeId && selectedSectionId == null) {
          setInternalActiveId(id);
          const index = normalizedSections.findIndex((s) => s.id === id);
          onSelectedSectionChange?.({ selectedSectionIndex: index, selectedSectionId: id });
        }
      },
      { root: scrollRef.current, threshold: [0.1, 0.5, 0.9], rootMargin: "0px 0px -55% 0px" },
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hasAnchorBar, normalizedSections, selectedSectionId, onSelectedSectionChange]);

  /* ---- A2: Snapping-Header-State ---- */
  const [snapped, setSnapped] = useState(false);
  const [pinned, setPinned] = useState(!!headerPinned);

  // controlled pin
  useEffect(() => {
    if (headerPinned != null) setPinned(headerPinned);
  }, [headerPinned]);

  const setSnappedState = useCallback(
    (next: boolean) => {
      setSnapped((prev) => {
        if (prev === next) return prev;
        onToggleHeaderArea?.(!next); // visible = !snapped
        return next;
      });
    },
    [onToggleHeaderArea],
  );

  useImperativeHandle(
    ref,
    (): ObjectPageHandle => ({
      toggleHeaderArea: (s?: boolean) => {
        setSnappedState(s == null ? !snapped : s);
      },
    }),
    [setSnappedState, snapped],
  );

  /* ---- A2: Scroll-getriebenes Snapping ---- */
  const onScroll = useCallback(() => {
    if (pinned || !headerArea) return;
    const el = scrollRef.current;
    if (!el) return;
    setSnappedState(el.scrollTop > 8);
  }, [pinned, headerArea, setSnappedState]);

  const handleTitleClick = useCallback(() => {
    if (preserveHeaderStateOnClick || !headerArea) return;
    setSnappedState(!snapped);
  }, [preserveHeaderStateOnClick, headerArea, snapped, setSnappedState]);

  const togglePin = useCallback(() => {
    const next = !pinned;
    if (headerPinned == null) setPinned(next);
    onPinButtonToggle?.(next);
    if (next) setSnappedState(false);
  }, [pinned, headerPinned, onPinButtonToggle, setSnappedState]);

  /* ---- A1: Tastatur-Navigation in der Anchor-Bar ---- */
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const onTabKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = (index + 1) % normalizedSections.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
        nextIndex = (index - 1 + normalizedSections.length) % normalizedSections.length;
      else if (e.key === "Home") nextIndex = 0;
      else if (e.key === "End") nextIndex = normalizedSections.length - 1;
      if (nextIndex == null) return;
      e.preventDefault();
      const target = normalizedSections[nextIndex];
      if (!target) return;
      navigateTo(target.id);
      tabRefs.current.get(target.id)?.focus();
    },
    [normalizedSections, navigateTo],
  );

  /* ---- Title-Bereich ---- */
  const effectiveActions = actions ?? actionsBar;
  const showSnappedTitle = snapped;
  const headerNode = showSnappedTitle && snappedHeader != null ? snappedHeader : header ?? title;
  const subHeaderNode =
    showSnappedTitle && snappedSubHeader != null ? snappedSubHeader : subHeader ?? subtitle;

  const renderImage = () => {
    if (image == null) return null;
    const inner =
      typeof image === "string" ? (
        <img className="prn-op-image-img" src={image} alt="" />
      ) : (
        image
      );
    return (
      <div className="prn-op-image" data-circle={imageShapeCircle ? "" : undefined}>
        {inner}
      </div>
    );
  };

  const topHeaderA11y = accessibilityAttributes?.objectPageTopHeader;
  const anchorBarA11y = accessibilityAttributes?.objectPageAnchorBar;
  const footerA11y = accessibilityAttributes?.objectPageFooterActions;

  return (
    <div
      className={cx("prn-objectpage", className)}
      data-mode={mode}
      data-snapped={snapped ? "" : undefined}
      data-pinned={pinned ? "" : undefined}
      style={style}
    >
      {/* ---- A3: Title / Top-Header ---- */}
      <header
        className={cx(
          "prn-objectpage-head prn-op-top-header",
          glass && "prn-glass prn-glass-bar",
        )}
        role={topHeaderA11y?.role ?? "banner"}
        aria-label={topHeaderA11y?.["aria-label"]}
      >
        {breadcrumbs && <div className="prn-op-breadcrumbs">{breadcrumbs}</div>}

        <div className="prn-objectpage-headrow">
          {renderImage()}
          <div className="prn-objectpage-titles">
            <h1
              className="prn-objectpage-title"
              onClick={handleTitleClick}
              data-clickable={!preserveHeaderStateOnClick && headerArea ? "" : undefined}
            >
              {headerNode}
            </h1>
            {subHeaderNode && <span className="prn-objectpage-subtitle">{subHeaderNode}</span>}
            {(snapped ? snappedContent : expandedContent) && (
              <div className="prn-op-state-content">{snapped ? snappedContent : expandedContent}</div>
            )}
          </div>

          {status && (
            <span className="prn-objectpage-status">
              <span className="prn-status-badge" data-tone={status.tone ?? "neutral"}>
                <span className="prn-status-dot" aria-hidden />
                {status.label}
              </span>
            </span>
          )}

          {navigationBar && <div className="prn-op-navigation-bar">{navigationBar}</div>}
          {effectiveActions && <div className="prn-objectpage-actions">{effectiveActions}</div>}

          {!hidePinButton && headerArea && (
            <button
              type="button"
              className="prn-op-pin"
              aria-pressed={pinned}
              aria-label={pinned ? "Header lösen" : "Header anheften"}
              onClick={togglePin}
            >
              <span aria-hidden>{pinned ? "📌" : "📍"}</span>
            </button>
          )}
        </div>

        {/* A2: expandierbarer Header-Content */}
        {headerArea && !snapped && <div className="prn-op-header-area">{headerArea}</div>}

        {/* A3: KPIs */}
        {kpis && kpis.length > 0 && (
          <div className="prn-objectpage-kpis">
            {kpis.map((kpi, i) => (
              <div className="prn-kpi" key={i}>
                <span className="prn-kpi-label">{kpi.label}</span>
                <span className="prn-kpi-value" data-tone={kpi.tone}>
                  {kpi.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </header>

      {/* ---- A1: Anchor-Bar (Tablist) ---- */}
      {hasAnchorBar && (
        <div
          className="prn-op-anchorbar"
          role={anchorBarA11y?.role ?? "tablist"}
          aria-label={anchorBarA11y?.["aria-label"] ?? "Sektionen"}
        >
          {normalizedSections.map((s, i) => {
            const selected = s.id === activeId;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                id={`${reactId}-tab-${s.id}`}
                aria-selected={selected}
                aria-controls={`${reactId}-panel-${s.id}`}
                tabIndex={selected ? 0 : -1}
                className="prn-op-anchor"
                data-selected={selected ? "" : undefined}
                ref={(el) => {
                  if (el) tabRefs.current.set(s.id, el);
                  else tabRefs.current.delete(s.id);
                }}
                onClick={() => navigateTo(s.id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
              >
                {s.titleText}
              </button>
            );
          })}
        </div>
      )}

      {/* ---- Inhalt ---- */}
      {placeholder != null ? (
        <div className="prn-op-placeholder" role="status">
          {placeholder}
        </div>
      ) : (
        <div className="prn-op-scroll" ref={scrollRef} onScroll={onScroll}>
          <div className="prn-objectpage-sections-stack">
            {normalizedSections.map((s) => {
              const isActive = s.id === activeId;
              // iconTabBar: nur aktive Sektion sichtbar
              if (mode === "iconTabBar" && !isActive) return null;
              return (
                <div
                  key={s.id}
                  className="prn-op-section-anchor"
                  data-section-anchor={s.id}
                  data-active={isActive ? "" : undefined}
                  id={`${reactId}-panel-${s.id}`}
                  role={hasAnchorBar ? "tabpanel" : undefined}
                  aria-labelledby={hasAnchorBar ? `${reactId}-tab-${s.id}` : undefined}
                  ref={(el) => registerSection(s.id, el)}
                >
                  {s.node}
                </div>
              );
            })}
            {freeChildren}
          </div>
        </div>
      )}

      {/* ---- A4: Footer ---- */}
      {footerArea && (
        <div
          className="prn-op-footer"
          role={footerA11y?.role ?? "contentinfo"}
          aria-label={footerA11y?.["aria-label"]}
        >
          {footerArea}
        </div>
      )}

      {/* hidden: selectedSubSectionId markiert (für Konsumenten/Tests) */}
      {selectedSubSectionId && <input type="hidden" data-selected-subsection={selectedSubSectionId} readOnly value="" />}
    </div>
  );
});
