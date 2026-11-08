import { useMemo, useRef, useState } from "react";

import { Badge, Box, Button, Divider, Field, FormField, IconButton, Inline, Select, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { Glyph, useStored, useToast } from "../../../kit";
import { CodeTextarea } from "../content/Mono";
import { downloadText, FilePicker } from "../content/files";
import { CONFIG_LIST } from "../data/configList";
import { configText, logText } from "../data/configs";
import { bytesText, stampText } from "../format";
import { printing } from "../model";
import { useSettings } from "../settings";
import { useActions, useSim } from "../sim/Provider";
import { DataTable, Pager, type Column, type Sort } from "../ui/DataTable";
import { ConfirmDialog, Dialog } from "../ui/Dialog";
import { Panel } from "../ui/Panel";
import { useQueryState } from "../ui/useQueryState";

type Root = "config" | "config_examples" | "logs";
type Entry = { path: string; modified: number; size: number; writable: boolean };

const EXAMPLES: readonly (readonly [string, number, number])[] = [
  ["example-cartesian.cfg", 1759525000, 3210],
  ["example-corexy.cfg", 1759525000, 3550],
  ["example-extras.cfg", 1759525000, 24800],
  ["generic-creality-ender-3-v2.cfg", 1759525000, 4120],
  ["generic-creality-ender-3-v3-se.cfg", 1759525000, 4380],
];

const LOGS: readonly (readonly [string, number, number])[] = [
  ["klippy.log", 1793786600, 2_104_220],
  ["moonraker.log", 1793786600, 880_410],
  ["crowsnest.log", 1793786000, 121_330],
];

type Saved = { edits: Record<string, { text: string; modified: number }>; added: string[]; removed: string[] };

const EMPTY: Saved = { edits: {}, added: [], removed: [] };

const textOf = (root: Root, path: string) => {
  if (root === "config") return configText(path);
  if (root === "logs") return logText(path.startsWith("moonraker") ? "moonraker" : path.startsWith("crowsnest") ? "crowsnest" : "klippy");
  return `# ${path}: Klipper가 함께 주는 예시 설정입니다 (모의 데이터)\n# 복사해서 printer.cfg에 맞게 고쳐 쓰세요.\n`;
};

const sizeOf = (text: string) => new Blob([text]).size;

const KEY = (root: Root, path: string) => `${root}:${path}`;

export const ConfigFiles = () => {
  const sim = useSim();
  const { send } = useActions();
  const { stamp, settings } = useSettings();
  const toast = useToast();
  const [saved, setSaved] = useStored<Saved>("printer:config", EMPTY);
  const [edit, setEdit] = useQueryState("edit");
  const [root, setRoot] = useState<Root>("config");
  const [sort, setSort] = useState<Sort>({ id: "name", desc: false });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [making, setMaking] = useState(false);
  const [name, setName] = useState("");
  const nameField = useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = useState(false);
  const stored = saved ?? EMPTY;

  const entries = useMemo<Entry[]>(() => {
    const base: Entry[] =
      root === "config"
        ? CONFIG_LIST.map(([path, modified, size, permission]) => ({ path, modified, size, writable: permission.includes("w") }))
        : (root === "logs" ? LOGS : EXAMPLES).map(([path, modified, size]) => ({ path, modified, size, writable: false }));
    const out = base
      .filter((entry) => !stored.removed.includes(KEY(root, entry.path)))
      .map((entry) => {
        const edited = stored.edits[KEY(root, entry.path)];
        return edited ? { ...entry, modified: edited.modified, size: sizeOf(edited.text) } : entry;
      });
    const extra = stored.added.filter((key) => key.startsWith(`${root}:`)).map((key) => key.slice(root.length + 1));
    for (const path of extra) {
      const edited = stored.edits[KEY(root, path)];
      out.push({ path, modified: edited?.modified ?? Math.round(sim.clock / 1000), size: edited ? sizeOf(edited.text) : 0, writable: true });
    }
    return out;
  }, [root, stored, sim.clock]);

  const rows = useMemo(
    () =>
      [...entries].sort((a, b) => {
        const result = sort.id === "name" ? a.path.localeCompare(b.path) : sort.id === "size" ? a.size - b.size : a.modified - b.modified;
        return sort.desc ? -result : result;
      }),
    [entries, sort],
  );
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages - 1);
  const shown = rows.slice(current * pageSize, (current + 1) * pageSize);
  const chosen = [...selected].filter((path) => entries.some((entry) => entry.path === path));

  const columns: Column<Entry>[] = [
    {
      id: "name",
      header: "이름",
      track: "minmax(10rem, 3fr)",
      sortable: true,
      cell: (entry) => (
        <Inline gap="sm" align="center" wrap={false}>
          <Glyph name={entry.writable ? "file-text" : "lock"} ink="tertiary" />
          <Text as="span">{entry.path}</Text>
        </Inline>
      ),
    },
    { id: "size", header: "크기", track: "5.5rem", sortable: true, cell: (entry) => <Text as="span" numeric>{bytesText(entry.size)}</Text> },
    { id: "modified", header: "수정", track: "10rem", sortable: true, cell: (entry) => <Text as="span">{stampText(entry.modified * 1000, sim.clock, stamp)}</Text> },
  ];

  const open = edit?.includes(":") ? { root: edit.slice(0, edit.indexOf(":")) as Root, path: edit.slice(edit.indexOf(":") + 1) } : null;

  const remove = () => {
    setSaved((now) => ({ ...(now ?? EMPTY), removed: [...(now ?? EMPTY).removed, ...chosen.map((path) => KEY(root, path))], added: (now ?? EMPTY).added.filter((key) => !chosen.some((path) => key === KEY(root, path))) }));
    toast(`${chosen.length}개 파일을 지웠습니다`);
    setSelected(new Set());
  };

  const create = (path: string, text = "") => {
    setSaved((now) => ({ ...(now ?? EMPTY), added: [...(now ?? EMPTY).added, KEY(root, path)], edits: { ...(now ?? EMPTY).edits, [KEY(root, path)]: { text, modified: Math.round(sim.clock / 1000) } } }));
  };

  return (
    <>
      <Panel
        id="config"
        title="설정 파일"
        glyph="file-cog"
        collapsible={false}
        flush
        actions={<Text as="span" variant="caption" ink="tertiary">남은 공간 47.0 GB</Text>}
      >
        <Stack gap="md" padding="lg">
          <Inline justify="between" align="end" gap="md" wrap>
            <Box width="md" maxWidth="full">
              <FormField label="위치">
                <Select size="sm" value={root} onChange={(event) => { setRoot(event.target.value as Root); setPage(0); setSelected(new Set()); }}>
                  <Select.Option value="config">config</Select.Option>
                  <Select.Option value="config_examples">config_examples</Select.Option>
                  <Select.Option value="logs">logs</Select.Option>
                </Select>
              </FormField>
            </Box>
            <Inline gap="xs">
              <FilePicker accept=".cfg,.conf,.txt" multiple onPick={(files) => { for (const file of files) create(file.name, `# ${file.name}: 올린 파일입니다 (모의: 내용은 읽지 않습니다)\n`); toast(`${files.length}개 파일을 올렸습니다 (모의)`); }}>
                {(pick) => <IconButton variant="muted" size="sm" aria-label="파일 올리기" disabled={root === "logs"} onClick={pick}><Glyph name="upload" /></IconButton>}
              </FilePicker>
              <IconButton variant="muted" size="sm" aria-label="새 파일" disabled={root !== "config"} onClick={() => setMaking(true)}><Glyph name="file-plus" /></IconButton>
              <IconButton variant="muted" size="sm" aria-label="목록 새로 고침" onClick={() => toast("목록을 새로 불러왔습니다")}><Glyph name="refresh-cw" /></IconButton>
            </Inline>
          </Inline>
          <Inline justify="between" gap="md" wrap>
            <Text as="span" ink="secondary">현재 경로: <Text as="span" family="mono" ink="primary">/{root}</Text></Text>
            {chosen.length > 0 ? (
              <Inline gap="sm">
                <Text as="span" strong numeric>{chosen.length}개 선택</Text>
                <Button variant="hairline" size="xs" accent="error" onClick={() => setDeleting(true)}><Glyph name="trash-2" />삭제</Button>
                <Button variant="ghost" size="xs" onClick={() => setSelected(new Set())}>선택 해제</Button>
              </Inline>
            ) : null}
          </Inline>
        </Stack>
        <Divider />
        <DataTable
          label={`${root} 파일`}
          columns={columns}
          rows={shown}
          rowKey={(entry) => entry.path}
          sort={sort}
          onSort={(id) => { setSort((now) => (now.id === id ? { id, desc: !now.desc } : { id, desc: id === "modified" })); setPage(0); }}
          selection={{
            selected,
            canSelect: (entry) => entry.writable,
            onToggle: (key) => setSelected((now) => { const next = new Set(now); if (next.has(key)) next.delete(key); else next.add(key); return next; }),
            onToggleAll: (checked) => setSelected(checked ? new Set(shown.filter((entry) => entry.writable).map((entry) => entry.path)) : new Set()),
          }}
          onOpen={(entry) => setEdit(KEY(root, entry.path))}
        />
        <Divider />
        <Pager page={current} pageSize={pageSize} total={rows.length} onPage={setPage} onSize={(size) => { setPageSize(size); setPage(0); }} noun="파일" />
      </Panel>
      {open ? (
        <Editor
          key={KEY(open.root, open.path)}
          root={open.root}
          path={open.path}
          writable={open.root === "config" ? !(CONFIG_LIST.find((item) => item[0] === open.path)?.[3] === "r") : false}
          text={stored.edits[KEY(open.root, open.path)]?.text ?? textOf(open.root, open.path)}
          busy={printing(sim.print.state)}
          wrapLines={settings.editor.wrap}
          fontSize={settings.editor.fontSize}
          tab={settings.editor.tab}
          confirmLeave={settings.editor.confirmLeave}
          confirmRestart={settings.editor.confirmRestart}
          onSave={(text, restart) => {
            setSaved((now) => ({ ...(now ?? EMPTY), edits: { ...(now ?? EMPTY).edits, [KEY(open.root, open.path)]: { text, modified: Math.round(sim.clock / 1000) } } }));
            toast(restart ? "저장하고 Klipper를 다시 시작했습니다 (모의)" : "저장했습니다");
            if (restart) send("RESTART");
          }}
          onClose={() => setEdit(null)}
        />
      ) : null}
      <Dialog
        open={making}
        onClose={() => setMaking(false)}
        title="새 설정 파일"
        initialFocusRef={nameField}
        description="/config에 빈 파일을 만듭니다."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMaking(false)}>취소</Button>
            <Button
              disabled={name.trim() === "" || /[\\/]/.test(name) || entries.some((entry) => entry.path === name.trim())}
              onClick={() => {
                create(name.trim(), "# 새 파일\n");
                toast(`${name.trim()}을 만들었습니다`);
                setName("");
                setMaking(false);
              }}
            >
              만들기
            </Button>
          </>
        }
      >
        <Field ref={nameField} aria-label="파일 이름" placeholder="예: macros.cfg" value={name} onChange={(event) => setName(event.target.value)} />
      </Dialog>
      <ConfirmDialog open={deleting} onClose={() => setDeleting(false)} title={`파일 ${chosen.length}개를 지울까요?`} description={`${chosen.slice(0, 3).join(", ")}${chosen.length > 3 ? ` 외 ${chosen.length - 3}개` : ""}. 지운 파일은 되돌릴 수 없습니다.`} confirmLabel="삭제" danger onConfirm={remove} />
    </>
  );
};

