import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Badge, Box, Divider, Grid, Inline, Link, Stack, Text } from "@studio-baeks/paper-ui";

import { ClockIcon } from "../../compositions/icons";
import {
  Avatar, Bars, DAY, DataTable, DeployBadge, EmptyState, HealthBadge, Meter, METRICS, NETWORK_COST, PageTitle, Panel, StatStrip, Two,
  budgetAccent, clock, costHistory, formatMonth, formatTime, formatWon, formatWonShort, loadAccent, monthShare, monthlyOf, planPrice, relative, resourceOf, until, useStore,
  type Column, type DeployStatus, type Deployment, type Metrics, type Sort,
} from "./parts";

const STILL: Sort = { id: "", dir: "asc" };
const noop = () => undefined;

type Wants = { id: string; title: string; text: string; at: number; to: string; badge: "긴급" | "경고" | "기한" | "배포" | "심각" };

export const OverviewScreen = () => {
  const { alerts, audit, budget, deployments, findings, inScope, plan, resources, scope } = useStore();
  const navigate = useNavigate();
  const at = clock();
  const everything = scope.project === "all" && scope.env === "all";

  const mine = resources.filter(inScope);
  const services = METRICS.filter((entry) => {
    const resource = resourceOf(entry.id);
    return resource ? inScope(resource) : false;
  });
  const runs = deployments.filter(inScope);
  const latest = [...runs].reverse().slice(0, 6);
  const today = runs.filter((run) => run.started > at - DAY);
  const open = findings.filter((finding) => finding.state !== "해결" && inScope(finding));
  const overdue = open.filter((finding) => finding.due < at);
  const firing = alerts.filter((alert) => alert.state === "발생 중" && inScope(resourceOf(alert.service) ?? { projectId: "", env: "" }));
  const healthy = services.filter((entry) => entry.health === "정상").length;

  const forecast = monthlyOf(mine) + (everything ? NETWORK_COST + planPrice(plan) : 0);
  const spent = forecast * monthShare(at);
  const share = (forecast / budget) * 100;

  const wants: Wants[] = [
    ...firing.map((alert): Wants => ({ id: alert.id, title: `${alert.service}: ${alert.title}`, text: `알림 ${alert.id} · ${alert.assignee ?? "담당자 없음"}`, at: alert.since, to: "/demo/arcfield/monitoring?tab=alerts", badge: alert.severity === "긴급" ? "긴급" : "경고" })),
    ...open.filter((finding) => finding.severity === "심각").map((finding): Wants => ({ id: finding.id, title: finding.title, text: `${finding.id} · ${finding.resource} · ${until(finding.due, at)}`, at: finding.due - 20 * DAY, to: "/demo/arcfield/security", badge: "심각" })),
    ...overdue.filter((finding) => finding.severity !== "심각").map((finding): Wants => ({ id: finding.id, title: finding.title, text: `${finding.id} · ${finding.resource} · ${until(finding.due, at)}`, at: finding.due - 20 * DAY, to: "/demo/arcfield/security", badge: "기한" })),
    ...runs.filter((run) => run.status === "실패" && run.started > at - DAY).map((run): Wants => ({ id: run.id, title: `배포 #${run.no} 실패: ${run.service} ${run.version}`, text: run.reason ?? "", at: run.started, to: `/demo/arcfield/deploy/${run.id}`, badge: "배포" })),
  ].sort((a, b) => b.at - a.at);

  const worse = services.length - healthy;
  const recent = audit.slice(0, 7);

  const serviceColumns: readonly Column<Metrics>[] = [
    { id: "service", header: "서비스", track: "minmax(10rem, 2fr)", opens: true, render: (row) => <Two title top={row.id} sub={resourceOf(row.id)?.env ?? ""} /> },
    { id: "health", header: "상태", track: "6rem", render: (row) => <HealthBadge health={row.health} /> },
    { id: "p95", header: "p95", track: "5rem", render: (row) => <Text as="span" numeric ink={row.health === "정상" ? "secondary" : "primary"}>{row.p95 ? `${row.p95.toLocaleString("ko-KR")}ms` : "—"}</Text> },
    { id: "cpu", header: "CPU", track: "minmax(6rem, 1fr)", render: (row) => <Meter value={row.cpu} label={`${row.id} CPU ${row.cpu}%`} accent={loadAccent(row.cpu)} /> },
  ];

  const deployColumns: readonly Column<Deployment>[] = [
    { id: "status", header: "상태", track: "5.5rem", render: (row) => <DeployBadge status={row.status as DeployStatus} /> },
    { id: "run", header: "배포", track: "minmax(12rem, 2.4fr)", opens: true, render: (row) => <Two title top={row.message} sub={`#${row.no} · ${row.version}`} mono /> },
    { id: "service", header: "서비스", track: "minmax(8rem, 1.2fr)", render: (row) => <Two top={row.service} sub={row.env} /> },
    { id: "author", header: "작성자", track: "6.5rem", render: (row) => <Inline gap="xs"><Avatar name={row.author} /><Text as="span" ink="secondary" truncate>{row.author}</Text></Inline> },
    { id: "when", header: "시작", track: "5.5rem", render: (row) => <Text as="span" ink="tertiary" truncate>{relative(row.started, at)}</Text> },
  ];

  const history = costHistory(forecast);

  return (
    <Stack gap="xl">
      <PageTitle
        title="개요"
        description="Arcfield Logistics의 지금 상태입니다. 오늘 먼저 볼 것을 위에 모았습니다."
        aside={<Inline gap="xs"><ClockIcon size="label" ink="tertiary" /><Text as="span" variant="label" strong={false} ink="tertiary" numeric>{formatTime(at)} 기준</Text></Inline>}
      />
      <StatStrip stats={[
        { label: "정상 서비스", value: `${healthy}/${services.length}`, note: worse ? `성능 저하·장애 ${worse}` : "모두 정상", tone: worse ? "warning" : undefined },
        { label: "발생 중 알림", value: String(firing.length), note: firing.length ? firing.map((alert) => alert.service).join(" · ") : "없음", tone: firing.length ? "error" : undefined },
        { label: "24시간 배포", value: String(today.length), note: `성공 ${today.filter((run) => run.status === "성공").length} · 실패 ${today.filter((run) => run.status === "실패").length}` },
        { label: "열린 보안 항목", value: String(open.length), note: overdue.length ? `기한 넘김 ${overdue.length}` : "기한 넘김 없음", tone: overdue.length ? "warning" : undefined },
        { label: "이번 달 비용", value: formatWonShort(spent), note: `예상 ${formatWonShort(forecast)}` },
        { label: "자원", value: String(mine.length), note: `점검 필요 ${mine.filter((resource) => resource.status === "점검 필요").length}` },
      ]} />

      <Grid columns={{ base: "minmax(0, 1fr)", xl: "minmax(0, 1fr) minmax(0, 24rem)" }} gap="xl" align="start">
        <Stack gap="xl" minWidth={0}>
          <Panel title="서비스 상태" description="프로덕션 서비스의 지금 지표입니다." actions={<Link as={RouterLink} to="/demo/arcfield/monitoring" underline="hover">모니터링으로</Link>}>
            <DataTable label="서비스 상태" columns={serviceColumns} rows={services} rowKey={(row) => row.id} sort={STILL} onSort={noop} onOpen={(row) => navigate(`/demo/arcfield/monitoring?service=${row.id}`)}
              empty={<EmptyState title="이 범위에는 프로덕션 서비스가 없습니다">다른 프로젝트나 환경을 골라보세요.</EmptyState>} />
          </Panel>
          <Panel title="최근 배포" description="가장 나중에 시작한 순서입니다." actions={<Link as={RouterLink} to="/demo/arcfield/deploy" underline="hover">배포 전체 보기</Link>}>
            <DataTable label="최근 배포" columns={deployColumns} rows={latest} rowKey={(row) => row.id} sort={STILL} onSort={noop} onOpen={(row) => navigate(`/demo/arcfield/deploy/${row.id}`)}
              empty={<EmptyState title="이 범위에는 배포가 없습니다">다른 프로젝트나 환경을 골라보세요.</EmptyState>} />
          </Panel>
        </Stack>

        <Stack gap="xl" minWidth={0}>
          <Panel title="처리가 필요한 항목" description={wants.length ? `${wants.length}건이 기다리고 있습니다.` : "지금 급한 항목이 없습니다."}>
            {wants.length === 0 ? <EmptyState title="모두 처리했습니다">새로 생기면 여기에 나타납니다.</EmptyState> : (
              <Stack as="ul" paddingX="xl" paddingY="sm">
                {wants.slice(0, 6).map((item, index) => (
                  <Box as="li" key={item.id}>
                    {index > 0 ? <Divider aria-hidden /> : null}
                    <Stack gap="xs" paddingY="md">
                      <Inline justify="between" gap="sm" align="start">
                        <Link as={RouterLink} to={item.to} underline="hover">{item.title}</Link>
                        {item.badge === "긴급" || item.badge === "심각" ? <Badge accent="error" variant="soft" size="sm">{item.badge}</Badge> : <Badge accent="warning" variant="soft" size="sm">{item.badge}</Badge>}
                      </Inline>
                      <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{item.text}</Text>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Panel>

          <Panel title="이번 달 비용" description={everything ? `${formatMonth(at)} · 지난 12개월과 이번 달 예상` : `${formatMonth(at)} · 고른 범위의 자원만`} actions={<Link as={RouterLink} to="/demo/arcfield/billing" underline="hover">자세히</Link>}>
            <Stack gap="lg" padding="xl">
              <Stack gap="sm">
                <Inline align="baseline" justify="between" gap="sm" wrap>
                  <Text as="span" variant="display" numeric>{formatWon(spent)}</Text>
                  <Text as="span" variant="label" strong={false} ink="tertiary" numeric>예산 {formatWonShort(budget)}</Text>
                </Inline>
                <Meter value={share} label={`예상 비용이 예산의 ${Math.round(share)}%`} accent={budgetAccent(share)} />
                <Text as="span" variant="label" strong={false} ink={share >= 85 ? "warning" : "tertiary"} numeric>예상 {formatWonShort(forecast)} · 예산의 {Math.round(share)}%</Text>
              </Stack>
              <Bars label="월별 비용" values={[...history.map((month) => month.amount), forecast]} ends={[formatMonth(history[0]!.at), "이번 달(예상)"]} />
            </Stack>
          </Panel>

          <Panel title="최근 활동" description="감사 기록에서 가져왔습니다." actions={<Link as={RouterLink} to="/demo/arcfield/security?tab=audit" underline="hover">전체 보기</Link>}>
            <Stack as="ul" paddingX="xl" paddingY="sm">
              {recent.map((event, index) => (
                <Box as="li" key={event.id}>
                  {index > 0 ? <Divider aria-hidden /> : null}
                  <Inline gap="sm" align="start" paddingY="md">
                    <Avatar name={event.actor === "알 수 없음" ? null : event.actor} />
                    <Stack minWidth={0}>
                      <Text as="span" truncate><Text as="span" strong>{event.actor}</Text>님이 {event.action}</Text>
                      <Text as="span" variant="label" strong={false} ink="tertiary" truncate>{event.target} · {relative(event.at, at)}</Text>
                    </Stack>
                  </Inline>
                </Box>
              ))}
            </Stack>
          </Panel>
        </Stack>
      </Grid>
    </Stack>
  );
};
