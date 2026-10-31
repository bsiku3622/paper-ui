import { Divider, Inline, Stack, Text, type DividerProps } from "@studio-baeks/paper-ui";

import { defineSpec, enumControl, pick, vocab } from "../schema";

export default defineSpec({
  name: "Divider",
  blurb: "아주 옅은 괘선입니다. orientation으로 가로·세로를, level로 선의 색(base·strong)을 고릅니다. 두께는 border stroke가 정하고, 선은 border로 그어 OS가 색을 정하는 모드에서도 남습니다. 선이 꼭 필요한 자리에만 씁니다.",
  controls: [
    enumControl<DividerProps, "orientation">("orientation", vocab("ORIENTATIONS")),
    enumControl<DividerProps, "level">("level", vocab("DIVIDER_LEVELS")),
  ],
  defaults: { orientation: "horizontal", level: "base" },
  subject: (state) => {
    const orientation = pick<NonNullable<DividerProps["orientation"]>>(state, "orientation");
    const level = pick<NonNullable<DividerProps["level"]>>(state, "level");
    return orientation === "vertical" ? (
      <Inline gap="md" align="center" height="3rem">
        <Text variant="body" as="span">왼</Text>
        <Divider orientation="vertical" level={level} />
        <Text variant="body" as="span">오</Text>
      </Inline>
    ) : (
      <Stack gap="md" width="18rem">
        <Text variant="body" as="span">위</Text>
        <Divider orientation={orientation} level={level} />
        <Text variant="body" as="span">아래</Text>
      </Stack>
    );
  },
});
