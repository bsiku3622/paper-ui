// The route table. One layout route, SiteLayout, holds every page; each route's `handle` (SiteHandle) says what
// the shell does around it. Pages load lazily, under the shell's chrome.

import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { DOCS } from "virtual:paper-docs";

import type { SiteHandle } from "./site/handle";
import type { SiteLocale } from "./site/locale";
import { DOC_GROUPS, FOUNDATIONS, PLAYGROUND_NAV } from "./site/site-map";
import { SiteLayout } from "./site/SiteLayout";

// Every group's overview is a README headed Overview; in a tab or in history, its group tells them apart.
const docTitle = (path: string, locale: SiteLocale) => {
  const doc = DOCS.find(({ slug }) => slug === path);
  const group = DOC_GROUPS.find(({ id }) => id !== "" && id === path);
  const title = doc && (locale === "en" ? (doc.titleEn ?? doc.title) : doc.title);
  return doc && group ? `${locale === "ko" ? group.ko : group.label} ${title}` : title;
};

const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const Showcase = lazy(() => import("./pages/showcase/Showcase").then((m) => ({ default: m.Showcase })));
const Demo = lazy(() => import("./pages/demo/Demo").then((m) => ({ default: m.Demo })));
const DashboardScreen = lazy(() => import("./pages/demo/DashboardScreen").then((m) => ({ default: m.DashboardScreen })));
const OverviewScreen = lazy(() => import("./pages/demo/OverviewScreen").then((m) => ({ default: m.OverviewScreen })));
const ProjectsScreen = lazy(() => import("./pages/demo/ProjectsScreen").then((m) => ({ default: m.ProjectsScreen })));
const ProjectScreen = lazy(() => import("./pages/demo/ProjectsScreen").then((m) => ({ default: m.ProjectScreen })));
const DeployScreen = lazy(() => import("./pages/demo/DeployScreen").then((m) => ({ default: m.DeployScreen })));
const DeploymentScreen = lazy(() => import("./pages/demo/DeployScreen").then((m) => ({ default: m.DeploymentScreen })));
const MonitoringScreen = lazy(() => import("./pages/demo/MonitoringScreen").then((m) => ({ default: m.MonitoringScreen })));
const BillingScreen = lazy(() => import("./pages/demo/BillingScreen").then((m) => ({ default: m.BillingScreen })));
const SecurityScreen = lazy(() => import("./pages/demo/SecurityScreen").then((m) => ({ default: m.SecurityScreen })));
const DocsScreen = lazy(() => import("./pages/demo/DocsScreen").then((m) => ({ default: m.DocsScreen })));
const ArticleScreen = lazy(() => import("./pages/demo/DocsScreen").then((m) => ({ default: m.ArticleScreen })));
const SearchScreen = lazy(() => import("./pages/demo/SearchScreen").then((m) => ({ default: m.SearchScreen })));
const LoginScreen = lazy(() => import("./pages/demo/LoginScreen").then((m) => ({ default: m.LoginScreen })));
const SettingsScreen = lazy(() => import("./pages/demo/SettingsScreen").then((m) => ({ default: m.SettingsScreen })));
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
      {
        path: "demo",
        handle: handle({ title: { ko: "데모", en: "Demo" }, chrome: "none" }),
        children: [
          // The showcase: the demo apps, one at a time, in a frame.
          { index: true, element: <Showcase />, handle: handle({ title: { ko: "데모", en: "Demo" } }) },
          // Arcfield: the demo's own screens, which the showcase shows.
          {
            path: "arcfield",
            element: <Demo />,
            children: [
              // The dashboard is one frame (the sidebar, the bar, what its pages share) and each page is a route inside it.
              {
                element: <DashboardScreen />,
                children: [
                  { index: true, element: <OverviewScreen /> },
                  { path: "projects", element: <ProjectsScreen />, handle: handle({ title: "프로젝트와 자원 데모" }) },
                  { path: "projects/:projectId", element: <ProjectScreen />, handle: handle({ title: "프로젝트 데모" }) },
                  { path: "deploy", element: <DeployScreen />, handle: handle({ title: "배포 데모" }) },
                  { path: "deploy/:deployId", element: <DeploymentScreen />, handle: handle({ title: "배포 상세 데모" }) },
                  { path: "monitoring", element: <MonitoringScreen />, handle: handle({ title: "모니터링 데모" }) },
                  { path: "billing", element: <BillingScreen />, handle: handle({ title: "비용과 결제 데모" }) },
                  { path: "security", element: <SecurityScreen />, handle: handle({ title: "보안과 접근 데모" }) },
                  { path: "docs", element: <DocsScreen />, handle: handle({ title: "문서 데모" }) },
                  { path: "docs/:slug", element: <ArticleScreen />, handle: handle({ title: "문서 읽기 데모" }) },
                  { path: "search", element: <SearchScreen />, handle: handle({ title: "검색 데모" }) },
                ],
              },
              // The sign-in and the settings form are screens of their own: the dashboard's sidebar and bar are not around them.
              { path: "login", element: <LoginScreen />, handle: handle({ title: "로그인 데모" }) },
              { path: "settings", element: <SettingsScreen />, handle: handle({ title: "설정 폼 데모" }) },
            ],
          },
        ],
      },
      {
        path: "playground",
        handle: handle({ sidebar: "playground" }),
        children: [
          { index: true, element: <Overview />, handle: handle({ title: { ko: "플레이그라운드", en: "Playground" } }) },
          ...Object.entries(REDIRECTS).map(([from, to]): RouteObject => ({ path: from, element: <Navigate to={`/playground/${to}`} replace /> })),
          { path: "foundations/:section", element: <Foundations />, handle: handle({ title: (params) => FOUNDATIONS.find(({ id }) => id === params.section)?.label }) },
          { path: ":slug", element: <ComponentDetail />, handle: handle({ title: (params) => NAMES.get(params.slug ?? "") }) },
        ],
      },
      { path: "docs/*", element: <Docs />, handle: handle({ sidebar: "docs", title: (params, locale) => docTitle((params["*"] ?? "").replace(/\/$/, ""), locale) }) },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
];
