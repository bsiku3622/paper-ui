import { Fragment, createContext, useCallback, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type Dispatch, type FormEvent, type ReactNode, type RefObject, type SetStateAction } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Checkbox, Divider, Field, Floating, FormField, Grid, IconButton, Inline, Paint, Pressable, SegmentControl, Select, SelectableGroup, Spinner, Stack, Surface, Text, announce, useTheme, type BadgeProps } from "@studio-baeks/paper-ui";
import { tokens } from "@studio-baeks/paper-ui/tokens";

import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CloseIcon, InfoIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon, UpDownIcon } from "../../compositions/icons";

export type TabItem = { id: string; label: ReactNode; panel: ReactNode };

export const Tabs = ({ label, tabs, stretch = false, value: controlled, onValueChange }: { label: string; tabs: readonly TabItem[]; stretch?: boolean; value?: string; onValueChange?: (id: string) => void }) => {
  const base = useId();
  const [own, setOwn] = useState(tabs[0]!.id);
  const value = controlled !== undefined && tabs.some((tab) => tab.id === controlled) ? controlled : own;
  const setValue = (next: string) => {
    setOwn(next);
    onValueChange?.(next);
  };
  const group = {
    role: "tablist",
    "aria-label": label,
    selectedValues: [value],
    selectionRequired: true,
    onSelectedValuesChange: ([next]: string[]) => { if (next) setValue(next); },
    currentValue: value,
    onCurrentValueChange: setValue,
  };
  const buttons = tabs.map((tab) => (
    <Button key={tab.id} as={SelectableGroup.Item} value={tab.id} role="tab" id={`${base}-tab-${tab.id}`} aria-controls={`${base}-panel-${tab.id}`} variant="ghost" fullWidth={stretch}>
      {tab.label}
    </Button>
  ));
  return (
    <Stack gap="lg">
      {stretch ? <SelectableGroup as={Grid} columns={tabs.length} gap="xs" {...group}>{buttons}</SelectableGroup> : <SelectableGroup as={Inline} gap="xs" {...group}>{buttons}</SelectableGroup>}
      {tabs.map((tab) => (
        <Box key={tab.id} role="tabpanel" id={`${base}-panel-${tab.id}`} aria-labelledby={`${base}-tab-${tab.id}`} hidden={tab.id !== value}>
          {tab.panel}
        </Box>
      ))}
    </Stack>
  );
};

export const useParam = (key: string, fallback: string, allowed?: readonly string[]) => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const raw = params.get(key);
  const value = raw !== null && (!allowed || allowed.includes(raw)) ? raw : fallback;
  const set = useCallback(
    (next: string) => {
      const copy = new URLSearchParams(window.location.search);
      if (next === fallback) copy.delete(key);
      else copy.set(key, next);
      const search = copy.toString();
      navigate({ search: search ? `?${search}` : "", hash: window.location.hash }, { replace: true, preventScrollReset: true });
    },
    [fallback, key, navigate],
  );
  return [value, set] as const;
};

export const Segmented = ({ label, options, value, onChange }: { label: string; options: readonly { id: string; label: string }[]; value: string; onChange: (id: string) => void }) => (
  <SegmentControl aria-label={label} size="sm" value={value} onValueChange={onChange}>
    {options.map((option) => <SegmentControl.Item key={option.id} value={option.id}>{option.label}</SegmentControl.Item>)}
  </SegmentControl>
);

export const ThemeButton = () => {
  const { resolved, setTheme } = useTheme();
  const dark = resolved === "dark";
  return (
    <IconButton variant="soft" aria-label={dark ? "라이트 테마로 전환" : "다크 테마로 전환"} onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? <MoonIcon /> : <SunIcon />}
    </IconButton>
  );
};

export const ScreenBar = ({ start }: { start?: ReactNode }) => (
  <Inline as="header" justify="between" gap="md" wrap>
    {start ?? <Box />}
    <ThemeButton />
  </Inline>
);

export const MAIN = { as: "main", id: "main", tabIndex: -1, minWidth: 0 } as const;

export const MINUTE = 60_000;
export const HOUR = 3_600_000;
export const DAY = 86_400_000;

export const NOW = Date.UTC(2026, 10, 4, 5, 30);
const OPENED = Date.now();
export const clock = () => NOW + (Date.now() - OPENED);

const seoul = (at: number) => new Date(at + 9 * HOUR);
const two = (value: number) => String(value).padStart(2, "0");

export const formatDate = (at: number) => `${seoul(at).getUTCMonth() + 1}월 ${seoul(at).getUTCDate()}일`;
export const formatTime = (at: number) => `${two(seoul(at).getUTCHours())}:${two(seoul(at).getUTCMinutes())}`;
export const formatClock = (at: number) => `${formatTime(at)}:${two(seoul(at).getUTCSeconds())}`;
export const formatStamp = (at: number) => `${formatDate(at)} ${formatTime(at)}`;
export const formatLongDate = (at: number) => `${seoul(at).getUTCFullYear()}년 ${formatDate(at)}`;
export const formatMonth = (at: number) => `${seoul(at).getUTCFullYear()}년 ${seoul(at).getUTCMonth() + 1}월`;

export const relative = (at: number, now = clock()) => {
  const gap = now - at;
  if (gap < 0) return until(at, now);
  const minutes = Math.floor(gap / MINUTE);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(gap / HOUR);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(gap / DAY);
  if (days < 2) return "어제";
  if (days < 14) return `${days}일 전`;
  if (days < 60) return `${Math.floor(days / 7)}주 전`;
  return seoul(at).getUTCFullYear() === seoul(now).getUTCFullYear() ? formatDate(at) : formatMonth(at);
};

export const until = (at: number, now = clock()) => {
  const gap = at - now;
  const hours = Math.floor(Math.abs(gap) / HOUR);
  const days = Math.floor(Math.abs(gap) / DAY);
  if (gap >= 0) return hours < 72 ? `${Math.max(hours, 1)}시간 남음` : `${days}일 남음`;
  return hours < 24 ? `${Math.max(hours, 1)}시간 지남` : `${days}일 지남`;
};

