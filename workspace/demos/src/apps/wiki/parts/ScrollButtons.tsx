// ScrollButtons.tsx — the corner of the window: the table of contents, the top of the page, the bottom of the page. The pinning
// is content/FixedCorner; what is pinned is a Surface with IconButtons.

import { Box, Divider, Floating, IconButton, Stack, Surface, Text, useFloatingContext } from "@studio-baeks/paper-ui";

import { Glyph } from "../../../kit";
import { FixedCorner } from "../content/FixedCorner";
import type { TocEntry } from "../lib/markup";
import { jump, toBottom, toTop } from "../render/jump";

const ContentsList = ({ toc }: { toc: readonly TocEntry[] }) => {
  const { close } = useFloatingContext();
  return (
    <Stack gap="xs" minWidth="md" maxHeight="lg" overflowY="auto">
      <Text as="p" variant="subheading">목차</Text>
      {toc.map((entry) => (
        <Surface
          key={entry.id}
          as="button"
          type="button"
          hoverable
          radius="sm"
          paddingX="sm"
          paddingY="xs"
          onClick={() => {
            close();
            window.setTimeout(() => jump(entry.id), 60);
          }}
        >
          <Text as="span" variant="body" ink={entry.level === 2 ? "primary" : "secondary"}>{entry.num}. {entry.text}</Text>
        </Surface>
      ))}
    </Stack>
  );
};

// On a phone they would cover the text they are meant to help you through, so they are left out there.
export const ScrollButtons = ({ toc }: { toc?: readonly TocEntry[] }) => (
  <Box hideBelow="md">
    <FixedCorner>
      <Stack gap="sm" align="end">
        {toc && toc.length > 0 ? (
          <Floating>
            <Surface elevation="overlay" fill="raised" radius="md">
              <IconButton as={Floating.Trigger} variant="ghost" aria-label="목차 열기">
                <Glyph name="list" />
              </IconButton>
            </Surface>
            <Floating.Content as={Surface} fill="raised" border radius="md" padding="md" placement="start bottom" aria-label="목차">
              <ContentsList toc={toc} />
            </Floating.Content>
          </Floating>
        ) : null}
        <Surface elevation="overlay" fill="raised" radius="md" role="group" aria-label="화면 이동">
          <Stack>
            <IconButton variant="ghost" aria-label="맨 위로" onClick={toTop}>
              <Glyph name="arrow-up" />
            </IconButton>
            <Divider />
            <IconButton variant="ghost" aria-label="맨 아래로" onClick={toBottom}>
              <Glyph name="arrow-down" />
            </IconButton>
          </Stack>
        </Surface>
      </Stack>
    </FixedCorner>
  </Box>
);
