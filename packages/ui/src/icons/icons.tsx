import type { ReactNode, SVGProps } from "react";

/**
 * Monochrome Linien-Icons (SVG, `currentColor`) — bewusst KEINE Emoji.
 *
 * Stil: 24×24-Grid, `fill: none`, `stroke: currentColor`, 2px, runde Enden
 * (lucide-kompatible Optik). Die Icons erben die Textfarbe und sind damit
 * theme-fähig (Light/Dark/CU). Kein externer Dependency.
 *
 * Wer mehr Icons braucht, kann jedes monochrome `currentColor`-SVG (z. B.
 * `lucide-react`) direkt in die `icon`/`leading`-Slots der Komponenten geben.
 */
export type IconName =
  | "heart"
  | "flame"
  | "moon"
  | "chart"
  | "settings"
  | "menu"
  | "pin"
  | "pin-off"
  | "user"
  | "building"
  | "search"
  | "plus"
  | "bolt"
  | "alert"
  | "inbox"
  | "compass"
  | "mail"
  | "bell"
  | "grid"
  | "more"
  | "check"
  | "x"
  | "chevron-right"
  | "chevron-down";

const PATHS: Record<IconName, ReactNode> = {
  heart: <path d="M19 14c1.5-1.6 3-3.4 3-5.6A4.4 4.4 0 0 0 12 5 4.4 4.4 0 0 0 2 8.4c0 2.2 1.5 4 3 5.6l7 7Z" />,
  flame: (
    <path d="M8.5 14.5A4 4 0 1 0 16 17c0-1.5-.6-2.6-1.6-3.6-.5 1-1.1 1.5-2.1 1.5 1-2 .4-4.2-1.6-6.2-.4 2-1.4 3-2.8 4.4-.9 1-1.4 2.4-1.4 3.4Z" />
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7 16v-4M12 16V9M17 16V6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  pin: (
    <>
      <path d="M12 17v5" />
      <path d="M9 3h6l-1 7 2.5 4h-9L10 10 9 3Z" />
    </>
  ),
  "pin-off": (
    <>
      <path d="M12 17v5" />
      <path d="M9 3h6l-1 7 2.5 4h-9L10 10 9 3Z" />
      <path d="M3 3l18 18" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-3h4v3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  alert: (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 4h16l2 8v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" />
      <path d="M2 12h6l2 3h4l2-3h6" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  grid: (
    <>
      <circle cx="6" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="6" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="6" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="18" cy="18" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  "chevron-right": <path d="m9 6 6 6-6 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  /** Name des monochromen Icons. */
  name: IconName;
  /** Kantenlänge in px (Default 20). */
  size?: number | string;
  /** Wenn gesetzt: zugängliches Label (sonst `aria-hidden`, rein dekorativ). */
  title?: string;
}

/** Monochromes Linien-Icon (erbt `currentColor`). */
export function Icon({ name, size = 20, title, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title && <title>{title}</title>}
      {PATHS[name]}
    </svg>
  );
}
