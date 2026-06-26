import { useEffect, useState } from "react";
import { selectProps, type PropsData } from "./props-data";

export function PropsTable({ name }: { name: string }) {
  const [data, setData] = useState<PropsData | null>(null);
  useEffect(() => { fetch(`${import.meta.env.BASE_URL}props.json`).then((r) => r.json()).then(setData); }, []);
  if (!data) return null;
  const props = selectProps(data, name);
  if (props.length === 0) return <p><em>Keine Props dokumentiert.</em></p>;
  return (
    <table className="docs-props-table">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th></tr></thead>
      <tbody>
        {props.map((p) => (
          <tr key={p.name}>
            <td><code>{p.name}</code>{p.required && <span aria-label="erforderlich"> *</span>}<br /><small>{p.description}</small></td>
            <td><code>{p.type}</code></td>
            <td>{p.defaultValue ? <code>{p.defaultValue}</code> : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
