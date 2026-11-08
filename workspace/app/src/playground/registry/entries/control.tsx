import { Control, Inline, type ControlProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { answer, answerControl, defineSpec, enumControl, pick, vocab } from "../schema";
import { controlSample } from "./examples.css";

export default defineSpec({
  name: "Control",
  blurb: "Box 위에 크기를 입히는 primitive입니다. size 하나가 높이와 안쪽 여백과 모서리와 글자와 안의 아이콘 크기를 함께 정하고, anatomy는 그 크기로 무엇을 그리는가입니다. gap · align · justify는 내용을 늘어놓는 방식이라 크기와 따로 고릅니다. Button은 Control과 Paint와 Pressable을 묶은 것입니다. 색도 선도 칠하지 않으므로 혼자서는 면이 보이지 않아 이 견본은 면을 깔았습니다.",
  controls: [
    enumControl<ControlProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<ControlProps, "anatomy">("anatomy", vocab("CONTROL_ANATOMIES")),
    enumControl<ControlProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    enumControl<ControlProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    answerControl("strong", "strong takes a boolean: false is the regular weight", { derived: "a label's preset is already strong, so true changes nothing" }),
    enumControl<ControlProps, "gap">("gap", vocab("SPACES"), { rootDefault: "sm" }),
    enumControl<ControlProps, "align">("align", vocab("ALIGNS"), { rootDefault: "center" }),
    enumControl<ControlProps, "justify">("justify", vocab("JUSTIFIES"), { rootDefault: "center", behaviorOnly: "it shows once the box is wider than its content" }),
    enumControl<ControlProps, "iconSize">("iconSize", vocab("ICON_SIZES"), { omitted: "auto" }),
  ],
  defaults: { size: "md", anatomy: "label", shape: "rounded" },
  subject: (state) => {
    const form = {
      "data-testid": "control-example",
      className: controlSample,
      size: pick<NonNullable<ControlProps["size"]>>(state, "size"),
      anatomy: pick<NonNullable<ControlProps["anatomy"]>>(state, "anatomy"),
      shape: pick<NonNullable<ControlProps["shape"]>>(state, "shape"),
      fontSize: pick<NonNullable<ControlProps["fontSize"]>>(state, "fontSize"),
      strong: answer(state, "strong"),
      gap: pick<NonNullable<ControlProps["gap"]>>(state, "gap"),
      align: pick<NonNullable<ControlProps["align"]>>(state, "align"),
      justify: pick<NonNullable<ControlProps["justify"]>>(state, "justify"),
      iconSize: pick<NonNullable<ControlProps["iconSize"]>>(state, "iconSize"),
    };
    // What each anatomy holds, so the sample reads as what it draws: a square holds an icon, and a mark, a track and a ring hold nothing.
    switch (form.anatomy) {
      case "icon":
        return <Control {...form}>{glyph.plus}</Control>;
      case "input":
        return <Control {...form} as="input" aria-label="입력값" placeholder="입력값" />;
      case "frame":
        return <Control {...form}><Inline height="full" paddingX="md">선택값</Inline></Control>;
      case "area":
        return <Control {...form} as="textarea" rows={2} aria-label="여러 줄" placeholder="여러 줄을 담는 입력값" />;
      case "badge":
        return <Control {...form}>진행</Control>;
      case "mark":
      case "track":
      case "spinner":
      case "slider":
        return <Control {...form} />;
      default:
        return <Control {...form}>{glyph.plus}항목 더하기</Control>;
    }
  },
});
