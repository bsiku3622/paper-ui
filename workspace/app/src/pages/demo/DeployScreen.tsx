// Deployments: the list of what was put on a service and when, a form that starts one, and a page for each run with its steps and
// its log. A run that is going moves on its own (the store's clock), so the page can be watched until it ends.

import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { Box, Button, Divider, Field, Floating, FormField, Grid, Inline, Link, Radio, Select, Spinner, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { CheckIcon, ClockIcon, CloseIcon, PlusIcon } from "../../compositions/icons";
import {
  DAY, DEPLOY_STATUSES, DEPLOY_STEPS, DataTable, DeployBadge, Dialog, DialogFooter, EmptyState, ENVS, Facts, FilterChip, Meter, PageTitle, Pager, Panel, PersonCell, SearchField, SERVICES, StatStrip, TableBar, Two,
  clock, formatClock, formatPercent, formatSeconds, formatStamp, progressOf, relative, summarize, useProjectName, useStore, useTable, wait,
  type Column, type Deployment, type Trigger,
} from "./parts";

const TRIGGERS: readonly Trigger[] = ["푸시", "수동", "롤백", "예약"];

// What a run has taken so far, or took in all.
const spent = (run: Deployment, now: number) => (run.status === "진행 중" ? progressOf(run, now).elapsed : run.planned);

// ─── Starting one ────────────────────────────────────────────────────────────────────────────────────────────────────

const NewDeployForm = ({ onDone }: { onDone: (id: string) => void }) => {
  const { deploy, notify, record, scope } = useStore();
  const nameOf = useProjectName();
  const choices = SERVICES.filter((service) => scope.project === "all" || service.projectId === scope.project);
  const list = choices.length ? choices : SERVICES;
  const [service, setService] = useState(list[0]!.id);
  const [ref, setRef] = useState("main");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const projects = [...new Set(list.map((entry) => entry.projectId))];
  const error = ref.trim() ? undefined : "브랜치나 태그 이름을 입력해주세요.";
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (error || busy) return;
    setBusy(true);
    await wait(500);
    const target = SERVICES.find((entry) => entry.id === service)!;
    const run = deploy({ service: target, ref: ref.trim(), message });
    record({ code: "deploy.create", action: "배포를 시작했습니다", target: `${run.service} ${run.version}` });
    notify("info", `배포 #${run.no}을(를) 시작했습니다`, `${run.service} ${run.version}을(를) ${run.env}에 올립니다.`);
    onDone(run.id);
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <FormField label="서비스" description="배포는 서비스 하나씩 합니다.">
        <Select value={service} onChange={(event) => setService(event.target.value)}>
          {projects.map((projectId) => (
            <Select.Group key={projectId} label={nameOf(projectId)}>
              {list.filter((entry) => entry.projectId === projectId).map((entry) => <Select.Option key={entry.id} value={entry.id}>{`${entry.id} (${entry.env})`}</Select.Option>)}
            </Select.Group>
          ))}
        </Select>
      </FormField>
      <FormField label="브랜치 또는 태그" required description="이름에 fail이 들어 있으면 테스트 단계에서 실패합니다. 실패하는 모습을 보려면 써보세요." invalid={submitted && Boolean(error)} error={error}>
        <Field value={ref} autoComplete="off" onChange={(event) => setRef(event.target.value)} />
      </FormField>
      <FormField label="메모">
        <Field value={message} placeholder="예: 알림 문구 수정 반영" onChange={(event) => setMessage(event.target.value)} />
      </FormField>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" loading={busy} loadingLabel="시작하는 중">배포 시작</Button>
      </DialogFooter>
    </Stack>
  );
};

// ─── The list ────────────────────────────────────────────────────────────────────────────────────────────────────────

