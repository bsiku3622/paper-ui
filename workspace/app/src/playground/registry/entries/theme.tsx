import { Box, Button, Inline, Stack, Text, useResolvedTheme, useTheme, type BoxProps } from "@studio-baeks/paper-ui";
import { THEME_PREFERENCES } from "@studio-baeks/paper-ui/tokens";

import { named } from "../jsx";
import { defineSpec, enumControl, pick, vocab } from "../schema";

// Reads the theme the nearest Box theme resolved.
const ScopeReadout = () => {
  const resolved = useResolvedTheme();
  return <Text variant="caption">useResolvedTheme(): {resolved}</Text>;
};

export default defineSpec({
  name: "Theme",
  blurb: "Box의 theme은 하위 트리 하나에 테마를 겁니다. useTheme은 사용자의 선택과 적용된 값을 읽고 바꾸고, useResolvedTheme은 가장 가까운 theme이 정한 값을 읽습니다.",
  controls: [
    enumControl<BoxProps, "theme">("theme", vocab("BOX_THEMES"), { target: "Box", initial: "inverse", required: true }),
  ],
  defaults: {},
  parts: {
    ScopeReadout: named(
      `const ScopeReadout = () => {
  const resolved = useResolvedTheme();
  return <Text variant="caption">useResolvedTheme(): {resolved}</Text>;
};`,
      ScopeReadout,
    ),
  },
  useHarness: useTheme,
  subject: (state) => (
    <Box theme={pick<NonNullable<BoxProps["theme"]>>(state, "theme") ?? "inverse"} border radius="md" padding="md">
      <ScopeReadout />
    </Box>
  ),
  Stage: ({ subject, harness }) => (
    <Stack gap="md" align="start">
      {subject}
      <Text as="output" variant="caption" family="mono">useTheme(): theme={harness.theme}, resolved={harness.resolved}</Text>
      <Inline gap="sm">
        {THEME_PREFERENCES.map((preference) => (
          <Button key={preference} size="sm" variant="hairline" aria-pressed={harness.theme === preference} onClick={() => harness.setTheme(preference)}>{preference}</Button>
        ))}
      </Inline>
    </Stack>
  ),
});
