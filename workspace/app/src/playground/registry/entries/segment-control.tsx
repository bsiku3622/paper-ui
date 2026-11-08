import { SegmentControl, type SegmentControlProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, vocab } from "../schema";
import { narrow } from "./examples.css";

export default defineSpec({
  name: "SegmentControl",
  blurb: "여럿 중 하나를 한 줄 위에서 고릅니다. 기간이나 보기처럼 고른 즉시 화면이 바뀌는 자리에 씁니다. 라디오 묶음이라 방향키가 고르는 칸을 옮기고 Tab 정지는 하나입니다. track은 회색 홈 위로 흰 칸이 미끄러지고, outline은 입력 틀과 같은 흰 틀을 나눔선으로 갈라 고른 칸에 면과 앞 체크를 둡니다 — Field나 Select 곁의 폼에 놓일 때 씁니다. fullWidth면 주어진 폭을 칸이 같게 나누되, 어느 칸도 제 글자와 체크보다 좁아지지 않습니다.",
  controls: [
    enumControl<SegmentControlProps, "variant">("variant", vocab("SEGMENT_VARIANTS")),
    enumControl<SegmentControlProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<SegmentControlProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    boolControl<SegmentControlProps, "fullWidth">("fullWidth"),
    boolControl<SegmentControlProps, "disabled">("disabled"),
  ],
  defaults: { variant: "track", size: "md", shape: "pill" },
  sheet: { matrix: { rows: "shape", columns: "variant" }, strips: [{ key: "size" }] },
  subject: (state) => (
    <SegmentControl aria-label="기간" defaultValue="7d" variant={pick<NonNullable<SegmentControlProps["variant"]>>(state, "variant")} size={pick<NonNullable<SegmentControlProps["size"]>>(state, "size")} shape={pick<NonNullable<SegmentControlProps["shape"]>>(state, "shape")} fullWidth={flag(state, "fullWidth")} disabled={flag(state, "disabled")}>
      <SegmentControl.Item value="1d">1일</SegmentControl.Item>
      <SegmentControl.Item value="7d">7일</SegmentControl.Item>
      <SegmentControl.Item value="1m">1달</SegmentControl.Item>
      <SegmentControl.Item value="all">전체</SegmentControl.Item>
    </SegmentControl>
  ),
  Stage: ({ subject }) => <div className={narrow}>{subject}</div>,
});