export const DeployScreen = () => {
  const { deployments, inScope, now } = useStore();
  const nameOf = useProjectName();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const at = clock();

  const runs = [...deployments].filter(inScope).reverse();
  const week = runs.filter((run) => run.started > at - 7 * DAY);
  const finished = week.filter((run) => run.status === "성공" || run.status === "실패");
  const wins = finished.filter((run) => run.status === "성공");
  const going = runs.filter((run) => run.status === "진행 중");
  const average = wins.length ? Math.round(wins.reduce((sum, run) => sum + run.planned, 0) / wins.length) : 0;

  const columns: readonly Column<Deployment>[] = [
    { id: "status", header: "상태", track: "7rem", compare: (a, b) => DEPLOY_STATUSES.indexOf(a.status) - DEPLOY_STATUSES.indexOf(b.status), render: (row) => (
      <Stack gap="xs">
        <Inline><DeployBadge status={row.status} /></Inline>
        {row.status === "진행 중" ? <Meter value={progressOf(row, now).share * 100} label={`배포 #${row.no} 진행률`} accent="info" /> : null}
      </Stack>
    ) },
    { id: "run", header: "배포", track: "minmax(15rem, 2.6fr)", opens: true, compare: (a, b) => a.no - b.no, largestFirst: true, render: (row) => <Two title top={row.message} sub={`#${row.no} · ${row.version}`} mono /> },
    { id: "service", header: "서비스 · 환경", track: "minmax(10rem, 1.5fr)", compare: (a, b) => a.service.localeCompare(b.service), render: (row) => <Two top={row.service} sub={`${row.env} · ${nameOf(row.projectId)}`} /> },
    { id: "commit", header: "커밋 · 방식", track: "7.5rem", render: (row) => <Two top={<Text as="span" family="mono">{row.commit}</Text>} sub={row.trigger} /> },
    { id: "author", header: "작성자", track: "7rem", compare: (a, b) => a.author.localeCompare(b.author, "ko"), render: (row) => <PersonCell name={row.author} /> },
    { id: "took", header: "소요", track: "5.5rem", end: true, largestFirst: true, compare: (a, b) => a.planned - b.planned, render: (row) => <Text as="span" numeric ink="secondary">{formatSeconds(spent(row, now))}</Text> },
    { id: "when", header: "시작", track: "6.5rem", largestFirst: true, compare: (a, b) => a.started - b.started, render: (row) => <Two top={relative(row.started, at)} sub={formatStamp(row.started)} /> },
  ];
  const table = useTable(runs, {
    columns, sort: { id: "when", dir: "desc" }, size: 12,
    match: (row, words) => `${row.message} ${row.service} ${row.version} ${row.commit} ${row.author} #${row.no}`.toLowerCase().includes(words),
    filters: { status: (row) => row.status, env: (row) => row.env, service: (row) => row.service, author: (row) => row.author, trigger: (row) => row.trigger },
  });
  const count = (pick: (run: Deployment) => string, value: string) => runs.filter((run) => pick(run) === value).length;
  const services = [...new Set(runs.map((run) => run.service))].sort();
  const authors = [...new Set(runs.map((run) => run.author))].sort((a, b) => a.localeCompare(b, "ko"));

  return (
    <Stack gap="xl">
      <PageTitle title="배포" description="서비스에 올린 기록과 지금 진행 중인 배포입니다." aside={<Button onClick={() => setStarting(true)}><PlusIcon />새 배포</Button>} />
      <StatStrip stats={[
        { label: "진행 중", value: String(going.length), note: going.length ? going.map((run) => run.service).join(" · ") : "없음", tone: going.length ? "info" : undefined },
        { label: "7일 배포", value: String(week.length), note: `하루 평균 ${(week.length / 7).toFixed(1)}건` },
        { label: "성공률", value: finished.length ? formatPercent((wins.length / finished.length) * 100, 0) : "—", note: `${finished.length}건 중 ${wins.length}건 성공` },
        { label: "평균 소요", value: formatSeconds(average), note: "성공한 배포 기준" },
        { label: "7일 실패", value: String(finished.length - wins.length), note: "취소 제외", tone: finished.length - wins.length > 3 ? "warning" : undefined },
      ]} />
      <Panel>
        <TableBar summary={summarize(table, columns)} onReset={table.active ? table.reset : undefined}>
          <SearchField label="메시지, 서비스, 버전으로 찾기" value={table.query} onChange={table.setQuery} />
          <FilterChip label="상태" selected={table.picked.status ?? []} onChange={(next) => table.pick("status", next)} options={DEPLOY_STATUSES.map((status) => ({ value: status, label: status, count: count((run) => run.status, status) }))} />
          <FilterChip label="환경" selected={table.picked.env ?? []} onChange={(next) => table.pick("env", next)} options={ENVS.map((env) => ({ value: env, label: env, count: count((run) => run.env, env) }))} />
          <FilterChip label="서비스" selected={table.picked.service ?? []} onChange={(next) => table.pick("service", next)} options={services.map((service) => ({ value: service, label: service, count: count((run) => run.service, service) }))} />
          <FilterChip label="작성자" selected={table.picked.author ?? []} onChange={(next) => table.pick("author", next)} options={authors.map((author) => ({ value: author, label: author, count: count((run) => run.author, author) }))} />
          <FilterChip label="방식" selected={table.picked.trigger ?? []} onChange={(next) => table.pick("trigger", next)} options={TRIGGERS.map((trigger) => ({ value: trigger, label: trigger, count: count((run) => run.trigger, trigger) }))} />
        </TableBar>
        <DataTable label="배포 기록" columns={columns} rows={table.slice} rowKey={(row) => row.id} sort={table.sort} onSort={table.toggleSort} onOpen={(row) => navigate(`/demo/arcfield/deploy/${row.id}`)}
          empty={<EmptyState title="조건에 맞는 배포가 없습니다" action={<Button size="sm" variant="hairline" onClick={table.reset}>필터 초기화</Button>}>검색어나 필터, 위쪽 범위를 바꿔보세요.</EmptyState>} />
        <Pager table={table} />
      </Panel>
      <Dialog open={starting} onOpenChange={setStarting} title="새 배포" description="서비스를 고르고 올릴 브랜치나 태그를 적어주세요." size="md">
        <NewDeployForm onDone={(id) => { setStarting(false); navigate(`/demo/arcfield/deploy/${id}`); }} />
      </Dialog>
    </Stack>
  );
};

