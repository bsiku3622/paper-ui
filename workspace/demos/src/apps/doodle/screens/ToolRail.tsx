import { Divider, Floating, IconButton, Inline, SelectableGroup, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, type GlyphName } from "../../../kit";
import type { Tool } from "../data/types";

export const TOOLS: readonly { id: Tool; label: string; glyph: GlyphName }[] = [
  { id: "select", label: "선택", glyph: "mouse-pointer-2" },
  { id: "hand", label: "이동", glyph: "hand" },
  { id: "text", label: "텍스트 상자", glyph: "type" },
  { id: "image", label: "이미지", glyph: "image" },
  { id: "video", label: "동영상", glyph: "video" },
  { id: "pen", label: "펜", glyph: "paintbrush-2" },
];

const Help = () => (
  <Floating>
    <IconButton as={Floating.Trigger} size="sm" iconSize="body" variant="muted" aria-label="도움말" title="도움말"><Glyph name="circle-help" ink="tertiary" /></IconButton>
    <Floating.Content as={Surface} fill="raised" border radius="md" padding="lg" placement="end top" offset="md" aria-label="캔버스 사용법">
      <Stack gap="sm" width="lg">
        <Inline justify="between" align="start" gap="sm">
          <Text as="h2" variant="subheading">캔버스 사용법</Text>
          <IconButton as={Floating.Close} size="xs" variant="ghost" aria-label="닫기"><Glyph name="x" /></IconButton>
        </Inline>
        <Text as="p" variant="caption" ink="secondary">
          빈 공간을 드래그하면 이동합니다. 왼쪽 도구를 고른 뒤 캔버스를 눌러 텍스트·이미지·동영상을 놓거나 펜으로 그릴 수 있습니다. 문서는 양옆의 + 버튼으로 이어집니다.
        </Text>
      </Stack>
    </Floating.Content>
  </Floating>
);

export const ToolRail = ({ tool, onTool }: { tool: Tool; onTool: (tool: Tool) => void }) => {
  return (
    <Surface as="nav" aria-label="캔버스 도구" fill="raised" border elevation="overlay" radius="md" padding="sm">
      <Stack gap="xs" align="center">
        <SelectableGroup
          as={Stack}
          gap="xs"
          role="radiogroup"
          aria-label="도구"
          orientation="vertical"
          selectedValues={[tool]}
          selectionRequired
          onSelectedValuesChange={([next]: string[]) => { if (next) onTool(next as Tool); }}
          currentValue={tool}
        >
          {TOOLS.map((item) => (
            <IconButton
              key={item.id}
              as={SelectableGroup.Item}
              value={item.id}
              role="radio"
              size="sm"
              iconSize="body"
              variant={tool === item.id ? "solid" : "muted"}
              aria-label={item.label}
              title={item.label}
            >
              <Glyph name={item.glyph} ink={tool === item.id ? undefined : "tertiary"} />
            </IconButton>
          ))}
        </SelectableGroup>
        <Divider />
        <Help />
      </Stack>
    </Surface>
  );
};
