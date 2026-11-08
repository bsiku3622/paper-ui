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
export const LanguagesIcon = glyph("Languages", <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />);
export const CheckIcon = glyph("Check", <path d="m5 12 4 4L19 6" />);
export const GridIcon = glyph("Grid", <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />);
export const LayersIcon = glyph("Layers", <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>);
export const ClockIcon = glyph("Clock", <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
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
export const ChevronDownIcon = glyph("ChevronDown", <path d="m6 9 6 6 6-6" />);
export const UpDownIcon = glyph("UpDown", <><path d="m8 9 4-4 4 4" /><path d="m8 15 4 4 4-4" /></>);
export const StarIcon = glyph("Star", <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 17l-5.2 2.7 1-5.9-4.3-4.1 5.9-.8L12 3.5Z" />);
export const BoxIcon = glyph("Box", <><path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" /><path d="m3 8 9 5 9-5M12 13v8" /></>);
export const DeployIcon = glyph("Deploy", <><path d="M12 19V6" /><path d="m6 11 6-6 6 6" /><path d="M5 21h14" /></>);
export const ActivityIcon = glyph("Activity", <path d="M22 12h-4l-3 9L9 3l-3 9H2" />);
export const CardIcon = glyph("Card", <><rect x="3" y="6" width="18" height="14" rx="3.5" /><path d="M3 10h18M16 15h.01" /></>);
export const ShieldIcon = glyph("Shield", <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />);
export const GearIcon = glyph("Gear", <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>);
export const BookIcon = glyph("Book", <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" /></>);
export const HelpIcon = glyph("Help", <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.6a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.1.9-1.1 1.7" /><path d="M12 17h.01" /></>);
export const BellIcon = glyph("Bell", <><path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4l2-2Z" /><path d="M10 21h4" /></>);
export const ExternalIcon = glyph("External", <><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></>);
export const UndoIcon = glyph("Undo", <><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></>);
export const PanelIcon = glyph("Panel", <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M15 4v16" /></>);
export const PointerIcon = glyph("Pointer", <path d="m5 4 14 6.5-6 1.8L10.5 19 5 4Z" />);
