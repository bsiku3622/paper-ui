import { Link as RouterLink } from "react-router-dom";

import { IconButton } from "@studio-baeks/paper-ui";

import { Empty, Glyph } from "../../../kit";
import { WebcamFeed } from "../content/WebcamFeed";
import { metaOf } from "../sim/engine";
import { useSim } from "../sim/Provider";
import { useSettings } from "../settings";
import { Panel } from "../ui/Panel";

export const Feed = ({ index = 0 }: { index?: number }) => {
  const sim = useSim();
  const { webcams } = useSettings();
  const cams = webcams.filter((cam) => cam.enabled);
  const cam = cams[index] ?? cams[0];
  if (!cam) return <Empty glyph="webcam" title="켜진 웹캠이 없습니다" description="설정의 웹캠 탭에서 카메라를 켜세요." />;
  const height = metaOf(sim, sim.print.file)?.objectHeight ?? 100;
  const active = sim.print.state !== "standby";
  return (
    <WebcamFeed
      x={sim.live[0]}
      y={sim.live[1]}
      z={sim.live[2]}
      progress={active ? sim.live[2] / height : 0}
      hot={sim.extruder.temp > 100}
      fps={cam.fps}
      flipX={cam.flipX}
      flipY={cam.flipY}
      rotate={cam.rotate}
      ratio={cam.ratio}
    />
  );
};

export const WebcamPanel = () => (
  <Panel id="webcam" title="웹캠" glyph="webcam" flush actions={<IconButton as={RouterLink} to="/printer/cam" variant="ghost" size="sm" aria-label="웹캠 크게 보기"><Glyph name="maximize" /></IconButton>}>
    <Feed />
  </Panel>
);