// ─── One run ─────────────────────────────────────────────────────────────────────────────────────────────────────────

type StepState = "done" | "running" | "failed" | "waiting" | "skipped";

// Where each step of a run stands: the ones before the step it stopped at are done, the one it stopped at failed, the rest skipped.
const stepsOf = (run: Deployment, now: number): { name: string; state: StepState; seconds: number }[] => {
  const weights = [0.04, 0.16, 0.24, 0.26, 0.1, 0.12, 0.08];
  const current = run.status === "진행 중" ? progressOf(run, now).step : -1;
  return DEPLOY_STEPS.map((name, index) => {
    const seconds = Math.max(1, Math.round(run.planned * weights[index]!));
    if (run.status === "성공") return { name, state: "done", seconds };
    if (run.status === "진행 중") return { name, state: index < current ? "done" : index === current ? "running" : "waiting", seconds };
    const stopped = run.failedStep ?? 3;
    return { name, state: index < stopped ? "done" : index === stopped ? "failed" : "skipped", seconds };
  });
};

const STEP_LINES: readonly ((run: Deployment) => string[])[] = [
  (run) => [`저장소를 가져오는 중: arcfield/${run.service}`, `커밋 ${run.commit}을(를) 체크아웃했습니다.`, `제목: ${run.message}`],
  (run) => ["패키지 캐시를 확인합니다.", `의존성 ${(run.no % 40) + 86}개를 설치했습니다.`, "취약점 점검: 심각 0 · 높음 0"],
  (run) => ["이미지 빌드를 시작합니다.", "단계 4/9: 애플리케이션을 컴파일합니다.", `빌드를 마쳤습니다. 이미지 크기 ${(run.no % 90) + 120} MB`],
  (run) => [`단위 테스트 ${(run.no % 30) + 210}개를 실행합니다.`, `통합 테스트 ${(run.no % 9) + 24}개를 실행합니다.`, "모든 테스트를 통과했습니다."],
  (run) => [`레지스트리에 ${run.version} 태그로 올리는 중입니다.`, `다이제스트 sha256:${run.commit}${run.commit}${run.commit}`],
  (run) => [`${run.env} 환경에 새 버전을 올립니다.`, "인스턴스 1번을 교체했습니다.", "인스턴스 2번을 교체했습니다."],
  () => ["/healthz 응답을 확인했습니다. (200 OK)", "트래픽을 새 버전으로 옮깁니다.", "배포를 마쳤습니다."],
];

type LogLine = { at: number; text: string; level: "info" | "error" | "warn" };

const logOf = (run: Deployment, steps: ReturnType<typeof stepsOf>): LogLine[] => {
  const lines: LogLine[] = [];
  let cursor = run.started;
  steps.forEach((step, index) => {
    if (step.state === "waiting" || step.state === "skipped") return;
    lines.push({ at: cursor, text: `▸ ${step.name}`, level: "info" });
    const own = STEP_LINES[index]!(run);
    const shown = step.state === "running" ? own.slice(0, 1) : step.state === "failed" ? own.slice(0, 2) : own;
    shown.forEach((text, nth) => lines.push({ at: cursor + Math.round(((nth + 1) * step.seconds * 1000) / (shown.length + 1)), text, level: "info" }));
    cursor += step.seconds * 1000;
    if (step.state === "failed") {
      lines.push({ at: cursor, text: run.status === "취소됨" ? `취소: ${run.reason}` : `오류: ${run.reason}`, level: run.status === "취소됨" ? "warn" : "error" });
      lines.push({ at: cursor + 1000, text: "배포를 멈췄습니다. 서비스는 이전 버전으로 계속 동작합니다.", level: "info" });
    }
  });
  return lines;
};

