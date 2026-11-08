// The hub's frame: a sidebar with the services (the original's menu, plus the activity log), a top bar for finding things
// and the day's notices, and the page. Below md the sidebar folds into the shell's menu button.

import type { ReactNode } from "react";

import { Stack, useTheme } from "@studio-baeks/paper-ui";

import { AppShell, Meter, Person, Sidebar, SidebarBrand, SidebarCard, type NavSection } from "../../../kit";
import { BASE, SERVICES, serviceTo } from "../registry";
import { useAdmin } from "../store/store";
import { formatBytes } from "../lib/format";
import { TopControls } from "./TopControls";

const QUOTA = 20 * 1024 ** 3;

const AdminSidebar = () => {
  const { files, setSignedIn, log } = useAdmin();
  const { resolved, setTheme } = useTheme();
  const dark = resolved === "dark";
  const used = files.reduce((sum, file) => sum + file.size, 0);

  const sections: NavSection[] = [
    { items: [{ id: "home", label: "홈", glyph: "house", to: BASE, end: true }] },
    { label: "서비스", items: SERVICES.map((service) => ({ id: service.id, label: service.label, glyph: service.glyph, to: serviceTo(service.id) })) },
    { label: "기록", items: [{ id: "activity", label: "활동 기록", glyph: "history", to: `${BASE}/activity` }] },
  ];

  return (
    <Sidebar
      label="서비스 탐색"
      brand={<SidebarBrand name="hub" glyph="shield-check" to={BASE} sub="관리 콘솔" />}
      sections={sections}
      footerItems={[
        { id: "theme", label: dark ? "라이트 테마로 전환" : "다크 테마로 전환", glyph: dark ? "sun" : "moon", onSelect: () => setTheme(dark ? "light" : "dark") },
        {
          id: "signout",
          label: "로그아웃",
          glyph: "log-out",
          onSelect: () => {
            log({ service: "hub", level: "info", title: "로그아웃했습니다", actor: "관리자" });
            setSignedIn(false);
          },
        },
      ]}
      footer={
        <SidebarCard>
          <Stack gap="md">
            <Person name="관리자" sub="VPN 연결됨 · 10.20.10.2" />
            <Meter value={used / QUOTA} label="files 저장 공간" valueText={`${formatBytes(used)} / 20 GB`} />
          </Stack>
        </SidebarCard>
      }
    />
  );
};

export const Shell = ({ children }: { children: ReactNode }) => (
  <AppShell kind="board" name="관리 콘솔" sidebar={<AdminSidebar />} top={<TopControls />}>
    {children}
  </AppShell>
);