type EditorProps = {
  root: Root;
  path: string;
  writable: boolean;
  text: string;
  busy: boolean;
  wrapLines: boolean;
  fontSize: "label" | "caption" | "body";
  tab: 2 | 4;
  confirmLeave: boolean;
  confirmRestart: boolean;
  onSave: (text: string, restart: boolean) => void;
  onClose: () => void;
};

const Editor = ({ root, path, writable, text, busy, wrapLines, fontSize, tab, confirmLeave, confirmRestart, onSave, onClose }: EditorProps) => {
  const [draft, setDraft] = useState(text);
  const [restart, setRestart] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [asking, setAsking] = useState(false);
  const dirty = draft !== text;
  const save = () => {
    if (!writable) return;
    if (restart && confirmRestart) setAsking(true);
    else onSave(draft, restart);
  };
  const close = () => (dirty && confirmLeave ? setLeaving(true) : onClose());
  return (
    <>
      <Dialog
        open
        onClose={close}
        title={path}
        description={`/${root}${dirty ? " · 저장하지 않은 변경이 있습니다" : ""}`}
        size="full"
        footer={
          <>
            <Inline as="label" gap="sm" align="center">
              <Switch aria-label="저장 뒤 Klipper 다시 시작" checked={restart} disabled={!writable || busy} onChange={(event) => setRestart(event.target.checked)} />
              <Text as="span" ink="secondary">저장 뒤 Klipper 다시 시작{busy ? " (출력 중에는 할 수 없습니다)" : ""}</Text>
            </Inline>
            <Button variant="ghost" onClick={() => downloadText(path, draft)}><Glyph name="download" />내려받기</Button>
            <Button variant="ghost" onClick={close}>닫기</Button>
            <Button disabled={!writable || !dirty} onClick={save}><Glyph name="save" />저장</Button>
          </>
        }
      >
        <Stack gap="sm">
          {writable ? null : <Inline gap="sm" align="center"><Badge variant="soft" size="sm"><Glyph name="lock" />읽기 전용</Badge><Text as="span" variant="caption" ink="tertiary">이 파일은 업데이트 관리자나 시스템이 관리해 고칠 수 없습니다.</Text></Inline>}
          <CodeTextarea
            aria-label={`${path} 내용`}
            rows={24}
            fontSize={fontSize}
            wrapLines={wrapLines}
            value={draft}
            readOnly={!writable}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                event.preventDefault();
                save();
              } else if (event.key === "Tab" && writable) {
                event.preventDefault();
                const area = event.currentTarget;
                const { selectionStart: start, selectionEnd: end } = area;
                const spaces = " ".repeat(tab);
                setDraft(`${draft.slice(0, start)}${spaces}${draft.slice(end)}`);
                window.requestAnimationFrame(() => area.setSelectionRange(start + tab, start + tab));
              }
            }}
          />
          <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{draft.split("\n").length}줄 · {bytesText(sizeOf(draft))} · Cmd/Ctrl+S로 저장</Text>
        </Stack>
      </Dialog>
      <ConfirmDialog open={leaving} onClose={() => setLeaving(false)} title="저장하지 않고 닫을까요?" description="고친 내용이 사라집니다." confirmLabel="저장 안 하고 닫기" danger onConfirm={onClose} />
      <ConfirmDialog open={asking} onClose={() => setAsking(false)} title="저장하고 Klipper를 다시 시작할까요?" description="설정을 저장한 뒤 RESTART를 보냅니다. 히터가 꺼지고 원점 정보가 사라집니다." confirmLabel="저장하고 다시 시작" onConfirm={() => onSave(draft, true)} />
    </>
  );
};
