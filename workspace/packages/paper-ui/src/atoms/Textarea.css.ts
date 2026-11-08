import { layered } from "../tokens/layers.css";

const { style } = layered("components");

// Field 와 같은 결의 여러 줄 입력. 틀(테두리·포커스링·비활성)은 inputFrame, 크기(여백·글자·모서리)는 controlClass, 색은 fieldPaint,
// 면은 Surface fill 이다. 높이는 rows 가 정하고 세로로만 resize 한다.
export const textareaRoot = style({
  width: "100%",
  resize: "vertical",
});
