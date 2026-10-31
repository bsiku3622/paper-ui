/// <reference types="vitest/config" />
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defaultClientConditions, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

import { DOC_GROUPS } from "./src/site/site-core";
import { paperDocs } from "./vite/paper-docs";
import { themeBoot } from "./vite/theme-boot";

const workspace = fileURLToPath(new URL("..", import.meta.url));
const docs = fileURLToPath(new URL("../../docs", import.meta.url));
const inspect = fileURLToPath(new URL("../packages/paper-ui/src/tokens/inspect/", import.meta.url));
const { version } = JSON.parse(readFileSync(new URL("../packages/paper-ui/package.json", import.meta.url), "utf-8")) as { version: string };

// workspace 의 @studio-baeks/paper-ui 를 dist 가 아니라 *source* 로 해결한다 — package.json exports 의
// "paper-ui-source" 조건(tsconfig customConditions 와 같은 이름)을 먼저 본다. 그래서 vanilla-extract
// plugin 이 패키지 .css.ts 를 직접 컴파일하고, "@studio-baeks/paper-ui/styles.css" 는
// src/styles/global.css.ts 로 풀린다. 앱 stylesheet(.css.ts)는 "@studio-baeks/paper-ui/tokens" 를 읽는다.
// Foundations inspector 는 "@paper-ui/inspect/<시스템>" 으로 원본을 읽는다 — src/tokens/inspect/<시스템>.ts 로 풀리는
// 앱 전용 alias 이고, tsconfig 의 paths 와 같은 하나다.
// 문서는 레포 루트의 docs/ 에서 곧바로 읽는다 — paperDocs 가 목록을, "@docs" 가 본문을 준다.
// 사이트가 보여 주는 버전은 패키지의 package.json 이 정본이다 — __PAPER_UI_VERSION__ 이 그것을 빌드 때 박는다.
export default defineConfig({
  define: { __PAPER_UI_VERSION__: JSON.stringify(version) },
  plugins: [react(), vanillaExtractPlugin(), paperDocs({ dir: docs, groups: DOC_GROUPS }), themeBoot()],
  resolve: {
    alias: [
      { find: "@docs", replacement: docs },
      { find: /^@paper-ui\/inspect\/(.+)$/, replacement: `${inspect}$1.ts` },
    ],
    conditions: ["paper-ui-source", ...defaultClientConditions],
  },
  server: { fs: { allow: [workspace, docs] } },
  test: { environment: "jsdom", globals: true },
});
