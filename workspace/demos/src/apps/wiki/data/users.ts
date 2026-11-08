// users.ts — the people who write this wiki. Names are nicknames made up for the demo.

import type { WikiUser } from "./types";

const at = (date: string) => new Date(`${date}T10:00:00+09:00`).getTime();

export const USERS: readonly WikiUser[] = [
  { name: "돌담지기", role: "관리자", joined: at("2026-02-12"), bio: "돌담위키를 처음 열어 둔 사람입니다. 분류를 정리하고 장난 편집을 되돌립니다." },
  { name: "새벽안개", role: "편집 위원", joined: at("2026-02-20"), bio: "천문과 지구과학 문서를 주로 고칩니다. 새벽 관측 기록을 문서로 옮기는 중입니다." },
  { name: "푸른빛", role: "편집자", joined: at("2026-03-03"), bio: "디자인과 타이포그래피 문서를 씁니다. 표 정리를 좋아합니다." },
  { name: "느린걸음", role: "편집자", joined: at("2026-03-09"), bio: "달리기 문서와 마라톤 훈련표를 가꿉니다." },
  { name: "민트초코", role: "편집자", joined: at("2026-03-15"), bio: "커피와 음식 문서를 정리합니다. 분류가 흩어지면 눈에 잘 띕니다." },
  { name: "항해사", role: "편집 위원", joined: at("2026-03-22"), bio: "돌담시와 항구 관련 문서를 관리합니다." },
  { name: "밤하늘", role: "편집자", joined: at("2026-04-02"), bio: "별누리와 학교 동아리 문서를 씁니다." },
  { name: "오후세시", role: "편집 위원", joined: at("2026-04-11"), bio: "문법 도움말과 틀 정리를 맡고 있습니다." },
  { name: "책벌레", role: "편집자", joined: at("2026-04-19"), bio: "한글과 국어 문서를 다듬습니다." },
  { name: "작은불빛", role: "편집자", joined: at("2026-05-06"), bio: "3D 프린터 문서와 필라멘트 표를 정리합니다." },
  { name: "모래시계", role: "편집자", joined: at("2026-05-30"), bio: "역사 문서의 연표를 맞춥니다." },
  { name: "여울", role: "편집자", joined: at("2026-06-14"), bio: "체스와 보드게임 문서를 씁니다." },
  { name: "소금빵", role: "편집자", joined: at("2026-07-08"), bio: "돌담 소금빵을 사랑합니다. 향토 음식 문서를 씁니다." },
  { name: "가을바람", role: "편집자", joined: at("2026-08-21"), bio: "프로그래밍 언어 문서의 예제를 손봅니다." },
];

export const WIKI_OPENED = at("2026-02-12");

export const userByName = (name: string) => USERS.find((user) => user.name === name);

// A visitor who edited without logging in.
export const GUEST = "손님";
export const isAnonymous = (name: string) => name === GUEST || name.startsWith("익명 ");
