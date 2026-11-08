// The kit: what every demo app shares. Screens import from here and from Paper, and from nothing else outside
// their own folder.

export { Glyph, type GlyphName, type GlyphProps } from "./Glyph";
export { AppShell, TopBar, useFace, useShell, type AppShellProps, type ShellKind } from "./AppShell";
export { Sidebar, SidebarBrand, SidebarCard, type NavItem, type NavSection, type SidebarProps } from "./Sidebar";
export { Tabs, Segmented, type TabItem, type TabsProps, type SegmentOption } from "./Tabs";
export { PageHeader, SectionHeader, type PageHeaderProps } from "./PageHeader";
export { Stat, StatRow, type StatProps } from "./Stat";
export { Anchor } from "./Anchor";
export { Avatar, Person, toneOf, type AvatarProps } from "./Avatar";
export { Art, type ArtKind, type ArtProps } from "./Art";
export { Meter, type MeterProps } from "./Meter";
export { Empty } from "./Empty";
export { SurfaceLink, type SurfaceLinkProps } from "./SurfaceLink";
export { Menu, type MenuItem, type MenuProps } from "./Menu";
export { ToastProvider, useToast } from "./Toast";
export { useStored, clearStored } from "./storage";
export * from "./mock";
