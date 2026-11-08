// 자료실: files students share for a subject (notes, worksheets, past assignments) and the syllabi. Everything starts as
// "pending" and is shown once a manager approves it. The files here are made up — there is nothing behind them but a name,
// a type, a size and a number of pages the preview draws.

import { pick, random, shuffle } from "../../../kit";
import { termData, TERMS } from "./build";
import { ME } from "./people";

export type MaterialCategory = "syllabus" | "lecture_note" | "worksheet" | "assignment" | "reference" | "other";
export type MaterialStatus = "pending" | "approved" | "rejected";

export const CATEGORY_LABEL: Record<MaterialCategory, string> = { syllabus: "강의계획서", lecture_note: "강의 노트", worksheet: "학습지", assignment: "과제", reference: "참고 자료", other: "기타" };
export const CATEGORIES = Object.keys(CATEGORY_LABEL) as MaterialCategory[];

export type MaterialFile = { id: number; name: string; mediaType: string; sizeBytes: number; pages: number; image: boolean };
export type Material = {
  id: number;
  term: string;
  // the subject's name as the term lists it
  subject: string;
  title: string;
  category: MaterialCategory;
  description: string | null;
  status: MaterialStatus;
  rejectionReason: string | null;
  primarySyllabus: boolean;
  files: MaterialFile[];
  createdAt: string;
  updatedAt: string;
  uploader: { username: string; stuId: string };
  decidedAt: string | null;
};

export const MEDIA: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  zip: "application/zip",
};
export const extensionOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

const TITLES: Record<MaterialCategory, readonly string[]> = {
  syllabus: ["강의계획서"],
  lecture_note: ["필기 정리", "중간고사 전 총정리", "단원별 요약", "수업 내용 풀이", "교재 보충 노트"],
  worksheet: ["연습문제 풀이", "기출 유형 모음", "개념 확인 학습지", "실전 문제지"],
  assignment: ["과제 풀이 예시", "발표 자료", "보고서 초안과 피드백", "프로젝트 정리"],
  reference: ["더 읽을 자료", "참고 문헌 목록", "용어 사전", "시각 자료 모음"],
  other: ["수업 팁", "자료 모음"],
};
const NOTES = [
  "수업에서 나온 순서대로 정리했습니다.",
  "시험 범위만 간추려 두었습니다.",
  "풀이 과정을 한 줄씩 적었습니다.",
  "표와 그림 위주로 보기 좋게 묶었습니다.",
  "틀린 부분이 있으면 알려 주세요.",
];
const HANDLES = ["seoyeon", "doyun", "jiho", "harin", "minjun", "jiwoo", "seoah", "hajun", "yerin", "siwoo", "jian", "yuna"];

const sizeOf = (r: () => number, extension: string) => Math.round((extension === "pdf" ? 180_000 + r() * 3_800_000 : extension === "png" || extension === "jpg" ? 90_000 + r() * 1_400_000 : 40_000 + r() * 900_000));

export const makeFile = (r: () => number, id: number, title: string, extension: string, index: number): MaterialFile => ({
  id,
  name: `${title.replaceAll(" ", "_")}${index > 0 ? `_${index + 1}` : ""}.${extension}`,
  mediaType: MEDIA[extension] ?? "application/octet-stream",
  sizeBytes: sizeOf(r, extension),
  pages: extension === "pdf" || extension === "pptx" || extension === "docx" ? 2 + Math.floor(r() * 6) : 1,
  image: extension === "png" || extension === "jpg" || extension === "webp",
});

export const firstMaterials = (): Material[] => {
  const r = random("classes:materials");
  const names = termData(TERMS[0]!).subjects.map((subject) => subject.subject);
  const out: Material[] = [];
  let id = 1;
  let fileId = 1;
  const handles = shuffle(r, HANDLES);
  // n counts days from 1 October 2026 (0–33 reach 3 November)
  const day = (n: number) => `${n < 31 ? `2026-10-${String(n + 1).padStart(2, "0")}` : `2026-11-${String(n - 30).padStart(2, "0")}`}T${String(9 + Math.floor(r() * 10)).padStart(2, "0")}:${String(Math.floor(r() * 60)).padStart(2, "0")}:00+09:00`;
  // a syllabus for most subjects
  for (const subject of names) {
    if (r() < 0.35) continue;
    const when = day(1 + Math.floor(r() * 12));
    out.push({
      id: id++, term: "2026-2", subject, title: `${subject} 강의계획서`, category: "syllabus", description: "학교에서 올린 강의계획서입니다.", status: "approved", rejectionReason: null, primarySyllabus: true,
      files: [makeFile(r, fileId++, `${subject}_강의계획서`, "pdf", 0)], createdAt: when, updatedAt: when, uploader: { username: "office", stuId: "관리자" }, decidedAt: when,
    });
  }
  // what students shared
  const shared = shuffle(r, names).slice(0, 34);
  for (const subject of shared) {
    const category = pick(r, ["lecture_note", "lecture_note", "worksheet", "assignment", "reference", "other"] as const);
    const title = `${subject} ${pick(r, TITLES[category])}`;
    const extension = pick(r, ["pdf", "pdf", "pdf", "docx", "pptx", "png"] as const);
    const when = day(1 + Math.floor(r() * 30));
    const handle = handles[out.length % handles.length]!;
    const status: MaterialStatus = r() < 0.12 ? "pending" : r() < 0.1 ? "rejected" : "approved";
    out.push({
      id: id++, term: "2026-2", subject, title, category, description: r() < 0.8 ? pick(r, NOTES) : null, status,
      rejectionReason: status === "rejected" ? pick(r, ["내용이 교재 본문을 그대로 옮긴 것이라 올릴 수 없습니다.", "개인정보가 보이는 사진이 있어 가려서 다시 올려 주세요.", "파일이 열리지 않습니다."]) : null,
      primarySyllabus: false,
      files: Array.from({ length: 1 + Math.floor(r() * 2) }, (_, index) => makeFile(r, fileId++, title, extension, index)),
      createdAt: when, updatedAt: when, uploader: { username: handle, stuId: `25-${320 + (out.length % 30)}` }, decidedAt: status === "pending" ? null : when,
    });
  }
  // two of mine
  for (const [subject, status, title] of [["정보과학3", "approved", "그래프 탐색 정리"], ["일반지구과학", "pending", "판구조론 요약"]] as const) {
    const when = day(status === "approved" ? 28 : 33);
    out.push({
      id: id++, term: "2026-2", subject, title, category: "lecture_note", description: "수업 노트를 정리했습니다.", status, rejectionReason: null, primarySyllabus: false,
      files: [makeFile(r, fileId++, title, "pdf", 0)], createdAt: when, updatedAt: when, uploader: { username: "jiwoo", stuId: ME.stuId }, decidedAt: status === "approved" ? when : null,
    });
  }
  return out;
};
