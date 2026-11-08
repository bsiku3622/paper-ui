import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Divider, Grid, IconButton, Inline, Link, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Art, Glyph } from "../../../kit";
import type { Align, Block, Inline as Node, ListBlock, TocEntry } from "../lib/markup";
import { inlineText } from "../lib/markup";
import { categoryPath, editPath } from "../lib/paths";
import { Inlines, type InlineCtx } from "./Inlines";
import { jumpOnClick } from "./jump";

const withVariant = (ctx: InlineCtx, variant: InlineCtx["variant"]): InlineCtx => ({ ...ctx, variant });

export const Paragraph = ({ nodes, ctx }: { nodes: readonly Node[]; ctx: InlineCtx }) => (
  <Text as="p" variant="lead">
    <Inlines nodes={nodes} ctx={withVariant(ctx, "lead")} />
  </Text>
);

const MARKS = ["•", "–", "·"] as const;

export const ListView = ({ list, ctx, depth = 0 }: { list: ListBlock; ctx: InlineCtx; depth?: number }) => (
  <Stack as={list.ordered ? "ol" : "ul"} gap="xs">
    {list.items.map((item, index) => (
      <Stack as="li" key={index} gap="xs">
        {item.c.length > 0 ? (
          <Inline align="baseline" gap="sm">
            <Text as="span" variant="lead" ink="tertiary" numeric>{list.ordered ? `${index + 1}.` : MARKS[depth % MARKS.length]}</Text>
            <Text as="span" variant="lead">
              <Inlines nodes={item.c} ctx={withVariant(ctx, "lead")} />
            </Text>
          </Inline>
        ) : null}
        {item.sub ? (
          <Box paddingX="lg">
            <ListView list={item.sub} ctx={ctx} depth={depth + 1} />
          </Box>
        ) : null}
      </Stack>
    ))}
  </Stack>
);

export const Quote = ({ nodes, ctx }: { nodes: readonly Node[]; ctx: InlineCtx }) => (
  <Surface border="start" paddingX="lg" paddingY="xs">
    <Text as="p" variant="lead" ink="secondary">
      <Inlines nodes={nodes} ctx={withVariant(ctx, "lead")} />
    </Text>
  </Surface>
);

export const Note = ({ kind, nodes, ctx }: { kind: "ref" | "warn" | "info"; nodes: readonly Node[]; ctx: InlineCtx }) => {
  const text = (
    <Text as="p" variant="body">
      <Inlines nodes={nodes} ctx={withVariant(ctx, "body")} />
    </Text>
  );
  if (kind === "ref") {
    return (
      <Inline gap="sm" align="start">
        <Glyph name="circle-arrow-right" size="subheading" ink="info" />
        {text}
      </Inline>
    );
  }
  return (
    <Surface fill="sunken" radius="md" padding="md">
      <Inline gap="sm" align="start">
        <Glyph name={kind === "warn" ? "circle-alert" : "info"} size="subheading" ink={kind === "warn" ? "warning" : "secondary"} />
        {text}
      </Inline>
    </Surface>
  );
};

export const CodeBlock = ({ lang, source }: { lang: string; source: string }) => (
  <Surface fill="sunken" radius="md" padding="md" overflowX="auto">
    <Stack gap="xs">
      {lang ? <Text as="span" variant="label" ink="tertiary" strong={false}>{lang}</Text> : null}
      <Text as="pre" family="mono" variant="caption">{source}</Text>
    </Stack>
  </Surface>
);

export const Figure = ({ block, ctx }: { block: Extract<Block, { t: "figure" }>; ctx: InlineCtx }) => (
  <Stack role="figure" aria-label={inlineText(block.caption) || block.seed} gap="xs" maxWidth="measure.xs">
    <Art seed={block.seed} kind={block.kind} ratio={block.ratio} radius="md" />
    {block.caption.length > 0 ? (
      <Text as="p" variant="caption" ink="tertiary">
        <Inlines nodes={block.caption} ctx={withVariant(ctx, "caption")} />
      </Text>
    ) : null}
  </Stack>
);

const ALIGN: Record<Align, "start" | "center" | "end"> = { start: "start", center: "center", end: "end" };

