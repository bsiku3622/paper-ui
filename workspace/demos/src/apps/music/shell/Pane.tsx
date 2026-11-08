// 오른쪽 창: 가사 또는 다음 곡. 바탕 위에 그냥 놓이고, 창은 페이지가 스크롤되어도 제자리에 있습니다.

import { Box, Stack } from "@studio-baeks/paper-ui";

import { Rail } from "../content/Rail";
import { LyricsView } from "../parts/LyricsView";
import { QueueList } from "../parts/QueueList";
import { useSettings } from "../state/settings";

export const Pane = () => {
  const { settings } = useSettings();
  return (
    <Rail>
      <Box as="aside" aria-label={settings.pane === "queue" ? "다음 곡" : "가사"} height="full">
        {settings.pane === "queue" ? (
          <Box height="full" overflowY="auto">
            <Stack paddingY="md"><QueueList compact /></Stack>
          </Box>
        ) : (
          <LyricsView />
        )}
      </Box>
    </Rail>
  );
};
