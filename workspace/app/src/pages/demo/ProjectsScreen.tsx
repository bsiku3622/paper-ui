// Projects and the resources in them. A project has a page of its own; a resource opens in a dialog, where it can be restarted,
// copied into a snapshot or deleted, and every one of those changes the same data the other pages count.

import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Badge, Box, Button, Checkbox, Divider, Field, Floating, FormField, Inline, Link, Select, Stack, Text, Textarea } from "@studio-baeks/paper-ui";

import { PlusIcon } from "../../compositions/icons";
import {
  ConfirmDialog, DataTable, DeployBadge, Dialog, DialogFooter, EmptyState, ENVS, Facts, FilterChip, KINDS, ME, Notice, PageTitle, Pager, Panel, PersonCell, ResourceBadge, RESOURCE_STATUSES, SearchField, StatStrip, TabCount, TableBar, Tabs, Two,
  DAY, clock, formatLongDate, formatWon, formatWonShort, monthlyOf, relative, summarize, useParam, useProjectName, useStore, useTable, useWide, wait,
  type Column, type Deployment, type Env, type Kind, type Project, type Resource, type ResourceStatus,
} from "./parts";

// ─── One resource ────────────────────────────────────────────────────────────────────────────────────────────────────

const RESTARTABLE: readonly Kind[] = ["컨테이너 서비스", "컴퓨트 인스턴스", "관리형 데이터베이스"];
const SNAPSHOTTABLE: readonly Kind[] = ["컴퓨트 인스턴스", "관리형 데이터베이스"];

