import { Textarea, type TextareaProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, textControl, vocab, words } from "../schema";
import { wide } from "./examples.css";

export default defineSpec({
  name: "Textarea",
  blurb: "여러 줄 입력입니다. Field와 같은 status·size 축을 갖고 세로로만 resize합니다. size는 여백과 글자만 움직이고 높이는 rows가 정합니다.",
  controls: [
    textControl<TextareaProps, "placeholder">("placeholder", "여러 줄 입력…"),
    enumControl<TextareaProps, "status">("status", vocab("STATUSES")),
    enumControl<TextareaProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<TextareaProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    boolControl<TextareaProps, "disabled">("disabled"),
  ],
  defaults: { size: "md" },
  subject: (state) => (
    <Textarea
      placeholder={words(state, "placeholder") || undefined}
      status={pick<NonNullable<TextareaProps["status"]>>(state, "status")}
      size={pick<NonNullable<TextareaProps["size"]>>(state, "size")}
      fontSize={pick<NonNullable<TextareaProps["fontSize"]>>(state, "fontSize")}
      disabled={flag(state, "disabled")}
      rows={3}
    />
  ),
  Stage: ({ subject }) => <div className={wide}>{subject}</div>,
});
