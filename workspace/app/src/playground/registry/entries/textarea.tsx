import { Textarea, type TextareaProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, sample, textControl, vocab, words } from "../schema";
import { wide } from "./examples.css";

// rows is a number; the control offers its string forms and the subject reads them back.
type RowsControl = { rows?: string };

export default defineSpec({
  name: "Textarea",
  blurb: { ko: "여러 줄 입력입니다. Field와 같은 status·size·variant·fill 축을 갖고, 면을 고르지 않으면 Field처럼 흰 면에 회색 선 한 줄로 서며, 세로로만 resize합니다. size는 여백과 글자만 움직이고 높이는 rows가 정합니다.", en: "A multi-line input. It has the same status, size, variant and fill axes as Field; without a face it stands like Field, a white face with one grey line, and it resizes vertically only. size moves only padding and text; rows sets the height." },
  controls: [
    textControl<TextareaProps, "placeholder">("placeholder", { ko: "여러 줄 입력…", en: "Multi-line input…" }),
    enumControl<RowsControl, "rows">("rows", sample(["1", "2", "3", "4", "6"] as const, "rows takes any positive integer")),
    enumControl<TextareaProps, "status">("status", vocab("STATUSES")),
    enumControl<TextareaProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<TextareaProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    enumControl<TextareaProps, "variant">("variant", vocab("INPUT_VARIANTS")),
    enumControl<TextareaProps, "fill">("fill", vocab("SURFACE_FILLS")),
    boolControl<TextareaProps, "shadow">("shadow"),
    boolControl<TextareaProps, "disabled">("disabled"),
  ],
  defaults: { size: "md", variant: "hairline", rows: 4 },
  sheet: { matrix: { rows: "fill", columns: "variant" }, strips: [{ key: "size" }, { key: "status" }] },
  subject: (state) => {
    const rows = pick(state, "rows");
    return (
      <Textarea
        placeholder={words(state, "placeholder") || undefined}
        rows={rows === undefined ? undefined : Number(rows)}
        status={pick<NonNullable<TextareaProps["status"]>>(state, "status")}
        size={pick<NonNullable<TextareaProps["size"]>>(state, "size")}
        fontSize={pick<NonNullable<TextareaProps["fontSize"]>>(state, "fontSize")}
        variant={pick<NonNullable<TextareaProps["variant"]>>(state, "variant")}
        fill={pick<NonNullable<TextareaProps["fill"]>>(state, "fill")}
        shadow={flag(state, "shadow")}
        disabled={flag(state, "disabled")}
      />
    );
  },
  Stage: ({ subject }) => <div className={wide}>{subject}</div>,
});
