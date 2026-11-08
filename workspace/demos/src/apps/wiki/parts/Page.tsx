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
  docTitle?: string;
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
