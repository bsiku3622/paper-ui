// 파일 관리: the shelf of shared files and, beside it, who has come for them. The shelf keeps the original's controls — search,
// kind, sort, state filter, upload, edit, delete — and adds selection for deleting several at once. The table is the
// original's six columns; on a phone each row becomes a short block.

import { useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";

import { Badge, Button, Checkbox, Divider, Field, Grid, IconButton, Inline, Link, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, Menu, PageHeader, Stat, Tabs, useFace, useToast } from "../../../../kit";
import { KIND_OPTIONS, publicUrl, recentVisits, SORT_OPTIONS, visibleFiles, type Visit } from "../../data/files";
import type { AdminFile } from "../../data/types";
import { DAY, now } from "../../lib/clock";
import { elapsed, formatBytes, formatDay, formatMoment } from "../../lib/format";
import { LATENCY, useCopy, useDelay, useDemoState, useTab } from "../../lib/hooks";
import { serviceTo } from "../../registry";
import { useFileList } from "../../store/views";
import { Choice } from "../../ui/Choice";
import { Alert, Loading, Mono } from "../../ui/Parts";
import { Summary } from "../../ui/Summary";
import { Table, Two, type Column } from "../../ui/Table";
import { DeleteDialog } from "./DeleteDialog";
import { EditDialog } from "./EditDialog";
import { downloadText, expiryText, limitText, StateBadge } from "./parts";
import { ShareDialog } from "./ShareDialog";
import { UploadDialog } from "./UploadDialog";

const STATES = [
  { id: "all", label: "전체" },
  { id: "live", label: "공유 중" },
  { id: "expired", label: "만료됨" },
  { id: "exhausted", label: "횟수 소진" },
] as const;

const detailTo = (file: AdminFile) => `${serviceTo("files")}/${file.id}`;

const RESULT_FILTER = [
  { id: "all", label: "전체" },
  { id: "done", label: "완료" },
  { id: "blocked", label: "막힘" },
] as const;

export const FilesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const face = useFace();
  const [params] = useSearchParams();
  const demo = useDemoState();
  const all = useFileList();
  const files = demo === "empty" ? [] : all;
  const { ready, reload } = useDelay(LATENCY.list);
  // The numbers wait for the list, and stay blank when the list could not be read.
  const ok = ready && demo !== "error";
  const waiting = demo === "error" ? "확인하지 못했습니다" : "불러오는 중…";
  const { copied, copy } = useCopy();
  const [tab, setTab] = useTab(["files", "visits"] as const, "files");

  const asked = params.get("dialog");
  const askedFile = params.get("file") ?? all[0]?.id ?? null;
  const [uploadOpen, setUploadOpen] = useState(asked === "upload");
  const [editing, setEditing] = useState<string | null>(asked === "edit" ? askedFile : null);
  const [sharing, setSharing] = useState<string | null>(asked === "share" ? askedFile : null);
  const [removing, setRemoving] = useState<string[] | null>(asked === "delete" && askedFile ? [askedFile] : null);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState("recent");
  const [filter, setFilter] = useState<string>("all");
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [result, setResult] = useState<string>("all");

  const shown = visibleFiles([...files], query, kind, sort).filter((file) => filter === "all" || file.state === filter);
  const count = (state: string) => (state === "all" ? files.length : files.filter((file) => file.state === state).length);
  const visits: Visit[] = recentVisits(files, 120);
  const shownVisits = visits.filter((visit) => result === "all" || (result === "done" ? visit.result === "완료" : visit.result !== "완료"));

  const live = files.filter((file) => file.state === "live");
  const used = files.reduce((sum, file) => sum + file.size, 0);
  const week = visits.filter((visit) => visit.result === "완료" && visit.at > now() - 7 * DAY).length;
  const soon = live.filter((file) => file.expiresAt !== null && file.expiresAt - now() < 3 * DAY).sort((a, b) => (a.expiresAt ?? 0) - (b.expiresAt ?? 0));

  const allShownPicked = shown.length > 0 && shown.every((file) => picked.has(file.id));
  const somePicked = shown.some((file) => picked.has(file.id));
  const toggle = (id: string) => setPicked((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleAll = () => setPicked(allShownPicked ? new Set() : new Set(shown.map((file) => file.id)));
  const pickedFiles = files.filter((file) => picked.has(file.id));

  const rowActions = (file: AdminFile) => (
    <Inline gap="xs" justify="end">
      <IconButton size="sm" variant="ghost" aria-label={copied === file.id ? "복사됨" : `${file.title} 링크 복사`} onClick={() => void copy(publicUrl(file.slug), file.id)}>
        <Glyph name={copied === file.id ? "check" : "link"} />
      </IconButton>
      <IconButton size="sm" variant="ghost" aria-label={`${file.title} 수정`} onClick={() => setEditing(file.id)}><Glyph name="pencil" /></IconButton>
      <Menu
        label={`${file.title} 더 보기`}
        items={[
          { id: "detail", label: "상세 보기", glyph: "panel-right", onSelect: () => navigate(detailTo(file)) },
          { id: "share", label: "공유 링크", glyph: "share-2", onSelect: () => setSharing(file.id) },
          { id: "site", label: "공개 페이지 열기", glyph: "external-link", onSelect: () => toast("데모에서는 공개 사이트로 이동하지 않습니다") },
          { id: "divider", divider: true },
          { id: "delete", label: "삭제", glyph: "trash-2", danger: true, onSelect: () => setRemoving([file.id]) },
        ]}
      />
    </Inline>
  );

  const title = (file: AdminFile) => (
    <Link as={RouterLink} to={detailTo(file)} underline="hover">
      <Text as="span" strong truncate>{file.title}</Text>
    </Link>
  );

  const columns: Column<AdminFile>[] = [
    {
      id: "pick",
      header: <Checkbox aria-label="보이는 파일 모두 선택" checked={allShownPicked} indeterminate={!allShownPicked && somePicked} onChange={toggleAll} />,
      track: "1.5rem",
      render: (file) => <Checkbox aria-label={`${file.title} 선택`} checked={picked.has(file.id)} onChange={() => toggle(file.id)} />,
    },
    { id: "name", header: "이름", track: "minmax(13rem, 1fr)", render: (file) => <Stack minWidth={0}>{title(file)}<Text as="span" variant="label" strong={false} ink="tertiary" truncate>{file.originalName}</Text></Stack> },
    { id: "size", header: "크기", track: "4.5rem", render: (file) => <Text as="span" numeric>{formatBytes(file.size)}</Text> },
    { id: "limit", header: "제한", track: "8.5rem", render: (file) => <Two top={expiryText(file)} sub={downloadText(file)} /> },
    { id: "date", header: "올린 날", track: "6rem", render: (file) => <Text as="span" variant="caption" numeric>{formatDay(file.createdAt)}</Text> },
    { id: "state", header: "상태", track: "5.5rem", render: (file) => <StateBadge file={file} /> },
    { id: "actions", header: "", track: "7.5rem", render: rowActions },
  ];

  const card = (file: AdminFile) => (
    <Stack gap="md">
      <Inline gap="md" align="start">
        <Checkbox aria-label={`${file.title} 선택`} checked={picked.has(file.id)} onChange={() => toggle(file.id)} />
        <Grid columns="minmax(0, 1fr) auto" gap="sm" align="start">
          <Stack minWidth={0} gap="xs">
            {title(file)}
            <Mono truncate>/f/{file.slug}</Mono>
          </Stack>
          <StateBadge file={file} />
        </Grid>
      </Inline>
      <Stack gap="xs">
        <Text as="span" variant="caption" ink="secondary" numeric>{formatBytes(file.size)} · {formatDay(file.createdAt)}</Text>
        <Text as="span" variant="caption" ink="secondary">{limitText(file)}</Text>
      </Stack>
      <Grid columns={3} gap="xs">
        <Button size="sm" variant="ghost" fullWidth onClick={() => void copy(publicUrl(file.slug), file.id)}>{copied === file.id ? "복사됨" : "링크"}</Button>
        <Button size="sm" variant="ghost" fullWidth onClick={() => setEditing(file.id)}>수정</Button>
        <Button size="sm" variant="ghost" accent="error" fullWidth onClick={() => setRemoving([file.id])}>삭제</Button>
      </Grid>
    </Stack>
  );

  const visitColumns: Column<Visit>[] = [
    { id: "time", header: "시각", track: "9rem", render: (visit) => <Two top={formatMoment(visit.at)} sub={elapsed(visit.at)} /> },
    { id: "file", header: "파일", track: "minmax(12rem, 1fr)", render: (visit) => <Link as={RouterLink} to={`${serviceTo("files")}/${visit.fileId}`} underline="hover"><Text as="span" truncate>{visit.title}</Text></Link> },
    { id: "from", header: "받은 곳", track: "11rem", render: (visit) => <Two top={visit.place} sub={visit.address} subMono /> },
    { id: "client", header: "환경", track: "9rem", render: (visit) => <Text as="span" ink="secondary" truncate>{visit.client}</Text> },
    { id: "result", header: "결과", track: "6.5rem", render: (visit) => <Badge accent={visit.result === "완료" ? "success" : "warning"} variant="soft" dot>{visit.result}</Badge> },
  ];

  const visitCard = (visit: Visit) => (
    <Stack gap="xs">
      <Inline justify="between" gap="sm" align="start">
        <Text as="span" truncate>{visit.title}</Text>
        <Badge accent={visit.result === "완료" ? "success" : "warning"} variant="soft" dot>{visit.result}</Badge>
      </Inline>
      <Text as="span" variant="caption" ink="secondary">{formatMoment(visit.at)} · {visit.place} · {visit.client}</Text>
      <Mono ink="tertiary">{visit.address}</Mono>
    </Stack>
  );

  const resetFilters = () => { setQuery(""); setKind("all"); setFilter("all"); };

  return (
    <>
      <PageHeader
        title="파일 관리"
        description={!ready ? "불러오는 중…" : demo === "error" ? "목록을 불러오지 못했습니다." : `${live.length}개 공유 중 · 전체 ${files.length}개`}
        actions={
          <>
            <Button variant="ghost" onClick={() => { reload(); setPicked(new Set()); }}><Glyph name="refresh-cw" />새로고침</Button>
            <Button onClick={() => setUploadOpen(true)}><Glyph name="upload" />파일 · 폴더 올리기</Button>
          </>
        }
      />

      <Summary>
        <Stat label="공유 중" value={ok ? live.length : "–"} unit="개" note={ok ? `전체 ${files.length}개 · 만료 ${count("expired")}개` : waiting} />
        <Stat label="받아간 횟수" value={ok ? files.reduce((sum, file) => sum + file.downloadCount, 0) : "–"} unit="회" note={ok ? `최근 7일 ${week}회` : waiting} />
        <Stat label="사용 중인 공간" value={ok ? formatBytes(used) : "–"} note={ok ? "20 GB 중" : waiting} />
        <Stat label="곧 만료" value={ok ? soon.length : "–"} unit="개" note={ok ? (soon[0] ? `${soon[0].title} · ${expiryText(soon[0])}` : "3일 안에 만료되는 파일 없음") : waiting} tone={ok && soon.length > 0 ? "warning" : undefined} />
      </Summary>

      <Tabs
        label="파일 화면"
        items={[
          { id: "files", label: "파일", count: files.length },
          { id: "visits", label: "받은 기록", count: ready ? visits.length : undefined },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "files" ? (
        <Surface {...face} radius="lg" overflow="hidden">
          <Stack gap="md" padding="xl">
            <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(12rem, 1fr) 10rem 10rem" }} gap="sm">
              <Field size="sm" leading={<Glyph name="search" />} aria-label="파일 검색" placeholder="파일명 또는 설명 검색" value={query} clearable onClear={() => setQuery("")} onChange={(event) => setQuery(event.currentTarget.value)} />
              <Select size="sm" aria-label="파일 종류" value={kind} onChange={(event) => setKind(event.currentTarget.value)}>
                {KIND_OPTIONS.map((option) => <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>)}
              </Select>
              <Select size="sm" aria-label="정렬" value={sort} onChange={(event) => setSort(event.currentTarget.value)}>
                {SORT_OPTIONS.map((option) => <Select.Option key={option.value} value={option.value}>{option.label}</Select.Option>)}
              </Select>
            </Grid>
            <Inline justify="between" align="center" gap="md" wrap>
              <Choice label="파일 상태" breakpoint="md" value={filter} onChange={setFilter} options={STATES.map((state) => ({ id: state.id, label: state.label, count: ready ? count(state.id) : undefined }))} />
              {pickedFiles.length > 0 ? (
                <Inline gap="sm" wrap>
                  <Text as="span" strong>{pickedFiles.length}개 선택됨</Text>
                  <Button size="sm" variant="hairline" accent="error" onClick={() => setRemoving(pickedFiles.map((file) => file.id))}><Glyph name="trash-2" />삭제</Button>
                  <Button size="sm" variant="ghost" onClick={() => setPicked(new Set())}>선택 해제</Button>
                </Inline>
              ) : (
                <Text as="span" variant="caption" ink="tertiary" aria-live="polite">{shown.length}개 표시</Text>
              )}
            </Inline>
          </Stack>
          <Divider />
          {!ready ? (
            <Loading label="파일 불러오는 중" />
          ) : demo === "error" ? (
            <Stack padding="xl"><Alert action={<Button size="sm" variant="hairline" onClick={reload}>다시 시도</Button>}>목록을 불러오지 못했습니다. 잠시 뒤에 다시 시도해주세요.</Alert></Stack>
          ) : files.length === 0 ? (
            <Empty glyph="folder-open" title="아직 올린 파일이 없습니다." description="오른쪽 위 “파일 · 폴더 올리기”로 시작하세요." action={<Button variant="hairline" onClick={() => setUploadOpen(true)}>파일 · 폴더 올리기</Button>} />
          ) : shown.length === 0 ? (
            <Empty glyph="search-x" title="조건에 맞는 파일이 없습니다" action={<Button variant="hairline" onClick={resetFilters}>검색 초기화</Button>} />
          ) : (
            <Table label="올린 파일" rows={shown} rowKey={(file) => file.id} columns={columns} card={card} isSelected={(file) => picked.has(file.id)} />
          )}
        </Surface>
      ) : (
        <Surface {...face} radius="lg" overflow="hidden">
          <Inline justify="between" align="center" gap="md" wrap padding="xl">
            <Choice label="결과" value={result} onChange={setResult} options={RESULT_FILTER.map((item) => ({ id: item.id, label: item.label }))} />
            <Text as="span" variant="caption" ink="tertiary" aria-live="polite">{shownVisits.length}건 표시</Text>
          </Inline>
          <Divider />
          {!ready ? (
            <Loading label="기록 불러오는 중" />
          ) : shownVisits.length === 0 ? (
            <Empty glyph="inbox" title="받은 기록이 없습니다" description="링크로 파일을 받아가면 여기에 남습니다." />
          ) : (
            <Table label="받은 기록" rows={shownVisits} rowKey={(visit) => visit.id} columns={visitColumns} card={visitCard} />
          )}
        </Surface>
      )}

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} sample={params.get("sample") !== null} />
      <EditDialog id={editing} onClose={() => setEditing(null)} />
      <ShareDialog id={sharing} onClose={() => setSharing(null)} onEdit={(id) => { setSharing(null); setEditing(id); }} />
      <DeleteDialog ids={removing} onClose={() => setRemoving(null)} onDone={() => setPicked(new Set())} />
    </>
  );
};
