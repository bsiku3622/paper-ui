// Page.tsx — the white card every page of the wiki stands in: a title, what you can do with it, then the page. It is the first
// face on the ground, so it takes the shadow (or, on a white page, the line) from the kit.

import { useEffect, type ReactNode } from "react";

import { Stack, Surface } from "@studio-baeks/paper-ui";

import { PageHeader, useFace, type PageHeaderProps } from "../../../kit";
import type { TocEntry } from "../lib/markup";
import { ScrollButtons } from "./ScrollButtons";

export const Card = ({ children, label }: { children: ReactNode; label?: string }) => (
  <Surface as="section" aria-label={label} {...useFace()} radius="lg" padding="xl">
    {children}
  </Surface>
);

type PageProps = PageHeaderProps & {
  // The browser tab's title when the heading is more than text.
  docTitle?: string;
  // Headings of the article, for the contents button beside the scroll buttons.
  toc?: readonly TocEntry[];
  children: ReactNode;
};

export const Page = ({ docTitle, toc, children, ...header }: PageProps) => {
  const name = docTitle ?? (typeof header.title === "string" ? header.title : "");
  useEffect(() => {
    document.title = name ? `${name} - 돌담위키` : "돌담위키";
  }, [name]);
  return (
    <>
      <Card>
        <Stack gap="xl">
          <PageHeader {...header} />
          {children}
        </Stack>
      </Card>
      <ScrollButtons toc={toc} />
    </>
  );
};