const StepRow = ({ name, state, seconds }: { name: string; state: StepState; seconds: number }) => (
  <Inline justify="between" gap="md" paddingY="md">
    <Inline gap="sm">
      {state === "done" ? <CheckIcon ink="success" /> : state === "failed" ? <CloseIcon ink="error" /> : state === "running" ? <Spinner size="xs" label={`${name} 진행 중`} /> : <ClockIcon ink="tertiary" />}
      <Text as="span" ink={state === "waiting" || state === "skipped" ? "tertiary" : "primary"} strong={state === "running" || state === "failed"}>{name}</Text>
    </Inline>
    <Text as="span" variant="label" strong={false} ink={state === "failed" ? "error" : "tertiary"} numeric>
      {state === "done" ? formatSeconds(seconds) : state === "running" ? "진행 중" : state === "failed" ? "멈춤" : state === "skipped" ? "건너뜀" : "대기"}
    </Text>
  </Inline>
);

const RollbackForm = ({ run, onDone }: { run: Deployment; onDone: (id: string) => void }) => {
  const { deployments, deploy, notify, record } = useStore();
  const earlier = [...deployments].filter((entry) => entry.service === run.service && entry.env === run.env && entry.status === "성공" && entry.started < run.started).reverse().slice(0, 5);
  const [picked, setPicked] = useState(earlier[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const target = earlier.find((entry) => entry.id === picked);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!target || busy) return;
    setBusy(true);
    await wait(500);
    const service = SERVICES.find((entry) => entry.id === run.service)!;
    const next = deploy({ service, ref: "main", trigger: "롤백", message: `${target.version}으로 되돌림`, version: target.version });
    record({ code: "deploy.rollback", action: "배포를 되돌렸습니다", target: `${next.service} ${next.version}` });
    notify("info", `${next.service}을(를) ${target.version}으로 되돌립니다`, `배포 #${next.no}이(가) 시작되었습니다.`);
    onDone(next.id);
  };
  if (earlier.length === 0) {
    return (
      <Stack gap="lg">
        <Text as="p" ink="secondary">이 서비스에는 되돌아갈 수 있는 이전 성공 배포가 없습니다.</Text>
        <DialogFooter><Button as={Floating.Close}>닫기</Button></DialogFooter>
      </Stack>
    );
  }
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <Stack gap="xs" role="radiogroup" aria-label="되돌아갈 버전">
        {earlier.map((entry) => (
          <Grid key={entry.id} as="label" columns="auto minmax(0, 1fr)" columnGap="sm" rowGap="xs" align="center">
            <Radio name="rollback" checked={picked === entry.id} onChange={() => setPicked(entry.id)} />
            <Text as="span" strong>{`${entry.version} #${entry.no}`}</Text>
            <Box />
            <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{`${entry.message} · ${relative(entry.started)}`}</Text>
          </Grid>
        ))}
      </Stack>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" accent="warning" disabled={!target} loading={busy} loadingLabel="시작하는 중">이 버전으로 되돌리기</Button>
      </DialogFooter>
    </Stack>
  );
};