const ResourceBody = ({ resource, onClose }: { resource: Resource; onClose: () => void }) => {
  const { findings, setResources, notify, record } = useStore();
  const nameOf = useProjectName();
  const [asking, setAsking] = useState(false);
  const related = findings.filter((finding) => finding.resource === resource.id && finding.state !== "해결");
  const busy = resource.status === "시작 중" || resource.status === "생성 중";

  // A status that lasts only while the work is done: it goes back to what it was once the time is up.
  const work = (status: ResourceStatus, then: ResourceStatus) => {
    setResources((list) => list.map((entry) => (entry.id === resource.id ? { ...entry, status } : entry)));
    window.setTimeout(() => setResources((list) => list.map((entry) => (entry.id === resource.id && entry.status === status ? { ...entry, status: then } : entry))), 3500);
  };
  const restart = () => {
    work("시작 중", "정상");
    notify("info", `${resource.id}을(를) 다시 시작합니다`, "몇 초 뒤에 정상으로 돌아옵니다.");
    record({ code: "resource.restart", action: "자원을 다시 시작했습니다", target: resource.id });
  };
  const stop = () => {
    setResources((list) => list.map((entry) => (entry.id === resource.id ? { ...entry, status: "중지됨" } : entry)));
    notify("success", `${resource.id}을(를) 중지했습니다`, "중지한 인스턴스는 디스크 비용만 나옵니다.");
    record({ code: "resource.stop", action: "인스턴스를 중지했습니다", target: resource.id });
  };
  const snapshot = () => {
    const stamp = clock();
    const copy: Resource = { id: `${resource.id}-snap-${Math.floor(stamp / 1000) % 100000}`, kind: "스냅샷", projectId: resource.projectId, env: resource.env, spec: "생성 중", cost: 4000, status: "생성 중", created: stamp, owner: resource.owner };
    setResources((list) => [...list, copy]);
    window.setTimeout(() => setResources((list) => list.map((entry) => (entry.id === copy.id ? { ...entry, status: "정상", spec: "88 GB · 방금 생성" } : entry))), 4000);
    notify("success", "스냅샷을 만들고 있습니다", `${copy.id}이(가) 자원 목록에 나타났습니다.`);
    record({ code: "snapshot.create", action: "스냅샷을 만들었습니다", target: copy.id });
  };
  const remove = () => {
    setResources((list) => list.filter((entry) => entry.id !== resource.id));
    notify("success", `${resource.id}을(를) 삭제했습니다`, "이 자원이 낸 비용은 이번 달 청구까지만 남습니다.");
    record({ code: "resource.delete", action: "자원을 삭제했습니다", target: resource.id });
    onClose();
  };

  return (
    <Stack gap="lg">
      <Facts items={[
        ["종류", resource.kind],
        ["프로젝트", <Link key="project" as={RouterLink} to={`/demo/arcfield/projects/${resource.projectId}`} underline="hover">{nameOf(resource.projectId)}</Link>],
        ["환경", resource.env],
        ["사양", resource.spec],
        ["상태", <ResourceBadge key="status" status={resource.status} />],
        ["월 비용", formatWon(resource.cost)],
        ["만든 날", clock() - resource.created < 60 * DAY ? `${formatLongDate(resource.created)} · ${relative(resource.created)}` : formatLongDate(resource.created)],
        ["담당자", resource.owner],
      ]} />
      {related.length > 0 ? (
        <Notice accent="warning" title={`열린 점검 항목 ${related.length}건`}>
          {related.map((finding) => `${finding.id} ${finding.title}`).join(" · ")}{" "}
          <Link as={RouterLink} to="/demo/arcfield/security" underline="hover">보안과 접근에서 보기</Link>
        </Notice>
      ) : null}
      <Inline justify="between" gap="sm" wrap>
        <Button variant="ghost" accent="error" disabled={busy} onClick={() => setAsking(true)}>삭제</Button>
        <Inline gap="sm" wrap>
          {resource.kind === "컴퓨트 인스턴스" && resource.status !== "중지됨" ? <Button variant="hairline" disabled={busy} onClick={stop}>중지</Button> : null}
          {RESTARTABLE.includes(resource.kind) ? <Button variant="hairline" disabled={busy} onClick={restart}>{resource.status === "중지됨" ? "시작" : "다시 시작"}</Button> : null}
          {SNAPSHOTTABLE.includes(resource.kind) ? <Button variant="hairline" disabled={busy || resource.status === "중지됨"} onClick={snapshot}>스냅샷 만들기</Button> : null}
          <Button as={Floating.Close}>닫기</Button>
        </Inline>
      </Inline>
      <ConfirmDialog open={asking} onOpenChange={setAsking} title="이 자원을 삭제할까요?" description={`${resource.id}은(는) 삭제하면 되돌릴 수 없습니다. 연결된 스냅샷은 남습니다.`}
        confirmLabel="삭제" tone="error" confirmText={resource.id} onConfirm={remove} />
    </Stack>
  );
};

const ResourceDialog = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const { resources } = useStore();
  const resource = resources.find((entry) => entry.id === id);
  return (
    <Dialog open={Boolean(resource)} onOpenChange={(open) => { if (!open) onClose(); }} title={resource?.id ?? "자원"} description={resource?.kind} size="md">
      {resource ? <ResourceBody resource={resource} onClose={onClose} /> : null}
    </Dialog>
  );
};

// ─── A new project ───────────────────────────────────────────────────────────────────────────────────────────────────

const SLUG = /^[a-z][a-z0-9-]{2,31}$/;
const REGIONS = ["서울", "도쿄", "싱가포르"] as const;

