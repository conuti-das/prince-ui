import { useState } from "react";
import { setTheme, type PrinceTheme } from "@conuti-das/prince-ui";

const OPTIONS: { value: PrinceTheme | "system"; label: string }[] = [
  { value: "system", label: "System" },
  { value: "dark", label: "Prince Dark" },
  { value: "light", label: "Prince Light" },
  { value: "cu", label: "CU" },
];

export function ThemeSwitcher() {
  const [value, setValue] = useState<PrinceTheme | "system">("system");
  return (
    <select
      className="docs-theme-select"
      aria-label="Theme"
      value={value}
      onChange={(e) => {
        const v = e.target.value as PrinceTheme | "system";
        setValue(v);
        setTheme(v === "system" ? null : v);
      }}
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