export const TableView = ({ block, ctx }: { block: Extract<Block, { t: "table" }>; ctx: InlineCtx }) => {
  const width = block.align.length;
  const all = [...(block.head ? [block.head] : []), ...block.rows];
  const weights = Array.from({ length: width }, (_, c) => {
    const longest = Math.max(...all.map((row) => inlineText(row[c] ?? []).length), 1);
    return Math.min(24, Math.max(6, Math.round(Math.sqrt(longest) * 4)));
  });
  const columns = weights.map((weight) => `minmax(0, ${weight}fr)`).join(" ");
  const body = withVariant(ctx, "body");
  const cell = (nodes: Node[], c: number, head: boolean) => (
    <Box key={c} role={head ? "columnheader" : "cell"} paddingX="md" paddingY="sm" minWidth={0}>
      <Stack align={ALIGN[block.align[c] ?? "start"]}>
        <Text as="span" variant="body" strong={head ? true : undefined}>
          <Inlines nodes={nodes} ctx={body} />
        </Text>
      </Stack>
    </Box>
  );
  return (
    <Box overflowX="auto" role="region" aria-label="표" tabIndex={0}>
      <Surface border radius="md" overflow="hidden" role="table" minWidth={width >= 5 ? "measure.md" : width === 4 ? "xl" : undefined}>
        {block.head ? (
          <Surface as={Grid} role="row" fill="sunken" columns={columns}>
            {block.head.map((nodes, c) => cell(nodes, c, true))}
          </Surface>
        ) : null}
        {block.rows.map((row, r) => (
          <Surface as={Grid} key={r} role="row" border={block.head || r > 0 ? "top" : undefined} columns={columns}>
            {row.map((nodes, c) => cell(nodes, c, false))}
          </Surface>
        ))}
      </Surface>
    </Box>
  );
};

export const InfoBox = ({ block, ctx }: { block: Extract<Block, { t: "infobox" }>; ctx: InlineCtx }) => {
  const caption = withVariant(ctx, "caption");
  const body = withVariant(ctx, "body");
  return (
    <Surface border radius="md" overflow="hidden" role="group" aria-label={`${block.title} 정보`}>
      <Surface fill="sunken" padding="md">
        <Stack align="center">
          <Text as="p" variant="subheading">{block.title}</Text>
        </Stack>
      </Surface>
      {block.picture ? (
        <Stack gap="xs" padding="md">
          <Art seed={block.picture.seed} kind="photo" ratio="4 / 3" radius="sm" />
          {block.picture.caption.length > 0 ? (
            <Stack align="center">
              <Text as="p" variant="caption" ink="tertiary">
                <Inlines nodes={block.picture.caption} ctx={caption} />
              </Text>
            </Stack>
          ) : null}
        </Stack>
      ) : null}
      {block.rows.map((row, index) => (
        <Surface as={Grid} key={index} border="top" columns="minmax(0, 1fr) minmax(0, 2fr)" columnGap="md" paddingX="md" paddingY="sm">
          <Text as="span" variant="caption" ink="tertiary">{row.k}</Text>
          <Text as="span" variant="body">
            <Inlines nodes={row.c} ctx={body} />
          </Text>
        </Surface>
      ))}
    </Surface>
  );
};

export const NavBox = ({ block, ctx }: { block: Extract<Block, { t: "navbox" }>; ctx: InlineCtx }) => {
  const [open, setOpen] = useState(true);
  const body = { ...withVariant(ctx, "body"), underline: "hover" as const };
  return (
    <Surface border radius="md" overflow="hidden" role="group" aria-label={block.title}>
      <Surface fill="sunken" paddingX="md" paddingY="xs">
        <Inline justify="between" align="center" gap="md">
          <Text as="p" variant="subheading">{block.title}</Text>
          <Button size="xs" variant="ghost" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? "접기" : "펼치기"}
            <Glyph name={open ? "chevron-up" : "chevron-down"} />
          </Button>
        </Inline>
      </Surface>
      {open
        ? block.rows.map((row, index) => (
            <Surface as={Grid} key={index} border="top" columns={{ base: "minmax(0, 1fr)", md: "7rem minmax(0, 1fr)" }} gap="xs" columnGap="md" paddingX="md" paddingY="sm">
              <Text as="span" variant="caption" ink="tertiary" strong>{row.k}</Text>
              <Text as="span" variant="body">
                <Inlines nodes={row.c} ctx={body} />
              </Text>
            </Surface>
          ))
        : null}
    </Surface>
  );
};

