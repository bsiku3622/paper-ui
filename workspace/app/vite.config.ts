import { resolve } from "node:path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

// dev 에서 workspace dep 을 *source* 로 해결한다.
// dist/ 가 있으면 package.json exports 가 dist/index.js 로 매핑돼 vanilla-extract
// plugin 이 .css.ts 를 못 본다 (이미 컴파일된 js 만 보임).
// (app CSS 를 .css.ts 로 전환 — site/detail/markdown 이 tokens.* 를 직접 소비한다.)
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],
  resolve: {
    alias: {
      "@studio-baeks/paper-ui": resolve(__dirname, "../packages/paper-ui/src/index.ts"),
    },
  },
});
