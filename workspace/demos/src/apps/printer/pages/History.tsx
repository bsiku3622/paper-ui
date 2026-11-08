// The history: statistics over every job the printer has run (totals, how jobs ended, filament and time per day, as charts or
// as a table) and the list of jobs with a search, a sort, pages, multi-select and a dialog per job. The job that is printing
// is the first row; when it ends the row and the statistics change with it.

import { useMemo, useState } from "react";

import { Badge, Box, Button, Divider, Field, Grid, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, PageHeader, Segmented, useStored, useToast } from "../../../kit";
import { ColumnChart, SegmentedBar, type Column as ChartColumn } from "../content/Bars";
import { downloadText } from "../content/files";
import { HISTORY, HISTORY_TOTALS, type HistoryJob } from "../data/history";
import { longDuration, metres, partsOf, stampText } from "../format";
import { JobDialog } from "../parts/JobDialog";
import { JobGlyph } from "../parts/JobStatus";
import { useSettings } from "../settings";
import { useActions, useSim } from "../sim/Provider";
import { KeyValue } from "../ui/Controls";
import { DataTable, Pager, type Column, type Sort } from "../ui/DataTable";
import { ConfirmDialog } from "../ui/Dialog";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

type View = { sort: Sort; pageSize: number };

const DEFAULT_VIEW: View = { sort: { id: "start", desc: true }, pageSize: 10 };

const keyOf = (job: HistoryJob, id: string): number | string => {
  switch (id) {
    case "name": return job.filename;
    case "start": return job.start;
    case "estimate": return job.meta?.estimatedTime ?? 0;
    case "time": return job.printDuration;
    case "filament": return job.filament;
    case "slicer": return job.meta ? `${job.meta.slicer} ${job.meta.slicerVersion}` : "";
    default: return 0;
  }
};

const amount = (millimetres: number) => (millimetres < 1000 ? `${millimetres.toFixed(0)} mm` : metres(millimetres));

const sum = (jobs: readonly HistoryJob[], value: (job: HistoryJob) => number) => jobs.reduce((total, job) => total + value(job), 0);

// The whole history's totals as Moonraker gave them, moved by what has happened here since: jobs that ended, jobs that began.
const totalsOf = (history: readonly HistoryJob[]) => {
  const first = new Map(HISTORY.map((job) => [job.id, job]));
  let jobs: number = HISTORY_TOTALS.jobs;
  let printTime: number = HISTORY_TOTALS.printTime;
  let filament: number = HISTORY_TOTALS.filament;
  let longest: number = HISTORY_TOTALS.longestPrint;
  for (const job of history) {
    const before = first.get(job.id);
    if (!before) jobs += 1;
    printTime += job.printDuration - (before?.printDuration ?? 0);
    filament += job.filament - (before?.filament ?? 0);
    longest = Math.max(longest, job.printDuration);
  }
  return { jobs, printTime, filament, longest, average: printTime / Math.max(1, jobs) };
};

const dayKey = (ms: number) => {
  const { year, month, day } = partsOf(ms);
  return `${year}-${month}-${day}`;
};

const STATUS_TONE = { completed: "success", cancelled: "error", others: "neutral" } as const;

