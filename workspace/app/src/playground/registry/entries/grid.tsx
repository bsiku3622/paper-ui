import { Grid, Surface, Text, type GridProps } from "@studio-baeks/paper-ui";

import { defineSpec, enumControl, pick, sample, vocab } from "../schema";

const CELLS = [1, 2, 3, 4, 5, 6];

export default defineSpec({
  name: "Grid",
  blurb: "Box의 여백·크기·ref 계약에 grid 배치를 더합니다. columns는 양의 정수 또는 CSS track 선언입니다.",
  controls: [
    enumControl<GridProps, "columns">("columns", sample(["1", "2", "3"] as const, "columns takes any positive integer or track list"), { initial: "3" }),
    enumControl<GridProps, "rowGap">("rowGap", vocab("SPACES")),
    enumControl<GridProps, "columnGap">("columnGap", vocab("SPACES")),
    enumControl<GridProps, "align">("align", vocab("ALIGNS")),
    enumControl<GridProps, "justify">("justify", vocab("JUSTIFIES")),
    enumControl<GridProps, "justifyItems">("justifyItems", vocab("JUSTIFY_ITEMS")),
  ],
  defaults: { columns: 1 },
  subject: (state) => {
    const columns = pick(state, "columns");
    return (
      <Grid
        data-testid="grid-example"
        columns={columns === undefined ? undefined : Number(columns)}
        gap="sm"
        rowGap={pick<NonNullable<GridProps["rowGap"]>>(state, "rowGap")}
        columnGap={pick<NonNullable<GridProps["columnGap"]>>(state, "columnGap")}
        align={pick<NonNullable<GridProps["align"]>>(state, "align")}
        justify={pick<NonNullable<GridProps["justify"]>>(state, "justify")}
        justifyItems={pick<NonNullable<GridProps["justifyItems"]>>(state, "justifyItems")}
        width="full"
      >
        {CELLS.map((cell) => (
          <Surface key={cell} border radius="sm" padding="md"><Text>{cell}</Text></Surface>
        ))}
      </Grid>
    );
  },
});
