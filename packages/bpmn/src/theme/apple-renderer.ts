/**
 * Apple-Look-Custom-Renderer (diagram-js `additionalModules`).
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

/** Baut die `bpmnRenderer`/`textRenderer`-Config aus den Token-Farben. */
export function buildRendererConfig(colors: DiagramColors) {
  return {
    bpmnRenderer: {
      defaultFillColor: colors.defaultFillColor,
      defaultStrokeColor: colors.defaultStrokeColor,
      defaultLabelColor: colors.defaultLabelColor,
    },
    textRenderer: {
      defaultStyle: { fill: colors.defaultLabelColor },
    },
  };
}

/**
 * Erzeugt das `additionalModules`-Eintrag-Objekt für den Apple-Look-Renderer.
 * `BpmnRenderer` wird injiziert (per Dynamic Import geladen), damit der Paket-Entry
 * frei von bpmn-js-Top-Level-Imports bleibt.
 */
export function createAppleRendererModule(BpmnRenderer: new (...args: unknown[]) => unknown) {
  /**
   * @constructor
   * Höhere Render-Priorität (1500) als der Default-BpmnRenderer (1000),
   * damit `canRender`/`drawShape` zuerst greifen und wir an `super` delegieren.
   */
  function AppleRenderer(this: Record<string, unknown>, ...args: unknown[]) {
    // args: eventBus, styles, pathMap, canvas, textRenderer, ... (bpmn-js-Reihenfolge)
    Reflect.apply(BpmnRenderer as unknown as (...a: unknown[]) => void, this, args);
  }

  AppleRenderer.prototype = Object.create((BpmnRenderer as unknown as { prototype: object }).prototype);
  AppleRenderer.prototype.constructor = AppleRenderer;

  // canRender: nur Standard-BPMN-Elemente; an super delegieren.
  AppleRenderer.prototype.canRender = function canRender(this: Record<string, unknown>, element: unknown) {
    const parentProto = Object.getPrototypeOf(AppleRenderer.prototype);
    return parentProto.canRender.call(this, element);
  };

  // drawShape: super zeichnen lassen, danach Apple-Feinschliff anwenden.
  AppleRenderer.prototype.drawShape = function drawShape(
    this: Record<string, unknown>,
    parentNode: SVGElement,
    element: { type?: string; width?: number; height?: number },
  ) {
    const parentProto = Object.getPrototypeOf(AppleRenderer.prototype);
    const gfx = parentProto.drawShape.call(this, parentNode, element) as SVGElement | undefined;

    try {
      const type = element.type ?? "";
      // Task-/Activity-Rechtecke runder + weichere Hairline.
      if (type.includes("Task") || type.includes("SubProcess") || type.includes("CallActivity")) {
        const rect = parentNode.querySelector("rect");
        if (rect) {
          rect.setAttribute("rx", "12");
          rect.setAttribute("ry", "12");
        }
      }
      // Dünne, weiche Konturen auf der Hauptform.
      const main = (gfx ?? parentNode) as SVGElement;
      const stroke = main.querySelector?.("rect, circle, polygon, path") as SVGElement | null;
      if (stroke && stroke.getAttribute("stroke-width") === "2") {
        stroke.setAttribute("stroke-width", "1.5");
      }
    } catch {
      /* defensiv — Optik darf das Rendern nie brechen */
    }

    return gfx;
  };

  // $inject muss exakt dem BpmnRenderer entsprechen, damit DI die Args füllt.
  AppleRenderer.$inject = (BpmnRenderer as unknown as { $inject?: string[] }).$inject ?? [
    "config.bpmnRenderer",
    "eventBus",
    "styles",
    "pathMap",
    "canvas",
    "textRenderer",
  ];

  return {
    __init__: ["appleRenderer"],
    appleRenderer: ["type", AppleRenderer],
  };
}
