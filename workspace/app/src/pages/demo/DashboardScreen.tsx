import { Suspense, useEffect, useRef, useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Box, Button, Divider, Field, Floating, FormField, Grid, IconButton, Inline, Select, Stack, Surface, Text, Textarea, useFloatingContext } from "@studio-baeks/paper-ui";

import { ActivityIcon, BellIcon, BookIcon, BoxIcon, CardIcon, CheckIcon, ChevronDownIcon, DeployIcon, GearIcon, GridIcon, HelpIcon, LayersIcon, SearchIcon, ShieldIcon, StarIcon } from "../../compositions/icons";
import { DAY, Dialog, DialogFooter, MAIN, NoticeBar, PageSpinner, ThemeButton, clock, relative, useStore, useWide, wait } from "./parts";

type NavItemData = { id: string; label: string; icon: ComponentType; to: string; end?: boolean };

const SECTIONS: readonly { label?: string; items: readonly NavItemData[] }[] = [
  { items: [{ id: "overview", label: "개요", icon: GridIcon, to: "/demo/arcfield", end: true }] },
  { label: "운영", items: [{ id: "projects", label: "프로젝트와 자원", icon: BoxIcon, to: "/demo/arcfield/projects" }, { id: "deploy", label: "배포", icon: DeployIcon, to: "/demo/arcfield/deploy" }, { id: "monitor", label: "모니터링", icon: ActivityIcon, to: "/demo/arcfield/monitoring" }] },
  { label: "관리", items: [{ id: "billing", label: "비용과 결제", icon: CardIcon, to: "/demo/arcfield/billing" }, { id: "security", label: "보안과 접근", icon: ShieldIcon, to: "/demo/arcfield/security" }] },
];

const FOOT: readonly NavItemData[] = [{ id: "settings", label: "설정", icon: GearIcon, to: "/demo/arcfield/settings" }, { id: "docs", label: "문서", icon: BookIcon, to: "/demo/arcfield/docs" }];