const NewProjectForm = ({ onDone }: { onDone: (id: string) => void }) => {
  const { projects, members, setProjects, notify, record } = useStore();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [region, setRegion] = useState<string>("서울");
  const [owner, setOwner] = useState<string>(ME.name);
  const [envs, setEnvs] = useState<readonly Env[]>(["production", "staging"]);
  const [summary, setSummary] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const errors = {
    name: name.trim().length >= 2 ? undefined : "이름은 두 글자 이상으로 정해주세요.",
    id: !SLUG.test(id) ? "영문 소문자로 시작하는 3~32자의 소문자, 숫자, 하이픈만 쓸 수 있습니다." : projects.some((project) => project.id === id) ? "이미 쓰고 있는 ID입니다." : undefined,
    envs: envs.length ? undefined : "환경을 하나 이상 골라주세요.",
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (errors.name || errors.id || errors.envs || busy) return;
    setBusy(true);
    await wait(700);
    const project: Project = { id, name: name.trim(), owner, envs, region, created: clock(), summary: summary.trim() || "설명이 아직 없습니다." };
    setProjects((list) => [...list, project]);
    notify("success", `${project.name} 프로젝트를 만들었습니다`, `${region} 리전, 환경 ${envs.length}개로 시작합니다.`);
    record({ code: "project.create", action: "프로젝트를 만들었습니다", target: project.name });
    onDone(id);
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <FormField label="이름" required invalid={submitted && Boolean(errors.name)} error={errors.name}>
        <Field value={name} placeholder="예: 고객 알림" onChange={(event) => setName(event.target.value)} />
      </FormField>
      <FormField label="프로젝트 ID" required description="주소와 자원 이름에 쓰입니다. 만든 뒤에는 바꿀 수 없습니다." invalid={submitted && Boolean(errors.id)} error={errors.id}>
        <Field value={id} placeholder="customer-alerts" autoComplete="off" onChange={(event) => setId(event.target.value.toLowerCase())} />
      </FormField>
      <Inline gap="lg" align="start" wrap>
        <Box width="md" maxWidth="full">
          <FormField label="리전">
            <Select value={region} onChange={(event) => setRegion(event.target.value)}>
              {REGIONS.map((entry) => <Select.Option key={entry} value={entry}>{entry}</Select.Option>)}
            </Select>
          </FormField>
        </Box>
        <Box width="md" maxWidth="full">
          <FormField label="담당자">
            <Select value={owner} onChange={(event) => setOwner(event.target.value)}>
              {members.filter((person) => !person.pending).map((person) => <Select.Option key={person.name} value={person.name}>{person.name}</Select.Option>)}
            </Select>
          </FormField>
        </Box>
      </Inline>
      <Stack gap="xs" role="group" aria-label="환경">
        <Text as="span" variant="label">환경</Text>
        <Inline gap="lg" wrap>
          {ENVS.map((env) => (
            <Inline key={env} as="label" gap="sm">
              <Checkbox checked={envs.includes(env)} onChange={(event) => setEnvs(event.target.checked ? [...envs, env] : envs.filter((entry) => entry !== env))} />
              <Text as="span">{env}</Text>
            </Inline>
          ))}
        </Inline>
        {submitted && errors.envs ? <Text variant="caption" ink="error">{errors.envs}</Text> : null}
      </Stack>
      <FormField label="설명">
        <Textarea rows={3} value={summary} placeholder="무엇을 하는 프로젝트인지 한두 줄로 적어주세요." onChange={(event) => setSummary(event.target.value)} />
      </FormField>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" loading={busy} loadingLabel="만드는 중">프로젝트 만들기</Button>
      </DialogFooter>
    </Stack>
  );
};

// ─── The list ────────────────────────────────────────────────────────────────────────────────────────────────────────

type Row = { project: Project; count: number; attention: number; cost: number; last: Deployment | undefined };

