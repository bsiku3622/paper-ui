// DiffView.tsx — two texts set against each other, line by line and then word by word: two columns (before | after) or one.
// Removed and added lines take the soft error and success faces; unchanged stretches fold into “… 12줄 변경 없음 …”.

import { useMemo, type ReactNode } from "react";

import { Box, Grid, Paint, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty } from "../../../kit";
import { diffRows, diffWords, type Seg } from "../lib/diff";

type Tone = "del" | "add";

const Words = ({ segs, tone }: { segs: readonly Seg[]; tone: Tone }) => (
  <>
    {segs.map((seg, index) =>
      seg.changed ? (
        <Text as={tone === "del" ? "del" : "ins"} key={index} variant="caption" family="mono" ink={tone === "del" ? "error" : "success"} strong>{seg.text}</Text>
      ) : (
        <Text as="span" key={index} variant="caption" family="mono" ink="primary">{seg.text}</Text>
      ),
    )}
  </>
);

const Cell = ({ no, tone, children }: { no: number | null; tone?: Tone; children: ReactNode }) => {
  const inner = (
    <Grid columns="2.5rem minmax(0, 1fr)" gap="sm" paddingX="sm" paddingY="xs" align="baseline">
      <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{no ?? ""}</Text>
      <Text as="span" variant="caption" family="mono" ink="primary">{children}</Text>
    </Grid>
  );
  if (!tone) return inner;
  return (
    <Paint accent={tone === "del" ? "error" : "success"} variant="soft">
      {inner}
    </Paint>
  );
};

export const DiffView = ({ before, after, layout }: { before: string; after: string; layout: "split" | "unified" }) => {
  const rows = useMemo(() => diffRows(before, after), [before, after]);
  if (rows.every((row) => row.kind !== "change")) {
    return <Empty glyph="check" title="바뀐 내용이 없습니다" description="두 판의 글이 같습니다." />;
  }
  return (
    <Surface border radius="md" overflow="hidden">
      {rows.map((row, index) => {
        const edge = index > 0 ? ("top" as const) : undefined;
        if (row.kind === "gap") {
          return (
            <Surface key={index} fill="sunken" border={edge} paddingX="md" paddingY="xs">
              <Text as="p" variant="label" strong={false} ink="tertiary">… {row.count}줄 변경 없음 …</Text>
            </Surface>
          );
        }
        if (row.kind === "same") {
          return layout === "split" ? (
            <Surface as={Grid} key={index} border={edge} columns={{ base: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }}>
              <Cell no={row.oldNo}>{row.text}</Cell>
              <Box hideBelow="md"><Cell no={row.newNo}>{row.text}</Cell></Box>
            </Surface>
          ) : (
            <Surface key={index} border={edge}>
              <Cell no={row.newNo}>{row.text}</Cell>
            </Surface>
          );
        }
        const words = row.old !== null && row.next !== null ? diffWords(row.old, row.next) : null;
        const oldNode = row.old === null ? null : <Words segs={words ? words.old : [{ text: row.old, changed: false }]} tone="del" />;
        const newNode = row.next === null ? null : <Words segs={words ? words.next : [{ text: row.next, changed: false }]} tone="add" />;
        if (layout === "split") {
          return (
            <Surface as={Grid} key={index} border={edge} columns={{ base: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }}>
              {oldNode ? <Cell no={row.oldNo} tone="del">{oldNode}</Cell> : <Box hideBelow="md" />}
              {newNode ? <Cell no={row.newNo} tone="add">{newNode}</Cell> : <Box hideBelow="md" />}
            </Surface>
          );
        }
        return (
          <Surface key={index} border={edge}>
            {oldNode ? <Cell no={row.oldNo} tone="del">{oldNode}</Cell> : null}
            {newNode ? <Cell no={row.newNo} tone="add">{newNode}</Cell> : null}
          </Surface>
        );
      })}
    </Surface>
  );
};
