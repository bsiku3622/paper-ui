import { Children, type ReactNode } from "react";

import { Box, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";
import type { Status } from "@studio-baeks/paper-ui/tokens";

import { ruleCell, ruleClip, ruleGrid } from "./kit.css";

export type StatProps = {
  label: ReactNode;
  value: ReactNode;
  unit?: ReactNode;
  note?: ReactNode;
  tone?: Status;
  small?: boolean;
};

export const Stat = ({ label, value, unit, note, tone, small = false }: StatProps) => {
  const variant = small ? "heading" : "display";
  return (
    <Stack gap="xs" minWidth={0}>
      <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{label}</Text>
      <Inline gap="xs" align="baseline">
        <Text as="span" variant={variant} numeric ink={tone ?? "primary"}>{value}</Text>
        {unit ? <Text as="span" ink="tertiary">{unit}</Text> : null}
      </Inline>
      {note ? <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{note}</Text> : null}
    </Stack>
  );
};

export const StatRow = ({ children, min = "8rem" }: { children: ReactNode; min?: string }) => (
  <Box className={ruleClip}>
    <Grid columns={`repeat(auto-fit, minmax(${min}, 1fr))`} gap="lg" className={ruleGrid}>
      {Children.toArray(children).map((child, index) => (
        <Box key={index} className={ruleCell} minWidth={0}>{child}</Box>
      ))}
    </Grid>
  </Box>
);
