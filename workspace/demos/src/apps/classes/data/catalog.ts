// The course catalogue: what a course is (credits, department, tier, prerequisites), apart from who teaches it this term.
// Rows come from the snapshot in ./generated; the descriptions are written for this demo.

import { COURSE_ROWS, DEPARTMENT_ROWS, PREREQUISITE_ROWS } from "./generated/curriculum";

export type Category = "natural" | "humanities" | "convergence";
export type Tier = "core" | "advanced" | "ap" | "special" | "convergence";

export type Course = {
  name: string;
  english: string;
  department: string;
  category: Category;
  credits: number;
  apCredits: number;
  pf: boolean;
  // "1".."8", "summer" or empty.
  recommended: string;
  tier: Tier;
  requiredAdvanced: boolean;
  // Offered in English (EC) as well as in Korean.
  ec: boolean;
  description: string;
};

export type Department = { name: string; category: Category; track: string; notes: readonly string[] };
export type Prereq = { before: string; after: string; alternative: boolean };

export const CATEGORY_LABEL: Record<Category, string> = { natural: "자연과학", humanities: "인문사회", convergence: "융합" };
export const TIER_LABEL: Record<Tier, string> = { core: "핵심", advanced: "심화", ap: "AP", special: "특강", convergence: "융합" };
export const DEPARTMENT_ORDER = ["수학", "정보과학", "물리학", "화학", "생물학", "지구과학", "국어", "사회", "외국어", "예체능", "융합"];

const SPECIFIC: Record<string, string> = {
  수학1: "집합과 함수, 수열, 극한과 연속을 엄밀한 증명과 함께 다시 세우는 첫 수학 수업입니다.",
  수학2: "미분과 적분의 기초를 다지고 미적분학으로 가는 다리를 놓습니다.",
  미적분학1: "한 변수 함수의 미분과 적분을 극한의 언어로 다시 정리합니다.",
  "미적분학2(EC)": "급수, 매개변수 곡선, 다변수 함수의 첫걸음을 영어로 배웁니다.",
  미적분학3: "다변수 미적분과 벡터 해석을 다루는 AP 수준의 과목입니다.",
  "선형대수(EC)": "벡터 공간, 선형 변환, 고유값을 영어 강의로 배우는 과목입니다.",
  확률및통계: "확률 공간에서 출발해 추정과 검정까지 이어지는 수업입니다.",
  정보과학1: "파이썬으로 시작해 자료형과 흐름 제어, 간단한 알고리즘을 익힙니다.",
  정보과학2: "객체와 재귀, 기초 자료구조를 직접 구현하며 배웁니다.",
  정보과학3: "그래프와 동적 계획법 등 알고리즘 설계의 기본 도구를 다룹니다.",
  자료구조: "배열, 연결 리스트, 트리, 해시를 구현하고 비용을 따져 봅니다.",
  알고리즘: "분할 정복, 그리디, 최단 경로 같은 설계 기법과 복잡도 분석을 배웁니다.",
  "프로그래밍과문제해결(EC)": "영어로 문제를 읽고 코드로 푸는 훈련을 합니다.",
  물리학및실험1: "역학과 파동을 실험과 함께 배우는 1학년 필수 과목입니다.",
  물리학및실험2: "전자기학과 현대물리의 기초를 실험으로 확인합니다.",
  일반물리학1: "뉴턴 역학을 미적분으로 풀어내는 대학 수준의 물리 수업입니다.",
  일반물리학2: "전자기와 광학을 다루며 일반물리학1을 이어 갑니다.",
  화학및실험: "원자 구조에서 반응 속도까지 화학의 뼈대를 실험으로 세웁니다.",
  일반화학1: "열역학과 화학 평형을 정량적으로 다룹니다.",
  생물학및실험: "세포에서 생태계까지 생물학의 큰 그림을 실험으로 훑습니다.",
  일반생물학1: "분자와 세포 수준의 생명 현상을 깊이 있게 배웁니다.",
  일반지구과학: "지구 내부 구조부터 대기와 해양까지 지구계 전체를 다룹니다.",
  일반지구과학실험: "암석과 광물, 지도와 단면도를 직접 다뤄 보는 실험 수업입니다.",
  일반천문학: "별의 진화와 은하, 우주론의 기초를 정량적으로 배웁니다.",
  국어1: "읽고 쓰고 말하기를 모둠 활동으로 훈련하는 첫 국어 수업입니다.",
  국어2: "토론과 발표를 중심으로 비평문을 쓰는 연습을 합니다.",
  논리와글쓰기: "논증의 구조를 분석하고 설득하는 글을 직접 씁니다.",
  문학: "근현대 문학 작품을 시대와 연결해 읽고 비평합니다.",
  영어Ⅰ: "학술 영어의 읽기와 쓰기, 토론의 기초를 닦습니다.",
  영어Ⅱ: "발표와 에세이를 중심으로 학술 영어를 확장합니다.",
  영어Ⅲ: "비판적 읽기와 논증적 글쓰기를 다루는 영어 필수 과정의 마지막 단계입니다.",
  세계사의이해: "문명의 접촉과 충돌을 중심으로 세계사를 큰 흐름에서 이해합니다.",
  한국사의이해: "한국사를 자료 읽기 중심으로 다시 살펴봅니다.",
  철학: "인식과 존재, 윤리의 질문을 고전 텍스트로 따라가 봅니다.",
  정치와경제: "제도와 시장이 사회를 움직이는 방식을 사례로 배웁니다.",
  생활음악: "합창과 악기 합주를 통해 음악을 직접 만들어 보는 수업입니다.",
  음악: "음악의 구조와 역사를 듣고 만들며 이해합니다.",
  미술: "조형의 기본 원리를 연습하고 작품을 감상합니다.",
  체육1: "구기와 체력 운동을 고르게 경험합니다.",
  체육2: "팀 스포츠를 중심으로 전략과 협동을 배웁니다.",
  체육3: "개인 종목과 팀 종목을 번갈아 하며 체력을 키웁니다.",
  체육4: "선택 종목을 정해 깊이 있게 연습하는 마지막 필수 체육입니다.",
  융합특강: "해마다 주제를 바꿔 여러 분야를 가로지르는 특강입니다.",
  창의공학: "문제를 정의하고 시제품을 만들어 보는 프로젝트 수업입니다.",
  과학기술과사회: "과학 기술이 사회와 맺는 관계를 사례로 토론합니다.",
  법과학: "증거를 과학으로 다루는 방법을 화학과 생물학으로 살펴봅니다.",
  수학과예술: "대칭과 비율, 기하가 예술에서 쓰이는 방식을 탐구합니다.",
  우주생물학: "생명이 존재할 조건과 외계 생명 탐사를 다룹니다.",
};

