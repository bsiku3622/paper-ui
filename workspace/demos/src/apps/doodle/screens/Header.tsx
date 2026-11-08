// The top bar: the "d" mark and the name, where you are (나의 작업 공간 / <canvas>), the theme switch and the sync light. On a
// phone the breadcrumb goes and a calendar button comes, which opens and closes 오늘의 흐름.

import { Badge, IconButton, Inline, Surface, Text, useTheme } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { BrandMark } from "../content/Brand";
import { CANVAS_NAME, WORKSPACE_NAME } from "../data/seed";
import type { Sync } from "../data/types";

const SYNC = {
  connected: { label: "동기화됨", accent: "success" },
  saving: { label: "저장 중", accent: "warning" },
  offline: { label: "오프라인", accent: "error" },
} as const;

export const Header = ({ sync, narrow, panelOpen, onPanel }: { sync: Sync; narrow: boolean; panelOpen: boolean; onPanel: () => void }) => {
  const { resolved, setTheme } = useTheme();
  const dark = resolved === "dark";
  const state = SYNC[sync];
  return (
    <Surface as="header" fill="raised" border="bottom" paddingX={narrow ? "lg" : "xl"} paddingY="md">
      <Inline justify="between" gap="md">
        <Inline gap="lg">
          <Inline gap="sm" minWidth={narrow ? undefined : "md"}>
            <BrandMark />
            <Text as="h1" variant="subheading">doodle</Text>
          </Inline>
          <Inline as="nav" aria-label="현재 위치" gap="sm" hideBelow="md">
            <Text as="span" variant="label" ink="secondary">{WORKSPACE_NAME}</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary" aria-hidden>/</Text>
            <Text as="span" variant="label" ink="secondary" aria-current="page">{CANVAS_NAME}</Text>
          </Inline>
        </Inline>
        <Inline gap="md">
          <IconButton variant="hairline" size="sm" aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"} title={dark ? "라이트 모드" : "다크 모드"} onClick={() => setTheme(dark ? "light" : "dark")}>
            <Glyph name={dark ? "sun" : "moon"} />
          </IconButton>
          <Inline gap="xs" role="status">
            <Badge dot variant="ghost" accent={state.accent} size="xs" aria-hidden />
            <Text as="span" variant="label" strong={false} ink="tertiary">{state.label}</Text>
          </Inline>
          {narrow ? (
            <IconButton variant="ghost" size="sm" aria-label="일정 패널 열기" aria-expanded={panelOpen} onClick={onPanel}>
              <Glyph name="calendar-days" />
            </IconButton>
          ) : null}
        </Inline>
      </Inline>
    </Surface>
  );
};
