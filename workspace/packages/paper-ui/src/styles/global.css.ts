// global.css.ts — 전역 스타일의 유일한 entry.
//
// `@studio-baeks/paper-ui/styles.css` 가 workspace 에서는 이 파일로, 배포본에서는
// dist/paper-ui.css 로 풀린다. layers.css 가 맨 앞에서 `pui` 와 하위 layer 의 순서를 선언하고,
// 그 뒤로 변수(variables) · 문서 바탕(theme) · 간격 클래스(space) · 색 클래스(color) · 높이 클래스(elevation)를 들인다. 우선순위는
// import 순서가 아니라 각 규칙이 든 layer 가 정한다.

import "../tokens/layers.css";
import "../tokens/variables.css";
import "./theme.css";
import "./space.css";
import "./color.css";
import "./elevation.css";
