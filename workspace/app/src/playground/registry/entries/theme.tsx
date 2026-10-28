import { Box, Button, Inline, Stack, Text, ThemeScope, useResolvedTheme, useTheme, type Theme, type ThemeScopeProps } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { defineSpec, enumControl, pick, vocab } from "../schema";

const PREFERENCES = ["light", "dark", "system"] as const satisfies readonly Theme[];

// Reads the theme the nearest ThemeScope resolved.
const ScopeReadout = () => {
  const resolved = useResolvedTheme();
  return <Text variant="caption">useResolvedTheme(): {resolved}</Text>;
};

export default defineSpec({
  name: "Theme",
  blurb: "ThemeScope는 하위 트리 하나에 테마를 겁니다. useTheme은 사용자의 선택과 적용된 값을 읽고 바꾸고, useResolvedTheme은 가장 가까운 scope가 정한 값을 읽습니다.",
  controls: [
    enumControl<ThemeScopeProps, "theme">("theme", vocab("BOX_THEMES"), { target: "ThemeScope", initial: "inverse", required: true }),
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
    <ThemeScope theme={pick<ThemeScopeProps["theme"]>(state, "theme") ?? "inverse"}>
      <Box surface="canvas" border radius="md" padding="md">
        <ScopeReadout />
      </Box>
    </ThemeScope>
  ),
  Stage: ({ subject, harness }) => (
    <Stack gap="md" align="start">
      {subject}
      <Text as="output" variant="caption" family="mono">useTheme(): theme={harness.theme}, resolved={harness.resolved}</Text>
      <Inline gap="sm">
        {PREFERENCES.map((preference) => (
          <Button key={preference} size="sm" variant="hairline" aria-pressed={harness.theme === preference} onClick={() => harness.setTheme(preference)}>{preference}</Button>
        ))}
      </Inline>
    </Stack>
  ),
});
