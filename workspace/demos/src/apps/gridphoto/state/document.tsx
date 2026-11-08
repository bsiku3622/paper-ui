// The document and everything that happens to it over time: pages being added and worked through one at a time, settings that
// redraw a page for a moment, a search for printed lines, a PDF being made. Pages, their order and their settings are kept
// with useStored; what is only going on right now (progress, a search, a save) is not.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useStored, useToast } from "../../../kit";
import { activeFit, isReady } from "../model/derive";
import { SEED_COUNT, alignedFit, baseName, emptyDocument, finish, mockShot, nameAfter, newPage, printedOn, seedDocument, shotForFile, type Shot } from "../model/mock";
import { EXPORT_PAGE_MS, RENDER_MS, SEARCH_MS, STEPS, stepsFor } from "../model/steps";
import type { Doc, Fit, Page, Settings } from "../model/types";
import { paths } from "../paths";

const KEY = "gridphoto:document:v2";
// A PDF this long does not fit in a phone's memory.
const PDF_PAGES_LIMIT = 16;

export type Saving = { kind: "pdf" | "image"; done: number; total: number };
export type NewPhoto = { name: string; shot: Shot };

type Api = {
  doc: Doc;
  pages: Page[];
  current: Page | null;
  ready: Page[];
  busy: boolean;
  // 0 to 1 for each page being worked through.
  progress: Record<string, number>;
  // A page is being drawn again after a setting changed.
  rendering: boolean;
  // The page whose sheet is being searched for printed lines.
  searching: string | null;
  saving: Saving | null;
  problem: string | null;
  setProblem: (message: string | null) => void;
  select: (id: string) => void;
  addMock: (count?: number) => void;
  addFiles: (names: string[]) => void;
  patchSettings: (id: string, patch: Partial<Settings>) => void;
  setAlign: (id: string, value: boolean) => void;
  applyManual: (id: string, fit: Fit) => void;
  movePage: (id: string, offset: number) => void;
  removePage: (id: string) => void;
  newDocument: () => void;
  loadSample: () => void;
  setFormat: (format: Doc["format"]) => void;
  setShowGrid: (value: boolean) => void;
  exportPdf: () => void;
  exportImage: (id: string) => void;
};

const Ctx = createContext<Api | null>(null);

export const useGridphoto = () => {
  const api = useContext(Ctx);
  if (!api) throw new Error("useGridphoto is used inside <DocumentProvider>");
  return api;
};