export const CategoryBox = ({ names }: { names: readonly string[] }) => (
  <Surface border radius="sm" paddingX="md" paddingY="sm" role="group" aria-label="분류">
    <Inline gap="md" align="center" wrap>
      <Text as="span" variant="caption" ink="tertiary" strong>분류</Text>
      {names.map((name, index) => (
        <Inline key={name} gap="md" align="stretch">
          {index > 0 ? <Divider orientation="vertical" /> : null}
          <Link as={RouterLink} to={categoryPath(name)} underline="hover">{name}</Link>
        </Inline>
      ))}
    </Inline>
  </Surface>
);

const INDENT = { 2: undefined, 3: "md", 4: "xl" } as const;

export const Toc = ({ entries }: { entries: readonly TocEntry[] }) => {
  const [open, setOpen] = useState(true);
  const items = entries.map((entry) => (
    <Box as="li" key={entry.id} paddingX={INDENT[entry.level]}>
      <Link href={`#${entry.id}`} underline="hover" onClick={jumpOnClick(entry.id)}>
        <Text as="span" variant="body" ink="inherit">{entry.num}. {entry.text}</Text>
      </Link>
    </Box>
  ));
  return (
    <Surface id="toc" as="nav" aria-label="목차" border radius="md" padding="md" width="fit" minWidth="md" maxWidth="full">
      <Stack gap="sm">
        <Inline justify="between" align="center" gap="lg">
          <Text as="p" variant="subheading">목차</Text>
          <IconButton size="xs" variant="ghost" aria-label={open ? "목차 접기" : "목차 펼치기"} aria-expanded={open} onClick={() => setOpen(!open)}>
            <Glyph name={open ? "chevron-up" : "chevron-down"} />
          </IconButton>
        </Inline>
        {open ? (
          entries.length > 14 ? (
            <Grid as="ol" autoFlow="column" rows={Math.ceil(entries.length / 2)} columnGap="xl" rowGap="xs">
              {items}
            </Grid>
          ) : (
            <Stack as="ol" gap="xs">
              {items}
            </Stack>
          )
        ) : null}
      </Stack>
    </Surface>
  );
};

const HEADING_SIZE = { 2: "title", 3: "heading", 4: "subheading" } as const;

export const HeadingRow = ({ block, open, onToggle, section, title, ctx }: {
  block: Extract<Block, { t: "h" }>;
  open: boolean;
  onToggle: () => void;
  section?: boolean;
  title: string;
  ctx: InlineCtx;
}) => (
  <Stack gap="sm">
    <Inline justify="between" align="center" gap="md">
      <Inline id={block.id} gap="sm" align="center" minWidth={0}>
        <IconButton size="xs" variant="ghost" aria-label={`${block.num}. ${block.text} ${open ? "접기" : "펼치기"}`} aria-expanded={open} onClick={onToggle}>
          <Glyph name={open ? "chevron-down" : "chevron-right"} />
        </IconButton>
        <Text as={`h${block.level}`} variant={HEADING_SIZE[block.level]}>
          <Link href="#toc" underline="hover" onClick={jumpOnClick("toc")}>{block.num}.</Link> <Inlines nodes={block.c} ctx={withVariant(ctx, HEADING_SIZE[block.level])} />
        </Text>
      </Inline>
      {section ? (
        <Link as={RouterLink} to={editPath(title, block.section)} underline="hover" aria-label={`${block.text} 절 편집`}>
          <Text as="span" variant="label" ink="inherit" strong={false}>[편집]</Text>
        </Link>
      ) : null}
    </Inline>
    {block.level === 2 ? <Divider /> : null}
  </Stack>
);

export const Footnotes = ({ items, ctx }: { items: readonly Node[][]; ctx: InlineCtx }) => {
  const small = withVariant(ctx, "caption");
  return (
    <Stack gap="sm" role="region" aria-label="각주" id="footnotes">
      <Divider />
      <Text as="h2" variant="heading">각주</Text>
      <Stack as="ol" gap="xs">
        {items.map((nodes, index) => (
          <Inline as="li" key={index} id={`fn-${index + 1}`} gap="sm" align="baseline">
            <Link href={`#fnref-${index + 1}`} underline="hover" onClick={jumpOnClick(`fnref-${index + 1}`)} aria-label={`본문 ${index + 1}번 표시로 돌아가기`}>
              <Text as="span" variant="caption" ink="inherit" numeric>[{index + 1}]</Text>
            </Link>
            <Text as="span" variant="caption" ink="secondary">
              <Inlines nodes={nodes} ctx={small} />
            </Text>
          </Inline>
        ))}
      </Stack>
    </Stack>
  );
};