export const DeploymentScreen = () => {
  const { deployId = "" } = useParams();
  const { deployments, deploy, cancelDeployment, notify, record, now } = useStore();
  const nameOf = useProjectName();
  const navigate = useNavigate();
  const [rolling, setRolling] = useState(false);
  const run = deployments.find((entry) => entry.id === deployId);

  if (!run) {
    return (
      <Stack gap="xl">
        <PageTitle title="배포" back={{ to: "/demo/arcfield/deploy", label: "배포" }} />
        <Panel><EmptyState title="배포를 찾을 수 없습니다" action={<Button as={RouterLink} to="/demo/arcfield/deploy" variant="hairline">배포 목록으로</Button>}>주소가 맞지 않습니다.</EmptyState></Panel>
      </Stack>
    );
  }

  const steps = stepsOf(run, now);
  const lines = logOf(run, steps);
  const progress = progressOf(run, now);
  const redeploy = () => {
    const service = SERVICES.find((entry) => entry.id === run.service)!;
    const next = deploy({ service, ref: "main", trigger: "수동", message: `${run.message} (다시 배포)`, version: run.version });
    record({ code: "deploy.create", action: "배포를 시작했습니다", target: `${next.service} ${next.version}` });
    notify("info", `배포 #${next.no}을(를) 시작했습니다`, `${run.version}을(를) 다시 올립니다.`);
    navigate(`/demo/arcfield/deploy/${next.id}`);
  };
  const cancel = () => {
    cancelDeployment(run.id);
    record({ code: "deploy.cancel", action: "배포를 취소했습니다", target: `${run.service} ${run.version}` });
    notify("info", `배포 #${run.no}을(를) 취소했습니다`, "서비스는 이전 버전으로 계속 동작합니다.");
  };
  const previous = [...deployments].reverse().find((entry) => entry.service === run.service && entry.env === run.env && entry.status === "성공" && entry.started < run.started);

  return (
    <Stack gap="xl">
      <PageTitle
        title={`배포 #${run.no}`}
        back={{ to: "/demo/arcfield/deploy", label: "배포" }}
        description={`${run.message} · ${run.service}`}
        aside={
          <Inline gap="sm" wrap>
            <DeployBadge status={run.status} />
            {run.status === "진행 중" ? <Button variant="hairline" onClick={cancel}>취소</Button> : (
              <>
                <Button variant="hairline" onClick={() => setRolling(true)}>롤백</Button>
                <Button onClick={redeploy}>다시 배포</Button>
              </>
            )}
          </Inline>
        }
      />
      {run.status === "진행 중" ? (
        <Stack gap="sm">
          <Inline justify="between" gap="sm">
            <Text as="span" strong>{steps[progress.step]?.name} 중입니다</Text>
            <Text as="span" ink="tertiary" numeric>{formatPercent(progress.share * 100, 0)} · {formatSeconds(progress.elapsed)} / 약 {formatSeconds(run.planned)}</Text>
          </Inline>
          <Meter value={progress.share * 100} label="배포 진행률" accent="info" />
        </Stack>
      ) : null}
      <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 22rem)" }} gap="xl" align="start">
        <Stack gap="xl" minWidth={0}>
          <Panel title="단계" description={run.status === "진행 중" ? "지금 진행 중인 단계가 표시됩니다." : run.status === "성공" ? "모든 단계를 마쳤습니다." : run.reason}>
            <Stack as="ul" paddingX="xl" paddingY="sm">
              {steps.map((step, index) => (
                <Box as="li" key={step.name}>
                  {index > 0 ? <Divider aria-hidden /> : null}
                  <StepRow {...step} />
                </Box>
              ))}
            </Stack>
          </Panel>
          <Panel title="로그" description="시각은 서울 기준입니다.">
            <Surface fill="sunken" padding="lg" overflowY="auto" maxHeight="xl" role="region" aria-label="배포 로그" tabIndex={0}>
              <Stack gap="xs">
                {lines.map((line, index) => (
                  <Inline key={index} gap="md" align="baseline">
                    <Text as="span" variant="caption" family="mono" ink="tertiary" numeric>{formatClock(line.at)}</Text>
                    <Text as="span" variant="caption" family="mono" ink={line.level === "error" ? "error" : line.level === "warn" ? "warning" : line.text.startsWith("▸") ? "primary" : "secondary"} strong={line.text.startsWith("▸")}>{line.text}</Text>
                  </Inline>
                ))}
                {run.status === "진행 중" ? <Inline gap="sm"><Spinner size="xs" label="로그를 받는 중" /><Text as="span" variant="caption" family="mono" ink="tertiary">로그를 받는 중…</Text></Inline> : null}
              </Stack>
            </Surface>
          </Panel>
        </Stack>
        <Panel title="정보">
          <Box padding="xl">
            <Facts items={[
              ["서비스", run.service],
              ["프로젝트", <Link key="project" as={RouterLink} to={`/demo/arcfield/projects/${run.projectId}`} underline="hover">{nameOf(run.projectId)}</Link>],
              ["환경", run.env],
              ["버전", <Text key="version" as="span" family="mono">{run.version}</Text>],
              ["커밋", <Text key="commit" as="span" family="mono">{run.commit}</Text>],
              ["방식", run.trigger],
              ["작성자", <PersonCell key="author" name={run.author} />],
              ["시작", `${formatStamp(run.started)} (${relative(run.started)})`],
              ["소요", formatSeconds(spent(run, now))],
              ["이전 버전", previous ? <Link key="previous" as={RouterLink} to={`/demo/arcfield/deploy/${previous.id}`} underline="hover">{previous.version} #{previous.no}</Link> : "없음"],
            ]} />
          </Box>
        </Panel>
      </Grid>
      <Dialog open={rolling} onOpenChange={setRolling} title="이전 버전으로 되돌리기" description={`${run.service} (${run.env})를 이전에 성공한 버전으로 되돌립니다.`} size="md">
        <RollbackForm run={run} onDone={(id) => { setRolling(false); navigate(`/demo/arcfield/deploy/${id}`); }} />
      </Dialog>
    </Stack>
  );
};
