// A dense product screen: a sidebar the height of the window, a top bar, a strip of numbers and a table of seven columns.
// A row's title is strong and every other word in the table is the body's own, so a row reads from one place. The window scrolls,
// and the sidebar stands still beside it.

import { useState, type ComponentType, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Badge, Box, Button, Divider, Field, Grid, IconButton, Inline, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { ActivityIcon, BellIcon, BookIcon, BoxIcon, CardIcon, ChevronDownIcon, ClockIcon, DeployIcon, GearIcon, GridIcon, HelpIcon, LayersIcon, PlusIcon, SearchIcon, ShieldIcon, StarIcon } from "../../compositions/icons";
import { DemoBar, MAIN, Tabs } from "./parts";

const STATS = [
  { label: "열린 항목", value: "14", note: "심각 1 · 높음 3 · 그 외 10" },
  { label: "기한 넘김", value: "2", note: "SEC-1033 · SEC-1030", tone: "error" },
  { label: "30일 안에 해결", value: "22", note: "재검사로 확인" },
  { label: "관리자와 소유자", value: "2", note: "김서연 · 정민준" },
  { label: "MFA 없는 멤버", value: "1", note: "최하린", tone: "warning" },
  { label: "90일 미사용 키", value: "1", note: "legacy-ci", tone: "warning" },
] as const;

const FILTERS = ["심각도", "상태", "프로젝트", "환경", "담당자", "기한 넘김만"] as const;

const FINDINGS = [
  { id: "SEC-1042", title: "공개 읽기가 허용된 버킷", severity: "심각", resource: "arcfield-shipment-exports", kind: "스토리지 버킷", project: "배송 추적", env: "production", working: false, owner: null, due: "10월 29일", left: "36시간 남음", tone: "error" },
  { id: "SEC-1030", title: "90일 넘게 쓰지 않은 관리자 API 키", severity: "높음", resource: "legacy-ci", kind: "API 키", project: "워크스페이스", env: "—", working: false, owner: "김서연", due: "10월 25일", left: "3일 지남", tone: "error" },
  { id: "SEC-1033", title: "알려진 취약점이 있는 패키지를 포함한 이미지", severity: "높음", resource: "route-optimizer image", kind: "v3.8.1", project: "드라이버 앱 백엔드", env: "production", working: true, owner: "박지호", due: "10월 27일", left: "1일 지남", tone: "error" },
  { id: "SEC-1039", title: "모든 IP에서 연결을 받는 데이터베이스", severity: "높음", resource: "tracking-db-prod", kind: "관리형 데이터베이스", project: "배송 추적", env: "production", working: true, owner: "이도윤", due: "10월 31일", left: "3일 남음", tone: "warning" },
  { id: "SEC-1026", title: "모든 프로젝트에 공유된 데이터베이스 스냅샷", severity: "보통", resource: "staging-tracking-db", kind: "스냅샷", project: "배송 추적", env: "staging", working: false, owner: null, due: "11월 11일", left: "14일 남음", tone: "tertiary" },
  { id: "SEC-1028", title: "환경 변수에 평문으로 저장된 비밀값", severity: "보통", resource: "ops-console-app", kind: "컨테이너 서비스", project: "내부 도구", env: "production", working: true, owner: "이도윤", due: "11월 14일", left: "17일 남음", tone: "tertiary" },
  { id: "SEC-1032", title: "모든 IP에 열린 개발 인스턴스의 SSH", severity: "보통", resource: "dp-dev-notebook", kind: "컴퓨트 인스턴스", project: "데이터 플랫폼", env: "dev", working: false, owner: "한지우", due: "11월 18일", left: "21일 남음", tone: "tertiary" },
] as const;

// Every row names the same tracks, so the columns line up without a table layout. The smallest widths are what the table
// scrolls at, so a narrow screen scrolls it rather than breaking its words.
const COLUMNS = "5.5rem minmax(16rem, 2.4fr) minmax(11rem, 1.5fr) minmax(8rem, 1.1fr) 5.5rem 6.5rem 6.5rem";

const Severity = ({ level }: { level: (typeof FINDINGS)[number]["severity"] }) => {
  if (level === "심각") return <Badge accent="error" variant="soft" dot>{level}</Badge>;
  if (level === "높음") return <Badge accent="warning" variant="soft" dot>{level}</Badge>;
  return <Badge accent="warning" variant="ghost" dot>{level}</Badge>;
};

const Two = ({ top, sub, title, mono, ink = "tertiary" }: { top: string; sub: string; title?: boolean; mono?: boolean; ink?: "tertiary" | "error" | "warning" }) => (
  <Stack>
    <Text as="span" strong={title} ink={title ? "primary" : "secondary"} truncate>{top}</Text>
    <Text as="span" variant="label" strong={false} ink={ink} family={mono ? "mono" : undefined} numeric truncate>{sub}</Text>
  </Stack>
);

const Cell = ({ children }: { children: ReactNode }) => <Box role="cell" minWidth={0}>{children}</Box>;

const Heading = ({ children }: { children: string }) => (
  <Box role="columnheader"><Text as="span" variant="label" strong={false} ink="tertiary">{children}</Text></Box>
);

const Findings = () => (
  <Stack gap="xl">
    <Grid columns="repeat(auto-fit, minmax(8rem, 1fr))" gap="md">
      {STATS.map((stat, index) => (
        <Inline key={stat.label} align="stretch" gap="lg">
          {index > 0 ? <Divider orientation="vertical" /> : null}
          <Stack gap="xs">
            <Text as="span" variant="label" strong={false} ink="tertiary">{stat.label}</Text>
            <Text as="span" variant="display" numeric ink={"tone" in stat ? stat.tone : "primary"}>{stat.value}</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{stat.note}</Text>
          </Stack>
        </Inline>
      ))}
    </Grid>
    <Surface fill="raised" radius="lg" shadow overflow="hidden">
      <Inline justify="between" gap="md" wrap paddingX="xl" paddingY="lg">
        <Inline gap="xs" wrap>
          <Box width="lg" maxWidth="full">
            <Field size="sm" shape="pill" aria-label="ID나 제목으로 찾기" placeholder="ID나 제목으로 찾기" leading={<SearchIcon />} />
          </Box>
          {FILTERS.map((item) => <Button key={item} size="sm" shape="pill" variant="dashed" fontSize="label"><PlusIcon size="label" />{item}</Button>)}
        </Inline>
        <Text as="span" variant="label" strong={false} ink="tertiary">심각도, 그다음 기한 순</Text>
      </Inline>
      <Divider />
      <Box overflowX="auto">
        <Box role="table" aria-label="점검 결과" minWidth="min-content">
          <Box role="rowgroup">
            <Grid role="row" columns={COLUMNS} gap="sm" paddingX="xl" paddingY="sm">
              {["심각도", "항목", "영향받는 자원", "프로젝트 · 환경", "상태", "담당자", "기한"].map((name) => <Heading key={name}>{name}</Heading>)}
            </Grid>
            <Divider aria-hidden />
          </Box>
          <Box role="rowgroup">
            {FINDINGS.map((row, index) => (
              <Box key={row.id}>
                {index > 0 ? <Divider aria-hidden /> : null}
                <Surface as={Grid} role="row" hoverable columns={COLUMNS} gap="sm" align="center" paddingX="xl" paddingY="md">
                  <Cell><Severity level={row.severity} /></Cell>
                  <Cell><Two title top={row.title} sub={row.id} mono /></Cell>
                  <Cell><Two top={row.resource} sub={row.kind} /></Cell>
                  <Cell><Two top={row.project} sub={row.env} /></Cell>
                  <Cell>{row.working ? <Badge accent="info" variant="soft" dot>진행 중</Badge> : <Badge accent="primary" variant="hairline" dot>열림</Badge>}</Cell>
                  <Cell>
                    <Inline gap="xs">
                      <Badge accent={row.owner ? "info" : "primary"} variant={row.owner ? "soft" : "dashed"} size="sm" aria-hidden>{row.owner ? Array.from(row.owner)[0] : "?"}</Badge>
                      <Text as="span" ink={row.owner ? "secondary" : "tertiary"} truncate>{row.owner ?? "미지정"}</Text>
                    </Inline>
                  </Cell>
                  <Cell><Two top={row.due} sub={row.left} ink={row.tone} /></Cell>
                </Surface>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Surface>
  </Stack>
);

const Later = ({ children }: { children: string }) => (
  <Surface fill="raised" radius="lg" padding="xl"><Text ink="tertiary">{children}</Text></Surface>
);

type NavItemData = { id: string; label: string; icon: ComponentType; count?: number };

const SECTIONS: readonly { label?: string; items: readonly NavItemData[] }[] = [
  { items: [{ id: "overview", label: "개요", icon: GridIcon }] },
  { label: "운영", items: [{ id: "projects", label: "프로젝트와 자원", icon: BoxIcon }, { id: "deploy", label: "배포", icon: DeployIcon }, { id: "monitor", label: "모니터링", icon: ActivityIcon, count: 1 }] },
  { label: "관리", items: [{ id: "billing", label: "비용과 결제", icon: CardIcon }, { id: "security", label: "보안과 접근", icon: ShieldIcon, count: 1 }] },
];

const FOOT: readonly NavItemData[] = [{ id: "settings", label: "설정", icon: GearIcon }, { id: "docs", label: "문서", icon: BookIcon }];

// The one solid thing in the sidebar is the page you are on.
const NavItem = ({ item, current, onPick }: { item: NavItemData; current: string; onPick: (id: string) => void }) => {
  const Glyph = item.icon;
  const here = item.id === current;
  return (
    <Button fullWidth justify={item.count ? "between" : "start"} strong={here} variant={here ? "solid" : "muted"} aria-current={here ? "page" : undefined} onClick={() => onPick(item.id)}>
      <Inline as="span" gap="sm"><Glyph />{item.label}</Inline>
      {item.count ? <Badge accent="info" variant="solid" size="sm">{item.count}</Badge> : null}
    </Button>
  );
};

const Sidebar = () => {
  const [current, setCurrent] = useState("security");
  const item = (data: NavItemData) => <NavItem key={data.id} item={data} current={current} onPick={setCurrent} />;
  return (
    <Surface as="aside" elevation="sticky" top="lg" height="viewport" overflowY="auto" fill="raised" radius="lg" shadow padding="md" hideBelow="md">
      <Stack justify="between" gap="lg" height="full">
        <Stack gap="lg">
          <Inline gap="sm" paddingX="md" paddingY="xs">
            <IconButton as={RouterLink} to="/demo" size="xs" aria-label="Studio Baeks 첫 화면"><StarIcon /></IconButton>
            <Text as="span" variant="subheading">Studio Baeks</Text>
          </Inline>
          <Select size="lg" variant="ghost" fill="sunken" aria-label="작업 공간" defaultValue="arcfield">
            <Select.Option value="arcfield">Arcfield Logistics</Select.Option>
            <Select.Option value="studio">Studio Baeks</Select.Option>
          </Select>
          <Stack as="nav" aria-label="제품 메뉴" gap="md">
            {SECTIONS.map((section, index) => (
              <Stack key={section.label ?? index} gap="xs">
                {section.label ? <Box paddingX="lg"><Text as="span" variant="label" strong={false} ink="tertiary">{section.label}</Text></Box> : null}
                {section.items.map(item)}
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Stack as="nav" aria-label="계정 메뉴" gap="xs">{FOOT.map(item)}</Stack>
      </Stack>
    </Surface>
  );
};

const SIDEBAR_AND_COLUMN = "15.5rem minmax(0, 1fr)";

// The space between the sidebar and the column is the grid's gap, and the same padding stands around both.
export const DashboardScreen = () => (
  <Grid columns={{ base: "minmax(0, 1fr)", md: SIDEBAR_AND_COLUMN }} gap="xl" padding="lg" align="start">
    <Sidebar />
    <Stack gap="lg" minWidth={0}>
      <DemoBar />
      <Stack {...MAIN} gap="xl">
        <Inline justify="between" gap="sm" wrap>
          <Inline gap="xs">
            <Button variant="hairline" shape="pill"><BoxIcon />모든 프로젝트<ChevronDownIcon /></Button>
            <Button variant="hairline" shape="pill"><LayersIcon />모든 환경<ChevronDownIcon /></Button>
          </Inline>
          <Inline gap="sm" wrap>
            <Box width="lg" maxWidth="full">
              <Field shape="pill" fill="sunken" aria-label="자원과 배포 찾기" placeholder="자원, 배포 찾기" leading={<SearchIcon />} trailing={<Badge size="xs" variant="hairline" shape="rounded"><Text as="kbd" variant="caption" ink="inherit">/</Text></Badge>} />
            </Box>
            <IconButton variant="muted" shape="pill" aria-label="도움말"><HelpIcon /></IconButton>
            <IconButton variant="muted" shape="pill" aria-label="알림 3개" badge={<Badge accent="info" variant="solid" size="xs">3</Badge>}><BellIcon /></IconButton>
            <IconButton accent="info" variant="soft" shape="pill" aria-label="내 계정"><Text as="span" variant="label" ink="inherit">도</Text></IconButton>
          </Inline>
        </Inline>
        <Inline align="end" justify="between" gap="md" wrap>
          <Stack gap="xs">
            <Text variant="headline">보안과 접근</Text>
            <Text as="p" ink="tertiary">보안 점검 결과, 접근 권한, 감사 기록.</Text>
          </Stack>
          <Inline gap="xs">
            <ClockIcon size="label" ink="tertiary" />
            <Text as="span" variant="label" strong={false} ink="tertiary" numeric>마지막 점검 09:30 UTC</Text>
          </Inline>
        </Inline>
        <Tabs
          label="보안과 접근"
          tabs={[
            { id: "findings", label: <>점검 결과 <Text as="span" variant="label" strong={false} ink="tertiary" numeric>14</Text></>, panel: <Findings /> },
            { id: "access", label: "접근", panel: <Later>접근 권한 목록이 여기에 놓입니다.</Later> },
            { id: "audit", label: "감사 기록", panel: <Later>감사 기록이 여기에 놓입니다.</Later> },
          ]}
        />
      </Stack>
    </Stack>
  </Grid>
);
