import { Slider, type SliderProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, vocab } from "../schema";
import { narrow } from "./examples.css";

export default defineSpec({
  name: "Slider",
  blurb: "범위 안의 값 하나를 끌어서 고릅니다. native range라 끌기 · 방향키 · 폼은 브라우저가 맡고, 막대는 Switch 트랙과 같은 높이입니다. 채워진 부분은 primary의 solid 면이고, 손잡이는 흰 면에 solid 테를 두른 원이고, 지름이 막대 높이입니다.",
  controls: [
    enumControl<SliderProps, "status">("status", vocab("CHOICE_STATUSES")),
    enumControl<SliderProps, "size">("size", vocab("CONTROL_SIZES")),
    boolControl<SliderProps, "disabled">("disabled"),
  ],
  defaults: { size: "md" },
  sheet: { strips: [{ key: "size" }, { key: "status" }] },
  subject: (state) => (
    <Slider aria-label="월 예산" defaultValue={50} status={pick<NonNullable<SliderProps["status"]>>(state, "status")} size={pick<NonNullable<SliderProps["size"]>>(state, "size")} disabled={flag(state, "disabled")} />
  ),
  Stage: ({ subject }) => <div className={narrow}>{subject}</div>,
});
