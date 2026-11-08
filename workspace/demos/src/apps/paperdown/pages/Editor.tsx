// The editor (App.tsx): a header, the toolbar, the paper on the canvas with its caption above and "문서 끝" under it, and the
// status bar at the foot. The paper is written on directly (content/paper.tsx). A signed-in account adds the rail of its notes
// at the left. `local` is the document this browser keeps; any other id is a note of the account.
//
//   /paperdown/documents/local            the guest's document
//   /paperdown/documents/<id>             a note of the signed-in account
//   /paperdown/documents/local?legacy     the same, with the bar the old address shows

import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { Box, Inline, Text, Grid, Stack } from "@studio-baeks/paper-ui";

import { useToast } from "../../../kit";
import { emptyDocument } from "../data/sample";
import { Pin } from "../content/Pin";
import { imageData, isImageType, pickFile, saveFile } from "../content/files";
import { NO_STATE, Paper, type EditorState, type MathTarget, type PaperHandle, type SlashInfo } from "../content/paper";
import { useMedia } from "../lib/hooks";
import { htmlToMarkdown, markdownToHtml } from "../lib/markdown";
import { VALID_ID, documentPath, useStore } from "../lib/store";
import { statistics } from "../lib/text";
import { normalizeSettings, type DocumentData, type FontFace, type Settings } from "../lib/types";
import { Banner } from "../parts/Banner";
import { CLOUD_LABEL, CloudBar, parseCloud, type CloudState } from "../parts/CloudBar";
import { Confirm } from "../parts/Confirm";
import { DocumentDialog, type DialogState } from "../parts/Dialogs";
import { ExportMenu, type ExportKind } from "../parts/Export";
import { Header } from "../parts/Header";
import { NotesSidebar } from "../parts/NotesSidebar";
import { SlashMenu, type SlashItem } from "../parts/SlashMenu";
import { StatusBar } from "../parts/StatusBar";
import { Toolbar } from "../parts/Toolbar";
import { Loading } from "./Loading";
import { NotFound } from "./NotFound";

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const safeName = (title: string) => (title.trim() || "새로운 문서").replace(/[\\/:*?"<>|]/g, "-");

// A document file's contents as a document: this app's own file, or a Paperdown file whose Markdown is read.
const fromFile = async (file: File, current: Settings): Promise<DocumentData> => {
  const text = await file.text();
  if (file.name.endsWith(".json")) {
    const value = JSON.parse(text) as Partial<DocumentData> & { markdown?: string };
    const html = typeof value.html === "string" ? value.html : typeof value.markdown === "string" ? markdownToHtml(value.markdown) : null;
    if (html === null) throw new Error("올바른 Paperdown 문서 파일이 아닙니다.");
    return { id: "import", title: typeof value.title === "string" ? value.title : "새로운 문서", html, settings: normalizeSettings(value.settings), updatedAt: Date.now() };
  }
  return { id: "import", title: file.name.replace(/\.(md|markdown|txt)$/i, ""), html: markdownToHtml(text), settings: current, updatedAt: Date.now() };
};

const Workspace = ({ id }: { id: string }) => {
  const store = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [search] = useSearchParams();
  const first = useRef<DocumentData>(store.find(id)!);
  const [doc, setDoc] = useState<DocumentData>(first.current);
  // The document that is on the paper, and a count that says when another one is put there.
  const [load, setLoad] = useState({ html: first.current.html, round: 0 });
  const [state, setState] = useState<EditorState>(NO_STATE);
  const [text, setText] = useState("");
  const [pages, setPages] = useState(1);
  const [settled, setSettled] = useState(true);
  const [busy, setBusy] = useState("");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [slash, setSlash] = useState<SlashInfo | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const paper = useRef<PaperHandle>(null);
  const narrow = useMedia("(max-width: 767px)");
  const saveRef = useRef(store.save);
  saveRef.current = store.save;
  const docRef = useRef(doc);
  docRef.current = doc;
  const dirty = useRef(false);
  const account = id !== "local" && store.user !== null;
  const s = doc.settings;
  // What the account says about keeping this note, when it is not well (shown for `?cloud=…`), and whether its bar is open.
  const [cloud, setCloud] = useState<CloudState | null>(id !== "local" ? parseCloud(search.get("cloud")) : null);
  const [barOpen, setBarOpen] = useState(true);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    const before = document.title;
    document.title = `${doc.title || "새로운 문서"} — Paperdown`;
    return () => {
      document.title = before;
    };
  }, [doc.title]);

  // The document is kept a moment after the last change, and when the editor is left.
  useEffect(() => {
    if (doc === first.current) return;
    dirty.current = true;
    setSettled(false);
    const timer = window.setTimeout(() => {
      saveRef.current(doc);
      dirty.current = false;
      setSettled(true);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [doc]);
  useEffect(() => () => {
    if (dirty.current) saveRef.current(docRef.current);
  }, []);

  const settings = useCallback((patch: Partial<Settings>) => setDoc((now) => ({ ...now, settings: { ...now.settings, ...patch }, updatedAt: Date.now() })), []);

  // ---------------------------------------------------------------------------------------------------------------
  // Files.

  const download = useCallback((): boolean => {
    const now = docRef.current;
    try {
      const portable = { version: 1, title: now.title, markdown: htmlToMarkdown(now.html), html: now.html, settings: now.settings, updatedAt: now.updatedAt };
      saveFile(new Blob([JSON.stringify(portable, null, 2)], { type: "application/json" }), `${safeName(now.title)}.paperdown.json`);
      toast("서식과 이미지를 포함한 문서를 저장했습니다.");
      return true;
    } catch (error) {
      toast(error instanceof Error ? error.message : "문서를 내려받지 못했습니다.", { tone: "error" });
      return false;
    }
  }, [toast]);

  // A dialog goes, and the focus goes back to the paper.
  const closeDialog = useCallback(() => {
    setDialog(null);
    window.setTimeout(() => paper.current?.focus(), 0);
  }, []);

  const replace = useCallback((data: DocumentData) => {
    setDoc((now) => ({ ...now, title: data.title, html: data.html, settings: data.settings, updatedAt: Date.now() }));
    setLoad((now) => ({ html: data.html, round: now.round + 1 }));
    closeDialog();
  }, [closeDialog]);

  const insertImageFile = useCallback(async (file: File) => {
    if (!isImageType(file.type)) return toast("PNG, JPEG, WebP, GIF 이미지를 선택해주세요.", { tone: "error" });
    if (file.size > 15_000_000) return toast("이미지는 15MB 이하로 선택해주세요.", { tone: "error" });
    try {
      const src = await imageData(file);
      paper.current?.run({ type: "image", src, alt: file.name.replace(/\.[^.]+$/, "") });
      toast("이미지를 넣었습니다.");
    } catch {
      toast("이미지를 열지 못했습니다.", { tone: "error" });
    }
  }, [toast]);

  const chooseImage = useCallback(async () => {
    const file = await pickFile(IMAGE_ACCEPT);
    if (file) await insertImageFile(file);
  }, [insertImageFile]);

  const chooseDocument = useCallback(async () => {
    const file = await pickFile(".md,.markdown,.txt,.json");
    if (!file) return;
    if (file.size > 20_000_000) return toast("20MB 이하의 문서 파일을 선택해주세요.", { tone: "error" });
    try {
      setDialog({ kind: "import", data: await fromFile(file, docRef.current.settings) });
    } catch (error) {
      toast(error instanceof Error ? error.message : "파일을 열지 못했습니다.", { tone: "error" });
    }
  }, [toast]);

  // The exports that make a file are not made here: a PDF or a PNG would need what the original draws them with. The button
  // says it is working, and the toast says what the original says, with a word that this is a demo.
  const pretend = useCallback((label: string, done: string) => {
    setBusy(label);
    window.setTimeout(() => {
      setBusy("");
      toast(`${done} (시연이라 파일은 만들지 않습니다)`);
    }, 900);
  }, [toast]);

  const exportAs = useCallback((kind: ExportKind) => {
    if (kind === "pdf") pretend("PDF 만드는 중", "텍스트 PDF를 다운로드했습니다.");
    else if (kind === "png") pretend("PNG 저장 중", "PNG 이미지를 저장했습니다.");
    else if (kind === "json") download();
    else saveFile(new Blob([htmlToMarkdown(docRef.current.html)], { type: "text/markdown;charset=utf-8" }), `${safeName(docRef.current.title)}.md`);
  }, [download, pretend]);

  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        download();
      }
    };
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [download]);

  // ---------------------------------------------------------------------------------------------------------------
  // What the toolbar and the dialogs decide.

  // With nothing selected the face and the size are the paper's; with words selected they are theirs.
  const onFont = (font: FontFace) => {
    if (paper.current?.collapsed() ?? true) {
      settings({ font });
      window.setTimeout(() => paper.current?.focus(), 0);
    } else paper.current?.run({ type: "font", font });
  };
  const onSize = (value: string) => {
    const pt = Number(value);
    if (!Number.isFinite(pt) || pt < 6 || pt > 96) return toast("글자 크기는 6~96pt로 입력해주세요.", { tone: "error" });
    if (paper.current?.collapsed() ?? true) {
      settings({ sizePt: pt });
      window.setTimeout(() => paper.current?.focus(), 0);
    } else paper.current?.run({ type: "size", pt });
  };

  const submit = async (value: string) => {
    if (!dialog) return;
    if (dialog.kind === "new") {
      if (!download()) return;
      replace(emptyDocument(id, "새로운 문서", s));
    } else if (dialog.kind === "import" || dialog.kind === "transfer") {
      if (!download()) return;
      replace({ ...dialog.data, id });
      toast("문서를 불러왔습니다. 이전 문서는 파일로 보관했습니다.");
    } else if (dialog.kind === "link") {
      const url = value.trim();
      if (url) {
        try {
          if (!["https:", "http:", "mailto:"].includes(new URL(url).protocol)) throw new Error();
        } catch {
          return toast("https:// 로 시작하는 주소를 입력해주세요.", { tone: "error" });
        }
      }
      paper.current?.run({ type: "link", href: url });
      closeDialog();
    } else if (dialog.kind === "math") {
      if (!value.trim()) return;
      paper.current?.run({ type: "math", latex: value, target: dialog.target });
      closeDialog();
    }
  };

  const pick = (item: SlashItem) => {
    paper.current?.deleteSlash();
    setSlash(null);
    if (item.command) paper.current?.run(item.command);
    else if (item.open === "image") void chooseImage();
    else setDialog({ kind: "math", value: "" });
  };

  const stats = statistics(text);
  const paperLabel = `${s.paper === "custom" ? "CUSTOM" : s.paper.toUpperCase()} · ${s.mode === "pages" ? `${pages} PAGES` : "CONTINUOUS"}`;
  const shownSlash = slash !== null && dismissed !== slash.filter ? slash : null;

  return (
    <Stack minWidth={0}>
      {account && cloud && barOpen ? (
        <CloudBar
          state={cloud}
          onRetry={() => setCloud(null)}
          onLogin={() => store.openAuth()}
          onKeepDraft={() => {
            const note = store.createNote(docRef.current);
            setCloud(null);
            navigate(documentPath(note.id));
          }}
          onReload={() => setReloading(true)}
          onClose={() => setBarOpen(false)}
        />
      ) : null}
      {search.has("legacy") ? <Banner onMove={() => setDialog({ kind: "transfer", data: doc })} /> : null}
      <Header
        title={doc.title}
        onTitle={(title) => setDoc((now) => ({ ...now, title, updatedAt: Date.now() }))}
        saveLabel={account ? (cloud ? CLOUD_LABEL[cloud] : settled ? "계정에 저장됨" : "저장 중…") : settled ? "이 기기에 저장됨" : "저장 중"}
        busy={busy !== ""}
        exportMenu={<ExportMenu mode={s.mode} pages={pages} busy={busy} onExport={exportAs} />}
        onNew={() => {
          if (account) navigate(documentPath(store.createNote().id));
          else setDialog({ kind: "new" });
        }}
        onOpen={() => void chooseDocument()}
        onCopy={() => pretend("이미지 복사 중", "이미지를 복사했습니다.")}
      />
      <Toolbar
        state={state}
        settings={s}
        pages={pages}
        narrow={narrow}
        run={(command) => paper.current?.run(command)}
        onSettings={settings}
        onFont={onFont}
        onSize={onSize}
        onLink={() => setDialog({ kind: "link", value: state.link ?? "" })}
        onImage={() => void chooseImage()}
        onMath={() => setDialog({ kind: "math", value: "" })}
      />
      <Box as="main" id="main" paddingX="xl" paddingY="2xl" overflowX="auto">
        <Paper
          ref={paper}
          docKey={`${id}:${load.round}`}
          html={load.html}
          settings={s}
          caption={
            <Inline justify="between" align="baseline" gap="md">
              <Text as="span" variant="label" strong={false} ink="tertiary">{paperLabel}</Text>
              <Box as="span" hideBelow="md">
                <Text as="span" variant="label" strong={false} ink="tertiary">클릭해서 바로 쓰세요</Text>
              </Box>
            </Inline>
          }
          footer={<Text as="span" variant="label" strong={false} ink="tertiary">문서 끝</Text>}
          onContent={(html, plain, user) => {
            setText(plain);
            if (user) setDoc((now) => ({ ...now, html, updatedAt: Date.now() }));
          }}
          onState={setState}
          onSlash={(info) => {
            setSlash(info);
            if (!info) setDismissed(null);
          }}
          onMath={(target: MathTarget) => setDialog({ kind: "math", value: target.latex, target: target.element })}
          onPages={setPages}
          onImage={(file) => void insertImageFile(file)}
        />
      </Box>
      <StatusBar mode={s.mode} pages={pages} stats={stats} selected={state.selection ? statistics(state.selection).chars : 0} hint={account ? "계정에 자동 저장" : "이 브라우저에 자동 저장"} />
      <SlashMenu slash={shownSlash} onPick={pick} onDismiss={() => setDismissed(slash?.filter ?? "")} />
      <DocumentDialog dialog={dialog} onClose={closeDialog} onSubmit={(value) => void submit(value)} onSave={() => void download()} />
      <Confirm
        title={reloading ? "현재 초안 대신 서버 문서를 불러올까요? 초안을 남기려면 먼저 “초안으로 새 노트”를 선택해주세요." : null}
        label="불러오기"
        onClose={() => setReloading(false)}
        onConfirm={() => {
          const stored = store.find(id);
          if (stored) replace(stored);
          setReloading(false);
          setCloud(null);
        }}
      />
    </Stack>
  );
};

