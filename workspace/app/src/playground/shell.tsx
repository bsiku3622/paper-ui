// PlaygroundLayout — 플레이그라운드 공용 껍데기.
//
// SiteNav + 컴포넌트 사이드바 + 본문. 전수 레퍼런스(/playground)와 컴포넌트별
// 상세(/playground/:slug)가 같은 사이드바를 공유해 어디에 있든 길을 잃지 않는다.
// 사이드바 시각은 site.css 의 .side-* — 옅은 면 위 rounded rect, active 는 흰 pill.

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Box, Stack, Text, tokens } from "@studio-baeks/paper-ui";

import { SiteNav, NAV_HEIGHT } from "../site/chrome";
import { COMPONENTS, GROUPS } from "./registry";

// 사이드바 항목 = nav 전용 밀도(.side-link). 컨트롤(Button)의 size 체계를 상속하지
// 않는다 — nav 는 행 높이만 촘촘하게(28) 두고 글자는 14 로 고정한다(가독성). Button
// size="sm" 에 태우면 밀도 축이 폰트 축을 끌고 내려가 맥없어진다(VS Code·Atlassian·
// Linear 전부 nav 를 버튼 스케일과 분리). active 는 옅은 면 + weight 로 보상.
const SideLink = ({ to, label, active }: { to: string; label: string; active: boolean }) => (
  <Link to={to} className="side-link" data-active={active}>
    {label}
  </Link>
);

const SideGroup = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="side-group">
    <div className="side-group-label">{label}</div>
    {children}
  </div>
);

export const PlaygroundLayout = ({ active, children }: { active: string; children: ReactNode }) => (
  <Stack>
    <SiteNav />
    <Box style={{ display: "grid", gridTemplateColumns: `${tokens.shape.width.lg.layout} 1fr`, maxWidth: tokens.layout.container.content, marginInline: "auto", width: "100%" }}>
      <Box
        as="nav"
        paddingX="md"
        paddingY="lg"
        className="side-nav"
        style={{ minHeight: `calc(100vh - ${NAV_HEIGHT})`, top: NAV_HEIGHT }}
      >
        <SideGroup label="레퍼런스">
          <SideLink to="/playground/tokens" label="토큰 · Foundations" active={active === "tokens"} />
          <SideLink to="/playground" label="전수 · 한 화면" active={active === "all"} />
        </SideGroup>
        {GROUPS.map((g) => {
          const items = COMPONENTS.filter((c) => c.group === g);
          if (items.length === 0) return null;
          return (
            <SideGroup key={g} label={g}>
              {items.map((c) => (
                <SideLink key={c.slug} to={`/playground/${c.slug}`} label={c.name} active={active === c.slug} />
              ))}
            </SideGroup>
          );
        })}
      </Box>

      <Box paddingX="xl" paddingY="xl" style={{ minWidth: 0 }}>
        {children}
      </Box>
    </Box>
  </Stack>
);

// 사이드바 헤더에서 재사용할 수 있는 브레드크럼 한 줄.
export const Crumb = ({ group, name }: { group: string; name: string }) => (
  <Text variant="caption" ink="faint" as="span">{group} / {name}</Text>
);
