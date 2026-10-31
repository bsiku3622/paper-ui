import { Textarea, type TextareaProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, sample, subset, textControl, vocab, words } from "../schema";
import { wide } from "./examples.css";

// rows is a number; the control offers its string forms and the subject reads them back.
type RowsControl = { rows?: string };

export default defineSpec({
  name: "Textarea",
  blurb: "여러 줄 입력입니다. Field와 같은 status·size·fill 축을 갖고 세로로만 resize합니다. size는 여백과 글자만 움직이고 높이는 rows가 정합니다.",
  controls: [
    textControl<TextareaProps, "placeholder">("placeholder", "여러 줄 입력…"),
    enumControl<RowsControl, "rows">("rows", sample(["1", "2", "3", "4", "6"] as const, "rows takes any positive integer")),
    enumControl<TextareaProps, "status">("status", vocab("STATUSES")),
    enumControl<TextareaProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<TextareaProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    enumControl<TextareaProps, "fill">("fill", subset("SURFACE_FILLS", ["raised", "sunken"], "canvas is the page ground, not a face a textarea can have")),
    boolControl<TextareaProps, "disabled">("disabled"),
  ],
  defaults: { size: "md", fill: "raised", rows: 4 },
  subject: (state) => {
    const rows = pick(state, "rows");
    return (
      <Textarea
        placeholder={words(state, "placeholder") || undefined}
        rows={rows === undefined ? undefined : Number(rows)}
        status={pick<NonNullable<TextareaProps["status"]>>(state, "status")}
        size={pick<NonNullable<TextareaProps["size"]>>(state, "size")}
        fontSize={pick<NonNullable<TextareaProps["fontSize"]>>(state, "fontSize")}
        fill={pick<NonNullable<TextareaProps["fill"]>>(state, "fill")}
        disabled={flag(state, "disabled")}
      />
    );
  },
  Stage: ({ subject }) => <div className={wide}>{subject}</div>,
});
