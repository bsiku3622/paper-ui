import { useMemo, useRef, useState, type ReactNode } from "react";

import { Badge, Box, Button, Checkbox, Divider, Field, Floating, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, PageHeader, useStored, useToast } from "../../../kit";
import { baseName, historyOf, type FileHistory } from "../files";
import { bytesText, grams, longDuration, metres, millimetres, stampText } from "../format";
import type { FileEntry } from "../model";
import { FileDialog } from "../parts/FileDialog";
import { UploadDialog } from "../parts/UploadDialog";
import { useSettings } from "../settings";
import { useActions, useSim } from "../sim/Provider";
import { Fact } from "../ui/Controls";
import { DataTable, Pager, type Column, type Sort } from "../ui/DataTable";
import { ConfirmDialog, Dialog } from "../ui/Dialog";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

type Row = { kind: "folder"; path: string; name: string; count: number; modified: number } | { kind: "file"; file: FileEntry; hist: FileHistory };

type ColumnId = "size" | "modified" | "objectHeight" | "layerHeight" | "nozzle" | "filaments" | "usage" | "printTime" | "lastDuration" | "slicer" | "extruderTemp" | "bedTemp" | "chamberTemp" | "lastStart" | "lastEnd" | "lastTotal" | "lastFilament";

const OPTIONAL: readonly { id: ColumnId; header: string; track: string }[] = [
  { id: "size", header: "크기", track: "5.5rem" },
  { id: "modified", header: "수정", track: "9.5rem" },
  { id: "objectHeight", header: "개체 높이", track: "6.5rem" },
  { id: "layerHeight", header: "레이어 높이", track: "6.5rem" },
  { id: "nozzle", header: "노즐 지름", track: "6.5rem" },
  { id: "filaments", header: "필라멘트", track: "5.5rem" },
  { id: "usage", header: "필라멘트 사용", track: "6.5rem" },
  { id: "printTime", header: "예상 시간", track: "8rem" },
  { id: "lastDuration", header: "마지막 출력 시간", track: "8rem" },
  { id: "slicer", header: "슬라이서", track: "8rem" },
  { id: "extruderTemp", header: "노즐 온도", track: "5.5rem" },
  { id: "bedTemp", header: "베드 온도", track: "5.5rem" },
  { id: "chamberTemp", header: "챔버 온도", track: "5.5rem" },
  { id: "lastStart", header: "마지막 시작", track: "9.5rem" },
  { id: "lastEnd", header: "마지막 종료", track: "9.5rem" },
  { id: "lastTotal", header: "마지막 총 시간", track: "8rem" },
  { id: "lastFilament", header: "마지막 사용량", track: "6.5rem" },
];

const DEFAULT_COLUMNS: ColumnId[] = ["size", "modified", "objectHeight", "layerHeight", "nozzle", "filaments", "usage"];

type View = { sort: Sort; pageSize: number; columns: ColumnId[] };

const DEFAULT_VIEW: View = { sort: { id: "modified", desc: true }, pageSize: 10, columns: DEFAULT_COLUMNS };

const parentOf = (path: string) => (path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "");

const keyOf = (row: Row, id: string): number | string => {
  if (id === "name") return row.kind === "folder" ? row.name : row.file.name;
  if (row.kind === "folder") return id === "modified" ? row.modified : 0;
  const { file, hist } = row;
  const { meta } = file;
  switch (id) {
    case "size": return file.size;
    case "modified": return file.modified;
    case "objectHeight": return meta.objectHeight;
    case "layerHeight": return meta.layerHeight;
    case "nozzle": return meta.nozzle;
    case "filaments": return meta.filamentWeight;
    case "usage": return meta.filamentTotal;
    case "printTime": return meta.estimatedTime;
    case "lastDuration": return hist.lastDone?.printDuration ?? -1;
    case "slicer": return `${meta.slicer} ${meta.slicerVersion}`;
    case "extruderTemp": return meta.extruderTemp;
    case "bedTemp": return meta.bedTemp;
    case "chamberTemp": return meta.chamberTemp;
    case "lastStart": return hist.last?.start ?? -1;
    case "lastEnd": return hist.lastDone?.end ?? -1;
    case "lastTotal": return hist.lastDone?.totalDuration ?? -1;
    case "lastFilament": return hist.lastDone?.filament ?? -1;
    default: return 0;
  }
};

const Mark = ({ hist }: { hist: FileHistory }) => {
  if (hist.last?.status === "in_progress") return <Glyph name="clock" ink="info" label="출력 중" />;
  if (hist.completed > 0) {
    return (
      <Inline gap="xs" align="center">
        <Text as="span" variant="label" strong={false} ink="success" numeric>{hist.completed}</Text>
        <Glyph name="circle-check" ink="success" label={`${hist.completed}번 완료`} />
      </Inline>
    );
  }
  if (hist.count > 0) return <Glyph name="circle-x" ink="error" label="취소됨" />;
  return null;
};

