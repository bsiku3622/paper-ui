import { Divider, Inline, Stack, Text, type DividerProps } from "@studio-baeks/paper-ui";

import { defineSpec, enumControl, pick, vocab } from "../schema";
import { pick as inLocale } from "../../../site/locale";

const WORDS = {
  ko: { left: "왼", right: "오", top: "위", bottom: "아래" },
  en: { left: "L", right: "R", top: "Top", bottom: "Bottom" },
};

export default defineSpec({
  name: "Divider",
  blurb: { ko: "아주 옅은 괘선입니다. orientation으로 가로·세로를, level로 선의 색(base·strong)을 고릅니다. 두께는 border stroke가 정하고, 선은 border로 그어 OS가 색을 정하는 모드에서도 남습니다. 선이 꼭 필요한 자리에만 씁니다.", en: "A very faint rule. orientation picks horizontal or vertical, level picks the line colour (base, strong). The border stroke sets its thickness, and it is drawn as a border so it stays in modes where the OS picks colours. Use it only where a line is needed." },
  controls: [
    enumControl<DividerProps, "orientation">("orientation", vocab("ORIENTATIONS")),
    enumControl<DividerProps, "level">("level", vocab("DIVIDER_LEVELS")),
  ],
  defaults: { orientation: "horizontal", level: "base" },
  sheet: { matrix: { rows: "level", columns: "orientation" } },
  subject: (state, _harness, locale) => {
    const w = inLocale(WORDS, locale);
    const orientation = pick<NonNullable<DividerProps["orientation"]>>(state, "orientation");
    const level = pick<NonNullable<DividerProps["level"]>>(state, "level");
    return orientation === "vertical" ? (
      <Inline gap="md" align="center" height="3rem">
        <Text variant="body" as="span">{w.left}</Text>
        <Divider orientation="vertical" level={level} />
        <Text variant="body" as="span">{w.right}</Text>
      </Inline>
    ) : (
      <Stack gap="md" width="18rem">
        <Text variant="body" as="span">{w.top}</Text>
        <Divider orientation={orientation} level={level} />
        <Text variant="body" as="span">{w.bottom}</Text>
      </Stack>
    );
  },
});
