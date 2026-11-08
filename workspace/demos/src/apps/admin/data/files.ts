import { random } from "../../../kit";
import { DAY, HOUR, MINUTE, before, now } from "../lib/clock";
import { visitorAddress } from "../lib/fake";
import { mimeOf } from "../lib/format";
import type { AdminFile, DownloadEvent, DownloadResult, FileRow, FileState } from "./types";

export const PUBLIC_BASE = "https://files.example.com";
export const publicUrl = (slug: string) => `${PUBLIC_BASE}/f/${encodeURIComponent(slug)}`;

const KB = 1024;
const MB = 1024 * KB;
const GB = 1024 * MB;

type Seed = {
  slug: string;
  title: string;
  name: string;
  size: number;
  description: string;
  age: number;
  expires: number | null;
  max?: number;
  downloads: number;
  locked?: boolean;
};

const SEEDS: readonly Seed[] = [
  { slug: "midterm-v3", title: "탐구 중간 보고서", name: "탐구_중간보고서_v3.pdf", size: 4.8 * MB, description: "지도 선생님께 드릴 최종본", age: 2, expires: 12, downloads: 6 },
  { slug: "pendulum-trials", title: "물리학실험 측정 데이터", name: "pendulum_trial_07.csv", size: 212 * KB, description: "조원 공유용 원자료. 단진자 30회 측정", age: 5, expires: 25, downloads: 11 },
  { slug: "club-fair-poster", title: "동아리 박람회 포스터 시안", name: "poster_v5_final.png", size: 6.4 * MB, description: "인쇄 전 마지막 시안", age: 9, expires: null, downloads: 23 },
  { slug: "rehearsal-1027", title: "발표 리허설 영상", name: "rehearsal_1027.mp4", size: 1.18 * GB, description: "세 번째 리허설. 발표 순서 확인용", age: 7, expires: 3, max: 5, downloads: 4, locked: true },
  { slug: "backup-2026-10", title: "프로젝트 백업 2026-10", name: "backup-2026-10-31.tar.gz", size: 842 * MB, description: "10월 말 전체 백업", age: 4, expires: 0.96, max: 3, downloads: 1, locked: true },
  { slug: "timetable-drafts", title: "시간표 앱 시안 모음", name: "timetable-ui-drafts.zip", size: 38.2 * MB, description: "화면 시안 열두 장과 원본 파일", age: 15, expires: null, downloads: 31 },
  { slug: "math2-notes", title: "수학II 풀이 노트", name: "수학II_풀이노트_1-6단원.pdf", size: 12.6 * MB, description: "1단원부터 6단원까지 손풀이 스캔", age: 20, expires: null, downloads: 58 },
  { slug: "benchy-pla", title: "3D 프린터 벤치마킹 G-code", name: "benchy_pla_0.2mm.gcode", size: 3.1 * MB, description: "PLA 0.2mm, 노즐 205도", age: 6, expires: 30, downloads: 2 },
  { slug: "marlin-config-old", title: "Marlin 설정 파일", name: "Configuration_adv.h", size: 38 * KB, description: "예전 펌웨어 설정", age: 40, expires: -12, downloads: 7 },
  { slug: "orientation-schedule", title: "신입생 일정표", name: "orientation_schedule.xlsx", size: 96 * KB, description: "오리엔테이션 주간 일정", age: 33, expires: -3, downloads: 41 },
  { slug: "board-rev4", title: "회로도 rev4", name: "board_rev4_schematic.svg", size: 420 * KB, description: "전원부를 고친 네 번째 판", age: 11, expires: null, downloads: 8 },
  { slug: "slides-final", title: "발표 슬라이드 (한글)", name: "발표자료_최종.hwpx", size: 2.2 * MB, description: "교내 발표회용", age: 13, expires: 9, downloads: 14 },
  { slug: "bio-lab-photos", title: "생물 실험 사진 묶음", name: "bio_lab_photos.zip", size: 214 * MB, description: "현미경 사진 열두 장", age: 8, expires: 6, max: 10, downloads: 10 },
  { slug: "review-notes", title: "코드 리뷰 메모", name: "review-notes.md", size: 8 * KB, description: "", age: 3, expires: null, downloads: 3 },
  { slug: "references-bib", title: "논문 참고문헌", name: "references.bib", size: 54 * KB, description: "초안에서 인용한 문헌 목록", age: 18, expires: null, downloads: 9 },
  { slug: "demo-cut-60s", title: "시연 영상 (짧은 버전)", name: "demo_cut_60s.mov", size: 286 * MB, description: "1분으로 줄인 판", age: 1, expires: 2, max: 4, downloads: 1 },
  { slug: "shared-snapshot", title: "공유 폴더 스냅샷", name: "shared-folder-snapshot.7z", size: 96.4 * MB, description: "", age: 27, expires: -5, downloads: 6, locked: true },
  { slug: "english-submit", title: "영어 수행평가 제출본", name: "영어_수행평가_제출본.docx", size: 1.1 * MB, description: "제출 기한 지나서 닫음", age: 22, expires: -1, downloads: 5 },
  { slug: "enclosure-parts", title: "케이스 설계 STL 묶음", name: "enclosure_parts.zip", size: 17.8 * MB, description: "상판, 하판, 버튼 세 부품", age: 12, expires: null, downloads: 12 },
  { slug: "a11y-checklist", title: "웹 접근성 점검표", name: "a11y-checklist.pdf", size: 780 * KB, description: "배포 전에 훑어보는 열두 항목", age: 16, expires: null, downloads: 19 },
  { slug: "demo-track-v2", title: "음악 시안 (미완성)", name: "demo_track_v2.mp3", size: 8.9 * MB, description: "후렴이 아직 비어 있음", age: 10, expires: 20, max: 3, downloads: 3 },
  { slug: "deploy-scripts", title: "배포 스크립트 모음", name: "deploy-scripts.tar.gz", size: 120 * KB, description: "", age: 36, expires: null, downloads: 4 },
  { slug: "survey-raw", title: "설문 응답 원본", name: "survey_responses.csv", size: 3.4 * MB, description: "개인 정보는 지운 판", age: 14, expires: 16, downloads: 17, locked: true },
  { slug: "scan-1022", title: "스캔한 필기 (사본)", name: "scan_2026-10-22.heic", size: 3.9 * MB, description: "", age: 12, expires: -2, downloads: 2 },
  { slug: "third-party", title: "오픈소스 라이선스 목록", name: "THIRD_PARTY_NOTICES.txt", size: 214 * KB, description: "배포본에 같이 넣는 고지문", age: 29, expires: null, downloads: 6 },
  { slug: "icon-candidates", title: "앱 아이콘 후보", name: "icon-candidates.png", size: 1.7 * MB, description: "여섯 가지 후보를 한 장에", age: 19, expires: null, downloads: 26 },
  { slug: "firmware-142", title: "펌웨어 바이너리", name: "firmware-v1.4.2.bin", size: 1.0 * MB, description: "프린터 보드용 1.4.2", age: 2, expires: 5, max: 5, downloads: 2 },
  { slug: "dataset-sample", title: "데이터셋 일부 (샘플)", name: "dataset_sample_1k.parquet", size: 11.4 * MB, description: "천 행만 뽑은 맛보기", age: 24, expires: null, downloads: 13 },
  { slug: "interview-03", title: "인터뷰 녹취", name: "interview_clip_03.m4a", size: 24.6 * MB, description: "세 번째 인터뷰, 12분", age: 6, expires: 1, max: 2, downloads: 2 },
  { slug: "slides-week09", title: "9주차 슬라이드 모음", name: "slides-week09.pdf", size: 9.3 * MB, description: "", age: 5, expires: null, downloads: 22 },
  { slug: "font-subset", title: "폰트 서브셋 테스트", name: "subset-test.woff2", size: 142 * KB, description: "한글 2350자만 남긴 판", age: 42, expires: null, downloads: 3 },
  { slug: "exam-range", title: "시험 범위 정리", name: "exam-range-summary.pdf", size: 2.6 * MB, description: "중간고사 범위 요약", age: 28, expires: -9, downloads: 72 },
];

