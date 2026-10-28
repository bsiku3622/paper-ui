/// <reference types="vitest/config" />
import { fileURLToPath } from "node:url";
import { defaultClientConditions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

import { DOC_GROUPS } from "./src/site/site-core";
import { paperDocs } from "./vite/paper-docs";

const workspace = fileURLToPath(new URL("..", import.meta.url));
const docs = fileURLToPath(new URL("../../docs", import.meta.url));

// workspace 의 @studio-baeks/paper-ui 를 dist 가 아니라 *source* 로 해결한다 — package.json exports 의
// "paper-ui-source" 조건(tsconfig customConditions 와 같은 이름)을 먼저 본다. 그래서 vanilla-extract
// plugin 이 패키지 .css.ts 를 직접 컴파일하고, "@studio-baeks/paper-ui/styles.css" 는
// src/styles/global.css.ts 로 풀린다. 앱 stylesheet(.css.ts)는 "@studio-baeks/paper-ui/tokens" 를 읽는다.
// 문서는 레포 루트의 docs/ 에서 곧바로 읽는다 — paperDocs 가 목록을, "@docs" 가 본문을 준다.
export default defineConfig({
  plugins: [react(), vanillaExtractPlugin(), paperDocs({ dir: docs, groups: DOC_GROUPS })],
  resolve: {
    alias: { "@docs": docs },
    conditions: ["paper-ui-source", ...defaultClientConditions],
  },
  server: { fs: { allow: [workspace, docs] } },
  test: { environment: "jsdom", globals: true },
});