export const formatWon = (value: number) => `₩${Math.round(value).toLocaleString("ko-KR")}`;
export const formatCount = (value: number) => Math.round(value).toLocaleString("ko-KR");
export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`;
export const formatSeconds = (seconds: number) => (seconds < 60 ? `${seconds}초` : `${Math.floor(seconds / 60)}분 ${two(seconds % 60)}초`);
export const formatMinutes = (minutes: number) => (minutes < 60 ? `${minutes}분` : `${Math.floor(minutes / 60)}시간 ${minutes % 60}분`);

export const seeded = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
type Chance = () => number;
const between = (chance: Chance, low: number, high: number) => low + Math.floor(chance() * (high - low + 1));
const choose = <T,>(chance: Chance, list: readonly T[]): T => list[Math.floor(chance() * list.length)]!;
const hex = (chance: Chance, length: number) => Array.from({ length }, () => "0123456789abcdef"[Math.floor(chance() * 16)]).join("");

export type Role = "소유자" | "관리자" | "개발자" | "결제 담당" | "읽기 전용";
export const ROLES: readonly Role[] = ["소유자", "관리자", "개발자", "결제 담당", "읽기 전용"];
export type Person = { name: string; role: Role; team: string; email: string; mfa: boolean; seen: number; pending?: boolean };

const member = (handle: string, name: string, role: Role, team: string, mfa: boolean, minutes: number): Person => ({ name, role, team, email: `${handle}@arcfield.example`, mfa, seen: NOW - minutes * MINUTE });

export const ME: Person = { ...member("seoyun.han", "한서윤", "관리자", "플랫폼", true, 0), email: "name@studiobaeks.com" };

export const PEOPLE: readonly Person[] = [
  ME,
  member("seoyeon.kim", "김서연", "소유자", "플랫폼", true, 12),
  member("minjun.jung", "정민준", "관리자", "보안", true, 95),
  member("doyun.lee", "이도윤", "개발자", "배송 추적", true, 4),
  member("jiho.park", "박지호", "개발자", "드라이버 앱", true, 8),
  member("jiwoo.han", "한지우", "개발자", "데이터 플랫폼", true, 240),
  member("harin.choi", "최하린", "개발자", "내부 도구", false, 4320),
  member("serin.oh", "오세린", "개발자", "정산", true, 310),
  member("taeo.yoon", "윤태오", "개발자", "창고", true, 1500),
  member("hajun.lim", "임하준", "읽기 전용", "운영", true, 2900),
  member("yujin.kang", "강유진", "결제 담당", "재무", true, 380),
  member("jaehyun.song", "송재현", "개발자", "데이터 플랫폼", true, 5800),
  member("nayun.seo", "서나윤", "읽기 전용", "고객 지원", true, 12900),
  member("sion.moon", "문시온", "개발자", "배송 추적", true, 31),
  member("yerin.hwang", "황예린", "개발자", "드라이버 앱", true, 130),
  { ...member("mina.jang", "장민아", "읽기 전용", "협력사", false, 0), pending: true },
  { ...member("junseo.bae", "배준서", "개발자", "드라이버 앱", false, 0), pending: true },
];

export const initial = (name: string) => Array.from(name)[0] ?? "?";

export type Env = "production" | "staging" | "dev";
export type EnvOrNone = Env | "—";
export const ENVS: readonly Env[] = ["production", "staging", "dev"];

export type Project = { id: string; name: string; owner: string; envs: readonly EnvOrNone[]; region: string; created: number; summary: string };

export const PROJECTS: readonly Project[] = [
  { id: "shipment-tracking", name: "배송 추적", owner: "이도윤", envs: ["production", "staging", "dev"], region: "서울", created: NOW - 702 * DAY, summary: "고객에게 보이는 배송 위치와 도착 예정 시각을 계산하고 알립니다." },
  { id: "driver-backend", name: "드라이버 앱 백엔드", owner: "박지호", envs: ["production", "staging"], region: "서울", created: NOW - 655 * DAY, summary: "기사 앱의 배차, 경로 최적화, 푸시 알림을 맡는 서버입니다." },
  { id: "ops-console", name: "내부 도구", owner: "최하린", envs: ["production", "dev"], region: "서울", created: NOW - 410 * DAY, summary: "운영팀이 쓰는 관리 콘솔과 보고서 도구입니다." },
  { id: "data-platform", name: "데이터 플랫폼", owner: "한지우", envs: ["production", "staging", "dev"], region: "도쿄", created: NOW - 520 * DAY, summary: "배송 이벤트를 모아 분석용 웨어하우스로 옮깁니다." },
  { id: "workspace", name: "워크스페이스", owner: "김서연", envs: ["—"], region: "서울", created: NOW - 760 * DAY, summary: "조직 전체가 함께 쓰는 키, 아티팩트, 로그 보관소입니다." },
  { id: "settlement", name: "정산 시스템", owner: "오세린", envs: ["production", "staging"], region: "서울", created: NOW - 372 * DAY, summary: "운송사와 화주의 정산, 세금계산서 발행을 처리합니다." },
  { id: "warehouse-ops", name: "창고 관리", owner: "윤태오", envs: ["production", "dev"], region: "서울", created: NOW - 288 * DAY, summary: "입출고 스캔, 재고 실사, 라벨 출력을 처리합니다." },
];
export const projectName = (id: string) => PROJECTS.find((project) => project.id === id)?.name ?? id;

export const KINDS = ["컨테이너 서비스", "관리형 데이터베이스", "스토리지 버킷", "컴퓨트 인스턴스", "로드 밸런서", "메시지 큐", "스냅샷"] as const;
export type Kind = (typeof KINDS)[number];
export const RESOURCE_STATUSES = ["정상", "점검 필요", "중지됨", "시작 중", "생성 중"] as const;
export type ResourceStatus = (typeof RESOURCE_STATUSES)[number];

export type Resource = { id: string; kind: Kind; projectId: string; env: EnvOrNone; spec: string; cost: number; status: ResourceStatus; created: number; owner: string };

type ResourceRow = readonly [name: string, kind: Kind, projectId: string, env: EnvOrNone, spec: string, cost: number, status: ResourceStatus, age: number];

const RESOURCE_ROWS: readonly ResourceRow[] = [
  ["tracking-api", "컨테이너 서비스", "shipment-tracking", "production", "3개 × (2 vCPU · 4 GB)", 386000, "정상", 612],
  ["tracking-api-stg", "컨테이너 서비스", "shipment-tracking", "staging", "1개 × (1 vCPU · 2 GB)", 62000, "정상", 540],
  ["tracking-worker", "컨테이너 서비스", "shipment-tracking", "production", "2개 × (2 vCPU · 4 GB)", 258000, "정상", 598],
  ["tracking-db-prod", "관리형 데이터베이스", "shipment-tracking", "production", "PostgreSQL 15 · 8 vCPU · 32 GB", 620000, "점검 필요", 640],
  ["tracking-db-staging", "관리형 데이터베이스", "shipment-tracking", "staging", "PostgreSQL 15 · 2 vCPU · 8 GB", 128000, "정상", 540],
  ["staging-tracking-db", "스냅샷", "shipment-tracking", "staging", "42 GB · 11월 1일 생성", 4000, "정상", 3],
  ["arcfield-shipment-exports", "스토리지 버킷", "shipment-tracking", "production", "1.8 TB · 공개 읽기 켜짐", 41000, "점검 필요", 702],
  ["tracking-events", "메시지 큐", "shipment-tracking", "production", "파티션 12 · 보존 7일", 74000, "정상", 466],
  ["tracking-edge-lb", "로드 밸런서", "shipment-tracking", "production", "리스너 14 · 영역 2개", 48000, "정상", 590],
  ["tracking-dev-vm", "컴퓨트 인스턴스", "shipment-tracking", "dev", "2 vCPU · 8 GB", 44000, "중지됨", 301],
  ["driver-api", "컨테이너 서비스", "driver-backend", "production", "4개 × (2 vCPU · 4 GB)", 512000, "정상", 655],
  ["driver-api-stg", "컨테이너 서비스", "driver-backend", "staging", "1개 × (1 vCPU · 2 GB)", 71000, "정상", 600],
  ["route-optimizer", "컨테이너 서비스", "driver-backend", "production", "3개 × (4 vCPU · 8 GB)", 694000, "점검 필요", 420],
  ["driver-push-gateway", "컨테이너 서비스", "driver-backend", "production", "2개 × (1 vCPU · 2 GB)", 96000, "정상", 388],
  ["driver-db-prod", "관리형 데이터베이스", "driver-backend", "production", "PostgreSQL 15 · 4 vCPU · 16 GB", 310000, "정상", 655],
  ["driver-media", "스토리지 버킷", "driver-backend", "production", "640 GB", 18000, "정상", 500],
  ["driver-lb", "로드 밸런서", "driver-backend", "production", "리스너 6 · 영역 2개", 48000, "정상", 655],
  ["ops-console-app", "컨테이너 서비스", "ops-console", "production", "2개 × (1 vCPU · 2 GB)", 104000, "점검 필요", 410],
  ["ops-console-db", "관리형 데이터베이스", "ops-console", "production", "MySQL 8 · 2 vCPU · 8 GB", 142000, "정상", 410],
  ["ops-dev-vm", "컴퓨트 인스턴스", "ops-console", "dev", "2 vCPU · 4 GB", 38000, "정상", 220],
  ["ops-console-assets", "스토리지 버킷", "ops-console", "production", "12 GB", 1200, "정상", 410],
  ["dp-warehouse", "관리형 데이터베이스", "data-platform", "production", "컬럼형 · 16 vCPU · 128 GB", 1180000, "정상", 520],
  ["dp-ingest-worker", "컨테이너 서비스", "data-platform", "production", "6개 × (4 vCPU · 8 GB)", 742000, "정상", 480],
  ["dp-etl-scheduler", "컨테이너 서비스", "data-platform", "production", "1개 × (2 vCPU · 4 GB)", 92000, "정상", 470],
  ["dp-raw-bucket", "스토리지 버킷", "data-platform", "production", "24 TB", 552000, "정상", 520],
  ["dp-ingest-queue", "메시지 큐", "data-platform", "production", "파티션 24 · 보존 3일", 118000, "정상", 480],
  ["dp-dev-notebook", "컴퓨트 인스턴스", "data-platform", "dev", "8 vCPU · 32 GB", 212000, "점검 필요", 190],
  ["dp-staging-warehouse", "관리형 데이터베이스", "data-platform", "staging", "컬럼형 · 4 vCPU · 32 GB", 286000, "정상", 330],
  ["dp-exports", "스토리지 버킷", "data-platform", "staging", "96 GB", 9000, "정상", 330],
  ["settlement-api", "컨테이너 서비스", "settlement", "production", "2개 × (2 vCPU · 4 GB)", 264000, "정상", 372],
  ["settlement-api-stg", "컨테이너 서비스", "settlement", "staging", "1개 × (1 vCPU · 2 GB)", 58000, "정상", 360],
  ["settlement-batch", "컨테이너 서비스", "settlement", "production", "1개 × (4 vCPU · 8 GB)", 182000, "정상", 360],
  ["settlement-db-prod", "관리형 데이터베이스", "settlement", "production", "PostgreSQL 15 · 4 vCPU · 16 GB", 340000, "점검 필요", 372],
  ["settlement-db-staging", "관리형 데이터베이스", "settlement", "staging", "PostgreSQL 15 · 2 vCPU · 8 GB", 112000, "정상", 360],
  ["settlement-archive", "스토리지 버킷", "settlement", "production", "3.4 TB", 78000, "정상", 372],
  ["settlement-db-snap-1030", "스냅샷", "settlement", "production", "190 GB · 암호화 꺼짐", 9500, "점검 필요", 5],
  ["warehouse-api", "컨테이너 서비스", "warehouse-ops", "production", "2개 × (2 vCPU · 4 GB)", 238000, "정상", 288],
  ["warehouse-scanner-gw", "컨테이너 서비스", "warehouse-ops", "production", "2개 × (1 vCPU · 2 GB)", 101000, "점검 필요", 270],
  ["warehouse-db-prod", "관리형 데이터베이스", "warehouse-ops", "production", "PostgreSQL 15 · 4 vCPU · 16 GB", 305000, "정상", 288],
  ["warehouse-labels", "스토리지 버킷", "warehouse-ops", "production", "210 GB", 6100, "정상", 250],
  ["warehouse-dev-vm", "컴퓨트 인스턴스", "warehouse-ops", "dev", "2 vCPU · 8 GB", 44000, "중지됨", 140],
  ["warehouse-lb", "로드 밸런서", "warehouse-ops", "production", "리스너 4 · 영역 2개", 48000, "정상", 288],
  ["arcfield-shared-artifacts", "스토리지 버킷", "workspace", "—", "780 GB", 21000, "정상", 760],
  ["arcfield-log-archive", "스토리지 버킷", "workspace", "—", "9.6 TB", 212000, "정상", 740],
  ["arcfield-vpn-gw", "컴퓨트 인스턴스", "workspace", "—", "2 vCPU · 4 GB", 58000, "정상", 700],
  ["arcfield-ci-runner", "컴퓨트 인스턴스", "workspace", "—", "3대 × (4 vCPU · 8 GB)", 176000, "생성 중", 1],
];

export const RESOURCES: readonly Resource[] = RESOURCE_ROWS.map(([id, kind, projectId, env, spec, cost, status, age]) => ({
  id, kind, projectId, env, spec, cost, status,
  created: NOW - age * DAY,
  owner: PROJECTS.find((project) => project.id === projectId)?.owner ?? "김서연",
}));

export const DEPLOY_STEPS = ["소스 가져오기", "의존성 설치", "빌드", "테스트", "이미지 올리기", "배포", "상태 확인"] as const;
export const DEPLOY_STATUSES = ["성공", "실패", "취소됨", "진행 중"] as const;
export type DeployStatus = (typeof DEPLOY_STATUSES)[number];
export type Trigger = "푸시" | "수동" | "롤백" | "예약";

export type Deployment = {
  id: string; no: number; service: string; projectId: string; env: Env; version: string; commit: string; message: string; author: string;
  trigger: Trigger; status: DeployStatus; started: number;
  planned: number; failedStep?: number; reason?: string;
};

const AUTHORS: Record<string, readonly string[]> = {
  "shipment-tracking": ["이도윤", "문시온", "한서윤"],
  "driver-backend": ["박지호", "황예린"],
  "ops-console": ["최하린", "김서연"],
  "data-platform": ["한지우", "송재현"],
  settlement: ["오세린", "김서연"],
  "warehouse-ops": ["윤태오"],
  workspace: ["김서연"],
};

const MESSAGES: Record<string, readonly string[]> = {
  "shipment-tracking": ["도착 예정 시각 계산에 교통 지연 보정 추가", "배송 상태 웹훅 재시도를 지수 백오프로 변경", "수령 확인 알림 문구 수정", "지도 타일 요청 캐시를 5분으로 조정", "배송 조회 응답에서 쓰지 않는 필드 제거", "택배사 코드 매핑 표 갱신", "이벤트 소비자에 중복 처리 방지 키 추가"],
  "driver-backend": ["경로 최적화 제한 시간을 8초로 조정", "기사 앱 푸시 토큰 갱신 로직 수정", "배차 우선순위에 적재율 반영", "위치 전송 주기를 운행 상태에 맞춰 조절", "오프라인 동기화 충돌 해결 규칙 변경", "경로 이탈 감지 기준값 조정"],
  "ops-console": ["운영 콘솔에 필터 저장 기능 추가", "감사 기록 내보내기 버튼 추가", "관리자 권한 검사 위치 정리", "대시보드 집계 쿼리 개선"],
  "data-platform": ["수집 배치 크기를 2,000건으로 늘림", "스키마 변경 감지 경고 추가", "일일 집계 작업의 재시도 정책 변경", "원본 보관 기간 정책 적용"],
  settlement: ["정산 마감 일자 계산 오류 수정", "수수료 규칙 v3 적용", "세금계산서 발행 재시도 처리", "환율 반올림 방식 통일"],
  "warehouse-ops": ["스캐너 연결이 끊기면 자동으로 다시 연결", "재고 실사 화면에 바코드 중복 경고 추가", "입고 예정 목록 정렬 기준 변경", "라벨 출력 템플릿 수정"],
  workspace: ["공용 설정 정리"],
};
const GENERIC_MESSAGES = ["의존성 보안 업데이트", "로그 수준 조정", "헬스 체크 경로 정리", "빌드 캐시 설정 개선", "긴급 수정 반영", "설정 값 정리"];
const FAILURES: readonly (readonly [step: number, reason: string])[] = [[2, "빌드 중 타입 오류가 발견되었습니다."], [3, "통합 테스트 3건이 실패했습니다."], [3, "테스트 시간 제한을 넘었습니다."], [5, "새 버전이 준비 상태가 되지 않았습니다."], [6, "상태 확인이 3번 연속 실패했습니다."]];

export const SERVICES: readonly Resource[] = RESOURCES.filter((resource) => resource.kind === "컨테이너 서비스" && resource.env !== "dev" && resource.env !== "—");

const makeDeployments = (): Deployment[] => {
  const chance = seeded(20261104);
  const picks = SERVICES.flatMap((service) => (service.env === "production" ? [service, service, service] : [service]));
  const drafts = Array.from({ length: 56 }, () => {
    const service = choose(chance, picks);
    const minutesAgo = Math.floor(Math.pow(chance(), 1.7) * 21 * 24 * 60) + 20;
    return { service, started: NOW - minutesAgo * MINUTE, roll: chance(), trigger: chance(), planned: between(chance, 95, 520), author: choose(chance, AUTHORS[service.projectId] ?? ["김서연"]), message: choose(chance, [...(MESSAGES[service.projectId] ?? []), ...GENERIC_MESSAGES]), failure: choose(chance, FAILURES), commit: hex(chance, 7) };
  });
  drafts.sort((a, b) => a.started - b.started);
  const patch = new Map<string, number>();
  const base = new Map<string, readonly [number, number]>();
  const list = drafts.map((draft, index): Deployment => {
    const name = draft.service.id;
    if (!base.has(name)) base.set(name, [between(chance, 2, 4), between(chance, 3, 14)]);
    const [major, minor] = base.get(name)!;
    const next = (patch.get(name) ?? between(chance, 0, 9)) + 1;
    patch.set(name, next);
    const status: DeployStatus = draft.roll < 0.82 ? "성공" : draft.roll < 0.92 ? "실패" : draft.roll < 0.97 ? "취소됨" : "성공";
    const trigger: Trigger = name === "dp-etl-scheduler" ? "예약" : draft.trigger < 0.7 ? "푸시" : draft.trigger < 0.92 ? "수동" : "롤백";
    return {
      id: `dep-${2431 + index}`, no: 2431 + index, service: name, projectId: draft.service.projectId, env: draft.service.env as Env,
      version: `v${major}.${minor}.${next}`, commit: draft.commit, message: trigger === "롤백" ? "이전 버전으로 되돌림" : draft.message, author: draft.author,
      trigger, status, started: draft.started, planned: draft.planned,
      ...(status === "실패" ? { failedStep: draft.failure[0], reason: draft.failure[1] } : {}),
      ...(status === "취소됨" ? { failedStep: 3, reason: "사용자가 배포를 취소했습니다." } : {}),
    };
  });
  const last = list[list.length - 1]!;
  list[list.length - 1] = { ...last, status: "진행 중", started: NOW - 14_000, planned: 46, failedStep: undefined, reason: undefined, trigger: "푸시" };
  return list;
};
export const DEPLOYMENTS: readonly Deployment[] = makeDeployments();

export const progressOf = (deployment: Deployment, now = clock()) => {
  const elapsed = Math.max(0, now - deployment.started) / 1000;
  const share = Math.min(1, elapsed / deployment.planned);
  return { share, step: Math.min(DEPLOY_STEPS.length - 1, Math.floor(share * DEPLOY_STEPS.length)), elapsed: Math.min(deployment.planned, Math.round(elapsed)) };
};

export type ServiceHealth = "정상" | "성능 저하" | "장애";
export type Metrics = { id: string; health: ServiceHealth; p95: number; errors: number; rps: number; cpu: number; memory: number; uptime: number };

const METRIC_ROWS: readonly (readonly [string, ServiceHealth, number, number, number, number, number, number])[] = [
  ["tracking-api", "정상", 142, 0.12, 1840, 46, 58, 99.99],
  ["tracking-worker", "정상", 380, 0.2, 420, 52, 71, 99.97],
  ["route-optimizer", "성능 저하", 2140, 0.9, 260, 91, 84, 99.82],
  ["driver-api", "정상", 96, 0.08, 2210, 38, 52, 99.99],
  ["driver-push-gateway", "정상", 61, 0.05, 780, 24, 40, 100],
  ["ops-console-app", "정상", 210, 0.3, 36, 18, 44, 99.95],
  ["dp-ingest-worker", "정상", 520, 0.4, 1320, 68, 77, 99.9],
  ["settlement-api", "정상", 118, 0.1, 190, 31, 49, 99.98],
  ["warehouse-api", "정상", 134, 0.14, 640, 42, 55, 99.96],
  ["warehouse-scanner-gw", "장애", 0, 12.4, 0, 12, 90, 98.74],
];
export const METRICS: readonly Metrics[] = METRIC_ROWS.map(([id, health, p95, errors, rps, cpu, memory, uptime]) => ({ id, health, p95, errors, rps, cpu, memory, uptime }));

export const seriesOf = (service: string, measure: "rps" | "p95" | "errors", points: number) => {
  const metrics = METRICS.find((entry) => entry.id === service);
  const chance = seeded(service.length * 977 + measure.length * 131 + points);
  const level = metrics ? metrics[measure] : 0;
  return Array.from({ length: points }, (_, index) => {
    const wave = 0.82 + 0.18 * Math.sin((index / points) * Math.PI * 2 + service.length) + (chance() - 0.5) * 0.14;
    const bend = metrics && metrics.health !== "정상" && index >= points - Math.ceil(points / 6) ? (measure === "errors" ? 3 : measure === "p95" ? 2.4 : 0.35) : 1;
    return Math.max(0, level * wave * bend);
  });
};

export type AlertSeverity = "긴급" | "경고" | "정보";
export type AlertState = "발생 중" | "확인함" | "해결됨";
export type Alert = { id: string; title: string; service: string; severity: AlertSeverity; state: AlertState; since: number; until?: number; rule: string; assignee: string | null };

const ALERT_TEMPLATES: readonly (readonly [string, string, AlertSeverity])[] = [
  ["응답 시간 p95가 2초를 넘었습니다", "latency_p95 > 2000ms · 5분", "긴급"],
  ["오류율이 1%를 넘었습니다", "error_rate > 1% · 5분", "경고"],
  ["CPU 사용률이 85%를 넘었습니다", "cpu > 85% · 10분", "경고"],
  ["메모리 사용률이 90%를 넘었습니다", "memory > 90% · 10분", "경고"],
  ["인스턴스가 5분 안에 3번 재시작했습니다", "restarts >= 3 · 5분", "경고"],
  ["처리 대기열이 10분째 늘고 있습니다", "queue_depth 증가 · 10분", "경고"],
  ["배포 직후 오류율이 올랐습니다", "error_rate +0.5%p · 배포 후 15분", "정보"],
];

const makeAlerts = (): Alert[] => {
  const chance = seeded(3142);
  const fixed: Alert[] = [
    { id: "ALT-3142", title: "응답 시간 p95가 2초를 넘었습니다", service: "route-optimizer", severity: "긴급", state: "발생 중", since: NOW - 47 * MINUTE, rule: "latency_p95 > 2000ms · 5분", assignee: "박지호" },
    { id: "ALT-3141", title: "연결 수가 한도의 80%에 닿았습니다", service: "tracking-api", severity: "경고", state: "확인함", since: NOW - 190 * MINUTE, rule: "db_connections > 80% · 10분", assignee: "이도윤" },
    { id: "ALT-3138", title: "인스턴스가 5분 안에 3번 재시작했습니다", service: "warehouse-scanner-gw", severity: "경고", state: "확인함", since: NOW - 9 * HOUR, rule: "restarts >= 3 · 5분", assignee: "윤태오" },
    { id: "ALT-3133", title: "처리 대기열이 10분째 늘고 있습니다", service: "dp-ingest-worker", severity: "경고", state: "확인함", since: NOW - 26 * HOUR, rule: "queue_depth 증가 · 10분", assignee: "한지우" },
  ];
  const resolved = Array.from({ length: 20 }, (_, index): Alert => {
    const [title, rule, severity] = choose(chance, ALERT_TEMPLATES);
    const service = choose(chance, METRICS).id;
    const since = NOW - Math.floor((26 + chance() * 20 * 24) * HOUR);
    const owner = AUTHORS[SERVICES.find((entry) => entry.id === service)?.projectId ?? ""] ?? ["김서연"];
    return { id: `ALT-${3132 - index}`, title, service, severity, state: "해결됨", since, until: since + between(chance, 6, 140) * MINUTE, rule, assignee: choose(chance, owner) };
  });
  resolved.sort((a, b) => b.since - a.since);
  return [...fixed, ...resolved].map((alert, index) => ({ ...alert, id: `ALT-${3142 - index}` }));
};
export const ALERTS: readonly Alert[] = makeAlerts();

export const SEVERITIES = ["심각", "높음", "보통", "낮음"] as const;
export type Severity = (typeof SEVERITIES)[number];
export const FINDING_STATES = ["열림", "진행 중", "해결"] as const;
export type FindingState = (typeof FINDING_STATES)[number];
export type Finding = { id: string; title: string; severity: Severity; resource: string; kind: string; projectId: string; env: EnvOrNone; state: FindingState; owner: string | null; due: number; resolved?: number };

type FindingRow = readonly [id: string, title: string, severity: Severity, resource: string, kind: string, projectId: string, env: EnvOrNone, state: FindingState, owner: string | null, dueHours: number];

const FINDING_ROWS: readonly FindingRow[] = [
  ["SEC-1042", "공개 읽기가 허용된 버킷", "심각", "arcfield-shipment-exports", "스토리지 버킷", "shipment-tracking", "production", "열림", null, 36],
  ["SEC-1030", "90일 넘게 쓰지 않은 관리자 API 키", "높음", "legacy-ci", "API 키", "workspace", "—", "열림", "김서연", -72],
  ["SEC-1033", "알려진 취약점이 있는 패키지를 포함한 이미지", "높음", "route-optimizer image", "v3.8.1", "driver-backend", "production", "진행 중", "박지호", -24],
  ["SEC-1039", "모든 IP에서 연결을 받는 데이터베이스", "높음", "tracking-db-prod", "관리형 데이터베이스", "shipment-tracking", "production", "진행 중", "이도윤", 72],
  ["SEC-1037", "삭제 보호가 꺼진 운영 데이터베이스", "높음", "settlement-db-prod", "관리형 데이터베이스", "settlement", "production", "열림", "오세린", 120],
  ["SEC-1045", "암호화되지 않은 데이터베이스 스냅샷", "높음", "settlement-db-snap-1030", "스냅샷", "settlement", "production", "진행 중", "오세린", 144],
  ["SEC-1026", "모든 프로젝트에 공유된 데이터베이스 스냅샷", "보통", "staging-tracking-db", "스냅샷", "shipment-tracking", "staging", "열림", null, 336],
  ["SEC-1028", "환경 변수에 평문으로 저장된 비밀값", "보통", "ops-console-app", "컨테이너 서비스", "ops-console", "production", "진행 중", "이도윤", 408],
  ["SEC-1032", "모든 IP에 열린 개발 인스턴스의 SSH", "보통", "dp-dev-notebook", "컴퓨트 인스턴스", "data-platform", "dev", "열림", "한지우", 504],
  ["SEC-1046", "2단계 인증이 켜지지 않은 멤버", "보통", "최하린", "멤버", "workspace", "—", "열림", "정민준", 216],
  ["SEC-1049", "만료가 14일 남은 인증서", "보통", "driver-lb", "로드 밸런서", "driver-backend", "production", "열림", "박지호", 240],
  ["SEC-1034", "root 권한으로 실행되는 컨테이너", "보통", "warehouse-scanner-gw", "컨테이너 서비스", "warehouse-ops", "production", "열림", "윤태오", 288],
  ["SEC-1051", "TLS 1.0을 허용하는 리스너", "낮음", "tracking-edge-lb", "로드 밸런서", "shipment-tracking", "production", "열림", null, 720],
  ["SEC-1043", "버전 관리가 꺼진 버킷", "낮음", "dp-exports", "스토리지 버킷", "data-platform", "staging", "열림", null, 960],
  ["SEC-1041", "180일 넘게 교체하지 않은 SSH 키", "보통", "arcfield-vpn-gw", "컴퓨트 인스턴스", "workspace", "—", "해결", "정민준", 2],
  ["SEC-1044", "과도한 권한을 가진 서비스 계정", "높음", "deploy-bot", "API 키", "workspace", "—", "해결", "김서연", 3],
  ["SEC-1035", "암호화가 꺼진 메시지 큐", "보통", "dp-ingest-queue", "메시지 큐", "data-platform", "production", "해결", "한지우", 5],
  ["SEC-1036", "만료된 서비스 계정 키가 남아 있음", "낮음", "ci-runner-2025", "API 키", "workspace", "—", "해결", "정민준", 6],
  ["SEC-1038", "모든 아웃바운드를 허용하는 기본 보안 그룹", "낮음", "tracking-api", "컨테이너 서비스", "shipment-tracking", "production", "해결", "이도윤", 8],
  ["SEC-1031", "접근 로그가 꺼진 버킷", "낮음", "driver-media", "스토리지 버킷", "driver-backend", "production", "해결", "박지호", 9],
  ["SEC-1029", "30일 넘게 점검하지 않은 이미지", "낮음", "tracking-worker", "컨테이너 서비스", "shipment-tracking", "production", "해결", "이도윤", 12],
  ["SEC-1027", "읽기 전용 멤버가 쓰기 토큰을 발급받음", "보통", "임하준", "멤버", "workspace", "—", "해결", "정민준", 13],
  ["SEC-1025", "백업 보존 기간이 7일 미만", "보통", "warehouse-db-prod", "관리형 데이터베이스", "warehouse-ops", "production", "해결", "윤태오", 16],
  ["SEC-1024", "쓰이지 않는 로드 밸런서 규칙", "낮음", "warehouse-lb", "로드 밸런서", "warehouse-ops", "production", "해결", "윤태오", 19],
  ["SEC-1022", "공개된 컨테이너 레지스트리 저장소", "높음", "arcfield/route-optimizer", "이미지 저장소", "driver-backend", "production", "해결", "박지호", 22],
  ["SEC-1019", "관리자 콘솔에 IP 제한이 없음", "높음", "ops-console-app", "컨테이너 서비스", "ops-console", "production", "해결", "최하린", 26],
];

export const FINDINGS: readonly Finding[] = FINDING_ROWS.map(([id, title, severity, resource, kind, projectId, env, state, owner, hours]) => ({
  id, title, severity, resource, kind, projectId, env, state, owner,
  due: state === "해결" ? NOW + 30 * DAY : NOW + hours * HOUR,
  ...(state === "해결" ? { resolved: NOW - hours * DAY } : {}),
}));

export type ApiKey = { id: string; name: string; prefix: string; scope: string; owner: string; created: number; used: number | null; expires: number | null; revoked: boolean };

type KeyRow = readonly [name: string, prefix: string, scope: string, owner: string, createdDays: number, usedHours: number | null, expiresDays: number | null];

const KEY_ROWS: readonly KeyRow[] = [
  ["legacy-ci", "arc_demo_7c1e", "관리자 전체", "김서연", 612, 143 * 24, null],
  ["deploy-bot", "arc_demo_a90b", "배포 · 읽기", "정민준", 301, 0.4, 120],
  ["grafana-readonly", "arc_demo_3d52", "모니터링 읽기", "한서윤", 188, 0.1, null],
  ["terraform-prod", "arc_demo_e117", "자원 관리", "정민준", 260, 31, 60],
  ["data-export-job", "arc_demo_58fa", "스토리지 읽기", "한지우", 140, 5, 90],
  ["driver-app-sdk", "arc_demo_b4c8", "푸시 · 위치 쓰기", "박지호", 96, 0.02, 200],
  ["settlement-batch", "arc_demo_09de", "청구 읽기", "오세린", 72, 26, 30],
  ["ci-runner-2026", "arc_demo_f6a3", "배포 · 읽기", "김서연", 9, 1.5, 180],
];

export const KEYS: readonly ApiKey[] = KEY_ROWS.map(([name, prefix, scope, owner, createdDays, usedHours, expiresDays]) => ({
  id: `key-${name}`, name, prefix, scope, owner, created: NOW - createdDays * DAY, used: usedHours === null ? null : NOW - usedHours * HOUR, expires: expiresDays === null ? null : NOW + expiresDays * DAY, revoked: false,
}));

export type AuditEvent = { id: string; at: number; actor: string; code: string; action: string; target: string; ip: string; place: string; result: "성공" | "실패" | "거부됨" };

const PLACES: readonly (readonly [string, string])[] = [["203.0.113.24", "서울"], ["203.0.113.57", "서울"], ["198.51.100.8", "부산"], ["198.51.100.141", "서울"], ["192.0.2.33", "도쿄"], ["203.0.113.190", "대전"]];
const ACTIONS: readonly (readonly [code: string, action: string])[] = [
  ["login.success", "로그인했습니다"], ["login.success", "로그인했습니다"], ["login.failed", "로그인에 실패했습니다"], ["deploy.create", "배포를 시작했습니다"], ["deploy.create", "배포를 시작했습니다"], ["deploy.rollback", "배포를 되돌렸습니다"],
  ["key.create", "API 키를 만들었습니다"], ["key.revoke", "API 키를 폐기했습니다"], ["member.invite", "멤버를 초대했습니다"], ["role.update", "역할을 바꿨습니다"], ["bucket.policy", "버킷 접근 정책을 고쳤습니다"],
  ["finding.assign", "점검 항목의 담당자를 정했습니다"], ["billing.card", "결제 수단을 바꿨습니다"], ["resource.restart", "자원을 다시 시작했습니다"], ["mfa.enable", "2단계 인증을 켰습니다"], ["project.update", "프로젝트 설정을 고쳤습니다"],
];

const auditTarget = (chance: Chance, code: string, actor: string): string => {
  switch (code) {
    case "deploy.create": case "deploy.rollback": { const deployment = choose(chance, DEPLOYMENTS); return `${deployment.service} ${deployment.version}`; }
    case "key.create": case "key.revoke": return choose(chance, KEYS).name;
    case "member.invite": return choose(chance, ["junseo.bae@arcfield.example", "mina.jang@arcfield.example", "partner.ops@arcfield.example"]);
    case "role.update": return `${choose(chance, PEOPLE).name}: ${choose(chance, ROLES)}`;
    case "bucket.policy": return choose(chance, RESOURCES.filter((resource) => resource.kind === "스토리지 버킷")).id;
    case "finding.assign": return choose(chance, FINDINGS).id;
    case "billing.card": return "신용카드 •••• 4242";
    case "resource.restart": return choose(chance, RESOURCES.filter((resource) => resource.kind !== "스냅샷" && resource.kind !== "스토리지 버킷")).id;
    case "project.update": return projectName(choose(chance, PROJECTS).id);
    case "mfa.enable": return actor;
    default: return "콘솔";
  }
};

const makeAudit = (): AuditEvent[] => {
  const chance = seeded(881);
  const actors = PEOPLE.filter((person) => !person.pending);
  const events = Array.from({ length: 84 }, (_, index): AuditEvent => {
    const [code, action] = choose(chance, ACTIONS);
    const actor = code === "login.failed" && chance() < 0.4 ? "알 수 없음" : choose(chance, actors).name;
    const [ip, place] = choose(chance, PLACES);
    const at = NOW - Math.floor((8 + Math.pow(chance(), 1.5) * 14 * 24 * 60) * MINUTE);
    const result = code === "login.failed" ? (actor === "알 수 없음" ? "거부됨" : "실패") : code === "bucket.policy" && chance() < 0.15 ? "거부됨" : "성공";
    return { id: `evt-${index}`, at, actor, code, action, target: auditTarget(chance, code, actor), ip, place, result };
  });
  return events.sort((a, b) => b.at - a.at).map((event, index) => ({ ...event, id: `evt-${9400 - index}` }));
};
export const AUDIT: readonly AuditEvent[] = makeAudit();

export type Card = { id: string; brand: string; last4: string; holder: string; expires: string; primary: boolean };
export type Plan = { id: string; name: string; price: number; summary: string };
export const PLANS: readonly Plan[] = [
  { id: "team", name: "Team", price: 190000, summary: "멤버 10명까지, 이메일 지원, 감사 기록 90일 보관" },
  { id: "business", name: "Business", price: 480000, summary: "멤버 무제한, 우선 지원, 감사 기록 1년 보관, SSO" },
  { id: "enterprise", name: "Enterprise", price: 1450000, summary: "전담 담당자, 99.99% 가용성 약정, 감사 기록 무기한 보관" },
];
export const CARDS: readonly Card[] = [
  { id: "card-1", brand: "신용카드", last4: "4242", holder: "ARCFIELD LOGISTICS", expires: "08/28", primary: true },
  { id: "card-2", brand: "법인카드", last4: "0005", holder: "ARCFIELD LOGISTICS", expires: "03/27", primary: false },
];

export const NETWORK_COST = 312000;
export const monthlyOf = (resources: readonly Resource[]) => resources.reduce((sum, resource) => (resource.status === "중지됨" ? sum : sum + resource.cost), 0);
export const planPrice = (id: string) => PLANS.find((plan) => plan.id === id)?.price ?? 0;
export const resourceOf = (id: string) => RESOURCES.find((resource) => resource.id === id);

export const MONTH_START = Date.UTC(2026, 9, 31, 15);
export const monthShare = (at = clock()) => Math.min(1, (at - MONTH_START) / (30 * DAY));

const COST_SHAPE = [0.61, 0.64, 0.63, 0.69, 0.71, 0.74, 0.73, 0.78, 0.82, 0.85, 0.89, 0.92];
export const costHistory = (forecast: number) => COST_SHAPE.map((share, index) => ({ at: Date.UTC(2025, 10 + index, 1), amount: Math.round((forecast * share) / 1000) * 1000 }));

export const DOC_CATEGORIES = ["시작하기", "프로젝트와 자원", "배포", "모니터링", "비용과 결제", "보안과 접근", "API"] as const;
export type DocCategory = (typeof DOC_CATEGORIES)[number];
export type DocMeta = { slug: string; title: string; category: DocCategory; summary: string; minutes: number; updated: number; keywords: string };

const KEYWORDS: Record<string, string> = {
  tour: "사이드바 개요 범위 검색 단축키",
  "first-project": "프로젝트 만들기 리전 환경 ID",
  environments: "production staging dev 환경 권한",
  "resource-kinds": "컨테이너 데이터베이스 버킷 인스턴스 로드 밸런서 큐 스냅샷 이름",
  "bucket-access": "버킷 공개 읽기 공유 링크 접근 로그",
  "database-backup": "백업 복구 스냅샷 보존",
  snapshots: "스냅샷 공유 범위 비용 복사",
  pipeline: "파이프라인 빌드 테스트 이미지 배포 상태 확인 헬스",
  rollback: "롤백 되돌리기 이전 버전 스키마",
  "failed-deploy": "실패 진단 로그 빌드 테스트 헬스 체크 롤백",
  "alert-rules": "알림 규칙 지표 기준값 지속 시간 오류율",
  "reading-p95": "응답 시간 p95 p99 평균 그래프 지연",
  postmortem: "사후 분석 사건 타임라인 재발 방지 회고",
  "read-invoice": "청구서 비용 부가세 항목 지난달",
  "budget-alerts": "예산 알림 80% 100% 비용",
  roles: "역할 권한 소유자 관리자 개발자 읽기 전용",
  "require-mfa": "2단계 인증 MFA 복구 코드",
  "rotate-keys": "API 키 교체 폐기 권한 범위",
  "audit-export": "감사 기록 내보내기 CSV 보존",
  "rest-start": "REST API curl 인증 헤더 401 403 429",
};

const doc = (slug: string, category: DocCategory, title: string, summary: string, minutes: number, daysAgo: number): DocMeta => ({ slug, title, category, summary, minutes, updated: NOW - daysAgo * DAY, keywords: KEYWORDS[slug] ?? "" });
export const DOCS: readonly DocMeta[] = [
  doc("tour", "시작하기", "콘솔 둘러보기", "사이드바의 여덟 곳이 각각 무엇을 보여 주는지 한 번에 훑어봅니다.", 5, 12),
  doc("first-project", "시작하기", "첫 프로젝트 만들기", "이름과 리전을 정하고, 소유자와 환경을 붙여 프로젝트를 만듭니다.", 4, 30),
  doc("environments", "시작하기", "production, staging, dev 나누기", "환경을 나누는 기준과, 환경마다 접근 권한을 다르게 두는 방법입니다.", 6, 45),
  doc("resource-kinds", "프로젝트와 자원", "자원의 종류와 이름 규칙", "일곱 가지 자원 종류와, 팀이 함께 쓰기 좋은 이름 붙이는 규칙을 정리했습니다.", 5, 21),
  doc("bucket-access", "프로젝트와 자원", "스토리지 버킷의 공개 범위", "공개 읽기를 켜기 전에 확인할 것과, 안전하게 파일을 나누는 방법입니다.", 7, 8),
  doc("database-backup", "프로젝트와 자원", "데이터베이스 백업과 복구", "자동 백업의 주기와 보존 기간, 특정 시점으로 복구하는 순서를 설명합니다.", 8, 19),
  doc("snapshots", "프로젝트와 자원", "스냅샷 만들기와 공유 범위", "스냅샷은 만든 프로젝트 안에만 보이도록 두는 것이 기본입니다.", 4, 33),
  doc("pipeline", "배포", "배포 파이프라인의 단계", "소스 가져오기부터 상태 확인까지 일곱 단계가 하는 일을 설명합니다.", 6, 15),
  doc("rollback", "배포", "이전 버전으로 되돌리기", "문제가 생긴 배포를 되돌리는 방법과, 되돌린 뒤 확인할 것들입니다.", 3, 6),
  doc("failed-deploy", "배포", "실패한 배포를 진단하는 순서", "로그에서 어느 단계에서 멈췄는지 읽고, 원인별로 대응하는 방법입니다.", 7, 11),
  doc("alert-rules", "모니터링", "알림 규칙 만들기", "지표와 기준값, 지속 시간을 정해 알림 규칙을 만드는 방법입니다.", 6, 9),
  doc("reading-p95", "모니터링", "응답 시간 지표 읽기", "평균 대신 p95와 p99를 보는 이유와, 그래프에서 먼저 볼 것입니다.", 5, 27),
  doc("postmortem", "모니터링", "사건 기록과 사후 분석", "사건이 끝난 뒤 타임라인을 정리하고 재발을 막는 항목을 남기는 방법입니다.", 9, 40),
  doc("read-invoice", "비용과 결제", "청구서 읽는 법", "청구서의 항목이 어떻게 계산되는지, 이번 달 비용이 왜 늘었는지 찾는 법입니다.", 5, 14),
  doc("budget-alerts", "비용과 결제", "예산과 비용 알림", "월 예산을 정하고, 사용량이 기준에 닿으면 알림을 받도록 설정합니다.", 3, 23),
  doc("roles", "보안과 접근", "역할과 권한", "소유자, 관리자, 개발자, 결제 담당, 읽기 전용이 각각 할 수 있는 일입니다.", 6, 17),
  doc("require-mfa", "보안과 접근", "2단계 인증을 필수로 만들기", "모든 멤버에게 2단계 인증을 요구하고, 복구 코드를 관리하는 방법입니다.", 4, 5),
  doc("rotate-keys", "보안과 접근", "API 키 관리와 교체", "키를 만들고, 범위를 좁히고, 쓰지 않는 키를 찾아 폐기하는 방법입니다.", 6, 3),
  doc("audit-export", "보안과 접근", "감사 기록 내보내기", "기간과 행위자를 골라 감사 기록을 CSV로 내보내는 방법입니다.", 3, 36),
  doc("rest-start", "API", "REST API 시작하기", "키를 발급받아 첫 요청을 보내고, 응답과 오류를 읽는 방법입니다.", 8, 2),
];

export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export type Scope = { project: string; env: string };
export type NoticeTone = "success" | "error" | "info";
export type NoticeData = { id: number; tone: NoticeTone; title: string; text?: string };
type Stamp = { code: string; action: string; target: string; result?: AuditEvent["result"] };

export type Store = {
  me: Person;
  scope: Scope;
  setScope: (next: Partial<Scope>) => void;
  inScope: (item: { projectId: string; env: string }) => boolean;
  notice: NoticeData | null;
  notify: (tone: NoticeTone, title: string, text?: string) => void;
  dismiss: () => void;
  projects: readonly Project[]; setProjects: Dispatch<SetStateAction<readonly Project[]>>;
  resources: readonly Resource[]; setResources: Dispatch<SetStateAction<readonly Resource[]>>;
  deployments: readonly Deployment[];
  deploy: (input: { service: Resource; ref: string; trigger?: Trigger; message?: string; version?: string }) => Deployment;
  cancelDeployment: (id: string) => void;
  alerts: readonly Alert[]; setAlerts: Dispatch<SetStateAction<readonly Alert[]>>;
  findings: readonly Finding[]; setFindings: Dispatch<SetStateAction<readonly Finding[]>>;
  members: readonly Person[]; setMembers: Dispatch<SetStateAction<readonly Person[]>>;
  keys: readonly ApiKey[]; setKeys: Dispatch<SetStateAction<readonly ApiKey[]>>;
  audit: readonly AuditEvent[];
  record: (stamp: Stamp) => void;
  budget: number; setBudget: Dispatch<SetStateAction<number>>;
  plan: string; setPlan: Dispatch<SetStateAction<string>>;
  cards: readonly Card[]; setCards: Dispatch<SetStateAction<readonly Card[]>>;
  read: ReadonlySet<string>;
  markRead: (ids: readonly string[]) => void;
  now: number;
};

const StoreContext = createContext<Store | null>(null);

export const useStore = (): Store => {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore reads the dashboard's state: render the page inside the dashboard.");
  return store;
};

const bump = (version: string | undefined) => {
  const match = version?.match(/^v(\d+)\.(\d+)\.(\d+)$/);
  return match ? `v${match[1]}.${match[2]}.${Number(match[3]) + 1}` : "v1.0.0";
};

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [scope, setScopeState] = useState<Scope>({ project: "all", env: "all" });
  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [projects, setProjects] = useState<readonly Project[]>(PROJECTS);
  const [resources, setResources] = useState<readonly Resource[]>(RESOURCES);
  const [deployments, setDeployments] = useState<readonly Deployment[]>(DEPLOYMENTS);
  const [alerts, setAlerts] = useState<readonly Alert[]>(ALERTS);
  const [findings, setFindings] = useState<readonly Finding[]>(FINDINGS);
  const [members, setMembers] = useState<readonly Person[]>(PEOPLE);
  const [keys, setKeys] = useState<readonly ApiKey[]>(KEYS);
  const [audit, setAudit] = useState<readonly AuditEvent[]>(AUDIT);
  const [budget, setBudget] = useState(10500000);
  const [plan, setPlan] = useState("business");
  const [cards, setCards] = useState<readonly Card[]>(CARDS);
  const [read, setRead] = useState<ReadonlySet<string>>(new Set());
  const [now, setNow] = useState(clock);
  const counter = useRef(0);
  const latest = useRef(deployments);
  latest.current = deployments;

  const setScope = useCallback((next: Partial<Scope>) => setScopeState((previous) => ({ ...previous, ...next })), []);
  const inScope = useCallback(
    (item: { projectId: string; env: string }) => (scope.project === "all" || item.projectId === scope.project) && (scope.env === "all" || item.env === scope.env),
    [scope],
  );

  const notify = useCallback((tone: NoticeTone, title: string, text?: string) => {
    counter.current += 1;
    setNotice({ id: counter.current, tone, title, text });
    announce(text ? `${title} ${text}` : title, { politeness: tone === "error" ? "assertive" : "polite" });
  }, []);
  const dismiss = useCallback(() => setNotice(null), []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice((current) => (current?.id === notice.id ? null : current)), 7000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const record = useCallback(({ code, action, target, result = "성공" }: Stamp) => {
    counter.current += 1;
    setAudit((list) => [{ id: `evt-new-${counter.current}`, at: clock(), actor: ME.name, code, action, target, ip: "203.0.113.24", place: "서울", result }, ...list]);
  }, []);

  const deploy = useCallback((input: { service: Resource; ref: string; trigger?: Trigger; message?: string; version?: string }) => {
    const list = latest.current;
    const previous = [...list].reverse().find((entry) => entry.service === input.service.id);
    const no = list.reduce((top, entry) => Math.max(top, entry.no), 0) + 1;
    const failing = /fail/i.test(input.ref);
    const created: Deployment = {
      id: `dep-${no}`, no, service: input.service.id, projectId: input.service.projectId, env: input.service.env as Env,
      version: input.version ?? bump(previous?.version), commit: Math.abs(no * 2654435761 >>> 0).toString(16).slice(0, 7).padStart(7, "0"),
      message: input.message?.trim() || `${input.ref} 브랜치 배포`, author: ME.name, trigger: input.trigger ?? "수동",
      status: "진행 중", started: clock(), planned: failing ? 24 : 38, ...(failing ? { failedStep: 3, reason: "통합 테스트 2건이 실패했습니다." } : {}),
    };
    latest.current = [...list, created];
    setDeployments(latest.current);
    return created;
  }, []);

  const cancelDeployment = useCallback((id: string) => {
    const at = clock();
    setDeployments((list) => list.map((entry) => (entry.id === id && entry.status === "진행 중"
      ? { ...entry, status: "취소됨", planned: Math.max(1, Math.round((at - entry.started) / 1000)), failedStep: progressOf(entry, at).step, reason: "사용자가 배포를 취소했습니다." }
      : entry)));
  }, []);

  const running = deployments.some((entry) => entry.status === "진행 중");
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const at = clock();
      setNow(at);
      const done = latest.current.filter((entry) => entry.status === "진행 중" && at >= entry.started + entry.planned * 1000);
      if (done.length === 0) return;
      latest.current = latest.current.map((entry) => (done.includes(entry) ? { ...entry, status: entry.failedStep !== undefined ? "실패" : "성공" } : entry));
      setDeployments(latest.current);
      for (const entry of done) {
        if (entry.failedStep !== undefined) notify("error", `배포 #${entry.no}이(가) 실패했습니다`, `${entry.service} ${entry.version} · ${entry.reason ?? ""}`);
        else notify("success", `배포 #${entry.no}이(가) 끝났습니다`, `${entry.service} ${entry.version}을(를) ${entry.env}에 올렸습니다.`);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, notify]);

  const markRead = useCallback((ids: readonly string[]) => setRead((previous) => new Set([...previous, ...ids])), []);

  const value: Store = {
    me: ME, scope, setScope, inScope, notice, notify, dismiss, projects, setProjects, resources, setResources, deployments, deploy, cancelDeployment,
    alerts, setAlerts, findings, setFindings, members, setMembers, keys, setKeys, audit, record, budget, setBudget, plan, setPlan, cards, setCards, read, markRead, now,
  };
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useWide = () =>
  useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(`(min-width: ${tokens.layout.breakpoint.md})`);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(`(min-width: ${tokens.layout.breakpoint.md})`).matches,
    () => true,
  );

