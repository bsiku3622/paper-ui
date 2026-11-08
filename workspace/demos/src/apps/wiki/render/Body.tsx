// Body.tsx — an article laid out the way a wiki lays it out: the category line, notes, the lead beside the infobox, the table of
// contents, then numbered sections that fold, then the footnotes. One component draws an article, an old revision and the
// editor's preview.

import { useState, type ReactNode } from "react";

import { Divider, Grid, Stack } from "@studio-baeks/paper-ui";

import type { Block, Inline, Parsed } from "../lib/markup";
import { inlineText } from "../lib/markup";
import { CategoryBox, CodeBlock, Figure, Footnotes, HeadingRow, InfoBox, ListView, NavBox, Note, Paragraph, Quote, TableView, Toc } from "./blocks";
import type { InlineCtx } from "./Inlines";

type Plain = Exclude<Block, { t: "h" }>;
const isPlain = (block: Block): block is Plain => block.t !== "h";

const BlockView = ({ block, ctx }: { block: Plain; ctx: InlineCtx }) => {
  switch (block.t) {
    case "p":
      return <Paragraph nodes={block.c} ctx={ctx} />;
    case "list":
      return <ListView list={block} ctx={ctx} />;
    case "quote":
      return <Quote nodes={block.c} ctx={ctx} />;
    case "hr":
      return <Divider />;
    case "code":
      return <CodeBlock lang={block.lang} source={block.v} />;
    case "table":
      return <TableView block={block} ctx={ctx} />;
    case "note":
      return <Note kind={block.kind} nodes={block.c} ctx={ctx} />;
    case "figure":
      return <Figure block={block} ctx={ctx} />;
    case "infobox":
      return <InfoBox block={block} ctx={ctx} />;
    case "navbox":
      return <NavBox block={block} ctx={ctx} />;
  }
};

// Roughly how tall a block stands in the lead column (px), to decide how many sections can sit beside a tall infobox instead of
// leaving a hole under the table of contents. It only has to be about right.
const textLines = (nodes: readonly Inline[], perLine: number) => Math.max(1, Math.ceil(inlineText(nodes).length / perLine));
const heightOf = (block: Block): number => {
  switch (block.t) {
    case "h":
      return 56;
    case "p":
      return textLines(block.c, 42) * 24 + 16;
    case "list":
      return block.items.reduce((sum, item) => sum + textLines(item.c, 40) * 24 + 4 + (item.sub ? heightOf(item.sub) : 0), 16);
    case "quote":
      return textLines(block.c, 40) * 24 + 24;
    case "table":
      return (block.rows.length + (block.head ? 1 : 0)) * 38 + 16;
    case "note":
      return textLines(block.c, 70) * 20 + 24;
    case "figure":
      return 290;
    case "code":
      return block.v.split("\n").length * 20 + 56;
    case "hr":
      return 17;
    case "navbox":
      return block.rows.length * 40 + 56;
    case "infobox":
      return 56 + (block.picture ? 290 : 0) + block.rows.length * 37;
  }
};

type Group = { order: number; key: string; items: ReactNode[] };

export const Body = ({ parsed, title, ctx, editable = false, compact = false }: { parsed: Parsed; title: string; ctx: InlineCtx; editable?: boolean; compact?: boolean }) => {
  const [folded, setFolded] = useState<Record<string, boolean>>({});

  const first = parsed.blocks.findIndex((block) => block.t === "h");
  const lead = (first < 0 ? parsed.blocks : parsed.blocks.slice(0, first)).filter(isPlain);
  const rest = first < 0 ? [] : parsed.blocks.slice(first);

  // Notes that open the article stand above everything; the infobox goes beside the lead.
  let lifted = 0;
  while (lead[lifted]?.t === "note") lifted++;
  const notes = lead.slice(0, lifted);
  const infobox = lead.find((block) => block.t === "infobox");
  const main = lead.slice(lifted).filter((block) => block !== infobox);
  const toc = parsed.toc.length >= 2 ? <Toc entries={parsed.toc} /> : null;
  const beside = !compact && infobox !== undefined;

  // How many of the first sections fit in the lead column before the infobox ends.
  const sectionsBeside = (() => {
    if (!beside || !infobox) return 0;
    const target = heightOf(infobox);
    let left = main.reduce((sum, block) => sum + heightOf(block), 0) + (parsed.toc.length >= 2 ? 60 + parsed.toc.length * 24 : 0);
    let count = 0;
    let at = 0;
    while (at < rest.length) {
      let end = at + 1;
      while (end < rest.length && rest[end]!.t !== "h") end++;
      const height = rest.slice(at, end).reduce((sum, block) => sum + heightOf(block), 0);
      if (left + height / 2 > target) break;
      left += height;
      count++;
      at = end;
    }
    return count;
  })();

  const groups: Group[] = [];
  let hideBelow: number | null = null;
  let order = 0;
  for (const [index, block] of rest.entries()) {
    if (block.t === "h") {
      order++;
      if (hideBelow !== null && block.level > hideBelow) continue;
      hideBelow = null;
      const open = !folded[block.id];
      if (!open) hideBelow = block.level;
      groups.push({
        order,
        key: block.id,
        items: [<HeadingRow key="head" block={block} open={open} onToggle={() => setFolded({ ...folded, [block.id]: open })} section={editable} title={title} ctx={ctx} />],
      });
    } else if (hideBelow === null) {
      groups[groups.length - 1]?.items.push(<BlockView key={index} block={block} ctx={ctx} />);
    }
  }
  const sectionView = (list: readonly Group[]) =>
    list.map((group) => (
      <Stack key={group.key} gap="md">
        {group.items}
      </Stack>
    ));
  const near = groups.filter((group) => group.order <= sectionsBeside);
  const below = groups.filter((group) => group.order > sectionsBeside);

  const stacked = compact && infobox ? <BlockView block={infobox} ctx={ctx} /> : null;
  const leadColumn =
    main.length > 0 || toc || stacked || near.length > 0 ? (
      <Stack gap="xl" minWidth={0}>
        {main.length > 0 || stacked || toc ? (
          <Stack gap="lg">
            {main.map((block, index) => (
              <BlockView key={index} block={block} ctx={ctx} />
            ))}
            {stacked}
            {toc}
          </Stack>
        ) : null}
        {sectionView(near)}
      </Stack>
    ) : null;

  return (
    <Stack gap="xl">
      {parsed.categories.length > 0 ? <CategoryBox names={parsed.categories} /> : null}
      {notes.length > 0 ? (
        <Stack gap="sm">
          {notes.map((block, index) => (
            <BlockView key={index} block={block} ctx={ctx} />
          ))}
        </Stack>
      ) : null}
      {beside && infobox ? (
        <Grid columns={{ base: "minmax(0, 1fr)", md: "minmax(0, 1fr) 20rem" }} gap="xl" align="start">
          {leadColumn ?? <Stack />}
          <BlockView block={infobox} ctx={ctx} />
        </Grid>
      ) : (
        leadColumn
      )}
      {below.length > 0 ? <Stack gap="xl">{sectionView(below)}</Stack> : null}
      {parsed.footnotes.length > 0 ? <Footnotes items={parsed.footnotes} ctx={ctx} /> : null}
    </Stack>
  );
};