const NavItem = ({ item, count, onNavigate }: { item: NavItemData; count?: number; onNavigate?: () => void }) => {
  const { pathname } = useLocation();
  const Glyph = item.icon;
  const here = item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`);
  return (
    <Button as={RouterLink} to={item.to} size="sm" fontSize="body" fullWidth justify={count ? "between" : "start"} strong={here} variant="ghost" aria-current={here ? "page" : undefined} onClick={onNavigate}>
      <Inline as="span" gap="sm"><Glyph />{item.label}</Inline>
      {count ? <Badge accent="error" variant="soft" size="xs">{count}</Badge> : null}
    </Button>
  );
};

const useCounts = (): Record<string, number> => {
  const { alerts, findings } = useStore();
  return {
    monitor: alerts.filter((alert) => alert.state === "발생 중").length,
    security: findings.filter((finding) => finding.severity === "심각" && finding.state !== "해결").length,
  };
};

const NavList = ({ onNavigate }: { onNavigate?: () => void }) => {
  const counts = useCounts();
  return (
    <Stack as="nav" aria-label="제품 메뉴" gap="lg">
      {SECTIONS.map((section, index) => (
        <Stack key={section.label ?? index}>
          {section.label ? <Box paddingX="md" paddingY="xs"><Text as="span" variant="caption" ink="tertiary">{section.label}</Text></Box> : null}
          {section.items.map((item) => <NavItem key={item.id} item={item} count={counts[item.id]} onNavigate={onNavigate} />)}
        </Stack>
      ))}
    </Stack>
  );
};

const WORKSPACES = [{ id: "arcfield", name: "Arcfield Logistics" }, { id: "studio", name: "Studio Baeks" }] as const;

const Workspace = () => {
  const [current, setCurrent] = useState<(typeof WORKSPACES)[number]["id"]>("arcfield");
  const name = WORKSPACES.find((workspace) => workspace.id === current)?.name;
  return (
    <Inline justify="between" gap="sm" paddingX="xs">
      <Inline gap="sm" minWidth={0}>
        <IconButton as={RouterLink} to="/demo/arcfield" size="sm" aria-label={`${name} 첫 화면`}><StarIcon /></IconButton>
        <Stack minWidth={0}>
          <Text as="span" strong truncate>{name}</Text>
          <Text as="span" variant="caption" ink="tertiary" truncate>작업 공간</Text>
        </Stack>
      </Inline>
      <Floating>
        <IconButton as={Floating.Trigger} size="sm" variant="ghost" aria-label="작업 공간 바꾸기"><ChevronDownIcon /></IconButton>
        <Floating.Content as={Surface} fill="raised" radius="md" padding="sm" width="lg" maxWidth="full" aria-label="작업 공간" placement="bottom end">
          <Stack gap="xs">
            {WORKSPACES.map((workspace) => (
              <Button key={workspace.id} as={Floating.Close} size="sm" variant="ghost" fullWidth justify="between" selected={workspace.id === current} onClick={() => setCurrent(workspace.id)}>
                {workspace.name}{workspace.id === current ? <CheckIcon /> : null}
              </Button>
            ))}
          </Stack>
        </Floating.Content>
      </Floating>
    </Inline>
  );
};

const Sidebar = () => (
  <Surface as="aside" elevation="sticky" top="none" height="viewport" overflowY="auto" border="end" padding="md" hideBelow="md">
    <Stack justify="between" gap="lg" height="full">
      <Stack gap="xl">
        <Workspace />
        <NavList />
      </Stack>
      <Stack as="nav" aria-label="계정 메뉴">{FOOT.map((item) => <NavItem key={item.id} item={item} />)}</Stack>
    </Stack>
  </Surface>
);

const ScopeMenu = ({ label, icon, value, options, onChange }: { label: string; icon: ReactNode; value: string; options: readonly { value: string; label: string }[]; onChange: (next: string) => void }) => {
  const current = options.find((option) => option.value === value) ?? options[0];
  return (
    <Floating>
      <Button as={Floating.Trigger} accent={value === "all" ? "primary" : "info"} variant="soft">{icon}{current?.label}<ChevronDownIcon /></Button>
      <Floating.Content as={Surface} fill="raised" radius="md" padding="sm" width="lg" maxWidth="full" aria-label={label}>
        <Stack gap="xs">
          {options.map((option) => (
            <Button key={option.value} as={Floating.Close} size="sm" variant="ghost" fullWidth justify="between" selected={option.value === value} onClick={() => onChange(option.value)}>
              {option.label}{option.value === value ? <CheckIcon /> : null}
            </Button>
          ))}
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

const MenuLink = ({ to, children }: { to: string; children: ReactNode }) => {
  const { close } = useFloatingContext();
  return <Button as={RouterLink} to={to} size="sm" variant="ghost" fullWidth justify="start" onClick={close}>{children}</Button>;
};

type Alerting = { id: string; title: string; text: string; at: number; to: string };

const useAlerting = (): Alerting[] => {
  const { alerts, deployments, findings } = useStore();
  const at = clock();
  return [
    ...alerts.filter((alert) => alert.state === "발생 중").map((alert) => ({ id: alert.id, title: `${alert.service}: ${alert.title}`, text: relative(alert.since), at: alert.since, to: "/demo/arcfield/monitoring?tab=alerts" })),
    ...deployments.filter((deployment) => deployment.status === "실패" && deployment.started > at - 2 * DAY).map((deployment) => ({ id: deployment.id, title: `배포 #${deployment.no} 실패: ${deployment.service}`, text: relative(deployment.started), at: deployment.started, to: `/demo/arcfield/deploy/${deployment.id}` })),
    ...findings.filter((finding) => finding.state !== "해결" && finding.due < at).map((finding) => ({ id: finding.id, title: `${finding.id} 기한을 넘겼습니다`, text: finding.title, at: finding.due, to: "/demo/arcfield/security" })),
  ].sort((a, b) => b.at - a.at).slice(0, 8);
};

