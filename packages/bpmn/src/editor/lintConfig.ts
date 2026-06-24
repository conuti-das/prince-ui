/**
 * bpmnlint-Konfiguration für den BpmnEditor.
 *
 * Die Regel-Module von `bpmnlint` werden im Editor **lazy** geladen und hier
 * über einen Resolver injiziert — so bleibt der Paket-Entry frei von
 * Top-Level-Engine-Imports. Portiert aus maco `BpmnEditor/lintConfig.ts`
 * (4 Regeln: label-required, no-disconnected, no-implicit-split, no-complex-gateway).
 */

/** Ein einzelnes, flach normalisiertes Lint-Ergebnis aus bpmn-js-bpmnlint. */
export interface LintIssue {
  id: string;
  message: string;
  category: "error" | "warning";
  element?: string;
}

/** Severity je Regel. */
export type LintSeverity = "error" | "warn" | "off";

/** Regel-Konfiguration: Regelname → Severity. */
export type LintRuleConfig = Record<string, LintSeverity>;

/** Default-Regeln (MaKo-tauglich). */
export const DEFAULT_LINT_RULES: LintRuleConfig = {
  "bpmnlint/label-required": "error",
  "bpmnlint/no-disconnected": "error",
  "bpmnlint/no-implicit-split": "warn",
  "bpmnlint/no-complex-gateway": "warn",
};

/**
 * Baut das `linting.bpmnlint`-Konfigobjekt für den Modeler.
 * `rules` mappt vollqualifizierte Regelnamen auf die geladenen Regel-Module.
 */
export function buildLintConfig(
  ruleModules: Record<string, unknown>,
  rules: LintRuleConfig = DEFAULT_LINT_RULES,
) {
  const ruleCache: Record<string, unknown> = {};
  for (const [name, mod] of Object.entries(ruleModules)) {
    ruleCache[`rule:${name}`] = mod;
  }

  return {
    config: { rules },
    resolver: {
      resolveRule(pkg: string, ruleName: string): unknown {
        const key = `rule:${pkg}/${ruleName}`;
        const resolved = ruleCache[key];
        if (!resolved) throw new Error(`unknown rule <${pkg}/${ruleName}>`);
        return resolved;
      },
      resolveConfig(_pkg: string, configName: string): unknown {
        throw new Error(`unknown config <${configName}>`);
      },
    },
  };
}