export type Accent = NonNullable<BadgeProps["accent"]>;

export const formatWonShort = (value: number) => (value >= 100_000_000 ? `₩${(value / 100_000_000).toFixed(1)}억` : `₩${Math.round(value / 10_000).toLocaleString("ko-KR")}만`);

export const PageTitle = ({ title, description, aside, back }: { title: string; description?: ReactNode; aside?: ReactNode; back?: { to: string; label: string } }) => (
  <Stack gap="md">
    {back ? <Inline><Button as={RouterLink} to={back.to} size="sm" variant="ghost"><ArrowLeftIcon />{back.label}</Button></Inline> : null}
    <Inline align="end" justify="between" gap="md" wrap>
      <Stack gap="xs">
        <Text as="h1" variant="title">{title}</Text>
        {description ? <Text as="p" ink="tertiary">{description}</Text> : null}
      </Stack>
      {aside}
    </Inline>
  </Stack>
);

export const Panel = ({ anchor, title, description, actions, children }: { anchor?: string; title?: ReactNode; description?: ReactNode; actions?: ReactNode; children?: ReactNode }) => {
  const id = useId();
  return (
    <Surface as="section" id={anchor} aria-labelledby={title ? id : undefined} fill="raised" radius="lg" shadow overflow="hidden">
      {title ? (
        <>
          <Inline justify="between" gap="md" wrap paddingX="xl" paddingY="lg">
            <Stack gap="xs">
              <Text as="h2" variant="subheading" id={id}>{title}</Text>
              {description ? <Text as="p" variant="label" strong={false} ink="tertiary">{description}</Text> : null}
            </Stack>
            {actions}
          </Inline>
          <Divider />
        </>
      ) : null}
      {children}
    </Surface>
  );
};