export const History = () => {
  const sim = useSim();
  const { update } = useActions();
  const { stamp } = useSettings();
  const toast = useToast();
  const [jobId, setJobId] = useQueryState("job");
  const [view, setView] = useStored<View>("printer:history", DEFAULT_VIEW);
  const [mode, setMode] = useState("chart");
  const [metric, setMetric] = useState("jobs");
  const [daily, setDaily] = useState("filament");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const { history } = sim;
  const totals = totalsOf(history);

  const groups = useMemo(() => {
    const done = history.filter((job) => job.status === "completed");
    const cancelled = history.filter((job) => job.status === "cancelled");
    const others = history.filter((job) => job.status !== "completed" && job.status !== "cancelled");
    return [
      { id: "completed", label: "완료", jobs: done },
      { id: "cancelled", label: "취소", jobs: cancelled },
      { id: "others", label: "그 밖", jobs: others },
    ] as const;
  }, [history]);
  const valueOf = (jobs: readonly HistoryJob[]) => (metric === "jobs" ? jobs.length : metric === "filament" ? sum(jobs, (job) => job.filament) / 1000 : sum(jobs, (job) => job.printDuration) / 3600);
  const readout = (value: number) => (metric === "jobs" ? `${value}건` : metric === "filament" ? `${value.toFixed(1)} m` : `${value.toFixed(1)} 시간`);
  const whole = groups.reduce((total, group) => total + valueOf(group.jobs), 0);

  const days = useMemo<ChartColumn[]>(() => {
    const out: ChartColumn[] = [];
    for (let back = 13; back >= 0; back--) {
      const ms = sim.clock - back * 86_400_000;
      const key = dayKey(ms);
      const jobs = history.filter((job) => dayKey(job.start * 1000) === key);
      const { month, day } = partsOf(ms);
      const value = daily === "filament" ? sum(jobs, (job) => job.filament) / 1000 : jobs.length ? sum(jobs, (job) => job.printDuration) / jobs.length / 60 : 0;
      out.push({ id: key, label: String(day), value: Math.round(value * 100) / 100, title: `${month}월 ${day}일 · ${jobs.length}건`, readout: daily === "filament" ? `${value.toFixed(2)} m` : `${value.toFixed(1)} 분` });
    }
    return out;
  }, [history, sim.clock, daily]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = history.filter((job) => job.filename.toLowerCase().includes(needle));
    return [...list].sort((a, b) => {
      const x = keyOf(a, view.sort.id);
      const y = keyOf(b, view.sort.id);
      const result = typeof x === "string" && typeof y === "string" ? x.localeCompare(y, "ko") : (x as number) - (y as number);
      return view.sort.desc ? -result : result;
    });
  }, [history, query, view.sort]);
  const pages = Math.max(1, Math.ceil(rows.length / view.pageSize));
  const current = Math.min(page, pages - 1);
  const shown = rows.slice(current * view.pageSize, (current + 1) * view.pageSize);
  const chosen = [...selected].filter((id) => history.some((job) => job.id === id));

  const columns: Column<HistoryJob>[] = [
    {
      id: "name",
      header: "파일 이름",
      track: "minmax(14rem, 3fr)",
      sortable: true,
      cell: (job, dim) => (
        <Inline gap="sm" align="center" wrap={false}>
          <JobGlyph status={job.status} />
          <Text as="span" ink={dim ? "tertiary" : "primary"}>{job.filename}</Text>
        </Inline>
      ),
    },
    { id: "start", header: "시작", track: "10rem", sortable: true, cell: (job, dim) => <Text as="span" ink={dim ? "tertiary" : "primary"}>{stampText(job.start * 1000, sim.clock, stamp)}</Text> },
    { id: "estimate", header: "예상 시간", track: "8rem", sortable: true, cell: (job, dim) => <Text as="span" numeric ink={dim ? "tertiary" : "primary"}>{job.meta ? longDuration(job.meta.estimatedTime) : "—"}</Text> },
    { id: "time", header: "출력 시간", track: "8rem", sortable: true, cell: (job, dim) => <Text as="span" numeric ink={dim ? "tertiary" : "primary"}>{job.printDuration > 0 ? longDuration(job.printDuration) : "—"}</Text> },
    { id: "filament", header: "필라멘트", track: "6.5rem", sortable: true, cell: (job, dim) => <Text as="span" numeric ink={dim ? "tertiary" : "primary"}>{amount(job.filament)}</Text> },
    {
      id: "slicer",
      header: "슬라이서",
      track: "8rem",
      sortable: true,
      cell: (job, dim) => (
        <Stack>
          <Text as="span" ink={dim ? "tertiary" : "primary"}>{job.meta?.slicer ?? "—"}</Text>
          {job.meta ? <Text as="span" variant="label" strong={false} ink="tertiary">{job.meta.slicerVersion}</Text> : null}
        </Stack>
      ),
    },
  ];

  const exportCsv = () => {
    const lines = ["id,filename,status,start,end,print_seconds,total_seconds,filament_mm"];
    for (const job of history) lines.push([job.id, `"${job.filename.replaceAll('"', '""')}"`, job.status, new Date(job.start * 1000).toISOString(), job.end ? new Date(job.end * 1000).toISOString() : "", job.printDuration, job.totalDuration, job.filament].join(","));
    downloadText("print-history.csv", lines.join("\n"), "text/csv");
    toast("기록을 CSV로 내려받았습니다");
  };

  return (
    <>
      <PageHeader title="기록" description="프린터가 지금까지 한 출력과 그 통계입니다." actions={<Button variant="hairline" onClick={exportCsv}><Glyph name="download" />CSV로 내보내기</Button>} />
      <Panel id="history-stats" title="통계" glyph="chart-line" actions={<Segmented label="보기" value={mode} onChange={setMode} options={[{ id: "chart", label: "차트" }, { id: "table", label: "표" }]} />}>
        <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1.5fr)" }} gap="xl" align="start">
          <KeyValue
            rows={[
              ["총 출력 시간", longDuration(totals.printTime)],
              ["가장 긴 출력", longDuration(totals.longest)],
              ["평균 출력 시간", longDuration(totals.average)],
              ["필라멘트 사용 총량", metres(totals.filament, 1)],
              ["총 작업", `${totals.jobs}건`],
            ]}
          />
          <Stack gap="md">
            <Inline justify="between" align="center" gap="md" wrap>
              <Text as="h3" variant="subheading">끝난 방식</Text>
              <Segmented label="기준" size="xs" value={metric} onChange={setMetric} options={[{ id: "jobs", label: "건수" }, { id: "filament", label: "필라멘트" }, { id: "time", label: "시간" }]} />
            </Inline>
            {mode === "chart" ? (
              <Stack gap="md">
                <SegmentedBar label={`끝난 방식: ${groups.map((group) => `${group.label} ${readout(valueOf(group.jobs))}`).join(", ")}`} parts={groups.map((group) => ({ id: group.id, label: group.label, value: valueOf(group.jobs), tone: STATUS_TONE[group.id] }))} />
                <Stack>
                  {groups.map((group, index) => (
                    <Stack key={group.id}>
                      {index > 0 ? <Divider aria-hidden /> : null}
                      <Inline justify="between" align="center" gap="md" paddingY="sm">
                        <Badge variant="soft" size="sm" accent={group.id === "completed" ? "success" : group.id === "cancelled" ? "error" : "primary"} dot>{group.label}</Badge>
                        <Text as="span" numeric>{readout(valueOf(group.jobs))} <Text as="span" ink="tertiary">· {whole > 0 ? Math.round((valueOf(group.jobs) / whole) * 100) : 0}%</Text></Text>
                      </Inline>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            ) : (
              <Stack role="table" aria-label="끝난 방식">
                <Grid role="row" columns="minmax(0, 1fr) 3.5rem 5rem 5.5rem" gap="sm" paddingY="xs">
                  {["", "건수", "필라멘트", "시간"].map((name, index) => <Box key={index} role="columnheader"><Text as="span" variant="label" strong={false} ink="tertiary">{name}</Text></Box>)}
                </Grid>
                {groups.map((group) => (
                  <Stack key={group.id}>
                    <Divider aria-hidden />
                    <Grid role="row" columns="minmax(0, 1fr) 3.5rem 5rem 5.5rem" gap="sm" paddingY="sm">
                      <Box role="rowheader"><Text as="span">{group.label}</Text></Box>
                      <Box role="cell"><Text as="span" numeric>{group.jobs.length}</Text></Box>
                      <Box role="cell"><Text as="span" numeric>{(sum(group.jobs, (job) => job.filament) / 1000).toFixed(1)} m</Text></Box>
                      <Box role="cell"><Text as="span" numeric>{(sum(group.jobs, (job) => job.printDuration) / 3600).toFixed(1)} 시간</Text></Box>
                    </Grid>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
          <Stack gap="md">
            <Inline justify="between" align="center" gap="md" wrap>
              <Text as="h3" variant="subheading">날짜별 (14일)</Text>
              <Segmented label="기준" size="xs" value={daily} onChange={setDaily} options={[{ id: "filament", label: "필라멘트" }, { id: "time", label: "평균 출력 시간" }]} />
            </Inline>
            {mode === "chart" ? (
              <ColumnChart data={days} unit={daily === "filament" ? "m" : "분"} tone="info" label={`날짜별 ${daily === "filament" ? "필라멘트 사용량 (m)" : "평균 출력 시간 (분)"}`} />
            ) : (
              <Box maxHeight="lg" overflowY="auto">
                <Stack role="table" aria-label="날짜별">
                  {[...days].reverse().map((day) => (
                    <Stack key={day.id}>
                      <Divider aria-hidden />
                      <Inline role="row" justify="between" gap="md" paddingY="xs">
                        <Text as="span" ink="secondary">{day.title}</Text>
                        <Text as="span" numeric>{day.readout}</Text>
                      </Inline>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Grid>
      </Panel>
      <Panel
        id="history-jobs"
        title="출력 기록"
        glyph="history"
        collapsible={false}
        flush
        actions={
          <IconButton variant="ghost" size="sm" aria-label="CSV로 내보내기" onClick={exportCsv}><Glyph name="download" /></IconButton>
        }
      >
        <Stack gap="md" padding="lg">
          <Box width="lg" maxWidth="full">
            <Field size="sm" aria-label="기록 찾기" placeholder="파일 이름으로 찾기" leading={<Glyph name="search" />} value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} clearable onClear={() => setQuery("")} />
          </Box>
          {chosen.length > 0 ? (
            <Surface fill="sunken" radius="md" paddingX="md" paddingY="sm">
              <Inline justify="between" align="center" gap="md" wrap>
                <Text as="span" strong numeric>{chosen.length}건 선택</Text>
                <Inline gap="sm">
                  <Button variant="hairline" size="sm" accent="error" onClick={() => setDeleting(true)}><Glyph name="trash-2" />기록에서 삭제</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>선택 해제</Button>
                </Inline>
              </Inline>
            </Surface>
          ) : null}
        </Stack>
        <Divider />
        <DataTable
          label="출력 기록"
          columns={columns}
          rows={shown}
          rowKey={(job) => job.id}
          sort={view.sort}
          onSort={(id) => { setView((now) => ({ ...now, sort: now.sort.id === id ? { id, desc: !now.sort.desc } : { id, desc: id === "start" } })); setPage(0); }}
          selection={{
            selected,
            canSelect: (job) => job.status !== "in_progress",
            onToggle: (key) => setSelected((now) => { const next = new Set(now); if (next.has(key)) next.delete(key); else next.add(key); return next; }),
            onToggleAll: (checked) => setSelected(checked ? new Set(shown.filter((job) => job.status !== "in_progress").map((job) => job.id)) : new Set()),
          }}
          isDim={(job) => !job.exists}
          onOpen={(job) => setJobId(job.id)}
          empty={<Stack align="center" gap="sm" padding="2xl"><Glyph name="history" size="subheading" ink="tertiary" /><Text ink="tertiary">찾는 기록이 없습니다</Text></Stack>}
        />
        <Divider />
        <Pager page={current} pageSize={view.pageSize} total={rows.length} onPage={setPage} onSize={(size) => { setView((now) => ({ ...now, pageSize: size })); setPage(0); }} noun="작업" />
      </Panel>
      <JobDialog id={jobId} onClose={() => setJobId(null)} />
      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title={`작업 ${chosen.length}건을 기록에서 지울까요?`}
        description={`${chosen.slice(0, 3).map((id) => history.find((job) => job.id === id)?.filename ?? id).join(", ")}${chosen.length > 3 ? ` 외 ${chosen.length - 3}건` : ""}. 파일은 그대로 있고 기록과 통계만 바뀝니다.`}
        confirmLabel="삭제"
        danger
        onConfirm={() => {
          const gone = history.filter((job) => chosen.includes(job.id));
          update((s) => ({ ...s, history: s.history.filter((job) => !chosen.includes(job.id)) }));
          toast(`${gone.length}건을 지웠습니다`, {
            action: {
              label: "되돌리기",
              onSelect: () => update((s) => ({ ...s, history: [...s.history, ...gone.filter((job) => !s.history.some((item) => item.id === job.id))].sort((a, b) => b.start - a.start) })),
            },
          });
          setSelected(new Set());
        }}
      />
    </>
  );
};
