import { useState } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Field, Floating, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { AppShell, Glyph, Menu, Meter, Person, Segmented, Sidebar, SidebarBrand, SidebarCard, TopBar, type NavSection } from "../../kit";
import { termLabel, TERMS } from "./data/build";
import { gradeOf, weekMarkers, weekOf } from "./lib/calendar";
import { path, useClasses } from "./state";
import { Chat } from "./pages/ask/Chat";
import { MajorPrompt } from "./ui/MajorPrompt";
import { searchHref } from "./ui/parts";

const QuickSearch = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  return (
    <Box width="lg">
      <Field
        shape="pill"
        fill="sunken"
        aria-label="과목, 교사, 학번 찾기"
        placeholder="과목 · 교사 · 학번 찾기"
        leading={<Glyph name="search" />}
        value={text}
        clearable
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.nativeEvent.isComposing || !text.trim()) return;
          navigate(searchHref(text.trim()));
          setText("");
        }}
      />
    </Box>
  );
};

const AskWindow = () => {
  const here = useLocation().pathname;
  const open = useSearchParams()[0].get("ask") === "1";
  if (here.startsWith(path("/ask"))) return <IconButton variant="muted" shape="pill" aria-label="Ask — 지금 이 화면입니다" disabled><Glyph name="sparkles" /></IconButton>;
  return (
    <Floating defaultOpen={open}>
      <IconButton as={Floating.Trigger} variant="muted" shape="pill" aria-label="Ask 열기"><Glyph name="sparkles" /></IconButton>
      <Floating.Content as={Surface} fill="raised" border radius="lg" padding="lg" placement="bottom end" aria-label="Ask" maxHeight="80dvh" overflowY="auto">
        <Stack gap="md" width="measure.sm" maxWidth="full">
          <Inline justify="between" align="center">
            <Text as="h2" variant="subheading">Ask</Text>
            <Button as={RouterLink} to={path("/ask")} variant="ghost" size="xs"><Glyph name="panel-right" />크게 보기</Button>
          </Inline>
          <Chat compact />
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

export const Shell = () => {
  const { term, setTerm, tradeOpen, signOut, session, me, events, clock } = useClasses();
  const navigate = useNavigate();
  const markers = weekMarkers(events);
  const week = weekOf(new Date(`${clock.key}T00:00:00`), markers);
  const grade = gradeOf(me.stuId, new Date(`${clock.key}T00:00:00`));

  const sections: NavSection[] = [
    {
      items: [
        { id: "home", label: "홈", glyph: "house", to: path(), end: true },
        { id: "search", label: "검색", glyph: "search", to: path("/search") },
        { id: "rooms", label: "빈 강의실", glyph: "map", to: path("/rooms") },
        { id: "calendar", label: "학사일정", glyph: "calendar-days", to: path("/calendar") },
        { id: "ask", label: "Ask", glyph: "sparkles", to: path("/ask") },
      ],
    },
    {
      label: "전교생과 통계",
      items: [
        { id: "browse", label: "탐색", glyph: "library", to: path("/browse") },
        { id: "analysis", label: "통계", glyph: "chart-column", to: path("/analysis") },
        { id: "files", label: "자료실", glyph: "folder-open", to: path("/files") },
        { id: "upload", label: "자료 올리기", glyph: "upload", to: path("/upload") },
      ],
    },
    {
      label: "내 것",
      items: [
        { id: "zamong", label: "자몽", glyph: "graduation-cap", to: path("/zamong") },
        ...(tradeOpen ? [{ id: "trade", label: "수강 정정", glyph: "arrow-left-right" as const, to: path("/trade"), badge: <Badge size="xs" variant="soft" accent="info">한시</Badge> }] : []),
        { id: "exams", label: "시험", glyph: "clipboard-list", to: path("/exams") },
      ],
    },
  ];

  return (
    <AppShell
      kind="board"
      name="Class Explorer"
      sidebar={
        <Sidebar
          label="Class Explorer 메뉴"
          brand={<SidebarBrand name="Class Explorer" glyph="graduation-cap" to={path()} sub="KSA 수업 탐색" />}
          sections={sections}
          footerItems={[
            { id: "about", label: "설정", glyph: "settings", to: path("/about") },
            ...(session.role === "admin" ? [{ id: "admin", label: "관리", glyph: "shield-check" as const, to: path("/admin") }] : []),
          ]}
          footer={
            <SidebarCard>
              <Person name={me.name} sub={`${me.stuId}${grade ? ` · ${grade}학년` : ""}`} />
              <Box paddingY="sm">
                <Meter value={Math.min(1, (week ?? 0) / 17)} label={`${termLabel(term)}학기`} valueText={week ? `${week}주차 / 17주` : "방학"} />
              </Box>
            </SidebarCard>
          }
        />
      }
      top={
        <TopBar
          start={
            <Segmented
              label="학기"
              options={TERMS.map((item) => ({ id: termLabel(item), label: termLabel(item) }))}
              value={termLabel(term)}
              onChange={(id) => setTerm(TERMS.find((item) => termLabel(item) === id) ?? term)}
            />
          }
          end={
            <>
              <QuickSearch />
              <AskWindow />
              <Menu
                label="계정"
                glyph="circle-user"
                items={[
                  { id: "me", heading: `${me.name} · ${session.username}` },
                  { id: "about", label: "설정", glyph: "settings", onSelect: () => navigate(path("/about")) },
                  { id: "privacy", label: "개인정보처리방침", glyph: "shield-check", onSelect: () => navigate(path("/privacy")) },
                  { id: "divider", divider: true },
                  { id: "out", label: "로그아웃", glyph: "log-out", danger: true, onSelect: () => { signOut(); navigate(path("/welcome")); } },
                ]}
              />
            </>
          }
        />
      }
    >
      <Outlet />
      <MajorPrompt />
    </AppShell>
  );
};