export const ProjectsScreen = () => {
  const { projects, resources, deployments, inScope, scope } = useStore();
  const nameOf = useProjectName();
  const navigate = useNavigate();
  const [tab, setTab] = useParam("tab", "projects", ["projects", "resources"]);
  const [open, setOpen] = useParam("open", "");
  const [creating, setCreating] = useState(false);
  const inEnv = (env: string) => scope.env === "all" || env === scope.env;

  const rows: Row[] = projects
    .filter((project) => (scope.project === "all" || project.id === scope.project) && (scope.env === "all" || project.envs.includes(scope.env as Env)))
    .map((project) => {
      const own = resources.filter((resource) => resource.projectId === project.id && inEnv(resource.env));
      const runs = deployments.filter((run) => run.projectId === project.id && inEnv(run.env));
      return { project, count: own.length, attention: own.filter((resource) => resource.status === "점검 필요").length, cost: monthlyOf(own), last: runs[runs.length - 1] };
    });
  const mine = resources.filter(inScope);

  const projectColumns: readonly Column<Row>[] = [
    { id: "name", header: "프로젝트", track: "minmax(12rem, 2fr)", opens: true, compare: (a, b) => a.project.name.localeCompare(b.project.name, "ko"), render: (row) => <Two title top={row.project.name} sub={row.project.id} mono /> },
    { id: "envs", header: "환경", track: "minmax(11rem, 1.6fr)", render: (row) => <Inline gap="xs" wrap>{row.project.envs.map((env) => <Badge key={env} variant="hairline" size="sm">{env}</Badge>)}</Inline> },
    { id: "count", header: "자원", track: "6rem", largestFirst: true, compare: (a, b) => a.count - b.count, render: (row) => <Two top={`${row.count}개`} sub={row.attention ? `점검 필요 ${row.attention}` : "이상 없음"} ink={row.attention ? "warning" : "tertiary"} /> },
    { id: "cost", header: "월 비용", track: "7rem", end: true, largestFirst: true, compare: (a, b) => a.cost - b.cost, render: (row) => <Text as="span" numeric>{formatWon(row.cost)}</Text> },
    { id: "owner", header: "담당자", track: "7rem", compare: (a, b) => a.project.owner.localeCompare(b.project.owner, "ko"), render: (row) => <PersonCell name={row.project.owner} /> },
    { id: "last", header: "최근 배포", track: "minmax(9rem, 1.2fr)", largestFirst: true, compare: (a, b) => (a.last?.started ?? 0) - (b.last?.started ?? 0), render: (row) => <Two top={row.last ? relative(row.last.started) : "—"} sub={row.last ? `${row.last.service} ${row.last.version}` : "배포 없음"} /> },
  ];
  const projectTable = useTable(rows, { columns: projectColumns, sort: { id: "name", dir: "asc" }, match: (row, words) => `${row.project.name} ${row.project.id} ${row.project.owner}`.toLowerCase().includes(words), size: 12 });

  const resourceColumns: readonly Column<Resource>[] = [
    { id: "name", header: "자원", track: "minmax(13rem, 2.2fr)", opens: true, compare: (a, b) => a.id.localeCompare(b.id), render: (row) => <Two title top={row.id} sub={row.kind} /> },
    { id: "project", header: "프로젝트 · 환경", track: "minmax(10rem, 1.4fr)", compare: (a, b) => nameOf(a.projectId).localeCompare(nameOf(b.projectId), "ko"), render: (row) => <Two top={nameOf(row.projectId)} sub={row.env} /> },
    { id: "spec", header: "사양", track: "minmax(11rem, 1.8fr)", render: (row) => <Text as="span" ink="secondary" truncate>{row.spec}</Text> },
    { id: "status", header: "상태", track: "6.5rem", compare: (a, b) => RESOURCE_STATUSES.indexOf(a.status) - RESOURCE_STATUSES.indexOf(b.status), render: (row) => <ResourceBadge status={row.status} /> },
    { id: "cost", header: "월 비용", track: "7rem", end: true, largestFirst: true, compare: (a, b) => a.cost - b.cost, render: (row) => <Text as="span" numeric>{formatWon(row.cost)}</Text> },
    { id: "created", header: "만든 날", track: "6rem", largestFirst: true, compare: (a, b) => a.created - b.created, render: (row) => <Text as="span" ink="tertiary">{relative(row.created)}</Text> },
  ];
  const resourceTable = useTable(mine, {
    columns: resourceColumns, sort: { id: "name", dir: "asc" }, size: 12,
    match: (row, words) => `${row.id} ${row.kind} ${row.spec} ${nameOf(row.projectId)} ${row.owner}`.toLowerCase().includes(words),
    filters: { kind: (row) => row.kind, project: (row) => row.projectId, env: (row) => row.env, status: (row) => row.status },
  });
  const count = (pick: (resource: Resource) => string, value: string) => mine.filter((resource) => pick(resource) === value).length;

  const worried = mine.filter((resource) => resource.status === "점검 필요").length;
  const stopped = mine.filter((resource) => resource.status === "중지됨").length;

  return (
    <Stack gap="xl">
      <PageTitle
        title="프로젝트와 자원"
        description="프로젝트마다 자원과 비용을 보고, 자원의 상태를 확인합니다."
        aside={<Button onClick={() => setCreating(true)}><PlusIcon />새 프로젝트</Button>}
      />
      <StatStrip stats={[
        { label: "프로젝트", value: String(rows.length), note: `환경 ${new Set(rows.flatMap((row) => row.project.envs)).size}종` },
        { label: "자원", value: String(mine.length), note: `${KINDS.filter((kind) => mine.some((resource) => resource.kind === kind)).length}가지 종류` },
        { label: "점검 필요", value: String(worried), note: worried ? "보안과 접근에서 확인" : "이상 없음", tone: worried ? "warning" : undefined },
        { label: "중지됨", value: String(stopped), note: "디스크 비용만 나옵니다" },
        { label: "월 예상 비용", value: formatWonShort(monthlyOf(mine)), note: "자원만 합친 값" },
      ]} />
      <Tabs
        label="프로젝트와 자원"
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            id: "projects", label: <TabCount label="프로젝트" count={rows.length} />, panel: (
              <Panel>
                <TableBar summary={summarize(projectTable, projectColumns)} onReset={projectTable.active ? projectTable.reset : undefined}>
                  <SearchField label="이름이나 ID로 찾기" value={projectTable.query} onChange={projectTable.setQuery} />
                </TableBar>
                <DataTable label="프로젝트" columns={projectColumns} rows={projectTable.slice} rowKey={(row) => row.project.id} sort={projectTable.sort} onSort={projectTable.toggleSort}
                  onOpen={(row) => navigate(`/demo/arcfield/projects/${row.project.id}`)}
                  empty={<EmptyState title="조건에 맞는 프로젝트가 없습니다">검색어를 바꾸거나 위쪽 범위를 넓혀보세요.</EmptyState>} />
                <Pager table={projectTable} />
              </Panel>
            ),
          },
          {
            id: "resources", label: <TabCount label="자원" count={mine.length} />, panel: (
              <Panel>
                <TableBar summary={summarize(resourceTable, resourceColumns)} onReset={resourceTable.active ? resourceTable.reset : undefined}>
                  <SearchField label="이름, 종류, 사양으로 찾기" value={resourceTable.query} onChange={resourceTable.setQuery} />
                  <FilterChip label="종류" selected={resourceTable.picked.kind ?? []} onChange={(next) => resourceTable.pick("kind", next)} options={KINDS.map((kind) => ({ value: kind, label: kind, count: count((resource) => resource.kind, kind) }))} />
                  <FilterChip label="프로젝트" selected={resourceTable.picked.project ?? []} onChange={(next) => resourceTable.pick("project", next)} options={projects.map((project) => ({ value: project.id, label: project.name, count: count((resource) => resource.projectId, project.id) }))} />
                  <FilterChip label="환경" selected={resourceTable.picked.env ?? []} onChange={(next) => resourceTable.pick("env", next)} options={[...ENVS, "—"].map((env) => ({ value: env, label: env === "—" ? "환경 없음" : env, count: count((resource) => resource.env, env) }))} />
                  <FilterChip label="상태" selected={resourceTable.picked.status ?? []} onChange={(next) => resourceTable.pick("status", next)} options={RESOURCE_STATUSES.map((status) => ({ value: status, label: status, count: count((resource) => resource.status, status) }))} />
                </TableBar>
                <DataTable label="자원" columns={resourceColumns} rows={resourceTable.slice} rowKey={(row) => row.id} sort={resourceTable.sort} onSort={resourceTable.toggleSort} onOpen={(row) => setOpen(row.id)}
                  empty={<EmptyState title="조건에 맞는 자원이 없습니다" action={<Button size="sm" variant="hairline" onClick={resourceTable.reset}>필터 초기화</Button>}>검색어나 필터를 바꿔보세요.</EmptyState>} />
                <Pager table={resourceTable} />
              </Panel>
            ),
          },
        ]}
      />
      <Dialog open={creating} onOpenChange={setCreating} title="새 프로젝트" description="자원과 배포를 묶는 단위입니다." size="md">
        <NewProjectForm onDone={(id) => { setCreating(false); navigate(`/demo/arcfield/projects/${id}`); }} />
      </Dialog>
      {open ? <ResourceDialog id={open} onClose={() => setOpen("")} /> : null}
    </Stack>
  );
};

