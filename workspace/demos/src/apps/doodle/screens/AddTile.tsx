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