const GENERIC: Record<string, string> = {
  수학: "수학적 사고를 한 단계 넓히는 과목입니다.",
  정보과학: "컴퓨터과학의 개념을 직접 구현하며 배우는 과목입니다.",
  물리학: "물리 현상을 수식과 실험으로 풀어 보는 과목입니다.",
  화학: "물질과 반응을 정량적으로 이해하는 과목입니다.",
  생물학: "생명 현상을 분자에서 개체까지 살펴보는 과목입니다.",
  지구과학: "지구와 우주를 관측과 모형으로 이해하는 과목입니다.",
  국어: "읽기와 쓰기, 말하기를 깊이 있게 다루는 과목입니다.",
  사회: "사회 현상을 자료와 논증으로 이해하는 과목입니다.",
  외국어: "언어와 문화를 함께 배우는 과목입니다.",
  예체능: "몸과 감각으로 배우는 실기 중심 과목입니다.",
  융합: "서로 다른 분야를 엮어 새로운 질문을 만드는 과목입니다.",
};

const departmentCategory = (name: string): Category => (name === "융합" ? "convergence" : ["국어", "사회", "외국어", "예체능"].includes(name) ? "humanities" : "natural");

export const DEPARTMENTS: readonly Department[] = DEPARTMENT_ROWS.map(([name, track, notes]) => ({ name, category: departmentCategory(name), track, notes }));

export const COURSES: readonly Course[] = COURSE_ROWS.map(([name, english, department, category, credits, apCredits, pf, recommended, tier, requiredAdvanced, ec]) => ({
  name,
  english,
  department,
  category: category as Category,
  credits,
  apCredits,
  pf: pf === 1,
  recommended,
  tier: tier as Tier,
  requiredAdvanced: requiredAdvanced === 1,
  ec: ec === 1,
  description: SPECIFIC[name] ?? `${GENERIC[department] ?? "개설 과목입니다."} ${credits}학점${pf === 1 ? ", 통과·실패로 평가합니다" : ""}.`,
}));

export const PREREQUISITES: readonly Prereq[] = PREREQUISITE_ROWS.map(([before, after, alternative]) => ({ before, after, alternative: alternative === 1 }));

export const COURSE_BY_NAME = new Map(COURSES.map((course) => [course.name, course]));
export const courseOf = (name: string) => COURSE_BY_NAME.get(name);

// 졸업 요건 (credits): the numbers the school asks for in each strand, and the English-class requirement.
export const REQUIREMENTS: Record<string, number> = { natural: 67, humanities: 52, convergence: 8, ec: 10 };
export const GRADE_POINTS: Record<string, number> = { "A+": 4.3, A0: 4.0, "A-": 3.7, "B+": 3.3, B0: 3.0, "B-": 2.7, "C+": 2.3, C0: 2.0, "C-": 1.7, "D+": 1.3, D0: 1.0, "D-": 0.7, F: 0 };
export const GRADE_OPTIONS = Object.keys(GRADE_POINTS);