export type StatItem = { label: string; value: string; note?: string; tone?: "error" | "warning" | "success" | "info" };

export const StatStrip = ({ stats }: { stats: readonly StatItem[] }) => (
  <Grid columns={{ base: 2, md: 3, xl: stats.length }} gap="md">
    {stats.map((stat) => (
      <Surface key={stat.label} fill="raised" radius="lg" shadow padding="lg">
        <Stack gap="sm">
          <Text as="span" ink="secondary" truncate>{stat.label}</Text>
          <Text as="span" variant="title" numeric ink={stat.tone ?? "primary"}>{stat.value}</Text>
          {stat.note ? <Text as="span" variant="caption" ink="tertiary" truncate>{stat.note}</Text> : null}
        </Stack>
      </Surface>
    ))}
  </Grid>
);

export const TabCount = ({ label, count }: { label: string; count: number }) => (
  <>{label} <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{count}</Text></>
);

export const Two = ({ top, sub, title, mono, ink = "tertiary" }: { top: ReactNode; sub?: ReactNode; title?: boolean; mono?: boolean; ink?: "tertiary" | "secondary" | "error" | "warning" | "success" | "info" }) => (
  <Stack>
    <Text as="span" strong={title} ink={title ? "primary" : "secondary"} truncate>{top}</Text>
    {sub !== undefined ? <Text as="span" variant="label" strong={false} ink={ink} family={mono ? "mono" : undefined} numeric truncate>{sub}</Text> : null}
  </Stack>
);

