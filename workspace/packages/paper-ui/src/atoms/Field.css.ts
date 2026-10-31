import { CONTROL_SIZES, stateStyle, tokens, transition } from "../tokens";
import type { ControlSize } from "../tokens";
import { controlGeometry, geometry } from "../internal/shape";
import { layered } from "../tokens/layers.css";

const { style, styleVariants } = layered("components");

// Field 는 input group — 래퍼가 틀(inputFrame: 테두리·모서리·포커스링·비활성)을 지고, 그 색은 fieldPaint,
// 면은 Surface fill 이 입힌다. 안쪽 input 은 투명·무테로 값만 담고, leading/trailing 어도먼트(아이콘·$·단위)와
// 액션(clear·비밀번호)이 input 양옆에 앉는다. 크기(height·paddingInline·fontSize)는 fieldSize 가 래퍼에 준다.
export const fieldWrap = style({
  display: "flex",
  alignItems: "center",
  gap: tokens.shape.control.gap,
  width: "100%",
  cursor: "text",
});

// 안쪽 input — 면·테두리·아웃라인 없음. 폰트·색은 래퍼에서 상속.
//
// 브라우저 기본 폼 스타일이 letter-spacing: normal 을 명시해 래퍼의 자간 상속을 끊을 수
// 있으므로 안쪽 input 에서 이어 붙인다. placeholder 와 입력값이 같은 기준선으로 읽힌다.
//
// 브라우저가 지우기(검색 ×)와 보기(Edge 비밀번호)를 같은 일을 하는 자기 장치로 입력 안에 그리므로 숨긴다 —
// 그 일의 주인은 Field 의 clearable 과 showPasswordToggle 이다. number 증감과 date 선택 장치는 브라우저에 남긴다.
export const fieldInput = style({
  flex: 1,
  minWidth: 0,
  // Chromium의 input은 자체 overflow: clip을 쓰므로, line-height만 높여도 caret가 작은
  // input box 경계에서 잘릴 수 있다. 입력면 높이 전체를 확보하고 줄상자는 내부에서 중앙에 둔다.
  height: "100%",
  border: "none",
  background: "transparent",
  // ring의 주인은 래퍼다.
  outline: "none",
  font: "inherit",
  // control line-height(16)까지 물려받으면 브라우저 caret와 한글 fallback glyph가
  // 한 줄 상자에 눌려 위아래가 잘릴 수 있다. 입력 줄상자는 fieldInputLeading 이 따로 주고 래퍼 안에서
  // 중앙 정렬해 caret 높이만 확보한다.
  letterSpacing: "inherit",
  color: "inherit",
  padding: 0,
  margin: 0,
  selectors: {
    // 비활성 native input 의 기본 커서 대신 틀(inputFrame)의 not-allowed 를 받는다.
    "&:disabled": { cursor: "inherit" },
    "&::-webkit-search-cancel-button, &::-webkit-search-decoration": { appearance: "none", display: "none" },
    "&::-ms-clear, &::-ms-reveal": { display: "none" },
  },
});

// Shared input geometry and the field typography preset.
export const fieldSize = styleVariants(
  controlGeometry.field,
);

// 입력값이 앉는 줄상자. preset 의 글자 줄(16)은 Shape 의 안쪽 여백이 읽는 값이라, caret 의 높이는 따로 둔다.
export const fieldInputLeading = styleVariants(
  Object.fromEntries(CONTROL_SIZES.map((size) => [size, { lineHeight: tokens.typography.preset.field[size].inputLeading }])) as Record<ControlSize, { lineHeight: string }>,
);

// 어도먼트 — leading/trailing 슬롯(아이콘·$·단위). 축소 안 됨. 색은 fieldAdornmentPaint.
export const fieldAdornment = style({
  display: "inline-flex",
  alignItems: "center",
  flexShrink: 0,
});

// 액션 버튼 — clear(×)·비밀번호 보기(👁). 색은 fieldActionPaint(흐렸다가 hover 때 또렷).
// 보이는 아이콘은 컨트롤 아이콘 크기 그대로이고, 누르는 자리는 보이지 않는 ::before 가 24px 까지 넓힌다.
// 링은 버튼 자신의 곡률을 따른다.
export const fieldAction = style([stateStyle.focusVisible, stateStyle.disabledCursor, {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRadius: tokens.shape.radius.control,
  transition: transition("hover", "color"),
}]);

// 액션의 보이지 않는 hit area — 아이콘이 최소 target 에 못 미친 만큼 사방으로. 형제 액션과 겹치지 않는다.
export const fieldActionReach = styleVariants(
  geometry.target.action,
  (inset) => ({ selectors: { "&::before": { content: "''", position: "absolute", inset } } }),
);

// 정렬 축 — numeric 과 직교. 논리값(start·center·end)이라 RTL 도 따라간다. 우측정렬 숫자열 = numeric + end.
export const fieldAlign = styleVariants({
  start: { textAlign: "start" },
  center: { textAlign: "center" },
  end: { textAlign: "end" },
});
