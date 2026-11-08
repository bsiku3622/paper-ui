// ComponentDetail — 컴포넌트 하나를 만져보는 상세 페이지 (/playground/:slug).
//
// 왼쪽 위에 살아 있는 preview, 그 아래 그 상태 그대로의 코드, 오른쪽에 prop 토글.
// 코드는 preview 가 그리는 subject 를 그대로 찍어 낸 것이라 둘이 어긋날 수 없고, 코드를 고치면
// 같은 문법으로 읽혀 토글이 따라온다. 전수 레퍼런스(/playground)와 사이드바를 공유한다.
// Atom 은 코드 아래에 Props 표와 모든 조합(Reference.tsx)이 붙는다.
//
// 상태(useState)는 slug 로 keyed 된 DetailView 가 든다 — slug 가 바뀌면 remount 돼
// 그 컴포넌트의 첫 화면으로 새로 시작한다.

import { useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { Button, IconButton, Inline, Pressable, Stack, Surface, Text, SelectableGroup, useResolvedTheme } from "@studio-baeks/paper-ui";
import { SURFACE_FILLS, type SurfaceFill } from "@studio-baeks/paper-ui/tokens";

import { CheckIcon, CloseIcon, EditIcon } from "../compositions/icons";
import { joinClass } from "../joinClass";
import { pick as inLocale, useSiteLocale, useWords, type Bilingual } from "../site/locale";
import { PageHeader } from "../site/PageHeader";
import { SectionHeading } from "../site/SectionHeading";
import { codeOf, entryBySlug, initialState, normalized, stateFromCode, type State } from "./registry";
import type { Entry } from "./registry";
import { ControlRow } from "./ControlRow";
import { PropsTable, VariantSheet } from "./Reference";
import * as s from "./detail.css";

// The order the page shows them in. A fill added to the vocabulary fails typecheck here until it has a place.
const PREVIEW_ORDER: Record<SurfaceFill, number> = { raised: 0, canvas: 1, sunken: 2 };
const PREVIEW_SURFACES = [...SURFACE_FILLS].sort((a, b) => PREVIEW_ORDER[a] - PREVIEW_ORDER[b]);
const PREVIEW_BACKGROUNDS = [...PREVIEW_SURFACES, "track"] as const;
type PreviewBackground = (typeof PREVIEW_BACKGROUNDS)[number];
const PREVIEW_SURFACE_KEY = "paper-ui-preview-surface";
// In dark the sunken surface is the canvas (the surface ladder); the button for sunken says so.
const FOLDED = { surface: "sunken", into: "canvas" } as const satisfies Record<string, SurfaceFill>;
const FOLDED_TITLE: Bilingual = { ko: "다크에서는 canvas와 같은 단계", en: "In dark, the same step as canvas" };

const DETAIL_WORDS = {
  ko: { copied: "복사됨", copy: "복사", closeEdit: "코드 편집 닫기", edit: "코드 편집", editor: "컴포넌트 코드 편집", background: "미리보기 배경", code: "코드", reset: "초기화", none: "토글할 prop 이 없는 컴포넌트입니다. 위 미리보기가 기본 형태입니다." },
  en: { copied: "Copied", copy: "Copy", closeEdit: "Close code editor", edit: "Edit code", editor: "Edit component code", background: "Preview background", code: "Code", reset: "Reset", none: "This component has no props to toggle. The preview above is its default form." },
} as const satisfies Bilingual<Record<string, string>>;

const readPreviewBackground = (): PreviewBackground => {
  try {
    const stored = window.localStorage.getItem(PREVIEW_SURFACE_KEY);
    if (stored === "well") {
      window.localStorage.setItem(PREVIEW_SURFACE_KEY, "track");
      return "track";
    }
    return PREVIEW_BACKGROUNDS.find((background) => background === stored) ?? "raised";
  } catch {
    return "raised";
  }
};

// 두 면이 지금 테마에서 같은 색으로 칠해지는가 — 숨은 표본 둘이 칠한 색을 비교한다. Provider 가 테마를
// 문서에 쓰는 일은 자기 effect 에서 하므로, 색은 그 뒤 다음 프레임에 읽는다.
const useFoldedSurfaces = () => {
  const theme = useResolvedTheme();
  const probes = useRef<HTMLDivElement>(null);
  const [folded, setFolded] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const [front, back] = Array.from(probes.current?.children ?? [], (probe) => getComputedStyle(probe).backgroundColor);
      setFolded(front !== undefined && front === back);
    });
    return () => cancelAnimationFrame(frame);
  }, [theme]);
  return { probes, folded };
};

const CodeBlock = ({ code, onChange, error }: { code: string; onChange: (code: string) => void; error?: string }) => {
  const w = useWords(DETAIL_WORDS);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      },
      () => {},
    );
  };
  return (
    <Surface fill={editing ? "sunken" : "raised"} radius="md" shadow className={joinClass(s.codeBlock, error && s.codeBlockError)} data-testid="code-block">
      <div className={s.codeActions}>
        <Button variant="soft" size="sm" fontSize="label" onClick={copy}>{copied ? w.copied : w.copy}</Button>
        <IconButton
          variant="soft"
          size="sm"
          aria-label={editing ? w.closeEdit : w.edit}
          className={s.codeEdit}
          onClick={() => setEditing((current) => !current)}
        >
          {editing ? <CloseIcon /> : <EditIcon />}
        </IconButton>
      </div>
      {editing ? <textarea className={s.codeEditor} value={code} onChange={(event) => onChange(event.currentTarget.value)} spellCheck={false} aria-label={w.editor} /> : <pre><code>{code}</code></pre>}
      {error ? <Text variant="caption" ink="error" className={s.codeError}>{error}</Text> : null}
    </Surface>
  );
};

