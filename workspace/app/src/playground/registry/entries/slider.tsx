import { Slider, type SliderProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, vocab } from "../schema";
import { narrow } from "./examples.css";
import { pick as inLocale } from "../../../site/locale";

const WORDS = {
  ko: { label: "월 예산" },
  en: { label: "Monthly budget" },
};

export default defineSpec({
  name: "Slider",
  blurb: { ko: "범위 안의 값 하나를 끌어서 고릅니다. native range라 끌기 · 방향키 · 폼은 브라우저가 맡고, 막대는 Switch 트랙과 같은 높이입니다. 채워진 부분은 primary의 solid 면이고, 손잡이는 흰 면에 solid 테를 두른 원이고, 지름이 막대 높이입니다. origin을 주면 채움이 그 값에서 손잡이까지 이어집니다.", en: "Chooses one value in a range by dragging. It is a native range, so dragging, arrow keys and forms are the browser's, and the bar has the same height as the Switch track. The filled part is a primary solid face, and the thumb is a circle with a solid ring on a white face whose diameter is the bar height. With origin, the fill runs from that value to the thumb." },
  controls: [
    enumControl<SliderProps, "status">("status", vocab("CHOICE_STATUSES")),
    enumControl<SliderProps, "size">("size", vocab("CONTROL_SIZES")),
    boolControl<SliderProps, "disabled">("disabled"),
  ],
  defaults: { size: "md" },
  sheet: { strips: [{ key: "size" }, { key: "status" }] },
  subject: (state, _harness, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <Slider aria-label={w.label} defaultValue={50} status={pick<NonNullable<SliderProps["status"]>>(state, "status")} size={pick<NonNullable<SliderProps["size"]>>(state, "size")} disabled={flag(state, "disabled")} />
    );
  },
  Stage: ({ subject }) => <div className={narrow}>{subject}</div>,
});
