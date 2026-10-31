import type { ElementType } from "react";

import { Button, type ButtonProps } from "@studio-baeks/paper-ui";

import { stay } from "../demo";
import { boolControl, defineSpec, enumControl, flag, sample, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Button",
  blurb: "accent × variant가 서로 독립된 시각 무게 축입니다. primary도 neutral accent family라 모든 accent가 같은 다섯 slot 계약을 공유합니다. fontSize는 버튼 실루엣과 별도로 글자만 조절합니다. 높이와 가로 여백은 size 사다리가, 모서리는 컨트롤 곡률(shape)이 정합니다. selected는 hairline · ghost · muted에서 선택된 면과 aria-pressed를 입힙니다. loading은 포커스를 잃지 않고 누름과 제출만 막으며, 시작할 때 포커스가 있으면 loadingLabel을 한 번 알립니다.",
  controls: [
    enumControl<ButtonProps, "accent">("accent", vocab("ACCENTS")),
    enumControl<ButtonProps, "variant">("variant", vocab("VARIANTS")),
    enumControl<ButtonProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<ButtonProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    boolControl<ButtonProps, "selected">("selected", false, { behaviorOnly: "selected shows only on hairline, ghost and muted" }),
    boolControl<ButtonProps, "loading">("loading"),
    textControl<ButtonProps, "loadingLabel">("loadingLabel", ""),
    boolControl<ButtonProps, "fullWidth">("fullWidth"),
    enumControl<ButtonProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    boolControl<ButtonProps, "disabled">("disabled"),
    enumControl<ButtonProps<ElementType>, "as">("as", sample(["button", "a"] as const, "the two elements a button-shaped control renders as; as takes any tag")),
    textControl<ButtonProps, "children">("children", "버튼"),
  ],
  defaults: { accent: "primary", variant: "solid", size: "md", shape: "rounded", as: "button" },
  subject: (state) => {
    const common = {
      accent: pick<NonNullable<ButtonProps["accent"]>>(state, "accent"),
      variant: pick<NonNullable<ButtonProps["variant"]>>(state, "variant"),
      size: pick<NonNullable<ButtonProps["size"]>>(state, "size"),
      fontSize: pick<NonNullable<ButtonProps["fontSize"]>>(state, "fontSize"),
      loading: flag(state, "loading"),
      loadingLabel: words(state, "loadingLabel") || undefined,
      fullWidth: flag(state, "fullWidth"),
      shape: pick<NonNullable<ButtonProps["shape"]>>(state, "shape"),
      disabled: flag(state, "disabled"),
    };
    // The knob always sets the prop, so the code panel reads back what it printed. Only hairline, ghost and muted take
    // it: on the others the printed code is a type error and nothing shows, which the control's note says.
    const selection = (flag(state, "selected") ? { selected: true } : {}) as { selected?: undefined };
    return pick(state, "as") === "a" ? <Button as="a" href="/playground/button" onClick={stay} {...common} {...selection}>{words(state, "children")}</Button> : <Button {...common} {...selection}>{words(state, "children")}</Button>;
  },
});
