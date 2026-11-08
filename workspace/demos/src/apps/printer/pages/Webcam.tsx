// The webcam page: the camera as large as the column allows. With more than one camera turned on, a switch chooses between them.

import { useState } from "react";

import { Badge, Box, Button, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, Segmented, useToast } from "../../../kit";
import { Feed } from "../panels/WebcamPanel";
import { useSettings } from "../settings";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

const SERVICE: Record<string, string> = { mjpeg: "MJPEG 스트림", webrtc: "WebRTC", hls: "HLS", ipcamera: "IP 카메라" };

export const WebcamPage = () => {
  const { webcams } = useSettings();
  const toast = useToast();
  const [, setSettings] = useQueryState("settings");
  const cams = webcams.filter((cam) => cam.enabled);
  const [index, setIndex] = useState(0);
  const cam = cams[Math.min(index, cams.length - 1)];
  return (
    <>
      <PageHeader
        title="웹캠"
        description="프린터 위의 카메라입니다. 모의 화면이라 실제 영상은 오지 않습니다."
        actions={<Button variant="hairline" onClick={() => setSettings("webcams")}><Glyph name="settings" />웹캠 설정</Button>}
      />
      {cam ? (
        <Panel
          id="cam-page"
          title={cam.name}
          glyph="webcam"
          collapsible={false}
          flush
          actions={<Button variant="ghost" size="sm" onClick={() => toast("스냅샷을 저장했습니다 (모의)")}><Glyph name="camera" />스냅샷</Button>}
        >
          <Stack>
            <Surface fill="sunken" padding="lg">
              <Stack align="center">
                <Box width="full" maxWidth="measure.xl">
                  <Surface radius="md" overflow="hidden"><Feed index={Math.min(index, cams.length - 1)} /></Surface>
                </Box>
              </Stack>
            </Surface>
            <Inline justify="between" align="center" gap="md" wrap paddingX="lg" paddingY="md">
              {cams.length > 1 ? <Segmented label="카메라" value={String(index)} onChange={(value) => setIndex(Number(value))} options={cams.map((item, at) => ({ id: String(at), label: item.name }))} /> : <Text as="span" ink="tertiary">카메라 하나</Text>}
              <Inline gap="sm" wrap>
                <Badge variant="hairline" size="sm">{SERVICE[cam.service] ?? cam.service}</Badge>
                <Badge variant="hairline" size="sm">목표 {cam.fps} FPS</Badge>
                {cam.flipX || cam.flipY || cam.rotate ? <Badge variant="hairline" size="sm">뒤집기·회전 적용</Badge> : null}
              </Inline>
            </Inline>
          </Stack>
        </Panel>
      ) : (
        <Empty glyph="webcam" title="켜진 웹캠이 없습니다" description="설정의 웹캠 탭에서 카메라를 켜거나 새로 추가하세요." action={<Button variant="hairline" onClick={() => setSettings("webcams")}>웹캠 설정 열기</Button>} />
      )}
    </>
  );
};
