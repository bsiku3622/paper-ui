import { controlGeometry } from "../internal/shape";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// Field 와 같은 결의 여러 줄 입력. 틀(테두리·모서리·포커스링·비활성)은 inputFrame, 색은 fieldPaint, 면은 Surface fill 이다.
// 높이는 rows 가 정하고 세로로만 resize 한다. 크기(padding·fontSize)는 size 축(textareaSize)이 정한다 — 컨트롤 높이·글자
// 사다리를 공유하고, 여러 줄 입력에 필요한 세로 여백만 별도 축으로 보정한다.
export const textareaRoot = style({
  width: "100%",
  resize: "vertical",
});

// Block inset accounts for the textarea preset’s leading and font size.
export const textareaSize = styleVariants(
  controlGeometry.textarea,
);