// ─── One project ─────────────────────────────────────────────────────────────────────────────────────────────────────

const ProjectSettings = ({ project }: { project: Project }) => {
  const { members, setProjects, setResources, notify, record, resources, scope, setScope } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState(project.name);
  const [summary, setSummary] = useState(project.summary);
  const [owner, setOwner] = useState(project.owner);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  const invalid = name.trim().length < 2;
  const dirty = name !== project.name || summary !== project.summary || owner !== project.owner;
  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaved(true);
    if (invalid || busy) return;
    setBusy(true);
    await wait(600);
    setProjects((list) => list.map((entry) => (entry.id === project.id ? { ...entry, name: name.trim(), summary: summary.trim(), owner } : entry)));
    record({ code: "project.update", action: "프로젝트 설정을 고쳤습니다", target: name.trim() });
    notify("success", "저장했습니다", "프로젝트 설정을 바꿨습니다.");
    setBusy(false);
    setSaved(false);
  };
  const remove = () => {
    if (scope.project === project.id) setScope({ project: "all" });
    setResources((list) => list.filter((resource) => resource.projectId !== project.id));
    setProjects((list) => list.filter((entry) => entry.id !== project.id));
    record({ code: "project.delete", action: "프로젝트를 삭제했습니다", target: project.name });
    notify("success", `${project.name} 프로젝트를 삭제했습니다`, "속한 자원도 함께 지웠습니다.");
    navigate("/demo/arcfield/projects");
  };
  const owned = resources.filter((resource) => resource.projectId === project.id).length;
  return (
    <Stack gap="xl">
      <Panel title="프로젝트 설정">
        <Stack as="form" noValidate gap="lg" padding="xl" onSubmit={save}>
          <FormField label="이름" required invalid={saved && invalid} error="이름은 두 글자 이상이어야 합니다.">
            <Field value={name} onChange={(event) => setName(event.target.value)} />
          </FormField>
          <FormField label="설명">
            <Textarea rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} />
          </FormField>
          <Inline gap="lg" align="start" wrap>
            <Box width="md" maxWidth="full">
              <FormField label="담당자">
                <Select value={owner} onChange={(event) => setOwner(event.target.value)}>
                  {members.filter((person) => !person.pending).map((person) => <Select.Option key={person.name} value={person.name}>{person.name}</Select.Option>)}
                </Select>
              </FormField>
            </Box>
            <Box width="md" maxWidth="full">
              <FormField label="리전" description="만든 뒤에는 바꿀 수 없습니다.">
                <Field value={project.region} disabled readOnly />
              </FormField>
            </Box>
          </Inline>
          <Inline justify="end" gap="sm">
            <Button variant="ghost" disabled={!dirty || busy} onClick={() => { setName(project.name); setSummary(project.summary); setOwner(project.owner); setSaved(false); }}>되돌리기</Button>
            <Button type="submit" disabled={!dirty} loading={busy} loadingLabel="저장하는 중">저장</Button>
          </Inline>
        </Stack>
      </Panel>
      <Panel title="프로젝트 삭제" description="속한 자원과 배포 기록까지 모두 지웁니다. 되돌릴 수 없습니다.">
        <Inline justify="between" gap="md" wrap padding="xl">
          <Text as="p" ink="secondary">자원 {owned}개가 함께 삭제됩니다.</Text>
          <Button accent="error" variant="hairline" onClick={() => setAsking(true)}>이 프로젝트 삭제</Button>
        </Inline>
      </Panel>
      <ConfirmDialog open={asking} onOpenChange={setAsking} title="프로젝트를 삭제할까요?" description={`${project.name}에 속한 자원 ${owned}개가 함께 삭제됩니다.`} confirmLabel="삭제" tone="error" confirmText={project.id} onConfirm={remove} />
    </Stack>
  );
};