export const Avatar = ({ name }: { name: string | null }) => (
  <Badge accent={name ? "info" : "primary"} variant={name ? "soft" : "dashed"} size="sm" aria-hidden>{name ? initial(name) : "?"}</Badge>
);

export const PersonCell = ({ name }: { name: string | null }) => (
  <Inline gap="xs">
    <Avatar name={name} />
    <Text as="span" ink={name ? "secondary" : "tertiary"} truncate>{name ?? "미지정"}</Text>
  </Inline>
);

export const Facts = ({ items }: { items: readonly (readonly [label: string, value: ReactNode])[] }) => (
  <Grid columns="minmax(5rem, 8rem) minmax(0, 1fr)" gap="md" align="baseline">
    {items.map(([label, value]) => (
      <Fragment key={label}>
        <Text as="span" variant="label" strong={false} ink="tertiary">{label}</Text>
        <Box minWidth={0}>{typeof value === "string" || typeof value === "number" ? <Text as="span">{value}</Text> : value}</Box>
      </Fragment>
    ))}
  </Grid>
);

export const EmptyState = ({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) => (
  <Stack align="center" gap="md" padding="3xl">
    <Stack align="center" gap="xs">
      <Text as="p" strong>{title}</Text>
      {children ? <Text as="p" ink="tertiary">{children}</Text> : null}
    </Stack>
    {action}
  </Stack>
);

export const Notice = ({ accent, title, children, onDismiss }: { accent: "error" | "success" | "info" | "warning"; title: string; children?: ReactNode; onDismiss?: () => void }) => (
  <Surface fill="sunken" radius="md" padding="md">
    <Inline align="start" justify="between" gap="sm">
      <Stack gap="xs">
        <Text as="p" strong ink={accent}>{title}</Text>
        {children ? <Text as="p" ink="secondary">{children}</Text> : null}
      </Stack>
      {onDismiss ? <IconButton size="xs" variant="ghost" accent={accent} aria-label="알림 닫기" onClick={onDismiss}><CloseIcon /></IconButton> : null}
    </Inline>
  </Surface>
);

export const PageSpinner = () => (
  <Inline justify="center" padding="3xl"><Spinner label="페이지를 불러오는 중" /></Inline>
);

export const SeverityBadge = ({ level }: { level: Severity }) => {
  if (level === "심각") return <Badge accent="error" variant="soft" dot>{level}</Badge>;
  if (level === "높음") return <Badge accent="warning" variant="soft" dot>{level}</Badge>;
  if (level === "보통") return <Badge accent="warning" variant="ghost" dot>{level}</Badge>;
  return <Badge accent="primary" variant="ghost" dot>{level}</Badge>;
};

export const DeployBadge = ({ status }: { status: DeployStatus }) => {
  if (status === "성공") return <Badge accent="success" variant="soft" dot>{status}</Badge>;
  if (status === "실패") return <Badge accent="error" variant="soft" dot>{status}</Badge>;
  if (status === "진행 중") return <Badge accent="info" variant="soft" dot>{status}</Badge>;
  return <Badge accent="primary" variant="hairline" dot>{status}</Badge>;
};

export const HealthBadge = ({ health }: { health: ServiceHealth }) => {
  if (health === "정상") return <Badge accent="success" variant="soft" dot>{health}</Badge>;
  if (health === "성능 저하") return <Badge accent="warning" variant="soft" dot>{health}</Badge>;
  return <Badge accent="error" variant="soft" dot>{health}</Badge>;
};

export const ResourceBadge = ({ status }: { status: ResourceStatus }) => {
  if (status === "정상") return <Badge accent="success" variant="ghost" dot>{status}</Badge>;
  if (status === "점검 필요") return <Badge accent="warning" variant="soft" dot>{status}</Badge>;
  if (status === "생성 중" || status === "시작 중") return <Badge accent="info" variant="soft" dot>{status}</Badge>;
  return <Badge accent="primary" variant="hairline" dot>{status}</Badge>;
};

export const useProjectName = () => {
  const { projects } = useStore();
  return (id: string) => projects.find((project) => project.id === id)?.name ?? projectName(id);
};

export const Bars = ({ label, values, ends, accent = "primary", marks }: { label: string; values: readonly number[]; ends: readonly [string, string]; accent?: Accent; marks?: readonly boolean[] }) => {
  const top = Math.max(...values, 1);
  return (
    <Stack gap="sm">
      <Grid role="img" aria-label={label} columns={values.length} rows="minmax(0, 1fr)" gap="xs" align="end" height="md">
        {values.map((value, index) => (
          <Paint key={index} accent={marks?.[index] ? "error" : accent} variant={index === values.length - 1 ? "solid" : "soft"} height={`${Math.max(3, Math.round((value / top) * 100))}%`} />
        ))}
      </Grid>
      <Inline justify="between">
        <Text as="span" variant="label" strong={false} ink="tertiary">{ends[0]}</Text>
        <Text as="span" variant="label" strong={false} ink="tertiary">{ends[1]}</Text>
      </Inline>
    </Stack>
  );
};

export const Meter = ({ value, label, accent = "primary" }: { value: number; label: string; accent?: Accent }) => (
  <Surface fill="sunken" radius="full" overflow="hidden" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
    <Paint accent={accent} variant="solid" paddingY="xs" width={`${Math.min(100, Math.max(1, value))}%`} />
  </Surface>
);

export const strengthOf = (value: string) => {
  const score = [value.length >= 10, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
  return { score, label: ["너무 약함", "약함", "보통", "좋음", "아주 좋음"][score] ?? "" };
};

export const StrengthMeter = ({ value }: { value: string }) => {
  if (!value) return null;
  const { score, label } = strengthOf(value);
  return (
    <Stack gap="xs">
      <Meter value={Math.max(score, 0.2) * 25} label={`비밀번호 강도: ${label}`} accent={score <= 1 ? "error" : score === 2 ? "warning" : score === 3 ? "info" : "success"} />
      <Text as="span" variant="label" strong={false} ink="tertiary">강도: {label}</Text>
    </Stack>
  );
};

export const loadAccent = (value: number): Accent => (value >= 90 ? "error" : value >= 70 ? "warning" : "primary");
export const budgetAccent = (share: number): Accent => (share >= 100 ? "error" : share >= 85 ? "warning" : "primary");

export type Column<T> = {
  id: string;
  header: string;
  track: string;
  render: (row: T) => ReactNode;
  compare?: (a: T, b: T) => number;
  largestFirst?: boolean;
  end?: boolean;
  opens?: boolean;
};
export type Sort = { id: string; dir: "asc" | "desc" };

export type Selection<T> = { selected: ReadonlySet<string>; onChange: (next: Set<string>) => void; label: (row: T) => string };

const Cell = ({ children, end }: { children: ReactNode; end?: boolean }) => (
  <Box role="cell" minWidth={0}>{end ? <Inline justify="end">{children}</Inline> : children}</Box>
);

const HeaderCell = <T,>({ column, sort, onSort }: { column: Column<T>; sort: Sort; onSort: (id: string) => void }) => {
  const active = sort.id === column.id;
  const text = <Text as="span" variant="label" strong={false} ink={active ? "primary" : "tertiary"}>{column.header}</Text>;
  const content = column.compare ? (
    <Pressable onPress={() => onSort(column.id)}>
      <Inline gap="xs">{text}<UpDownIcon size="label" ink={active ? "primary" : "tertiary"} /></Inline>
    </Pressable>
  ) : text;
  return (
    <Box role="columnheader" aria-sort={column.compare ? (active ? (sort.dir === "asc" ? "ascending" : "descending") : "none") : undefined}>
      {column.end ? <Inline justify="end">{content}</Inline> : content}
    </Box>
  );
};

const CHECK_TRACK = "1.5rem";

export const DataTable = <T,>({ label, columns, rows, rowKey, sort, onSort, onOpen, selection, empty }: {
  label: string; columns: readonly Column<T>[]; rows: readonly T[]; rowKey: (row: T) => string; sort: Sort; onSort: (id: string) => void;
  onOpen?: (row: T) => void; selection?: Selection<T>; empty?: ReactNode;
}) => {
  const tracks = [selection ? CHECK_TRACK : null, ...columns.map((column) => column.track)].filter(Boolean).join(" ");
  const keys = rows.map(rowKey);
  const chosen = selection ? keys.filter((key) => selection.selected.has(key)).length : 0;
  return (
    <Box overflowX="auto">
      <Box role="table" aria-label={label} minWidth="min-content">
        <Box role="rowgroup">
          <Grid role="row" columns={tracks} gap="sm" paddingX="xl" paddingY="sm" align="center">
            {selection ? (
              <Box role="columnheader">
                <Checkbox aria-label="이 페이지의 항목 모두 선택" checked={rows.length > 0 && chosen === rows.length} indeterminate={chosen > 0 && chosen < rows.length}
                  onChange={(event) => selection.onChange(new Set(event.target.checked ? [...selection.selected, ...keys] : [...selection.selected].filter((key) => !keys.includes(key))))} />
              </Box>
            ) : null}
            {columns.map((column) => <HeaderCell key={column.id} column={column} sort={sort} onSort={onSort} />)}
          </Grid>
          <Divider aria-hidden />
        </Box>
        <Box role="rowgroup">
          {rows.map((row, index) => {
            const key = rowKey(row);
            return (
              <Box key={key}>
                {index > 0 ? <Divider aria-hidden /> : null}
                <Surface as={Grid} role="row" hoverable={Boolean(onOpen)} selected={selection?.selected.has(key)} columns={tracks} gap="sm" align="center" paddingX="xl" paddingY="md"
                  onClick={onOpen ? (event) => { if (!(event.target as Element).closest("[data-opens]")) onOpen(row); } : undefined}>
                  {selection ? (
                    <Box role="cell" onClick={(event) => event.stopPropagation()}>
                      <Checkbox aria-label={selection.label(row)} checked={selection.selected.has(key)}
                        onChange={(event) => selection.onChange(new Set(event.target.checked ? [...selection.selected, key] : [...selection.selected].filter((entry) => entry !== key)))} />
                    </Box>
                  ) : null}
                  {columns.map((column) => (
                    <Cell key={column.id} end={column.end}>
                      {onOpen && column.opens ? <Pressable as="div" data-opens onPress={() => onOpen(row)}>{column.render(row)}</Pressable> : column.render(row)}
                    </Cell>
                  ))}
                </Surface>
              </Box>
            );
          })}
        </Box>
        {rows.length === 0 ? empty : null}
      </Box>
    </Box>
  );
};

export const useTable = <T,>(rows: readonly T[], config: { columns: readonly Column<T>[]; sort: Sort; match?: (row: T, query: string) => boolean; filters?: Record<string, (row: T) => string>; size?: number }) => {
  const [query, setQueryState] = useState("");
  const [picked, setPicked] = useState<Record<string, readonly string[]>>({});
  const [sort, setSort] = useState<Sort>(config.sort);
  const [page, setPage] = useState(0);
  const size = config.size ?? 10;
  const words = query.trim().toLowerCase();
  const filtered = rows.filter((row) => (!words || !config.match || config.match(row, words)) && Object.entries(picked).every(([id, values]) => values.length === 0 || values.includes(config.filters?.[id]?.(row) ?? "")));
  const column = config.columns.find((entry) => entry.id === sort.id);
  const compare = column?.compare;
  const sorted = compare ? [...filtered].sort((a, b) => (sort.dir === "asc" ? 1 : -1) * compare(a, b)) : filtered;
  const pages = Math.max(1, Math.ceil(sorted.length / size));
  const current = Math.min(page, pages - 1);
  const active = words !== "" || Object.values(picked).some((values) => values.length > 0);
  return {
    query, picked, sort, size, pages, page: current, total: sorted.length, all: rows.length, active, sorted,
    slice: sorted.slice(current * size, current * size + size),
    setQuery: (next: string) => { setQueryState(next); setPage(0); },
    pick: (id: string, values: readonly string[]) => { setPicked((previous) => ({ ...previous, [id]: values })); setPage(0); },
    toggleSort: (id: string) => {
      setSort((previous) => (previous.id === id ? { id, dir: previous.dir === "asc" ? "desc" : "asc" } : { id, dir: config.columns.find((entry) => entry.id === id)?.largestFirst ? "desc" : "asc" }));
      setPage(0);
    },
    setPage,
    reset: () => { setQueryState(""); setPicked({}); setPage(0); },
  };
};
export type Table<T> = ReturnType<typeof useTable<T>>;

export const summarize = <T,>(table: Pick<Table<T>, "total" | "all" | "sort">, columns: readonly Column<T>[]) => {
  const column = columns.find((entry) => entry.id === table.sort.id);
  const count = table.total === table.all ? `${table.total}개` : `${table.all}개 중 ${table.total}개`;
  return column ? `${count} · ${column.header} ${table.sort.dir === "asc" ? "오름차순" : "내림차순"}` : count;
};

export const SearchField = ({ label, value, onChange }: { label: string; value: string; onChange: (next: string) => void }) => (
  <Box width="lg" maxWidth="full">
    <Field size="sm" shape="pill" type="search" aria-label={label} placeholder={label} leading={<SearchIcon />} clearable value={value} onChange={(event) => onChange(event.target.value)} />
  </Box>
);

export const FilterChip = ({ label, options, selected, onChange }: { label: string; options: readonly { value: string; label: string; count?: number }[]; selected: readonly string[]; onChange: (next: string[]) => void }) => {
  const active = selected.length > 0;
  const named = selected.length === 1 ? options.find((option) => option.value === selected[0])?.label ?? selected[0] : `${selected.length}개`;
  const toggle = (value: string) => onChange(selected.includes(value) ? selected.filter((entry) => entry !== value) : [...selected, value]);
  return (
    <Floating>
      <Button as={Floating.Trigger} size="sm" shape="pill" variant={active ? "soft" : "dashed"} fontSize="label">
        {active ? <CheckIcon size="label" /> : <PlusIcon size="label" />}{label}{active ? ` · ${named}` : ""}
      </Button>
      <Floating.Content as={Surface} fill="raised" radius="md" padding="sm" width="lg" maxWidth="full" aria-label={`${label} 필터`}>
        <Stack gap="xs">
          {options.map((option) => (
            <Inline key={option.value} as="label" gap="sm" justify="between" paddingX="sm" paddingY="xs">
              <Inline gap="sm">
                <Checkbox checked={selected.includes(option.value)} onChange={() => toggle(option.value)} />
                <Text as="span">{option.label}</Text>
              </Inline>
              {option.count !== undefined ? <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{option.count}</Text> : null}
            </Inline>
          ))}
          {active ? (
            <>
              <Divider />
              <Button size="xs" variant="ghost" onClick={() => onChange([])}>선택 해제</Button>
            </>
          ) : null}
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

export const TableBar = ({ children, summary, onReset }: { children: ReactNode; summary?: ReactNode; onReset?: () => void }) => (
  <>
    <Inline justify="between" gap="md" wrap paddingX="xl" paddingY="lg">
      <Inline gap="xs" wrap>
        {children}
        {onReset ? <Button size="sm" shape="pill" variant="ghost" fontSize="label" onClick={onReset}>초기화</Button> : null}
      </Inline>
      {summary ? <Text as="span" variant="label" strong={false} ink="tertiary">{summary}</Text> : null}
    </Inline>
    <Divider />
  </>
);

export const Pager = ({ table }: { table: Pick<Table<unknown>, "page" | "pages" | "total" | "size" | "setPage"> }) => {
  if (table.pages <= 1) return null;
  const first = table.page * table.size + 1;
  const last = Math.min(table.total, first + table.size - 1);
  return (
    <>
      <Divider />
      <Inline justify="between" gap="md" wrap paddingX="xl" paddingY="md">
        <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{first}–{last} / {table.total}</Text>
        <Inline gap="sm">
          <IconButton size="sm" variant="ghost" aria-label="이전 페이지" disabled={table.page === 0} onClick={() => table.setPage(table.page - 1)}><ArrowLeftIcon /></IconButton>
          <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{table.page + 1} / {table.pages}</Text>
          <IconButton size="sm" variant="ghost" aria-label="다음 페이지" disabled={table.page >= table.pages - 1} onClick={() => table.setPage(table.page + 1)}><ArrowRightIcon /></IconButton>
        </Inline>
      </Inline>
    </>
  );
};

const DIALOG_WIDTHS = { sm: "xl", md: "measure.sm", lg: "measure.md" } as const;

export const Dialog = ({ open, onOpenChange, title, description, size = "sm", initialFocusRef, children }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: ReactNode; size?: keyof typeof DIALOG_WIDTHS;
  initialFocusRef?: RefObject<HTMLElement | null>; children?: ReactNode;
}) => (
  <Floating open={open} onOpenChange={onOpenChange}>
    <Floating.Content as={Surface} fill="raised" radius="lg" padding="xl" width={DIALOG_WIDTHS[size]} maxWidth="full" presentation="modal" aria-label={title} initialFocusRef={initialFocusRef}>
      <Stack gap="lg">
        <Stack gap="xs">
          <Text as="h2" variant="heading">{title}</Text>
          {description ? <Text as="p" ink="secondary">{description}</Text> : null}
        </Stack>
        {children}
      </Stack>
    </Floating.Content>
  </Floating>
);

export const DialogFooter = ({ children }: { children: ReactNode }) => <Inline justify="end" gap="sm" wrap>{children}</Inline>;

const ConfirmBody = ({ confirmLabel, tone, confirmText, onConfirm }: { confirmLabel: string; tone: "primary" | "error"; confirmText?: string; onConfirm: () => void }) => {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const ready = !confirmText || typed === confirmText;
  const run = async () => {
    if (!ready || busy) return;
    setBusy(true);
    await wait(700);
    onConfirm();
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={(event) => { event.preventDefault(); void run(); }}>
      {confirmText ? (
        <FormFieldTyped text={confirmText} value={typed} onChange={setTyped} />
      ) : null}
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" accent={tone} disabled={!ready} loading={busy} loadingLabel="처리하는 중">{confirmLabel}</Button>
      </DialogFooter>
    </Stack>
  );
};

const FormFieldTyped = ({ text, value, onChange }: { text: string; value: string; onChange: (next: string) => void }) => (
  <Stack gap="xs">
    <Text as="label" variant="label" htmlFor="confirm-text">확인하려면 <Text as="span" variant="label" family="mono">{text}</Text>을(를) 그대로 입력하세요.</Text>
    <Field id="confirm-text" autoComplete="off" value={value} onChange={(event) => onChange(event.target.value)} />
  </Stack>
);

export const ConfirmDialog = ({ open, onOpenChange, title, description, confirmLabel, tone = "primary", confirmText, onConfirm }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: ReactNode; confirmLabel: string; tone?: "primary" | "error"; confirmText?: string; onConfirm: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
    <ConfirmBody confirmLabel={confirmLabel} tone={tone} confirmText={confirmText} onConfirm={() => { onConfirm(); onOpenChange(false); }} />
  </Dialog>
);

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ROLE_CHOICES = ROLES.filter((role) => role !== "소유자");

const InviteForm = ({ onDone }: { onDone: () => void }) => {
  const { members, setMembers, notify, record } = useStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("개발자");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const clean = email.trim().toLowerCase();
  const error = !clean ? "이메일을 입력해주세요." : !EMAIL.test(clean) ? "이메일 형식을 확인해주세요. 예: name@arcfield.example" : members.some((person) => person.email === clean) ? "이미 멤버이거나 초대한 이메일입니다." : undefined;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (error || busy) return;
    setBusy(true);
    await wait(700);
    setMembers((list) => [...list, { name: clean.split("@")[0]!, role, team: "초대 대기", email: clean, mfa: false, seen: 0, pending: true }]);
    record({ code: "member.invite", action: "멤버를 초대했습니다", target: clean });
    notify("success", "초대 메일을 보냈습니다", `${clean}으로 ${role} 역할 초대를 보냈습니다.`);
    onDone();
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <FormField label="이메일" required invalid={submitted && Boolean(error)} error={error}>
        <Field type="email" autoComplete="off" placeholder="name@arcfield.example" value={email} onChange={(event) => setEmail(event.target.value)} />
      </FormField>
      <FormField label="역할" description="역할은 나중에 바꿀 수 있습니다.">
        <Select value={role} onChange={(event) => setRole(event.target.value as Role)}>
          {ROLE_CHOICES.map((entry) => <Select.Option key={entry} value={entry}>{entry}</Select.Option>)}
        </Select>
      </FormField>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" loading={busy} loadingLabel="보내는 중">초대 보내기</Button>
      </DialogFooter>
    </Stack>
  );
};

const useMemberActions = () => {
  const { setMembers, notify, record } = useStore();
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<Person | null>(null);
  return {
    inviting, setInviting, removing, setRemoving,
    change: (person: Person, role: Role) => {
      setMembers((list) => list.map((entry) => (entry.name === person.name ? { ...entry, role } : entry)));
      record({ code: "role.update", action: "역할을 바꿨습니다", target: `${person.name}: ${role}` });
      notify("success", `${person.name}님의 역할을 바꿨습니다`, `${person.role} → ${role}`);
    },
    remove: (person: Person) => {
      setMembers((list) => list.filter((entry) => entry.name !== person.name));
      record({ code: "member.remove", action: person.pending ? "초대를 취소했습니다" : "멤버를 제거했습니다", target: person.name });
      notify("success", person.pending ? "초대를 취소했습니다" : `${person.name}님을 제거했습니다`, person.pending ? person.email : "이 멤버의 접근 권한이 모두 사라졌습니다.");
    },
  };
};

const MemberDialogs = ({ actions }: { actions: ReturnType<typeof useMemberActions> }) => {
  const { removing } = actions;
  return (
    <>
      <Dialog open={actions.inviting} onOpenChange={actions.setInviting} title="멤버 초대" description="초대받은 사람은 메일의 링크로 가입합니다."><InviteForm onDone={() => actions.setInviting(false)} /></Dialog>
      <ConfirmDialog open={removing !== null} onOpenChange={(open) => { if (!open) actions.setRemoving(null); }} title={removing?.pending ? "초대를 취소할까요?" : "멤버를 제거할까요?"}
        description={removing ? (removing.pending ? `${removing.email}으로 보낸 초대가 사라집니다.` : `${removing.name}님은 이 작업 공간의 모든 접근 권한을 잃습니다.`) : ""}
        confirmLabel={removing?.pending ? "초대 취소" : "제거"} tone="error" onConfirm={() => { if (removing) actions.remove(removing); }} />
    </>
  );
};

export const MemberRows = ({ limit = 5 }: { limit?: number }) => {
  const { members, me } = useStore();
  const actions = useMemberActions();
  const ordered = [...members].sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role) || a.name.localeCompare(b.name, "ko"));
  return (
    <Stack gap="md">
      <Stack as="ul">
        {ordered.slice(0, limit).map((person, index) => (
          <Box as="li" key={person.name}>
            {index > 0 ? <Divider aria-hidden /> : null}
            <Inline justify="between" gap="md" paddingY="md" wrap>
              <Inline gap="sm"><Avatar name={person.name} /><Two title top={person.name === me.name ? `${person.name} (나)` : person.name} sub={person.email} /></Inline>
              <Inline gap="sm">
                {person.role === "소유자" ? <Badge variant="soft">소유자</Badge> : (
                  <Box width="md">
                    <Select size="sm" aria-label={`${person.name}의 역할`} value={person.role} onChange={(event) => actions.change(person, event.target.value as Role)}>
                      {ROLE_CHOICES.map((entry) => <Select.Option key={entry} value={entry}>{entry}</Select.Option>)}
                    </Select>
                  </Box>
                )}
                {person.role === "소유자" || person.name === me.name ? null : <Button size="xs" variant="ghost" accent="error" onClick={() => actions.setRemoving(person)}>{person.pending ? "취소" : "제거"}</Button>}
              </Inline>
            </Inline>
          </Box>
        ))}
      </Stack>
      <Inline justify="between" gap="md" wrap>
        <Button size="sm" variant="hairline" onClick={() => actions.setInviting(true)}><PlusIcon />멤버 초대</Button>
        <Button as={RouterLink} to="/demo/arcfield/security?tab=access" size="sm" variant="ghost">멤버 {members.length}명 모두 보기<ArrowRightIcon /></Button>
      </Inline>
      <MemberDialogs actions={actions} />
    </Stack>
  );
};

