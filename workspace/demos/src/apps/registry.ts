import type { GlyphName } from "../kit";

export type AppEntry = { id: string; name: string; description: string; glyph: GlyphName };

export const APPS: readonly AppEntry[] = [
  { id: "admin", name: "관리 콘솔", description: "파일, WireGuard, Galaxy, Wake-on-LAN을 한곳에서 다룹니다.", glyph: "shield-check" },
  { id: "paperdown", name: "Paperdown", description: "Markdown을 종이처럼 조판하고 PDF로 내보냅니다.", glyph: "file-text" },
  { id: "doodle", name: "Doodle", description: "떠오른 생각을 끄적이고 모아 둡니다.", glyph: "pen-line" },
  { id: "gridphoto", name: "GridPhoto", description: "모눈종이 사진을 반듯하게 펴서 문서로 만듭니다.", glyph: "scan-line" },
  { id: "music", name: "음악", description: "보관함, 재생목록, 가사, 다음 곡까지.", glyph: "music" },
  { id: "classes", name: "Class Explorer", description: "학교의 과목과 분반, 시간표를 찾아봅니다.", glyph: "graduation-cap" },
  { id: "wiki", name: "위키", description: "문서, 목차, 분류, 최근 변경, 토론.", glyph: "book-open" },
  { id: "printer", name: "프린터 콘솔", description: "3D 프린터의 상태, 파일, 기록, 설정.", glyph: "printer" },
];