export const seedFiles = (): FileRow[] =>
  SEEDS.map((seed, index) => {
    const createdAt = before(seed.age * DAY + ((index * 37) % 19) * HOUR + ((index * 11) % 50) * MINUTE);
    const expiresAt = seed.expires === null ? null : before(-seed.expires * DAY);
    return {
      id: `f_${String(index + 1).padStart(3, "0")}`,
      slug: seed.slug,
      title: seed.title,
      description: seed.description,
      originalName: seed.name,
      mime: mimeOf(seed.name),
      size: Math.round(seed.size),
      visibility: seed.locked ? "password" : "public",
      expiresAt,
      maxDownloads: seed.max ?? null,
      downloadCount: seed.downloads,
      createdAt,
      updatedAt: createdAt,
    };
  });

export const fileState = (row: FileRow, at = now()): FileState => {
  if (row.expiresAt !== null && row.expiresAt <= at) return "expired";
  if (row.maxDownloads !== null && row.downloadCount >= row.maxDownloads) return "exhausted";
  return "live";
};

export const readFile = (row: FileRow, at = now()): AdminFile => ({
  ...row,
  locked: row.visibility === "password",
  remainingDownloads: row.maxDownloads === null ? null : Math.max(0, row.maxDownloads - row.downloadCount),
  state: fileState(row, at),
});

