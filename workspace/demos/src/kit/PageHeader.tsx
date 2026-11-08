// PageHeader — a page's title, what it is for, and what you can do on it. The site shell's measure: a display title,
// a lead line under it.

import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Button, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "./Glyph";

export type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  // Buttons at the end of the title row.
  actions?: ReactNode;
  // A small line above the title: a breadcrumb, a kind ("재생목록"), a status.
  eyebrow?: ReactNode;
  // Under the description: dates, owners, counts.
  meta?: ReactNode;
  back?: { to: string; label: string };
};

export const PageHeader = ({ title, description, actions, eyebrow, meta, back }: PageHeaderProps) => {
  return (
    <Stack gap="md">
      {back ? (
        <Inline>
          <Button as={RouterLink} to={back.to} size="sm" variant="ghost"><Glyph name="arrow-left" />{back.label}</Button>
        </Inline>
      ) : null}
      <Inline justify="between" align="end" gap="lg" wrap>
        <Stack gap="xs" minWidth={0}>
          {eyebrow ? <Text as="span" variant="label" strong={false} ink="tertiary">{eyebrow}</Text> : null}
          <Text as="h1" variant="display" strong>{title}</Text>
          {description ? <Text variant="lead" ink="secondary">{description}</Text> : null}
          {meta ? <Inline gap="md" wrap>{meta}</Inline> : null}
        </Stack>
        {actions ? <Inline gap="sm" wrap>{actions}</Inline> : null}
      </Inline>
    </Stack>
  );
};

// A heading inside a page, with what belongs to it on the right ("모두 보기").
export const SectionHeader = ({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) => (
  <Inline justify="between" align="end" gap="md" wrap>
    <Stack gap="xs" minWidth={0}>
      <Text as="h2" variant="heading">{title}</Text>
      {description ? <Text ink="tertiary">{description}</Text> : null}
    </Stack>
    {actions ? <Inline gap="sm" wrap>{actions}</Inline> : null}
  </Inline>
);