export const EditorPage = () => {
  const { id = "" } = useParams();
  const store = useStore();
  const navigate = useNavigate();
  const narrow = useMedia("(max-width: 767px)");
  const [removing, setRemoving] = useState<DocumentData | null>(null);
  // The id whose document has been fetched. The guest's is at hand; a note of the account takes a moment, as in the original.
  const [fetched, setFetched] = useState<string | null>(id === "local" ? id : null);
  useEffect(() => {
    if (id === "local") return setFetched(id);
    setFetched(null);
    const timer = window.setTimeout(() => setFetched(id), 220);
    return () => window.clearTimeout(timer);
  }, [id]);

  if (!VALID_ID.test(id)) return <NotFound kind="missing" />;
  if (id !== "local" && !store.user) return <NotFound kind="closed" reason="이 문서를 열려면 로그인해주세요." login />;
  if (id !== "local" && !store.find(id)) return <NotFound kind="closed" reason="문서를 찾을 수 없거나 접근 권한이 없습니다." />;

  const railOpen = store.user !== null && store.notesOpen;
  const rail = railOpen ? (
    <NotesSidebar
      activeId={id}
      overlay={narrow}
      onOpen={(note) => navigate(documentPath(note.id))}
      onCreate={() => navigate(documentPath(store.createNote().id))}
      onRemove={setRemoving}
      onClose={() => store.setNotesOpen(false)}
    />
  ) : null;

  return (
    <>
      <Grid columns={railOpen && !narrow ? "15.5rem minmax(0, 1fr)" : "minmax(0, 1fr)"} align="start">
        {railOpen && !narrow ? rail : null}
        {fetched === id ? <Workspace key={id} id={id} /> : <Loading />}
      </Grid>
      {railOpen && narrow ? <Pin at="start">{rail}</Pin> : null}
      <Confirm
        title={removing ? `“${removing.title || "제목 없는 노트"}”를 삭제할까요?` : null}
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          if (!removing) return;
          store.removeNote(removing.id);
          setRemoving(null);
          if (removing.id === id) navigate("/paperdown");
        }}
      />
    </>
  );
};
