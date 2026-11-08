// ChartCard — a chart on a card with its table twin one switch away, so every number the chart draws can be read without
// the chart. The switch is the kit's Segmented; the table is the screen's own.

import { useState, type ReactNode } from "react";

import { Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Segmented } from "../../../kit";
import { Card } from "./Card";
import { Hint } from "./Parts";

export const ChartCard = ({ title, description, legend, chart, table }: { title: string; description?: ReactNode; legend?: ReactNode; chart: ReactNode; table: ReactNode }) => {
  const [view, setView] = useState("chart");
  return (
    <Card>
      <Inline justify="between" align="start" gap="md" wrap>
        <Stack gap="xs" minWidth={0}>
          <Text as="h2" variant="subheading">{title}</Text>
          {description ? <Hint>{description}</Hint> : null}
        </Stack>
        <Segmented
          label={`${title} 보기`}
          size="xs"
          value={view}
          onChange={setView}
          options={[{ id: "chart", label: "차트", glyph: "chart-line" }, { id: "table", label: "표", glyph: "table" }]}
        />
      </Inline>
      {view === "chart" ? (
        <Stack gap="lg">
          {legend}
          {chart}
        </Stack>
      ) : (
        table
      )}
    </Card>
  );
};
