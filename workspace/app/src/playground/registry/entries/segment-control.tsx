import { SegmentControl, type SegmentControlProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, vocab } from "../schema";
import { narrow } from "./examples.css";
import { pick as inLocale } from "../../../site/locale";

const WORDS = {
  ko: { label: "기간", d1: "1일", d7: "7일", m1: "1달", all: "전체" },
  en: { label: "Period", d1: "1 day", d7: "7 days", m1: "1 month", all: "All" },
};

export default defineSpec({
  name: "SegmentControl",
  blurb: { ko: "여럿 중 하나를 한 줄 위에서 고릅니다. 기간이나 보기처럼 고른 즉시 화면이 바뀌는 자리에 씁니다. 라디오 묶음이라 방향키가 고르는 칸을 옮기고 Tab 정지는 하나입니다. track은 회색 홈 위로 흰 칸이 미끄러지고, outline은 입력 틀과 같은 흰 틀을 나눔선으로 갈라 고른 칸에 면과 앞 체크를 둡니다 — Field나 Select 곁의 폼에 놓일 때 씁니다. fullWidth면 주어진 폭을 칸이 같게 나누되, 어느 칸도 제 글자와 체크보다 좁아지지 않습니다.", en: "Chooses one of several on a single line. Use it where the screen changes as soon as one is chosen, such as a period or a view. It is a radio group, so arrow keys move the chosen cell and there is one Tab stop. track slides a white cell over a grey groove; outline splits the same white frame as an input with dividers and gives the chosen cell a face and a leading check, for forms beside a Field or Select. With fullWidth the cells share the given width equally, and no cell gets narrower than its own text and check." },
  controls: [
    enumControl<SegmentControlProps, "variant">("variant", vocab("SEGMENT_VARIANTS")),
    enumControl<SegmentControlProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<SegmentControlProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    boolControl<SegmentControlProps, "fullWidth">("fullWidth"),
    boolControl<SegmentControlProps, "disabled">("disabled"),
  ],
  defaults: { variant: "track", size: "md", shape: "pill" },
  sheet: { matrix: { rows: "shape", columns: "variant" }, strips: [{ key: "size" }] },
  subject: (state, _harness, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <SegmentControl aria-label={w.label} defaultValue="7d" variant={pick<NonNullable<SegmentControlProps["variant"]>>(state, "variant")} size={pick<NonNullable<SegmentControlProps["size"]>>(state, "size")} shape={pick<NonNullable<SegmentControlProps["shape"]>>(state, "shape")} fullWidth={flag(state, "fullWidth")} disabled={flag(state, "disabled")}>
      <SegmentControl.Item value="1d">{w.d1}</SegmentControl.Item>
      <SegmentControl.Item value="7d">{w.d7}</SegmentControl.Item>
      <SegmentControl.Item value="1m">{w.m1}</SegmentControl.Item>
      <SegmentControl.Item value="all">{w.all}</SegmentControl.Item>
    </SegmentControl>
    );
  },
  Stage: ({ subject }) => <div className={narrow}>{subject}</div>,
});
