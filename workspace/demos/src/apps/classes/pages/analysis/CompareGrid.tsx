// The week as a grid of days and periods, drawn for the comparison: the same faces as 검색's SlotGrid (ui/parts) with two
// changes the comparison needs.
//
//   - A period you pressed stays marked whatever it was. SlotGrid shows "selected" only on its plain faces, and here most
//     periods are green, blue or amber; the pressed one turns ink.
//   - A long subject is cut with an ellipsis. In SlotGrid the text is the item of a centred column, which keeps its full
//     width and spills out of both sides of a 50px column on a phone; here each line is the item of a row, which shrinks.

import { Fragment } from "react";

import { Box, Grid, Inline, Paint, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { Accent } from "@studio-baeks/paper-ui/tokens";

import { DAYS, DAY_LABEL, PERIOD_NUMBERS, type Day } from "../../data/periods";

export type Cell = {
  text?: string;
  sub?: string;
  // plain is the sunken face, strong is ink (the pressed one), an accent says what the period is.
  tone?: "plain" | "strong" | Accent;
  // Present when the period can be pressed; `pressed` is whether it is the one that is.
  onPress?: () => void;
  pressed?: boolean;
  hint?: string;
};

const Lines = ({ cell }: { cell: Cell }) => (
  <Stack justify="center" gap="xs" height="full" paddingX="xs">
    {[cell.text, cell.sub].map((line, index) =>
      line ? (
        <Inline key={index} justify="center">
          <Text as="span" variant="label" strong={false} ink="inherit" truncate>{line}</Text>
        </Inline>
      ) : null,
    )}
  </Stack>
);

const Face = ({ cell }: { cell: Cell }) => {
  const tone = cell.tone ?? "plain";
  const lines = <Lines cell={cell} />;
  if (tone === "plain") {
    return cell.onPress ? (
      <Surface as={Pressable} fill="sunken" radius="sm" height="full" hoverable onPress={cell.onPress} aria-pressed={cell.pressed ?? false} aria-label={cell.hint}>
        {lines}
      </Surface>
    ) : (
      <Surface fill="sunken" radius="sm" height="full">{lines}</Surface>
    );
  }
  const accent: Accent = tone === "strong" ? "primary" : tone;
  const variant = tone === "strong" ? "solid" : "soft";
  return (
    <Surface radius="sm" overflow="hidden" height="full">
      {cell.onPress ? (
        <Paint as={Pressable} accent={accent} variant={variant} hoverable height="full" width="full" onPress={cell.onPress} aria-pressed={cell.pressed ?? false} aria-label={cell.hint}>
          {lines}
        </Paint>
      ) : (
        <Paint accent={accent} variant={variant} height="full">{lines}</Paint>
      )}
    </Surface>
  );
};

// Five days across, the eleven periods down; `cell` says what is in each.
export const CompareGrid = ({ cell, label }: { cell: (day: Day, period: number) => Cell; label: string }) => (
  <Grid columns="1.5rem repeat(5, minmax(0, 1fr))" rows={`1.5rem repeat(${PERIOD_NUMBERS.length}, 2.5rem)`} gap="xs" role="group" aria-label={label}>
    <Box />
    {DAYS.map((day) => (
      <Inline key={day} justify="center">
        <Text as="span" variant="label" ink="tertiary">{DAY_LABEL[day]}</Text>
      </Inline>
    ))}
    {PERIOD_NUMBERS.map((period) => (
      <Fragment key={period}>
        <Inline justify="center">
          <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{period}</Text>
        </Inline>
        {DAYS.map((day) => (
          <Face key={day} cell={cell(day, period)} />
        ))}
      </Fragment>
    ))}
  </Grid>
);