export const Files = () => {
  const sim = useSim();
  const { update } = useActions();
  const { stamp } = useSettings();
  const toast = useToast();
  const [dir, setDir] = useQueryState("dir");
  const [file, setFile] = useQueryState("file");
  const [view, setView] = useStored<View>("printer:files", DEFAULT_VIEW);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [making, setMaking] = useState(false);
  const [folderName, setFolderName] = useState("");
  const folderField = useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const here = dir ?? "";
  const columnIds = view.columns.filter((id) => OPTIONAL.some((option) => option.id === id));

  const rows = useMemo<Row[]>(() => {
    const needle = query.trim().toLowerCase();
    const folders: Row[] = sim.folders
      .filter((path) => parentOf(path) === here)
      .map<Row>((path) => {
        const inside = sim.files.filter((item) => item.folder === path || item.folder.startsWith(`${path}/`));
        return { kind: "folder", path, name: baseName(path), count: inside.length, modified: Math.max(0, ...inside.map((item) => item.modified)) };
      })
      .filter((row) => row.kind === "folder" && row.name.toLowerCase().includes(needle));
    const files: Row[] = sim.files
      .filter((item) => item.folder === here && item.name.toLowerCase().includes(needle))
      .map<Row>((item) => ({ kind: "file", file: item, hist: historyOf(sim.history, item.name) }));
    const order = (a: Row, b: Row) => {
      const x = keyOf(a, view.sort.id);
      const y = keyOf(b, view.sort.id);
      const result = typeof x === "string" && typeof y === "string" ? x.localeCompare(y, "ko") : (x as number) - (y as number);
      return view.sort.desc ? -result : result;
    };
    return [...folders.sort(order), ...files.sort(order)];
  }, [sim.folders, sim.files, sim.history, here, query, view.sort]);

  const pages = Math.max(1, Math.ceil(rows.length / view.pageSize));
  const current = Math.min(page, pages - 1);
  const shown = rows.slice(current * view.pageSize, (current + 1) * view.pageSize);
  const keyFor = (row: Row) => (row.kind === "folder" ? `dir:${row.path}` : row.file.path);
  const chosen = [...selected].filter((key) => sim.files.some((item) => item.path === key));

  const sortBy = (id: string) => {
    setView((now) => ({ ...now, sort: now.sort.id === id ? { id, desc: !now.sort.desc } : { id, desc: id === "modified" } }));
    setPage(0);
  };

  const cells: Column<Row>[] = [
    {
      id: "name",
      header: "이름",
      track: "minmax(17rem, 3fr)",
      sortable: true,
      cell: (row) => (
        <Inline gap="sm" align="center" wrap={false}>
          <Glyph name={row.kind === "folder" ? "folder" : "file"} ink="tertiary" />
          <Stack minWidth={0}>
            <Text as="span">{row.kind === "folder" ? row.name : row.file.name}</Text>
            {row.kind === "folder" ? <Text as="span" variant="label" strong={false} ink="tertiary">{row.count}개 파일</Text> : null}
          </Stack>
          {row.kind === "file" ? <Mark hist={row.hist} /> : null}
        </Inline>
      ),
    },
    ...columnIds.map<Column<Row>>((id) => {
      const option = OPTIONAL.find((item) => item.id === id)!;
      return {
        id,
        header: option.header,
        track: option.track,
        sortable: true,
        cell: (row): ReactNode => {
          if (row.kind === "folder") return <Text as="span" ink="tertiary">{id === "modified" && row.modified ? stampText(row.modified * 1000, sim.clock, stamp) : "—"}</Text>;
          const { file: item, hist } = row;
          const { meta } = item;
          const dash = <Text as="span" ink="tertiary">—</Text>;
          switch (id) {
            case "size": return <Text as="span" numeric>{bytesText(item.size)}</Text>;
            case "modified": return <Text as="span">{stampText(item.modified * 1000, sim.clock, stamp)}</Text>;
            case "objectHeight": return <Text as="span" numeric>{millimetres(meta.objectHeight)}</Text>;
            case "layerHeight": return <Text as="span" numeric>{millimetres(meta.layerHeight)}</Text>;
            case "nozzle": return <Text as="span" numeric>{millimetres(meta.nozzle)}</Text>;
            case "filaments":
              return (
                <Stack gap="xs" align="start">
                  <Badge variant="soft" size="sm">{grams(meta.filamentWeight)}</Badge>
                  <Text as="span" variant="label" strong={false} ink="tertiary">{meta.filamentType}</Text>
                </Stack>
              );
            case "usage": return <Text as="span" numeric>{metres(meta.filamentTotal)}</Text>;
            case "printTime": return <Text as="span" numeric>{longDuration(meta.estimatedTime)}</Text>;
            case "lastDuration": return hist.lastDone ? <Text as="span" numeric>{longDuration(hist.lastDone.printDuration)}</Text> : dash;
            case "slicer": return <Text as="span">{meta.slicer} {meta.slicerVersion}</Text>;
            case "extruderTemp": return <Text as="span" numeric>{meta.extruderTemp} °C</Text>;
            case "bedTemp": return <Text as="span" numeric>{meta.bedTemp} °C</Text>;
            case "chamberTemp": return <Text as="span" numeric>{meta.chamberTemp} °C</Text>;
            case "lastStart": return hist.last ? <Text as="span">{stampText(hist.last.start * 1000, sim.clock, stamp)}</Text> : dash;
            case "lastEnd": return hist.lastDone?.end ? <Text as="span">{stampText(hist.lastDone.end * 1000, sim.clock, stamp)}</Text> : dash;
            case "lastTotal": return hist.lastDone ? <Text as="span" numeric>{longDuration(hist.lastDone.totalDuration)}</Text> : dash;
            case "lastFilament": return hist.lastDone ? <Text as="span" numeric>{metres(hist.lastDone.filament)}</Text> : dash;
            default: return dash;
          }
        },
      };
    }),
  ];

  const remove = () => {
    const gone = sim.files.filter((item) => chosen.includes(item.path));
    const queued = sim.queue.filter((item) => chosen.includes(item));
    update((s) => ({ ...s, files: s.files.filter((item) => !chosen.includes(item.path)), queue: s.queue.filter((item) => !chosen.includes(item)) }));
    toast(`${gone.length}개 파일을 삭제했습니다`, {
      action: {
        label: "되돌리기",
        onSelect: () => update((s) => ({ ...s, files: [...s.files, ...gone.filter((file) => !s.files.some((item) => item.path === file.path))], queue: [...s.queue, ...queued] })),
      },
    });
    setSelected(new Set());
  };
  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshing(false);
      toast("목록을 새로 불러왔습니다");
    }, 700);
  };

  return (
    <>
      <PageHeader
        title="G-code 파일"
        description="프린터에 올라가 있는 파일입니다. 파일을 누르면 자세한 정보와 출력 버튼이 나옵니다."
        actions={
          <>
            <Button variant="hairline" onClick={() => setMaking(true)}><Glyph name="folder-plus" />새 폴더</Button>
            <Button variant="solid" onClick={() => setUploading(true)}><Glyph name="upload" />올리기</Button>
          </>
        }
      />
      <Panel
        id="files"
        title="파일"
        glyph="file-code"
        collapsible={false}
        flush
        actions={
          <Floating>
            <IconButton as={Floating.Trigger} variant="ghost" size="sm" aria-label="보이는 열 고르기"><Glyph name="columns-3" /></IconButton>
            <Floating.Content as={Surface} fill="raised" border radius="md" padding="md" placement="bottom end" width="lg" maxWidth="full" aria-label="보이는 열">
              <Stack gap="sm">
                <Text as="h3" variant="subheading">보이는 열</Text>
                <Box maxHeight="xl" overflowY="auto">
                  <Stack gap="xs">
                    {OPTIONAL.map((option) => (
                      <Inline key={option.id} as="label" gap="sm" align="center" paddingY="xs">
                        <Checkbox
                          checked={view.columns.includes(option.id)}
                          onChange={(event) => setView((now) => ({ ...now, columns: event.target.checked ? OPTIONAL.map((item) => item.id).filter((id) => id === option.id || now.columns.includes(id)) : now.columns.filter((id) => id !== option.id) }))}
                        />
                        <Text as="span">{option.header}</Text>
                      </Inline>
                    ))}
                  </Stack>
                </Box>
                <Button variant="ghost" size="sm" onClick={() => setView((now) => ({ ...now, columns: DEFAULT_COLUMNS }))}>기본으로</Button>
              </Stack>
            </Floating.Content>
          </Floating>
        }
      >
        <Stack gap="md" padding="lg">
          <Inline justify="between" align="center" gap="md" wrap>
            <Box width="lg" maxWidth="full">
              <Field size="sm" aria-label="파일 찾기" placeholder="이 폴더에서 찾기" leading={<Glyph name="search" />} value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} clearable onClear={() => setQuery("")} />
            </Box>
            <Inline gap="xs">
              <Button variant="ghost" size="sm" loading={refreshing} loadingLabel="새로 고치는 중" onClick={refresh}><Glyph name="refresh-cw" />새로 고침</Button>
            </Inline>
          </Inline>
          <Inline justify="between" align="center" gap="md" wrap>
            <Inline gap="sm" align="center">
              {here ? <IconButton variant="ghost" size="xs" aria-label="상위 폴더" onClick={() => { setDir(parentOf(here) || null); setPage(0); setSelected(new Set()); }}><Glyph name="corner-left-up" /></IconButton> : null}
              <Text as="span" ink="secondary">현재 경로: <Text as="span" family="mono" ink="primary">/gcodes{here ? `/${here}` : ""}</Text></Text>
            </Inline>
            <Text as="span" ink="secondary">남은 공간 <Text as="span" numeric ink="primary">47.0 GB</Text></Text>
          </Inline>
          {chosen.length > 0 ? (
            <Surface fill="sunken" radius="md" paddingX="md" paddingY="sm">
              <Inline justify="between" align="center" gap="md" wrap>
                <Text as="span" strong numeric>{chosen.length}개 선택</Text>
                <Inline gap="sm" wrap>
                  <Button variant="hairline" size="sm" onClick={() => { update((s) => ({ ...s, queue: [...s.queue, ...chosen.filter((item) => !s.queue.includes(item))] })); toast("대기열에 추가했습니다"); setSelected(new Set()); }}><Glyph name="list" />대기열에 추가</Button>
                  <Button variant="hairline" size="sm" accent="error" onClick={() => setDeleting(true)}><Glyph name="trash-2" />삭제</Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>선택 해제</Button>
                </Inline>
              </Inline>
            </Surface>
          ) : null}
        </Stack>
        <Divider />
        <DataTable
          label="G-code 파일"
          columns={cells}
          rows={shown}
          rowKey={keyFor}
          sort={view.sort}
          onSort={sortBy}
          selection={{
            selected,
            canSelect: (row) => row.kind === "file",
            onToggle: (key) => setSelected((now) => { const next = new Set(now); if (next.has(key)) next.delete(key); else next.add(key); return next; }),
            onToggleAll: (checked) => setSelected(checked ? new Set(shown.flatMap((row) => (row.kind === "file" ? [row.file.path] : []))) : new Set()),
          }}
          onOpen={(row) => (row.kind === "folder" ? (setDir(row.path), setPage(0), setSelected(new Set())) : setFile(row.file.path))}
          empty={<Stack align="center" gap="sm" padding="2xl"><Glyph name="file" size="subheading" ink="tertiary" /><Text ink="tertiary">{query ? "찾는 파일이 없습니다" : "이 폴더는 비어 있습니다"}</Text></Stack>}
        />
        <Divider />
        <Pager page={current} pageSize={view.pageSize} total={rows.length} onPage={setPage} onSize={(size) => { setView((now) => ({ ...now, pageSize: size })); setPage(0); }} noun="파일" />
      </Panel>
      <FileDialog path={file} onClose={() => setFile(null)} />
      <UploadDialog open={uploading} folder={here} onClose={() => setUploading(false)} />
      <Dialog
        open={making}
        onClose={() => setMaking(false)}
        title="새 폴더"
        initialFocusRef={folderField}
        description={`만들 곳: /gcodes${here ? `/${here}` : ""}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMaking(false)}>취소</Button>
            <Button
              disabled={folderName.trim() === "" || /[\\/]/.test(folderName)}
              onClick={() => {
                const path = here ? `${here}/${folderName.trim()}` : folderName.trim();
                update((s) => (s.folders.includes(path) ? s : { ...s, folders: [...s.folders, path] }));
                toast(`${folderName.trim()} 폴더를 만들었습니다`);
                setFolderName("");
                setMaking(false);
              }}
            >
              만들기
            </Button>
          </>
        }
      >
        <Field ref={folderField} aria-label="폴더 이름" placeholder="폴더 이름" value={folderName} onChange={(event) => setFolderName(event.target.value)} />
      </Dialog>
      <ConfirmDialog open={deleting} onClose={() => setDeleting(false)} title={`파일 ${chosen.length}개를 삭제할까요?`} description="삭제한 파일은 되돌릴 수 없습니다. 출력 기록은 남습니다." confirmLabel="삭제" danger onConfirm={remove}>
        <Stack gap="xs">{chosen.slice(0, 4).map((path) => <Fact key={path} label="파일">{baseName(path)}</Fact>)}{chosen.length > 4 ? <Text variant="caption" ink="tertiary">외 {chosen.length - 4}개</Text> : null}</Stack>
      </ConfirmDialog>
    </>
  );
};