export type FileKind = "all" | "document" | "archive" | "image" | "other";
export const fileKind = (name: string): Exclude<FileKind, "all"> => {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  if (["zip", "7z", "rar", "gz", "tar", "bz2", "xz"].includes(extension)) return "archive";
  if (["png", "jpg", "jpeg", "webp", "gif", "svg", "heic", "avif"].includes(extension)) return "image";
  if (["pdf", "doc", "docx", "hwp", "hwpx", "txt", "md", "ppt", "pptx", "xls", "xlsx", "csv"].includes(extension)) return "document";
  return "other";
};
export const KIND_OPTIONS = [
  { value: "all", label: "모든 종류" },
  { value: "document", label: "문서" },
  { value: "archive", label: "압축 파일" },
  { value: "image", label: "이미지" },
  { value: "other", label: "기타 파일" },
] as const;
export const SORT_OPTIONS = [
  { value: "recent", label: "최근 업로드순" },
  { value: "name", label: "이름순" },
  { value: "size", label: "큰 파일순" },
] as const;

export const visibleFiles = (files: AdminFile[], query: string, kind: string, sort: string) => {
  const search = query.trim().toLocaleLowerCase().normalize("NFC");
  return files
    .filter((file) => (!search || [file.title, file.description, file.originalName, file.slug].some((text) => text.toLocaleLowerCase().normalize("NFC").includes(search))) && (kind === "all" || fileKind(file.originalName) === kind))
    .sort((a, b) => (sort === "name" ? a.title.localeCompare(b.title, "ko") : sort === "size" ? b.size - a.size : b.createdAt - a.createdAt));
};

const CLIENTS = ["Chrome · Windows", "Safari · iPhone", "Chrome · Android", "Edge · Windows", "Safari · macOS", "Firefox · Linux", "Chrome · macOS", "curl"] as const;
const PLACES = ["서울", "서울", "서울", "부산", "대전", "인천", "광주", "수원", "해외"] as const;

export const downloadsOf = (file: AdminFile, limit = 40): DownloadEvent[] => {
  const next = random(`visits:${file.id}`);
  const end = Math.min(now(), file.expiresAt ?? now());
  const span = Math.max(HOUR, end - file.createdAt);
  const events: DownloadEvent[] = [];
  const entry = (index: number, result: DownloadResult, at: number): DownloadEvent => ({
    id: `${file.id}:${index}`,
    fileId: file.id,
    at,
    address: visitorAddress(next),
    client: CLIENTS[Math.floor(next() * CLIENTS.length)]!,
    place: PLACES[Math.floor(next() * PLACES.length)]!,
    result,
  });
  const count = Math.min(file.downloadCount, limit);
  for (let index = 0; index < count; index++) {
    const at = file.createdAt + Math.pow(next(), 1.7) * span;
    events.push(entry(index, "완료", Math.round(at)));
  }
  if (file.visibility === "password") {
    for (let index = 0; index < 2 + Math.floor(next() * 3); index++) events.push(entry(100 + index, "비밀번호 오류", Math.round(file.createdAt + next() * span)));
  }
  if (file.state === "expired") events.push(entry(200, "만료됨", Math.round(end + next() * 2 * DAY)));
  if (file.state === "exhausted") events.push(entry(201, "횟수 소진", Math.round(end - next() * DAY)));
  return events.sort((a, b) => b.at - a.at).filter((event) => event.at <= now());
};

export type Visit = DownloadEvent & { title: string; slug: string };
export const recentVisits = (files: readonly AdminFile[], limit = 80): Visit[] =>
  files
    .flatMap((file) => downloadsOf(file, 30).map((event) => ({ ...event, title: file.title, slug: file.slug })))
    .sort((a, b) => b.at - a.at)
    .slice(0, limit);

export const dailyDownloads = (file: AdminFile, days = 14): { day: number; count: number }[] => {
  const start = now() - (days - 1) * DAY;
  const buckets = Array.from({ length: days }, (_, index) => ({ day: start + index * DAY, count: 0 }));
  for (const event of downloadsOf(file, 400)) {
    if (event.result !== "완료") continue;
    const slot = Math.floor((event.at - start) / DAY);
    if (slot >= 0 && slot < days) buckets[slot]!.count += 1;
  }
  return buckets;
};
