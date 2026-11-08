// What the studio can show: the site's own demo screens, and — on the owner's machine only — the apps of the host that runs next to
// this site. A production build hides the host's, because they exist nowhere but there.

import type { Mode } from "./protocol";

// Where the Arcfield screens live. The routes (routes.tsx) and every link inside the screens start here.
export const ARCFIELD = "/demo/arcfield";

export const HOST_PORT = 5310;

// One entry is one app, opened at its first page; the rest of its pages are reached inside it.
export type StudioApp = { id: string; label: string; group: "paper" | "host"; path: string };

// The owner's own apps, served by the host on its own port. They are listed only on the dev server: a build drops the list, so
// their names never ship with the site.
const HOST_APPS: readonly StudioApp[] = import.meta.env.DEV ? [
  { id: "admin", label: "관리 콘솔", group: "host", path: "/admin" },
  { id: "rne", label: "R&E 노트", group: "host", path: "/rne" },
  { id: "paperdown", label: "Paperdown", group: "host", path: "/paperdown" },
  { id: "doodle", label: "Doodle", group: "host", path: "/doodle" },
  { id: "gridphoto", label: "GridPhoto", group: "host", path: "/gridphoto" },
  { id: "music", label: "음악", group: "host", path: "/music" },
  { id: "classes", label: "Class Explorer", group: "host", path: "/classes" },
  { id: "wiki", label: "위키", group: "host", path: "/wiki" },
  { id: "printer", label: "프린터 콘솔", group: "host", path: "/printer" },
  { id: "kit", label: "kit 견본", group: "host", path: "/kit" },
] : [];

export const APPS: readonly StudioApp[] = [{ id: "arcfield", label: "Arcfield", group: "paper", path: ARCFIELD }, ...HOST_APPS];

export const GROUPS: readonly { id: StudioApp["group"]; label: string }[] = [
  { id: "paper", label: "Paper만으로 그린 데모" },
  { id: "host", label: "내 앱" },
];

// A production build has only the site's own screens.
export const visibleApps = (dev: boolean = import.meta.env.DEV): StudioApp[] => APPS.filter((app) => dev || app.group === "paper");

export const appById = (id: string): StudioApp | undefined => APPS.find((app) => app.id === id);

// Whether a path is one of the app's own pages: its first page or anything under it. A preview that goes elsewhere — the site's home,
// the studio itself — has left the app.
export const belongsTo = (app: StudioApp, path: string): boolean => {
  const bare = path.split(/[?#]/)[0]!.replace(/\/$/, "");
  return bare === app.path || bare.startsWith(`${app.path}/`);
};

// The host answers on its own port of the same host name, so a studio opened at 127.0.0.1 talks to 127.0.0.1.
export const originOf = (app: StudioApp, here: Location = window.location): string => (app.group === "paper" ? here.origin : `${here.protocol}//${here.hostname}:${HOST_PORT}`);

// The address a frame is opened at: the page, marked as a studio frame and in the theme it should come up in.
export const frameUrl = (app: StudioApp, path: string, theme: Mode, base: string = import.meta.env.BASE_URL, here: Location = window.location): string => {
  const prefix = app.group === "paper" ? base.replace(/\/$/, "") : "";
  const url = new URL(`${prefix}${path}`, originOf(app, here));
  url.searchParams.set("studio", "1");
  url.searchParams.set("theme", theme);
  return url.toString();
};