export const MemberManager = () => {
  const { members, notify, me } = useStore();
  const actions = useMemberActions();
  const { change, setInviting, setRemoving } = actions;
  const at = clock();
  const columns: readonly Column<Person>[] = [
    { id: "name", header: "멤버", track: "minmax(13rem, 2fr)", compare: (a, b) => a.name.localeCompare(b.name, "ko"), render: (row) => (
      <Inline gap="sm"><Avatar name={row.name} /><Two title top={row.name === me.name ? `${row.name} (나)` : row.name} sub={row.email} /></Inline>
    ) },
    { id: "role", header: "역할", track: "9rem", compare: (a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role), render: (row) => (
      row.role === "소유자" ? <Badge variant="soft">소유자</Badge> : (
        <Select size="sm" aria-label={`${row.name}의 역할`} value={row.role} onChange={(event) => change(row, event.target.value as Role)}>
          {ROLE_CHOICES.map((entry) => <Select.Option key={entry} value={entry}>{entry}</Select.Option>)}
        </Select>
      )
    ) },
    { id: "team", header: "팀", track: "minmax(7rem, 1fr)", compare: (a, b) => a.team.localeCompare(b.team, "ko"), render: (row) => <Text as="span" ink="secondary" truncate>{row.team}</Text> },
    { id: "mfa", header: "2단계 인증", track: "7rem", compare: (a, b) => Number(a.mfa) - Number(b.mfa), render: (row) => (row.pending ? <Text as="span" ink="tertiary">—</Text> : row.mfa ? <Badge accent="success" variant="ghost" dot>켜짐</Badge> : <Badge accent="warning" variant="soft" dot>꺼짐</Badge>) },
    { id: "seen", header: "마지막 활동", track: "6.5rem", largestFirst: true, compare: (a, b) => a.seen - b.seen, render: (row) => <Text as="span" ink="tertiary">{row.pending ? "초대 대기" : row.name === me.name ? "지금" : relative(row.seen, at)}</Text> },
    { id: "action", header: "", track: "9rem", end: true, render: (row) => (
      <Inline gap="xs" justify="end">
        {!row.pending && !row.mfa ? <Button size="xs" variant="hairline" onClick={() => notify("info", `${row.name}님에게 2단계 인증을 요구했습니다`, "다음 로그인 때 설정 화면이 나옵니다.")}>인증 요구</Button> : null}
        {row.role === "소유자" || row.name === me.name ? null : <Button size="xs" variant="ghost" accent="error" onClick={() => setRemoving(row)}>{row.pending ? "취소" : "제거"}</Button>}
      </Inline>
    ) },
  ];
  const table = useTable(members, {
    columns, sort: { id: "role", dir: "asc" }, size: 10,
    match: (row, words) => `${row.name} ${row.email} ${row.team}`.toLowerCase().includes(words),
    filters: { role: (row) => row.role, mfa: (row) => (row.pending ? "대기" : row.mfa ? "켜짐" : "꺼짐") },
  });
  const count = (pick: (person: Person) => string, value: string) => members.filter((person) => pick(person) === value).length;
  const pending = members.filter((person) => person.pending).length;
  return (
    <Panel title="접근 권한 목록" description={`멤버 ${members.length - pending}명이 함께하고 있고, 초대 ${pending}건이 답을 기다립니다.`} actions={<Button size="sm" onClick={() => setInviting(true)}><PlusIcon />멤버 초대</Button>}>
      <TableBar summary={summarize(table, columns)} onReset={table.active ? table.reset : undefined}>
        <SearchField label="멤버나 팀으로 찾기" value={table.query} onChange={table.setQuery} />
        <FilterChip label="역할" selected={table.picked.role ?? []} onChange={(next) => table.pick("role", next)} options={ROLES.map((role) => ({ value: role, label: role, count: count((person) => person.role, role) }))} />
        <FilterChip label="2단계 인증" selected={table.picked.mfa ?? []} onChange={(next) => table.pick("mfa", next)} options={["켜짐", "꺼짐", "대기"].map((value) => ({ value, label: value === "대기" ? "초대 대기" : value, count: count((person) => (person.pending ? "대기" : person.mfa ? "켜짐" : "꺼짐"), value) }))} />
      </TableBar>
      <DataTable label="멤버" columns={columns} rows={table.slice} rowKey={(row) => row.name} sort={table.sort} onSort={table.toggleSort}
        empty={<EmptyState title="조건에 맞는 멤버가 없습니다" action={<Button size="sm" variant="hairline" onClick={table.reset}>필터 초기화</Button>}>검색어나 필터를 바꿔보세요.</EmptyState>} />
      <Pager table={table} />
      <MemberDialogs actions={actions} />
    </Panel>
  );
};

