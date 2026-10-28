import { defaultClientConditions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

// workspace 의 @studio-baeks/paper-ui 를 dist 가 아니라 *source* 로 해결한다 — package.json exports 의
// "paper-ui-source" 조건(tsconfig customConditions 와 같은 이름)을 먼저 본다. 그래서 vanilla-extract
// plugin 이 패키지 .css.ts 를 직접 컴파일하고, "@studio-baeks/paper-ui/styles.css" 는
// src/styles/global.css.ts 로 풀린다. 앱 stylesheet(.css.ts)는 "@studio-baeks/paper-ui/tokens" 를 읽는다.
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    conditions: ["paper-ui-source", ...defaultClientConditions],
  },
});
