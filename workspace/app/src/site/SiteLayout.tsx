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
