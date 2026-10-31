// The route table. One layout route, SiteLayout, holds every page; each route's `handle` (SiteHandle) says what
// the shell does around it. Pages load lazily, under the shell's chrome.

import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { DOCS } from "virtual:paper-docs";

import type { SiteHandle } from "./site/handle";
import { FOUNDATIONS, PLAYGROUND_NAV } from "./site/site-map";
import { SiteLayout } from "./site/SiteLayout";

const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const Demo = lazy(() => import("./pages/demo/Demo").then((m) => ({ default: m.Demo })));
const Overview = lazy(() => import("./playground/Overview").then((m) => ({ default: m.Overview })));
const ComponentDetail = lazy(() => import("./playground/Detail").then((m) => ({ default: m.ComponentDetail })));
const Foundations = lazy(() => import("./playground/foundations").then((m) => ({ default: m.Foundations })));
const Docs = lazy(() => import("./pages/Docs").then((m) => ({ default: m.Docs })));

const NAMES = new Map(PLAYGROUND_NAV.flatMap((group) => group.sections.flatMap((section) => section.items)).map(({ slug, name }) => [slug, name]));

// Former routes: the palette is now the Color source, tokens the Foundations pages, and a slug is the component name in kebab case;
// a renamed or removed primitive's old slug lands on the page that took it over.
const REDIRECTS: Record<string, string> = {
  foundations: "foundations/color",
  palette: "foundations/color",
  tokens: "foundations/color",
  iconbutton: "icon-button",
  toggleable: "selectable",
  "toggle-group": "selectable-group",
  overlay: "floating",
  hoverable: "surface",
};

const handle = (own: SiteHandle) => own;

export const routes: RouteObject[] = [
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <Home />, handle: handle({ frame: "full" }) },
      { path: "demo", element: <Demo />, handle: handle({ title: "데모", chrome: "none" }) },
      {
        path: "playground",
        handle: handle({ sidebar: "playground" }),
        children: [
          { index: true, element: <Overview />, handle: handle({ title: "Playground" }) },
          ...Object.entries(REDIRECTS).map(([from, to]): RouteObject => ({ path: from, element: <Navigate to={`/playground/${to}`} replace /> })),
          { path: "foundations/:section", element: <Foundations />, handle: handle({ title: (params) => FOUNDATIONS.find(({ id }) => id === params.section)?.label }) },
          { path: ":slug", element: <ComponentDetail />, handle: handle({ title: (params) => NAMES.get(params.slug ?? "") }) },
        ],
      },
      { path: "docs/*", element: <Docs />, handle: handle({ sidebar: "docs", title: (params) => DOCS.find(({ slug }) => slug === (params["*"] ?? "").replace(/\/$/, ""))?.title }) },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];
