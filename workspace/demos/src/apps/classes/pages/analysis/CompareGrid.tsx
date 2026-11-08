import { Fragment } from "react";

import { Box, Grid, Inline, Paint, Pressable, Stack, Surface, Text } from "@studio-baeks/paper-ui";
import type { Accent } from "@studio-baeks/paper-ui/tokens";

import { DAYS, DAY_LABEL, PERIOD_NUMBERS, type Day } from "../../data/periods";

export type Cell = {
  text?: string;
  sub?: string;
  tone?: "plain" | "strong" | Accent;
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
