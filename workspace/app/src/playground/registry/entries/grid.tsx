import { Box, Grid, Text, type GridProps } from "@studio-baeks/paper-ui";

import { defineSpec, enumControl, pick, sample } from "../schema";

const CELLS = [1, 2, 3, 4, 5, 6];

export default defineSpec({
  name: "Grid",
  blurb: "Box의 면·간격·ref 계약에 grid 배치를 더합니다. columns는 양의 정수 또는 CSS track 선언입니다.",
  controls: [
    enumControl<GridProps, "columns">("columns", sample(["1", "2", "3"] as const, "columns takes any positive integer or track list"), { initial: "3" }),
  ],
  defaults: { columns: 1 },
  subject: (state) => {
    const columns = pick(state, "columns");
    return (
      <Grid data-testid="grid-example" columns={columns === undefined ? undefined : Number(columns)} gap="sm" width="full">
        {CELLS.map((cell) => (
          <Box key={cell} border radius="sm" padding="md"><Text>{cell}</Text></Box>
        ))}
      </Grid>
    );
  },
});
