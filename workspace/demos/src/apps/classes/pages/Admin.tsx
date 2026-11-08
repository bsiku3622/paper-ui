// 관리 — the operator console: reviewing uploads, what Ask remembers, accounts and devices, the term data and its history,
// make-up days, the course-change window, backups. One page of ten sections; the section is in the address
// (?section=users), so a link opens it, and a few panels read more of the address (?dialog=create, ?filter=approved, ?tab=
// teachers) to open on a state worth looking at.
//
// Everything on it is made up and kept in this browser. The accounts, devices, revisions, backups and remembered facts are
// stored under "classes:admin:…"; the uploads and the course-change setting are the app's own shared state, so what is done
// here shows on the Files page and in the sidebar.

import type { ComponentType } from "react";
import { useSearchParams } from "react-router-dom";

import { Stack } from "@studio-baeks/paper-ui";

import { Anchor, PageHeader, Stat, StatRow, Tabs } from "../../../kit";
import { useClasses } from "../state";
import { ScrollTabs } from "../ui/parts";
import { BackupsPanel } from "./admin/Backups";
import { DataPanel } from "./admin/Data";
import { MaterialsPanel } from "./admin/Materials";
import { MemoryPanel } from "./admin/Memory";
import { OverridesPanel } from "./admin/Overrides";
import { SessionsPanel } from "./admin/Sessions";
import { AdminProvider, useAdmin } from "./admin/store";
import { SurveyPanel } from "./admin/Survey";
import { TradePanel } from "./admin/Trade";
import { UsersPanel } from "./admin/Users";
import { VersionsPanel } from "./admin/Versions";

const SECTIONS = [
  { id: "materials", label: "자료 검수", Panel: MaterialsPanel },
  { id: "memory", label: "Ask 기억", Panel: MemoryPanel },
  { id: "users", label: "계정", Panel: UsersPanel },
  { id: "survey", label: "전공 조사", Panel: SurveyPanel },
  { id: "sessions", label: "접속 기기", Panel: SessionsPanel },
  { id: "data", label: "데이터", Panel: DataPanel },
  { id: "versions", label: "회차", Panel: VersionsPanel },
  { id: "overrides", label: "대체 시간표", Panel: OverridesPanel },
  { id: "trade", label: "수강 정정", Panel: TradePanel },
  { id: "backups", label: "백업", Panel: BackupsPanel },
] as const satisfies readonly { id: string; label: string; Panel: ComponentType }[];

const monthDay = (key: string) => `${Number(key.slice(5, 7))}월 ${Number(key.slice(8, 10))}일`;

const Console = () => {
  const { materials, tradeConfig, tradeOpen } = useClasses();
  const { accounts, sessions, facts, backups } = useAdmin();
  const [params, setParams] = useSearchParams();
  const wanted = params.get("section");
  const current = SECTIONS.find((item) => item.id === wanted) ?? SECTIONS[0];

  const pending = materials.filter((item) => item.status === "pending").length;
  const counts: Partial<Record<(typeof SECTIONS)[number]["id"], number>> = { materials: pending, memory: facts.length, users: accounts.length, sessions: sessions.length, backups: backups.length };
  const signedIn = new Set(sessions.map((item) => item.accountId)).size;
  const phones = sessions.filter((item) => item.device === "mobile").length;
  const Panel = current.Panel;

  return (
    <>
      <PageHeader
        eyebrow="운영자 전용"
        title="관리"
        description="계정과 학기 데이터, 자료 검수, 수강 정정 기간을 한곳에서 다룹니다. 이 시연의 모든 데이터는 지어낸 것이고 이 브라우저에만 남습니다."
      />

      <Anchor>
        <StatRow>
          <Stat label="검수 대기" value={pending} unit="건" note={`자료 ${materials.length}건 중`} />
          <Stat label="계정" value={accounts.length} unit="개" note={`지금 로그인 ${signedIn}개`} />
          <Stat label="로그인한 기기" value={sessions.length} unit="대" note={`웹 ${sessions.length - phones} · 모바일 ${phones}`} />
          <Stat label="수강 정정" value={tradeOpen ? "열림" : "닫힘"} note={tradeConfig.enabled ? `${monthDay(tradeConfig.deadline)}까지` : "스위치가 꺼져 있습니다"} />
        </StatRow>
      </Anchor>

      {/* ten tabs do not fit a phone: the row scrolls, and a link into a later section brings its tab into view */}
      <ScrollTabs selected={current.id}>
        <Tabs
          label="관리 영역"
          value={current.id}
          onChange={(id) => setParams({ section: id }, { replace: true })}
          items={SECTIONS.map(({ id, label }) => ({ id, label, count: counts[id] }))}
        />
      </ScrollTabs>

      <Stack as="section" aria-label={current.label} gap="xl">
        <Panel />
      </Stack>
    </>
  );
};

export const AdminPage = () => (
  <AdminProvider>
    <Console />
  </AdminProvider>
);
