// The "+ 문서" tile at either end of the row of documents. A dashed face on the canvas (Paper's dashed is "add / drop") that
// is a button by role: Paper's Button cannot be taller than 44, and this tile is a small portrait one, so it is the dashed
// Paint on a Surface (for its corner), pressed by click or by Enter and Space.

import { Paint, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";

export const AddTile = ({ side, onAdd }: { side: "left" | "right"; onAdd: () => void }) => (
  <Paint
    as={Surface}
    accent="primary"
    variant="dashed"
    fill="raised"
    radius="sm"
    hoverable
    paddingX="lg"
    paddingY="lg"
    role="button"
    tabIndex={0}
    aria-label={side === "left" ? "왼쪽에 문서 추가" : "오른쪽에 문서 추가"}
    onClick={onAdd}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onAdd();
      }
    }}
  >
    <Stack align="center" gap="xs">
      <Glyph name="plus" />
      <Text as="span" variant="label" strong={false} ink="tertiary">문서</Text>
    </Stack>
  </Paint>
);
