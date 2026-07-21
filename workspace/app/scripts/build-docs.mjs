// docs/**/*.md → app/public/docs/ 로 미러링 + manifest.json 생성.
// docs 가 app 밖(repo 루트)에 살아서, 앱이 fetch 할 수 있게 public 으로 복사한다.
// (funky-ui/studio-ui 와 같은 방식. 라이브러리엔 docs 컴포넌트를 안 넣는다 — 앱 몫.)

import { readdir, readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const DOCS = join(here, "../../../docs");        // paper-ui/docs
const OUT = join(here, "../public/docs");         // app/public/docs

// 섹션 순서·라벨 (없는 그룹은 알파벳). slug 는 그룹/파일.
const GROUP_ORDER = ["", "get-started", "foundations", "components"];
const GROUP_LABEL = {
  "get-started": "시작하기",
  foundations: "기초",
  components: "컴포넌트",
  "": "개요",
};

const walk = async (dir, base = "") => {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const rel = join(base, e.name);
    if (e.isDirectory()) out.push(...(await walk(join(dir, e.name), rel)));
    else if (e.name.endsWith(".md")) out.push(rel);
  }
  return out;
};

const title = (md, slug) => {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : slug;
};

const run = async () => {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const files = await walk(DOCS);
  const docs = [];
  for (const rel of files) {
    const md = await readFile(join(DOCS, rel), "utf-8");
    const slug = rel.replace(/\.md$/, "").replace(/\/README$/, "").replace(/^README$/, "");
    const dest = join(OUT, rel);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, md);
    const group = rel.includes("/") ? rel.split("/")[0] : "";
    docs.push({ slug, group, title: title(md, slug), file: rel });
  }
  // 그룹별 정렬
  const groups = [...new Set(docs.map((d) => d.group))].sort(
    (a, b) => (GROUP_ORDER.indexOf(a) + 1 || 99) - (GROUP_ORDER.indexOf(b) + 1 || 99),
  );
  const manifest = groups.map((g) => ({
    group: g,
    label: GROUP_LABEL[g] ?? g,
    docs: docs.filter((d) => d.group === g).sort((a, b) => a.slug.localeCompare(b.slug)),
  }));
  await writeFile(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`docs → public/docs: ${docs.length} files, ${groups.length} groups`);
};

run();
