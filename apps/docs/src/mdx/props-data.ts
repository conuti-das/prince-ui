export type PropEntry = { name: string; type: string; required: boolean; defaultValue: string | null; description: string };
export type PropsData = Record<string, { props: PropEntry[] }>;
export function selectProps(data: PropsData, name: string): PropEntry[] {
  return data[name]?.props ?? [];
}
