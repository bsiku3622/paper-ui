import type { Bilingual } from "../../site/locale";

export const ARCFIELD = "/demo/arcfield";

export type ShowcaseApp = { id: string; name: Bilingual; about: Bilingual; src: string };

const same = (name: string): Bilingual => ({ ko: name, en: name });

export const SHOWCASE_APPS: readonly ShowcaseApp[] = [
  { id: "arcfield", name: same("Arcfield"), about: { ko: "클라우드 콘솔 — 개요 · 배포 · 모니터링 · 결제 · 보안", en: "A cloud console: overview, deploys, monitoring, billing, security" }, src: ARCFIELD },
  { id: "admin", name: { ko: "관리 콘솔", en: "Admin console" }, about: { ko: "파일 · VPN · 갤러리 · Wake-on-LAN을 한곳에서", en: "Files, a VPN, a gallery and Wake-on-LAN in one place" }, src: "/demos/admin/" },
  { id: "paperdown", name: same("Paperdown"), about: { ko: "Markdown을 종이처럼 조판하고 PDF로 내보내기", en: "Markdown typeset like paper, exported to PDF" }, src: "/demos/paperdown/" },
  { id: "doodle", name: same("Doodle"), about: { ko: "문서와 메모를 늘어놓는 무한 캔버스", en: "An endless canvas for documents and notes" }, src: "/demos/doodle/" },
  { id: "gridphoto", name: same("GridPhoto"), about: { ko: "모눈종이 사진을 반듯한 문서로", en: "Photos of graph paper, straightened into documents" }, src: "/demos/gridphoto/" },
  { id: "music", name: { ko: "음악", en: "Music" }, about: { ko: "보관함 · 재생목록 · 가사 · 다음 곡", en: "Library, playlists, lyrics and up next" }, src: "/demos/music/" },
  { id: "classes", name: same("Class Explorer"), about: { ko: "과목 · 분반 · 시간표 찾아보기", en: "Courses, sections and timetables" }, src: "/demos/classes/" },
  { id: "wiki", name: { ko: "위키", en: "Wiki" }, about: { ko: "문서 · 목차 · 분류 · 최근 변경 · 토론", en: "Articles, contents, categories, recent changes and talk" }, src: "/demos/wiki/" },
  { id: "printer", name: { ko: "프린터 콘솔", en: "Printer console" }, about: { ko: "3D 프린터의 상태 · 파일 · 기록 · 설정", en: "A 3D printer's status, files, history and settings" }, src: "/demos/printer/" },
];

export const appOf = (id: string | null): ShowcaseApp => SHOWCASE_APPS.find((app) => app.id === id) ?? SHOWCASE_APPS[0]!;

export const showcaseTo = (app: ShowcaseApp): string => (app.id === SHOWCASE_APPS[0]!.id ? "/demo" : `/demo?app=${app.id}`);