const Bell = () => {
  const { read, markRead } = useStore();
  const list = useAlerting();
  const unread = list.filter((item) => !read.has(item.id));
  return (
    <Floating>
      <IconButton as={Floating.Trigger} variant="soft" aria-label={unread.length ? `알림 ${unread.length}개` : "알림"} badge={unread.length ? <Badge accent="info" variant="solid" size="xs">{unread.length}</Badge> : undefined}><BellIcon /></IconButton>
      <Floating.Content as={Surface} fill="raised" radius="md" padding="sm" width="xl" maxWidth="full" aria-label="알림" placement="bottom end">
        <Stack gap="xs">
          <Inline justify="between" paddingX="sm" paddingY="xs">
            <Text as="h2" variant="subheading">알림</Text>
            <Button size="xs" variant="ghost" onClick={() => markRead(list.map((item) => item.id))}>모두 읽음</Button>
          </Inline>
          <Divider />
          {list.length === 0 ? <Box padding="md"><Text as="p" ink="tertiary">새 알림이 없습니다.</Text></Box> : list.map((item) => (
            <MenuLink key={item.id} to={item.to}>
              <Inline as="span" gap="sm">
                {read.has(item.id) ? null : <Text as="span" ink="info" aria-hidden>●</Text>}
                <Text as="span" ink="inherit" truncate>{item.title}</Text>
              </Inline>
            </MenuLink>
          ))}
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

const SupportForm = ({ onDone }: { onDone: () => void }) => {
  const { notify } = useStore();
  const [subject, setSubject] = useState("");
  const [kind, setKind] = useState("question");
  const [body, setBody] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const errors = { subject: subject.trim() ? undefined : "제목을 입력해주세요.", body: body.trim().length >= 10 ? undefined : "내용은 10자 이상 적어주세요." };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (errors.subject || errors.body || busy) return;
    setBusy(true);
    await wait(800);
    notify("success", "문의를 접수했습니다", "SUP-1042 · 영업일 기준 하루 안에 메일로 답을 드립니다.");
    onDone();
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <FormField label="제목" required invalid={submitted && Boolean(errors.subject)} error={errors.subject}>
        <Field value={subject} onChange={(event) => setSubject(event.target.value)} />
      </FormField>
      <FormField label="유형">
        <Select value={kind} onChange={(event) => setKind(event.target.value)}>
          <Select.Option value="question">사용법 질문</Select.Option>
          <Select.Option value="incident">장애 신고</Select.Option>
          <Select.Option value="billing">결제와 청구</Select.Option>
          <Select.Option value="security">보안 문의</Select.Option>
        </Select>
      </FormField>
      <FormField label="내용" required invalid={submitted && Boolean(errors.body)} error={errors.body}>
        <Textarea rows={4} value={body} onChange={(event) => setBody(event.target.value)} />
      </FormField>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" loading={busy} loadingLabel="접수하는 중">문의 보내기</Button>
      </DialogFooter>
    </Stack>
  );
};

const SupportLink = ({ onSupport }: { onSupport: () => void }) => {
  const { close } = useFloatingContext();
  return <Button size="sm" variant="ghost" fullWidth justify="start" onClick={() => { close(); onSupport(); }}>지원 문의하기</Button>;
};

const Help = ({ onSupport }: { onSupport: () => void }) => (
  <Floating>
    <IconButton as={Floating.Trigger} variant="soft" aria-label="도움말"><HelpIcon /></IconButton>
    <Floating.Content as={Surface} fill="raised" radius="md" padding="sm" width="lg" maxWidth="full" aria-label="도움말" placement="bottom end">
      <Stack gap="xs">
        <MenuLink to="/demo/arcfield/docs">문서 보기</MenuLink>
        <MenuLink to="/demo/arcfield/docs/tour">콘솔 둘러보기</MenuLink>
        <SupportLink onSupport={onSupport} />
        <Divider />
        <Box paddingX="sm" paddingY="xs"><Text as="p" variant="label" strong={false} ink="tertiary">/ 를 누르면 검색으로 갑니다.</Text></Box>
      </Stack>
    </Floating.Content>
  </Floating>
);

const Account = () => {
  const { me } = useStore();
  return (
    <Floating>
      <IconButton as={Floating.Trigger} accent="info" variant="soft" aria-label="내 계정"><Text as="span" variant="label" ink="inherit">{Array.from(me.name)[0]}</Text></IconButton>
      <Floating.Content as={Surface} fill="raised" radius="md" padding="sm" width="lg" maxWidth="full" aria-label="내 계정" placement="bottom end">
        <Stack gap="xs">
          <Stack paddingX="sm" paddingY="xs">
            <Text as="span" strong>{me.name}</Text>
            <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{me.email}</Text>
          </Stack>
          <Divider />
          <MenuLink to="/demo/arcfield/settings">설정</MenuLink>
          <MenuLink to="/demo/arcfield/docs">문서</MenuLink>
          <MenuLink to="/demo/arcfield/login">로그아웃</MenuLink>
        </Stack>
      </Floating.Content>
    </Floating>
  );
};

const Toolbar = ({ onMenu, onSupport }: { onMenu: () => void; onSupport: () => void }) => {
  const { projects, scope, setScope } = useStore();
  const wide = useWide();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const onSearchPage = pathname === "/demo/arcfield/search";
  const heard = params.get("q") ?? "";

  useEffect(() => {
    if (onSearchPage) setQuery(heard);
  }, [onSearchPage, heard]);

  useEffect(() => {
    const listen = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))) return;
      event.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", listen);
    return () => window.removeEventListener("keydown", listen);
  }, []);

  const go = (next: string, replace: boolean) => navigate(`/demo/arcfield/search?q=${encodeURIComponent(next)}`, { replace });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) go(query.trim(), onSearchPage);
  };

  const scoped = pathname === "/demo/arcfield" || ["/demo/arcfield/projects", "/demo/arcfield/deploy", "/demo/arcfield/monitoring", "/demo/arcfield/security"].some((base) => pathname === base || pathname.startsWith(`${base}/`));

  return (
    <Inline as="header" justify={scoped || !wide ? "between" : "end"} gap="sm" wrap>
      {scoped || !wide ? (
        <Inline gap="xs" wrap>
          {wide ? null : <IconButton variant="soft" aria-label="메뉴 열기" onClick={onMenu}><GridIcon /></IconButton>}
          {scoped ? (
            <>
              <ScopeMenu label="프로젝트" icon={<BoxIcon />} value={scope.project} onChange={(project) => setScope({ project })}
                options={[{ value: "all", label: "모든 프로젝트" }, ...projects.map((project) => ({ value: project.id, label: project.name }))]} />
              <ScopeMenu label="환경" icon={<LayersIcon />} value={scope.env} onChange={(env) => setScope({ env })}
                options={[{ value: "all", label: "모든 환경" }, { value: "production", label: "production" }, { value: "staging", label: "staging" }, { value: "dev", label: "dev" }]} />
            </>
          ) : null}
        </Inline>
      ) : null}
      <Inline gap="sm">
        <Box as="form" role="search" onSubmit={submit} width="lg" minWidth={0}>
          <Field ref={input} shape="pill" variant="ghost" fill="sunken" aria-label="자원과 배포 찾기" placeholder="자원, 배포 찾기" leading={<SearchIcon />} value={query}
            trailing={<Badge size="xs" variant="hairline" shape="rounded"><Text as="kbd" variant="caption" ink="inherit">/</Text></Badge>}
            onChange={(event) => { setQuery(event.target.value); if (onSearchPage) go(event.target.value, true); }} />
        </Box>
        <Help onSupport={onSupport} />
        <Bell />
        <ThemeButton />
        <Account />
      </Inline>
    </Inline>
  );
};

const SIDEBAR_AND_COLUMN = "15.5rem minmax(0, 1fr)";

export const DashboardScreen = () => {
  const [menu, setMenu] = useState(false);
  const [support, setSupport] = useState(false);
  return (
    <Grid columns={{ base: "minmax(0, 1fr)", md: SIDEBAR_AND_COLUMN }} align="start">
      <Sidebar />
      <Stack gap="xl" minWidth={0} padding="xl">
        <Toolbar onMenu={() => setMenu(true)} onSupport={() => setSupport(true)} />
        <Stack {...MAIN} gap="xl">
          <NoticeBar />
          <Suspense fallback={<PageSpinner />}><Outlet /></Suspense>
        </Stack>
      </Stack>
      <Dialog open={menu} onOpenChange={setMenu} title="메뉴"><NavList onNavigate={() => setMenu(false)} /></Dialog>
      <Dialog open={support} onOpenChange={setSupport} title="지원 문의" description="사용 중 막힌 곳이나 이상한 점을 알려주세요."><SupportForm onDone={() => setSupport(false)} /></Dialog>
    </Grid>
  );
};
