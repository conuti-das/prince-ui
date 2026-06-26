import { Component, Suspense, type ReactNode } from "react";
import { resolveHeavyComponent } from "../playground/heavy-registry";

/**
 * Mount-Punkt für die Schwer-Editoren (bpmn/dmn/forms/bo4e) in MDX-Seiten.
 *
 * Die Editoren sind zu komplex für `<Playground>` (kein Control-Schema) und
 * zu groß für `<Example>` (react-live mit hunderten Zeilen Demo-XML im Scope).
 * Stattdessen mountet `<EditorExample name="…" />` die jeweilige Demo-Komponente
 * aus der Lazy-Registry mit eingebackenen Demo-Daten aus den Stories.
 */
class EditorBoundary extends Component<
  { name: string; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="docs-editor-error" role="alert">
          <strong>{this.props.name} konnte nicht geladen werden.</strong>
          <pre>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function EditorExample({ name }: { name: string }) {
  const Comp = resolveHeavyComponent(name);
  if (!Comp) {
    return (
      <p>
        <em>Kein Editor-Demo für „{name}".</em>
      </p>
    );
  }
  return (
    <div className="docs-editor-example">
      <EditorBoundary name={name}>
        <Suspense fallback={<div className="docs-editor-loading">Editor lädt …</div>}>
          <Comp />
        </Suspense>
      </EditorBoundary>
    </div>
  );
}