const update = (doc: Doc, id: string, change: (page: Page) => Page): Doc => ({ ...doc, pages: doc.pages.map((page) => (page.id === id ? change(page) : page)) });

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [doc, setDoc, resetDoc] = useStored<Doc>(KEY, seedDocument);
  const docRef = useRef(doc);
  docRef.current = doc;

  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [rendering, setRendering] = useState(false);
  const [searching, setSearching] = useState<string | null>(null);
  const [saving, setSaving] = useState<Saving | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const timers = useRef<{ render?: number; export?: number }>({});

  // A page caught halfway is simply looked at again next time.
  useEffect(() => {
    setDoc((now) => (now.pages.some((page) => page.status === "working") ? { ...now, pages: now.pages.map((page) => (page.status === "working" ? { ...page, status: "queued", stepIndex: 0 } : page)) } : now));
    setLoaded(true);
  }, [setDoc]);

  const pages = doc.pages;
  const current = useMemo(() => pages.find((page) => page.id === doc.currentId) ?? null, [pages, doc.currentId]);
  const ready = useMemo(() => pages.filter(isReady), [pages]);
  const working = pages.find((page) => page.status === "working");
  const waiting = pages.find((page) => page.status === "queued");
  const busy = pages.some((page) => page.status === "queued" || page.status === "working");

  // One photo at a time, as the engine does it: each needs its full pixels while it is looked at.
  useEffect(() => {
    if (!loaded || working || !waiting) return;
    setDoc((now) => (now.pages.some((page) => page.status === "working") ? now : update(now, waiting.id, (page) => (page.status === "queued" ? { ...page, status: "working", stepIndex: 0 } : page))));
  }, [loaded, working, waiting, setDoc]);

  // Walk the working page through its steps.
  const workingId = working?.id;
  const workingStep = working?.stepIndex;
  useEffect(() => {
    if (!loaded || !workingId) return;
    const page = docRef.current.pages.find((item) => item.id === workingId);
    if (!page || page.status !== "working") return;
    const steps = stepsFor(page.scenario);
    const step = steps[page.stepIndex];
    if (!step) return;
    const ms = STEPS[step].ms;
    const started = performance.now();
    const tick = window.setInterval(() => {
      const share = Math.min(1, (performance.now() - started) / ms);
      setProgress((now) => ({ ...now, [workingId]: (page.stepIndex + share) / steps.length }));
    }, 90);
    const done = window.setTimeout(() => {
      if (page.stepIndex + 1 < steps.length) {
        setDoc((now) => update(now, workingId, (item) => (item.status === "working" ? { ...item, stepIndex: item.stepIndex + 1 } : item)));
      } else {
        setProgress((now) => ({ ...now, [workingId]: 1 }));
        setDoc((now) => update(now, workingId, (item) => (item.status === "working" ? finish(item) : item)));
      }
    }, ms);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, [loaded, workingId, workingStep, setDoc]);

  // A page drawn again: it dims for a moment, as it does while the worker renders.
  const redraw = useCallback(() => {
    setRendering(true);
    window.clearTimeout(timers.current.render);
    timers.current.render = window.setTimeout(() => setRendering(false), RENDER_MS);
  }, []);

  const select = useCallback(
    (id: string) => {
      setDoc((now) => ({ ...now, currentId: id }));
    },
    [setDoc],
  );

  // ── Adding ──

  const addItems = useCallback(
    (items: NewPhoto[]) => {
      if (items.length === 0) return;
      const now = docRef.current;
      const added = items.map((item, index) => newPage(`p${now.imported + index + 1}`, item.name, item.shot));
      setDoc({ ...now, pages: [...now.pages, ...added], currentId: added[0]!.id, imported: now.imported + added.length });
      setProblem(null);
      navigate(paths.page(added[0]!.id));
      toast(added.length === 1 ? `${added[0]!.name}을 추가했습니다` : `사진 ${added.length}장을 추가했습니다`);
    },
    [navigate, setDoc, toast],
  );

  const addMock = useCallback(
    (count = 3) => {
      const now = docRef.current;
      addItems(Array.from({ length: count }, (_, index) => ({ name: nameAfter(now.imported + index), shot: mockShot(now.imported + index - SEED_COUNT) })));
    },
    [addItems],
  );

  const addFiles = useCallback(
    (names: string[]) => {
      addItems(names.map((fileName) => ({ name: baseName(fileName), shot: shotForFile(fileName) })));
    },
    [addItems],
  );

  // ── Settings ──

  const patchSettings = useCallback(
    (id: string, patch: Partial<Settings>) => {
      setDoc((now) => update(now, id, (page) => ({ ...page, settings: { ...page.settings, ...patch } })));
      redraw();
    },
    [redraw, setDoc],
  );

  // Turning alignment on looks for printed lines first if this page has not been searched yet.
  const setAlign = useCallback(
    (id: string, value: boolean) => {
      const page = docRef.current.pages.find((item) => item.id === id);
      if (!page) return;
      if (!value || page.aligned) {
        patchSettings(id, { align: value });
        return;
      }
      if (page.gridSearched || !page.fit) return;
      setSearching(id);
      window.setTimeout(() => {
        const lines = printedOn(page);
        setDoc((now) => update(now, id, (item) => ({ ...item, gridSearched: true, aligned: lines ? alignedFit(item, lines) : null, settings: { ...item.settings, align: lines !== null } })));
        setSearching(null);
        redraw();
      }, SEARCH_MS);
    },
    [patchSettings, redraw, setDoc],
  );

  const applyManual = useCallback(
    (id: string, next: Fit) => {
      const page = docRef.current.pages.find((item) => item.id === id);
      if (!page) return;
      // Someone who has just marked out a sheet wants it to look like a scan.
      const wasWholePhoto = page.fit?.origin === "none";
      const wanted = page.settings.align;
      const lines = printedOn(page);
      setDoc((now) => update(now, id, (item) => ({ ...item, fit: next, aligned: null, filled: 0, settings: { ...item.settings, align: false, filter: wasWholePhoto && next.kind === "sheet" ? "scan" : item.settings.filter } })));
      redraw();
      // New corners are a new outline for the printed lines to land on.
      if (next.kind === "sheet" && lines) {
        window.setTimeout(() => {
          setDoc((now) => update(now, id, (item) => (item.fit === null || item.fit.origin !== "manual" || item.fit.quad !== next.quad ? item : { ...item, aligned: alignedFit(item, lines, next.quad), settings: { ...item.settings, align: wanted } })));
        }, SEARCH_MS / 2);
      }
    },
    [redraw, setDoc],
  );

  // ── Order ──

  const movePage = useCallback(
    (id: string, offset: number) => {
      setDoc((now) => {
        const from = now.pages.findIndex((page) => page.id === id);
        const to = from + offset;
        if (from < 0 || to < 0 || to >= now.pages.length) return now;
        const next = now.pages.slice();
        const [page] = next.splice(from, 1);
        next.splice(to, 0, page!);
        return { ...now, pages: next };
      });
    },
    [setDoc],
  );

  const removePage = useCallback(
    (id: string) => {
      const now = docRef.current;
      const index = now.pages.findIndex((page) => page.id === id);
      if (index < 0) return;
      const gone = now.pages[index]!;
      const remaining = now.pages.filter((page) => page.id !== id);
      const next = remaining[Math.min(index, remaining.length - 1)]?.id ?? null;
      setDoc({ ...now, pages: remaining, currentId: next });
      navigate(next ? paths.page(next) : paths.home, { replace: true });
      toast(`${index + 1}쪽을 지웠습니다`, {
        action: {
          label: "되돌리기",
          onSelect: () => {
            const back = gone.status === "working" ? { ...gone, status: "queued" as const, stepIndex: 0 } : gone;
            setDoc((cur) => {
              const pages = cur.pages.slice();
              pages.splice(Math.min(index, pages.length), 0, back);
              return { ...cur, pages, currentId: back.id };
            });
            navigate(paths.page(back.id));
          },
        },
      });
    },
    [navigate, setDoc, toast],
  );

  const newDocument = useCallback(() => {
    window.clearTimeout(timers.current.export);
    setSaving(null);
    setProblem(null);
    setSearching(null);
    setDoc(emptyDocument(docRef.current.imported));
    navigate(paths.home);
  }, [navigate, setDoc]);

  // The sample replaces what is open, so it can be taken back.
  const loadSample = useCallback(() => {
    const before = docRef.current;
    setProblem(null);
    resetDoc();
    navigate(paths.home);
    if (before.pages.length > 0) {
      toast("예시 문서를 불러왔습니다", {
        action: {
          label: "되돌리기",
          onSelect: () => {
            setDoc(before);
            navigate(paths.home);
          },
        },
      });
    }
  }, [navigate, resetDoc, setDoc, toast]);

  const setFormat = useCallback((format: Doc["format"]) => setDoc((now) => ({ ...now, format })), [setDoc]);
  const setShowGrid = useCallback((value: boolean) => setDoc((now) => ({ ...now, showGrid: value })), [setDoc]);

  // ── Saving. Nothing is written anywhere: a save is a bar that fills, and a word at the end. ──

  const run = useCallback((kind: Saving["kind"], total: number, ms: number, finishWith: (done: boolean) => void, failAt?: number) => {
    const started = performance.now();
    window.clearInterval(timers.current.export);
    setSaving({ kind, done: 0, total });
    timers.current.export = window.setInterval(() => {
      const done = Math.min(total, ((performance.now() - started) / ms) * total);
      if (failAt !== undefined && done >= failAt) {
        window.clearInterval(timers.current.export);
        setSaving(null);
        finishWith(false);
        return;
      }
      if (done >= total) {
        window.clearInterval(timers.current.export);
        setSaving(null);
        finishWith(true);
        return;
      }
      setSaving({ kind, done, total });
    }, 70);
  }, []);

  const exportPdf = useCallback(() => {
    const list = docRef.current.pages.filter(isReady);
    if (list.length === 0) return;
    setProblem(null);
    run(
      "pdf",
      list.length,
      list.length * EXPORT_PAGE_MS,
      (ok) => {
        if (ok) toast(`${list.length}쪽 PDF를 저장했습니다`);
        else setProblem("PDF를 만들지 못했습니다. 페이지가 많으면 이 기기의 메모리가 모자랄 수 있습니다.");
      },
      list.length > PDF_PAGES_LIMIT ? list.length * 0.6 : undefined,
    );
  }, [run, toast]);

  const exportImage = useCallback(
    (id: string) => {
      const page = docRef.current.pages.find((item) => item.id === id);
      if (!page || !activeFit(page)) return;
      setProblem(null);
      const file = `${page.name}-flat.${docRef.current.format === "jpeg" ? "jpg" : "png"}`;
      run("image", 1, 900, (ok) => {
        if (ok) toast(`${file}을 저장했습니다`);
        else setProblem("저장하지 못했습니다. 메모리가 모자라면 JPEG로 바꿔 다시 시도해 주세요.");
      });
    },
    [run, toast],
  );

  const api: Api = {
    doc,
    pages,
    current,
    ready,
    busy,
    progress,
    rendering,
    searching,
    saving,
    problem,
    setProblem,
    select,
    addMock,
    addFiles,
    patchSettings,
    setAlign,
    applyManual,
    movePage,
    removePage,
    newDocument,
    loadSample,
    setFormat,
    setShowGrid,
    exportPdf,
    exportImage,
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
};