export const ProjectScreen = () => {
  const { projectId = "" } = useParams();
  const { projects, resources, deployments, findings, alerts, members } = useStore();
  const navigate = useNavigate();
  const wide = useWide();
  const [tab, setTab] = useParam("tab", "resources", ["resources", "deploys", "people", "settings"]);
  const [open, setOpen] = useParam("open", "");
  const project = projects.find((entry) => entry.id === projectId);

  const own = resources.filter((resource) => resource.projectId === projectId);
  const runs = deployments.filter((run) => run.projectId === projectId);
  const columns: readonly Column<Resource>[] = [
    { id: "name", header: "자원", track: "minmax(13rem, 2.2fr)", opens: true, compare: (a, b) => a.id.localeCompare(b.id), render: (row) => <Two title top={row.id} sub={row.kind} /> },
    { id: "env", header: "환경", track: "6.5rem", render: (row) => <Text as="span" ink="secondary">{row.env}</Text> },
    { id: "spec", header: "사양", track: "minmax(11rem, 1.8fr)", render: (row) => <Text as="span" ink="secondary" truncate>{row.spec}</Text> },
    { id: "status", header: "상태", track: "6.5rem", compare: (a, b) => RESOURCE_STATUSES.indexOf(a.status) - RESOURCE_STATUSES.indexOf(b.status), render: (row) => <ResourceBadge status={row.status} /> },
    { id: "cost", header: "월 비용", track: "7rem", end: true, largestFirst: true, compare: (a, b) => a.cost - b.cost, render: (row) => <Text as="span" numeric>{formatWon(row.cost)}</Text> },
  ];
  const table = useTable(own, { columns, sort: { id: "name", dir: "asc" }, size: 10, match: (row, words) => `${row.id} ${row.kind} ${row.spec}`.toLowerCase().includes(words) });
  const runColumns: readonly Column<Deployment>[] = [
    { id: "status", header: "상태", track: "5.5rem", render: (row) => <DeployBadge status={row.status} /> },
    { id: "run", header: "배포", track: "minmax(12rem, 2.4fr)", opens: true, render: (row) => <Two title top={row.message} sub={`#${row.no} · ${row.version}`} mono /> },
    { id: "service", header: "서비스", track: "minmax(8rem, 1.2fr)", render: (row) => <Two top={row.service} sub={row.env} /> },
    { id: "author", header: "작성자", track: "7rem", render: (row) => <PersonCell name={row.author} /> },
    { id: "when", header: "시작", track: "6rem", render: (row) => <Text as="span" ink="tertiary">{relative(row.started)}</Text> },
  ];
  const runTable = useTable([...runs].reverse(), { columns: runColumns, sort: { id: "", dir: "asc" }, size: 8 });

  if (!project) {
    return (
      <Stack gap="xl">
        <PageTitle title="프로젝트" back={{ to: "/demo/arcfield/projects", label: "프로젝트와 자원" }} />
        <Panel><EmptyState title="프로젝트를 찾을 수 없습니다" action={<Button as={RouterLink} to="/demo/arcfield/projects" variant="hairline">프로젝트 목록으로</Button>}>삭제했거나 주소가 맞지 않습니다.</EmptyState></Panel>
      </Stack>
    );
  }

  const unsolved = findings.filter((finding) => finding.projectId === projectId && finding.state !== "해결").length;
  const names = new Set([project.owner, ...runs.map((run) => run.author)]);
  const people = members.filter((person) => names.has(person.name));
  const worried = own.filter((resource) => resource.status === "점검 필요").length;
  const firing = alerts.filter((alert) => alert.state === "발생 중" && own.some((resource) => resource.id === alert.service)).length;

  return (
    <Stack gap="xl">
      <PageTitle
        title={project.name}
        back={{ to: "/demo/arcfield/projects", label: "프로젝트와 자원" }}
        description={`${project.summary} · ${project.id}`}
        aside={wide ? <Inline gap="xs" wrap>{project.envs.map((env) => <Badge key={env} variant="hairline">{env}</Badge>)}<Badge variant="soft">{project.region} 리전</Badge></Inline> : undefined}
      />
      <StatStrip stats={[
        { label: "자원", value: String(own.length), note: worried ? `점검 필요 ${worried}` : "이상 없음", tone: worried ? "warning" : undefined },
        { label: "월 비용", value: formatWonShort(monthlyOf(own)), note: "자원만 합친 값" },
        { label: "배포", value: String(runs.length), note: `실패 ${runs.filter((run) => run.status === "실패").length}` },
        { label: "열린 점검 항목", value: String(unsolved), tone: unsolved ? "warning" : undefined, note: unsolved ? "보안과 접근에서 확인" : "없음" },
        { label: "발생 중 알림", value: String(firing), tone: firing ? "error" : undefined, note: firing ? "모니터링에서 확인" : "없음" },
        { label: "담당자", value: project.owner, note: `${project.region} 리전` },
      ]} />
      <Tabs
        label={`${project.name} 프로젝트`}
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            id: "resources", label: <TabCount label="자원" count={own.length} />, panel: (
              <Panel>
                <TableBar summary={summarize(table, columns)} onReset={table.active ? table.reset : undefined}>
                  <SearchField label="이름이나 사양으로 찾기" value={table.query} onChange={table.setQuery} />
                </TableBar>
                <DataTable label={`${project.name}의 자원`} columns={columns} rows={table.slice} rowKey={(row) => row.id} sort={table.sort} onSort={table.toggleSort} onOpen={(row) => setOpen(row.id)}
                  empty={<EmptyState title="자원이 없습니다">이 프로젝트에는 아직 자원이 없습니다.</EmptyState>} />
                <Pager table={table} />
              </Panel>
            ),
          },
          {
            id: "deploys", label: <TabCount label="배포" count={runs.length} />, panel: (
              <Panel actions={<Button as={RouterLink} to="/demo/arcfield/deploy" size="sm" variant="hairline">배포로 가기</Button>} title="이 프로젝트의 배포">
                <DataTable label={`${project.name}의 배포`} columns={runColumns} rows={runTable.slice} rowKey={(row) => row.id} sort={runTable.sort} onSort={runTable.toggleSort} onOpen={(row) => navigate(`/demo/arcfield/deploy/${row.id}`)}
                  empty={<EmptyState title="배포 기록이 없습니다">첫 배포를 하면 여기에 쌓입니다.</EmptyState>} />
                <Pager table={runTable} />
              </Panel>
            ),
          },
          {
            id: "people", label: <TabCount label="구성원" count={people.length} />, panel: (
              <Panel title="이 프로젝트에 손댄 사람" description="담당자와, 이 프로젝트를 배포한 사람입니다.">
                <Stack as="ul" paddingX="xl" paddingY="sm">
                  {people.map((person, index) => (
                    <Box as="li" key={person.name}>
                      {index > 0 ? <Divider aria-hidden /> : null}
                      <Inline justify="between" gap="md" paddingY="md" wrap>
                        <PersonCell name={person.name} />
                        <Text as="span" ink="tertiary">{person.role} · {person.team}</Text>
                      </Inline>
                    </Box>
                  ))}
                </Stack>
              </Panel>
            ),
          },
          { id: "settings", label: "설정", panel: <ProjectSettings project={project} /> },
        ]}
      />
      {open ? <ResourceDialog id={open} onClose={() => setOpen("")} /> : null}
    </Stack>
  );
};
