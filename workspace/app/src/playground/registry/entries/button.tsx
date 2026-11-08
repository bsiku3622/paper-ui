import type { ElementType } from "react";

import { Badge, Button, type ButtonProps } from "@studio-baeks/paper-ui";

import { stay } from "../demo";
import { answer, answerControl, boolControl, defineSpec, enumControl, faceProps, flag, sample, pick, textControl, vocab, words } from "../schema";

export default defineSpec({
  name: "Button",
  blurb: { ko: "accent × variant가 서로 독립된 시각 무게 축입니다. primary도 neutral accent family라 모든 accent가 같은 다섯 slot 계약을 공유합니다. hairline · dashed · ghost · muted의 면은 fill이 고르고 안 주면 투명이며, 그림자는 면이 있을 때만 받습니다. fontSize는 버튼 실루엣과 별도로 글자만 조절합니다. 높이와 가로 여백은 size 사다리가, 모서리는 컨트롤 곡률(shape)이 정합니다. selected는 hairline · ghost · muted에서 선택된 면과 aria-pressed를 입힙니다. loading은 포커스를 잃지 않고 누름과 제출만 막으며, 시작할 때 포커스가 있으면 loadingLabel을 한 번 알립니다.", en: "accent × variant are independent axes of visual weight. primary is also a neutral accent family, so every accent shares the same five-slot contract. The face of hairline, dashed, ghost and muted is chosen by fill and is transparent without one; a shadow lands only on a face. fontSize changes the text alone, apart from the button's silhouette. Height and horizontal padding come from the size ladder, corners from the control curvature (shape). selected puts the selected face and aria-pressed on hairline, ghost and muted. loading blocks only press and submit without losing focus, and announces loadingLabel once if it had focus when it started." },
  controls: [
    enumControl<ButtonProps, "accent">("accent", vocab("ACCENTS")),
    enumControl<ButtonProps, "variant">("variant", vocab("VARIANTS")),
    enumControl<ButtonProps, "fill">("fill", vocab("SURFACE_FILLS"), { behaviorOnly: "only hairline, dashed, ghost and muted have a face to choose" }),
    boolControl<ButtonProps, "shadow">("shadow", false, { behaviorOnly: "only a face casts one: solid, soft, or a fill" }),
    enumControl<ButtonProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<ButtonProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    answerControl("strong", "strong takes a boolean: false is the regular weight", { derived: "the preset is already strong, so true changes nothing" }),
    boolControl<ButtonProps, "selected">("selected", false, { behaviorOnly: "selected shows only on hairline, ghost and muted" }),
    boolControl<ButtonProps, "loading">("loading"),
    textControl<ButtonProps, "loadingLabel">("loadingLabel", ""),
    boolControl<ButtonProps, "fullWidth">("fullWidth"),
    enumControl<ButtonProps, "gap">("gap", vocab("SPACES"), { rootDefault: "sm", behaviorOnly: "it shows once the button holds an icon beside its label" }),
    enumControl<ButtonProps, "align">("align", vocab("ALIGNS"), { rootDefault: "center" }),
    enumControl<ButtonProps, "justify">("justify", vocab("JUSTIFIES"), { rootDefault: "center", behaviorOnly: "it shows once the button is wider than its content" }),
    boolControl<ButtonProps, "badge">("badge", false, { example: { ko: "알림 숫자", en: "count" }, type: "ReactNode" }),
    enumControl<ButtonProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    boolControl<ButtonProps, "disabled">("disabled"),
    enumControl<ButtonProps<ElementType>, "as">("as", sample(["button", "a"] as const, "the two elements a button-shaped control renders as; as takes any tag")),
    textControl<ButtonProps, "children">("children", { ko: "버튼", en: "Button" }),
  ],
  defaults: { accent: "primary", variant: "solid", size: "md", shape: "pill", as: "button" },
  sheet: { matrix: { rows: "accent", columns: "variant" }, strips: [{ key: "size" }, { key: "shape" }, { key: "fill", with: { variant: "hairline" } }] },
  subject: (state) => {
    const common = {
      accent: pick<NonNullable<ButtonProps["accent"]>>(state, "accent"),
      variant: pick<NonNullable<ButtonProps["variant"]>>(state, "variant"),
      ...faceProps(state),
      size: pick<NonNullable<ButtonProps["size"]>>(state, "size"),
      fontSize: pick<NonNullable<ButtonProps["fontSize"]>>(state, "fontSize"),
      strong: answer(state, "strong"),
      loading: flag(state, "loading"),
      loadingLabel: words(state, "loadingLabel") || undefined,
      fullWidth: flag(state, "fullWidth"),
      gap: pick<NonNullable<ButtonProps["gap"]>>(state, "gap"),
      align: pick<NonNullable<ButtonProps["align"]>>(state, "align"),
      justify: pick<NonNullable<ButtonProps["justify"]>>(state, "justify"),
      badge: flag(state, "badge") ? <Badge accent="info" variant="solid" size="xs">3</Badge> : undefined,
      shape: pick<NonNullable<ButtonProps["shape"]>>(state, "shape"),
      disabled: flag(state, "disabled"),
    };
    // The knob always sets the prop, so the code panel reads back what it printed. Only hairline, ghost and muted take
    // it: on the others the printed code is a type error and nothing shows, which the control's note says.
    const selection = (flag(state, "selected") ? { selected: true } : {}) as { selected?: undefined };
    return pick(state, "as") === "a" ? <Button as="a" href="/playground/button" onClick={stay} {...common} {...selection}>{words(state, "children")}</Button> : <Button {...common} {...selection}>{words(state, "children")}</Button>;
  },
});
