// SiteLayout — the layout route every page sits in. It owns what a page must not remember: the skip link, the
// header, the sidebar and the one <main id="main">, the loading state under the chrome, the scroll on navigation
// and the title of the tab. What a page needs from it is said by the route's SiteHandle.
//
// A page with chrome 'none' (the Demo) is a product of its own: the shell keeps the skip link, the loading state and
// the title, and the page draws its own banner and its own <main id="main" tabIndex={-1}>.

import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

import { Box, Link, Text, VisuallyHidden, surfaceClass } from "@studio-baeks/paper-ui";

import { DocsNav } from "../docs/DocsNav";
import { joinClass } from "../joinClass";
import { PlaygroundNav } from "../playground/PlaygroundNav";
import { useDocumentTitle, useSiteHandle } from "./handle";
import { useWords } from "./locale";
import { SiteHeader } from "./SiteHeader";
import * as s from "./shell.css";

const SKIP = { ko: "본문으로 건너뛰기", en: "Skip to content" } as const;
const LOADING = { ko: "불러오는 중…", en: "Loading…" } as const;

// Hidden until its link has focus, then a raised plate at the top left, at the toast tier so nothing covers it.
const SkipLink = () => (
  <VisuallyHidden focusable className={`${surfaceClass({ fill: "raised", border: true, elevation: "toast" })} ${s.skipLink}`}>
    <Link href="#main" underline="hover" className={s.navLink.plain}>{useWords(SKIP)}</Link>
  </VisuallyHidden>
);

const PageLoading = () => (
  <Box paddingX="xl" paddingY="xl">
    <Text variant="caption">{useWords(LOADING)}</Text>
  </Box>
);

export const SiteLayout = () => {
  const { title, chrome, sidebar, frame } = useSiteHandle();
  useDocumentTitle(title);

  const page = (
    <Suspense fallback={<PageLoading />}>
      <Outlet />
    </Suspense>
  );

  return (
    <>
      <SkipLink />
      {chrome === "none" ? page : (
        <div className={joinClass(s.frameScope, sidebar && s.wideFrame)}>
          <SiteHeader />
          {sidebar ? (
            <div className={s.sidebarFrame}>
              {sidebar === "docs" ? <DocsNav /> : <PlaygroundNav />}
              <main id="main" tabIndex={-1} className={s.content}>{page}</main>
            </div>
          ) : (
            <main id="main" tabIndex={-1} className={frame === "full" ? undefined : s.frame}>{page}</main>
          )}
        </div>
      )}
      <ScrollRestoration />
    </>
  );
};
