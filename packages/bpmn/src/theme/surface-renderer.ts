/**
 * Custom-Renderer für die prince-ui-Optik (diagram-js `additionalModules`).
 *
 * Erbt vom `BpmnRenderer`, delegiert für alle Typen an die Original-Zeichenroutine
 * (Geometrie/Hit-Boxes/Bendpoints bleiben unangetastet) und passt nur die weiche
 * Optik nachträglich an: stärkere Eck-Rundung bei Tasks, Hairline-Stroke, dezenter
 * Schatten. Reines SVG — unabhängig vom Icon-Font.
 *
 * Wird als Factory exportiert, damit `bpmn-js` per Dynamic Import geladen werden
 * kann (kein Top-Level-Import der Engine im Paket-Entry).
 */

import type { DiagramColors } from "./diagram-theme";

/** Systemschrift-Stack, passend zum `--prn-font`-Token. */
const SURFACE_FONT =
  'system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/** Baut die `bpmnRenderer`/`textRenderer`-Config aus den Token-Farben.
 *  Setzt zusätzlich den Systemschrift-Stack auf alle Diagramm-Labels (interne +
 *  externe), damit die Beschriftungen nicht in der bpmn-js-Default-Schrift erscheinen. */
export function buildRendererConfig(colors: DiagramColors) {
  const labelStyle = {
    fill: colors.defaultLabelColor,
    fontFamily: SURFACE_FONT,
    fontSize: 12,
    fontWeight: 500,
  };
  return {
    bpmnRenderer: {
      defaultFillColor: colors.defaultFillColor,
      defaultStrokeColor: colors.defaultStrokeColor,
      defaultLabelColor: colors.defaultLabelColor,
    },
    textRenderer: {
      defaultStyle: labelStyle,
      externalStyle: labelStyle,
    },
  };
}

/**
 * Erzeugt das `additionalModules`-Eintrag-Objekt für den prince-ui-Optik-Renderer.
 * `BpmnRenderer` wird injiziert (per Dynamic Import geladen), damit der Paket-Entry
 * frei von bpmn-js-Top-Level-Imports bleibt.
 */
export function createSurfaceRendererModule(BpmnRenderer: new (...args: unknown[]) => unknown) {
  /**
   * @constructor
   * Höhere Render-Priorität (1500) als der Default-BpmnRenderer (1000),
   * damit `canRender`/`drawShape` zuerst greifen und wir an `super` delegieren.
   */
  function SurfaceRenderer(this: Record<string, unknown>, ...args: unknown[]) {
    // args: eventBus, styles, pathMap, canvas, textRenderer, ... (bpmn-js-Reihenfolge)
    Reflect.apply(BpmnRenderer as unknown as (...a: unknown[]) => void, this, args);
  }

  SurfaceRenderer.prototype = Object.create((BpmnRenderer as unknown as { prototype: object }).prototype);
  SurfaceRenderer.prototype.constructor = SurfaceRenderer;

  // canRender: nur Standard-BPMN-Elemente; an super delegieren.
  SurfaceRenderer.prototype.canRender = function canRender(this: Record<string, unknown>, element: unknown) {
    const parentProto = Object.getPrototypeOf(SurfaceRenderer.prototype);
    return parentProto.canRender.call(this, element);
  };

  // drawShape: super zeichnen lassen, danach optischen Feinschliff anwenden.
  SurfaceRenderer.prototype.drawShape = function drawShape(
    this: Record<string, unknown>,
    parentNode: SVGElement,
    element: { type?: string; width?: number; height?: number },
  ) {
    const parentProto = Object.getPrototypeOf(SurfaceRenderer.prototype);
    const gfx = parentProto.drawShape.call(this, parentNode, element) as SVGElement | undefined;

    try {
      const type = element.type ?? "";
      // Task-/Activity-Rechtecke runder (Karten-Radius).
      if (type.includes("Task") || type.includes("SubProcess") || type.includes("CallActivity")) {
        const rect = parentNode.querySelector("rect");
        if (rect) {
          rect.setAttribute("rx", "12");
          rect.setAttribute("ry", "12");
        }
      }
      // Dünne Hairline-Konturen auf der Hauptform (statt 2px-Stock-Linien).
      const main = (gfx ?? parentNode) as SVGElement;
      const stroke = main.querySelector?.("rect, circle, polygon, path") as SVGElement | null;
      if (stroke && stroke.getAttribute("stroke-width") === "2") {
        stroke.setAttribute("stroke-width", "1.5");
      }
      // Dezenter Schatten auf der gesamten Form (nicht auf Labels/Connections).
      const isLabel = type === "label";
      if (!isLabel && main?.style) {
        main.style.filter = "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.12))";
      }
    } catch {
      /* defensiv — Optik darf das Rendern nie brechen */
    }

    return gfx;
  };

  // drawConnection: super zeichnen lassen, danach Pfeile/Linien verschlanken.
  SurfaceRenderer.prototype.drawConnection = function drawConnection(
    this: Record<string, unknown>,
    parentNode: SVGElement,
    element: unknown,
  ) {
    const parentProto = Object.getPrototypeOf(SurfaceRenderer.prototype);
    const gfx = parentProto.drawConnection.call(this, parentNode, element) as SVGElement | undefined;
    try {
      const main = (gfx ?? parentNode) as SVGElement;
      const path = main.querySelector?.("path") as SVGElement | null;
      if (path && path.getAttribute("stroke-width") === "2") {
        path.setAttribute("stroke-width", "1.5");
      }
    } catch {
      /* defensiv */
    }
    return gfx;
  };

  // $inject muss exakt dem BpmnRenderer entsprechen, damit DI die Args füllt.
  SurfaceRenderer.$inject = (BpmnRenderer as unknown as { $inject?: string[] }).$inject ?? [
    "config.bpmnRenderer",
    "eventBus",
    "styles",
    "pathMap",
    "canvas",
    "textRenderer",
  ];

  return {
    __init__: ["surfaceRenderer"],
    surfaceRenderer: ["type", SurfaceRenderer],
  };
}