// 상태를 든 몸통. slug 마다 remount(key) 돼 첫 화면으로 새로 시작한다.
const DetailView = ({ entry }: { entry: Entry }) => {
  const { useHarness, Stage } = entry;
  const { locale } = useSiteLocale();
  const w = useWords(DETAIL_WORDS);
  const harness = useHarness();
  const [state, setState] = useState<State>(() => normalized(entry, initialState(entry, locale)));
  const [previewBackground, setPreviewBackground] = useState<PreviewBackground>(readPreviewBackground);
  const [draft, setDraft] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const { probes, folded } = useFoldedSurfaces();
  const subject = entry.subject(state, harness, locale);
  const code = draft ?? codeOf(entry, state, harness, locale);
  const selectPreviewBackground = (background: PreviewBackground) => {
    setPreviewBackground(background);
    try { window.localStorage.setItem(PREVIEW_SURFACE_KEY, background); } catch { /* Keep the current page usable when storage is unavailable. */ }
  };
  const set = (key: string) => (v: string | boolean | undefined) => {
    setState((current) => normalized(entry, { ...current, [key]: v }));
    setDraft(undefined);
    setCodeError(undefined);
  };
  const editCode = (nextCode: string) => {
    setDraft(nextCode);
    const parsed = stateFromCode(entry, nextCode, state, locale);
    if ("error" in parsed) {
      setCodeError(parsed.error);
      return;
    }
    setState(parsed.state);
    setCodeError(undefined);
  };

  return (
    <Stack gap="xl">
      <PageHeader group={entry.part === "atoms" ? "Atoms" : `Primitives / ${entry.group}`} name={entry.name} description={inLocale(entry.blurb, locale)} />

      <div className={s.detailBody}>
        {/* preview + code, and under them an Atom's props and every combination of its axes */}
        <Stack gap="xl" className={s.previewColumn}>
          <Stack gap="md">
            <div className={s.previewFrame}>
              <div ref={probes} hidden>
                {[FOLDED.surface, FOLDED.into].map((surface) => <Surface key={surface} fill={surface} />)}
              </div>
              {/* The stage is a card on the canvas: its face and a shadow, no line. The track background is a colour, not a face. */}
              {previewBackground === "track" ? (
                <Surface className={joinClass(s.previewStage, entry.preview === "flush" && s.previewStageFlush, s.previewStageTrack)} data-preview-background={previewBackground}>
                  {Stage ? <Stage subject={subject} state={state} harness={harness} /> : subject}
                </Surface>
              ) : (
                <Surface fill={previewBackground} shadow={entry.preview !== "flush"} className={joinClass(s.previewStage, entry.preview === "flush" && s.previewStageFlush)} data-preview-background={previewBackground}>
                  {Stage ? <Stage subject={subject} state={state} harness={harness} /> : subject}
                </Surface>
              )}
              <SelectableGroup
                className={s.surfaceSwitcher}
                aria-label={w.background}
                selectionRequired
                selectedValues={[previewBackground]}
                onSelectedValuesChange={(values) => {
                  const next = PREVIEW_BACKGROUNDS.find((background) => background === values[0]);
                  if (next) selectPreviewBackground(next);
                }}
              >
                {PREVIEW_BACKGROUNDS.map((background) => (
                  <Pressable
                    as={SelectableGroup.Item}
                    key={background}
                    value={background}
                    className={s.surfaceButton[background]}
                    aria-label={`${background} background`}
                    title={background === FOLDED.surface && folded ? inLocale(FOLDED_TITLE, locale) : `${background} background`}
                  >
                    {previewBackground === background ? <CheckIcon size="caption" /> : null}
                  </Pressable>
                ))}
              </SelectableGroup>
            </div>
            <Stack gap="xs">
              <SectionHeading title={w.code} variant="label" />
              <CodeBlock code={code} onChange={editCode} error={codeError} />
            </Stack>
          </Stack>
          {entry.part === "atoms" ? (
            <>
              <PropsTable entry={entry} />
              <VariantSheet entry={entry} harness={harness} ground={previewBackground} />
            </>
          ) : null}
        </Stack>

        {/* controls */}
        <Surface fill="raised" radius="lg" padding="lg" elevation="sticky" shadow className={s.propsPanel}>
          <Stack gap="lg">
            <Inline justify="between" align="center">
              <SectionHeading title="Props" variant="label" />
              {/* 손으로 꾸민 raw <button> 이었다 — muted 변형이 바로 그 자리다. */}
              {entry.controls.length > 0 && (
                <Button variant="muted" size="sm" onClick={() => { setState(normalized(entry, initialState(entry, locale))); setDraft(undefined); setCodeError(undefined); }}>
                  {w.reset}
                </Button>
              )}
            </Inline>
            {entry.controls.length === 0 ? (
              <Text variant="caption" ink="secondary">{w.none}</Text>
            ) : (
              <Stack gap="md">
                {entry.controls.map((c) => (
                  <ControlRow key={c.key} control={c} value={state[c.key]} defaults={entry.defaults} onChange={set(c.key)} />
                ))}
              </Stack>
            )}
          </Stack>
        </Surface>
      </div>
    </Stack>
  );
};

export const ComponentDetail = () => {
  const { slug = "" } = useParams();
  const entry = entryBySlug(slug);
  const { locale } = useSiteLocale();
  if (!entry) return <Navigate to="/playground" replace />;
  // key=slug — 컴포넌트가 바뀌면 상태를 새로 시작. 언어가 바뀌어도 새로 시작한다: 글자 칸의 첫 글자와 예시의 낱말이 그 언어의 것이다.
  return <DetailView entry={entry} key={`${entry.slug}:${locale}`} />;
};
