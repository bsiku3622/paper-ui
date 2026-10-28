// global.css.ts — 전역 스타일의 유일한 entry.
//
// `@studio-baeks/paper-ui/styles.css` 가 workspace 에서는 이 파일로, 배포본에서는
// dist/paper-ui.css 로 풀린다. 변수(theme) → 유틸리티 클래스 → accent 클래스 순서로 깐다.

import "./theme.css";
import "./utility.css";
import "./color.css";