const KEY_SCOPES = ["읽기 전용", "배포 · 읽기", "자원 관리", "관리자 전체"] as const;
const KEY_EXPIRIES = [["30", "30일 뒤"], ["90", "90일 뒤"], ["365", "1년 뒤"], ["0", "만료 없음"]] as const;

const NewKey = ({ onDone }: { onDone: () => void }) => {
  const { keys, setKeys, notify, record, me } = useStore();
  const [name, setName] = useState("");
  const [scope, setScope] = useState<string>("읽기 전용");
  const [days, setDays] = useState("90");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const error = !/^[a-z0-9][a-z0-9-]{2,30}$/.test(name) ? "영문 소문자, 숫자, 하이픈으로 3~31자의 이름을 정해주세요." : keys.some((key) => key.name === name && !key.revoked) ? "같은 이름의 키가 이미 있습니다." : undefined;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (error || busy) return;
    setBusy(true);
    await wait(700);
    const chance = seeded(Date.now());
    const prefix = `arc_demo_${hex(chance, 4)}`;
    setKeys((list) => [{ id: `key-${name}-${list.length}`, name, prefix, scope, owner: me.name, created: clock(), used: null, expires: days === "0" ? null : clock() + Number(days) * DAY, revoked: false }, ...list]);
    record({ code: "key.create", action: "API 키를 만들었습니다", target: name });
    notify("success", "API 키를 만들었습니다", name);
    setSecret(`${prefix}_NOT-A-REAL-KEY_${hex(chance, 12)}`);
  };
  if (secret) {
    return (
      <Stack gap="lg">
        <Notice accent="warning" title="이 키는 지금만 볼 수 있습니다">닫으면 다시 볼 수 없으니 안전한 곳에 옮겨 두세요. (이 키는 데모용 가짜 값입니다.)</Notice>
        <Surface fill="sunken" radius="md" padding="md"><Text as="p" family="mono" variant="caption">{secret}</Text></Surface>
        <DialogFooter>
          <Button variant="hairline" onClick={() => { void navigator.clipboard?.writeText(secret); notify("info", "복사했습니다", "클립보드에 가짜 키를 담았습니다."); }}>복사</Button>
          <Button onClick={onDone}>저장했습니다</Button>
        </DialogFooter>
      </Stack>
    );
  }
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <FormField label="이름" required description="어디에 쓰는 키인지 알 수 있게 짓습니다." invalid={submitted && Boolean(error)} error={error}>
        <Field autoComplete="off" placeholder="예: ci-runner-2027" value={name} onChange={(event) => setName(event.target.value.toLowerCase())} />
      </FormField>
      <Inline gap="lg" align="start" wrap>
        <Box width="lg" maxWidth="full">
          <FormField label="권한 범위">
            <Select value={scope} onChange={(event) => setScope(event.target.value)}>
              {KEY_SCOPES.map((entry) => <Select.Option key={entry} value={entry}>{entry}</Select.Option>)}
            </Select>
          </FormField>
        </Box>
        <Box width="md" maxWidth="full">
          <FormField label="만료">
            <Select value={days} onChange={(event) => setDays(event.target.value)}>
              {KEY_EXPIRIES.map(([value, label]) => <Select.Option key={value} value={value}>{label}</Select.Option>)}
            </Select>
          </FormField>
        </Box>
      </Inline>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" loading={busy} loadingLabel="만드는 중">키 만들기</Button>
      </DialogFooter>
    </Stack>
  );
};

