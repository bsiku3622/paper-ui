// The app's glyph set — the one place a path is drawn. The package ships no icons (Icon takes the path of a 24
// artboard), so the app names the ones it uses; a page imports `SearchIcon`, never a copy of its path. Each is
// the Icon element itself, so a size or ink prop and the size a control gives its icon work the same way.

import type { ReactNode } from "react";

import { Icon, type IconProps } from "@studio-baeks/paper-ui";

export type GlyphProps = Omit<IconProps, "children">;

const glyph = (name: string, paths: ReactNode) => {
  const Glyph = (props: GlyphProps) => <Icon {...props}>{paths}</Icon>;
  Glyph.displayName = `${name}Icon`;
  return Glyph;
};

export const SearchIcon = glyph("Search", <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
export const PlusIcon = glyph("Plus", <path d="M12 5v14M5 12h14" />);
export const ChevronRightIcon = glyph("ChevronRight", <path d="m9 18 6-6-6-6" />);
export const ArrowRightIcon = glyph("ArrowRight", <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>);
export const ArrowLeftIcon = glyph("ArrowLeft", <><path d="M19 12H5" /><path d="m11 6-6 6 6 6" /></>);
export const SunIcon = glyph(
  "Sun",
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </>,
);
export const MoonIcon = glyph("Moon", <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />);
export const CheckIcon = glyph("Check", <path d="m5 12 4 4L19 6" />);
export const GridIcon = glyph("Grid", <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />);
export const InboxIcon = glyph("Inbox", <><path d="M4 5h16v14H4z" /><path d="M4 13h4l2 2h4l2-2h4" /></>);
export const LayersIcon = glyph("Layers", <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>);
export const CalendarIcon = glyph("Calendar", <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4m8-4v4M4 10h16" /></>);
export const MoreIcon = glyph("More", <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>);
export const SparkIcon = glyph("Spark", <path d="m12 3 2 7 7 2-7 2-2 7-2-7-7-2 7-2 2-7Z" />);
export const ClockIcon = glyph("Clock", <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const FilterIcon = glyph("Filter", <path d="M4 5h16l-6.5 7v5l-3 2v-7L4 5Z" />);
export const CloseIcon = glyph("Close", <path d="m6 6 12 12M18 6 6 18" />);
export const EditIcon = glyph("Edit", <path d="m14.7 6.3 3 3M4 20l4.2-.9L19.2 8a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" />);
export const GripIcon = glyph(
  "Grip",
  <>
    <circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" />
    <circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" />
  </>,
);
export const InfoIcon = glyph("Info", <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>);
export const TrashIcon = glyph("Trash", <path d="M4 7h16M9 7V5h6v2M6 7l1 12h10l1-12" />);