const useKeyActions = () => {
  const { setKeys, notify, record } = useStore();
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  return {
    creating, setCreating, revoking, setRevoking,
    revoke: (key: ApiKey) => {
      setKeys((list) => list.map((entry) => (entry.id === key.id ? { ...entry, revoked: true } : entry)));
      record({ code: "key.revoke", action: "API 키를 폐기했습니다", target: key.name });
      notify("success", "API 키를 폐기했습니다", key.name);
    },
  };
};

const KeyDialogs = ({ actions }: { actions: ReturnType<typeof useKeyActions> }) => {
  const { revoking } = actions;
  return (
    <>
      <Dialog open={actions.creating} onOpenChange={actions.setCreating} title="새 API 키" description="이름과 권한 범위를 정하면 키를 한 번 보여 드립니다."><NewKey onDone={() => actions.setCreating(false)} /></Dialog>
      <ConfirmDialog open={revoking !== null} onOpenChange={(open) => { if (!open) actions.setRevoking(null); }} title="이 키를 폐기할까요?" description={revoking ? `${revoking.name}을(를) 쓰는 프로그램은 바로 접근하지 못하게 됩니다.` : ""} confirmLabel="폐기" tone="error"
        onConfirm={() => { if (revoking) actions.revoke(revoking); }} />
    </>
  );
};

export const KeyRows = ({ limit = 4 }: { limit?: number }) => {
  const { keys } = useStore();
  const actions = useKeyActions();
  const at = clock();
  const live = keys.filter((key) => !key.revoked).sort((a, b) => Math.max(b.created, b.used ?? 0) - Math.max(a.created, a.used ?? 0));
  return (
    <Stack gap="md">
      <Stack as="ul">
        {live.slice(0, limit).map((key, index) => {
          const idle = key.used !== null && at - key.used > 90 * DAY;
          return (
            <Box as="li" key={key.id}>
              {index > 0 ? <Divider aria-hidden /> : null}
              <Inline justify="between" gap="md" paddingY="md" wrap>
                <Two title top={key.name} sub={`${key.prefix}•••••••• · ${key.scope}`} mono />
                <Inline gap="md">
                  <Text as="span" variant="label" strong={false} ink={idle ? "warning" : "tertiary"}>{key.used === null ? "사용 기록 없음" : idle ? "90일 넘게 쓰지 않음" : `${relative(key.used, at)} 사용`}</Text>
                  <Button size="xs" variant="ghost" accent="error" onClick={() => actions.setRevoking(key)}>폐기</Button>
                </Inline>
              </Inline>
            </Box>
          );
        })}
      </Stack>
      <Inline justify="between" gap="md" wrap>
        <Button size="sm" variant="hairline" onClick={() => actions.setCreating(true)}><PlusIcon />새 키</Button>
        <Button as={RouterLink} to="/demo/arcfield/security?tab=access" size="sm" variant="ghost">키 {live.length}개 모두 보기<ArrowRightIcon /></Button>
      </Inline>
      <KeyDialogs actions={actions} />
    </Stack>
  );
};

export const KeyManager = () => {
  const { keys } = useStore();
  const actions = useKeyActions();
  const { setCreating, setRevoking } = actions;
  const at = clock();
  const idle = (key: ApiKey) => !key.revoked && key.used !== null && at - key.used > 90 * DAY;
  const columns: readonly Column<ApiKey>[] = [
    { id: "name", header: "키", track: "minmax(12rem, 2fr)", compare: (a, b) => a.name.localeCompare(b.name), render: (row) => <Two title top={row.name} sub={`${row.prefix}••••••••`} mono /> },
    { id: "scope", header: "권한 범위", track: "minmax(8rem, 1.2fr)", render: (row) => <Text as="span" ink="secondary" truncate>{row.scope}</Text> },
    { id: "owner", header: "만든 사람", track: "7rem", compare: (a, b) => a.owner.localeCompare(b.owner, "ko"), render: (row) => <PersonCell name={row.owner} /> },
    { id: "used", header: "마지막 사용", track: "8rem", largestFirst: true, compare: (a, b) => (a.used ?? 0) - (b.used ?? 0), render: (row) => <Two top={row.used === null ? "사용 기록 없음" : relative(row.used, at)} sub={idle(row) ? "90일 넘게 쓰지 않음" : undefined} ink="warning" /> },
    { id: "expires", header: "만료", track: "7rem", compare: (a, b) => (a.expires ?? Infinity) - (b.expires ?? Infinity), render: (row) => <Text as="span" ink="tertiary">{row.expires === null ? "만료 없음" : until(row.expires, at)}</Text> },
    { id: "status", header: "상태", track: "6rem", render: (row) => (row.revoked ? <Badge accent="primary" variant="hairline" dot>폐기됨</Badge> : <Badge accent="success" variant="ghost" dot>사용 가능</Badge>) },
    { id: "action", header: "", track: "4.5rem", end: true, render: (row) => (row.revoked ? null : <Button size="xs" variant="ghost" accent="error" onClick={() => setRevoking(row)}>폐기</Button>) },
  ];
  const table = useTable(keys, { columns, sort: { id: "used", dir: "asc" }, size: 10, match: (row, words) => `${row.name} ${row.scope} ${row.owner}`.toLowerCase().includes(words) });
  return (
    <Panel title="서비스 계정과 API 키" description="프로그램이 이 작업 공간에 들어오는 열쇠입니다. 지금은 가짜 값만 쓰입니다." actions={<Button size="sm" onClick={() => setCreating(true)}><PlusIcon />새 키</Button>}>
      <TableBar summary={summarize(table, columns)} onReset={table.active ? table.reset : undefined}>
        <SearchField label="키나 권한 범위로 찾기" value={table.query} onChange={table.setQuery} />
      </TableBar>
      <DataTable label="API 키" columns={columns} rows={table.slice} rowKey={(row) => row.id} sort={table.sort} onSort={table.toggleSort}
        empty={<EmptyState title="키가 없습니다">새 키를 만들어 시작하세요.</EmptyState>} />
      <Pager table={table} />
      <KeyDialogs actions={actions} />
    </Panel>
  );
};

const toneIcon = (tone: NoticeTone) => (tone === "success" ? <CheckIcon ink="success" /> : tone === "error" ? <CloseIcon ink="error" /> : <InfoIcon ink="info" />);

export const NoticeBar = () => {
  const { notice, dismiss } = useStore();
  if (!notice) return null;
  return (
    <Surface elevation="sticky" top="lg" fill="raised" radius="md" shadow padding="md">
      <Inline align="start" justify="between" gap="sm">
        <Inline align="start" gap="sm">
          {toneIcon(notice.tone)}
          <Stack gap="xs">
            <Text as="p" strong ink={notice.tone === "info" ? "primary" : notice.tone}>{notice.title}</Text>
            {notice.text ? <Text as="p" ink="secondary">{notice.text}</Text> : null}
          </Stack>
        </Inline>
        <IconButton size="xs" variant="ghost" aria-label="알림 닫기" onClick={dismiss}><CloseIcon /></IconButton>
      </Inline>
    </Surface>
  );
};
