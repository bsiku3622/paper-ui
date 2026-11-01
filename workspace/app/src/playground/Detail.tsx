// ComponentDetail — 컴포넌트 하나를 만져보는 상세 페이지 (/playground/:slug).
//
// 왼쪽 위에 살아 있는 preview, 그 아래 그 상태 그대로의 코드, 오른쪽에 prop 토글.
// 코드는 preview 가 그리는 subject 를 그대로 찍어 낸 것이라 둘이 어긋날 수 없고, 코드를 고치면
// 같은 문법으로 읽혀 토글이 따라온다. 전수 레퍼런스(/playground)와 사이드바를 공유한다.
//
// 상태(useState)는 slug 로 keyed 된 DetailView 가 든다 — slug 가 바뀌면 remount 돼
// 그 컴포넌트의 첫 화면으로 새로 시작한다.

import { useEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { Button, Field, IconButton, Inline, Pressable, Select, Stack, Surface, Switch, Text, SelectableGroup, useResolvedTheme } from "@studio-baeks/paper-ui";
import { SURFACE_FILLS, type SurfaceFill } from "@studio-baeks/paper-ui/tokens";

import { CheckIcon, CloseIcon, EditIcon } from "../compositions/icons";
import { joinClass } from "../joinClass";
import { PageHeader } from "../site/PageHeader";
import { SectionHeading } from "../site/SectionHeading";
import { codeOf, entryBySlug, initialState, normalized, stateFromCode, type Control, type State } from "./registry";
import type { Entry } from "./registry";
import * as s from "./detail.css";

// The order the page shows them in. A fill added to the vocabulary fails typecheck here until it has a place.
const PREVIEW_ORDER: Record<SurfaceFill, number> = { raised: 0, canvas: 1, sunken: 2 };
const PREVIEW_SURFACES = [...SURFACE_FILLS].sort((a, b) => PREVIEW_ORDER[a] - PREVIEW_ORDER[b]);
const PREVIEW_BACKGROUNDS = [...PREVIEW_SURFACES, "track"] as const;
type PreviewBackground = (typeof PREVIEW_BACKGROUNDS)[number];
const PREVIEW_SURFACE_KEY = "paper-ui-preview-surface";
// In dark the sunken surface is the canvas (the surface ladder); the button for sunken says so.
const FOLDED = { surface: "sunken", into: "canvas" } as const satisfies Record<string, SurfaceFill>;
const FOLDED_TITLE = "다크에서는 canvas와 같은 단계";

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

// prop 토글 한 줄.
//
// ⚠ **패널이 미리보기보다 시끄러우면 안 된다.** bool 을 true/false 두 버튼으로 그렸더니
// 고른 쪽이 검정 solid 라, 불리언 prop 이 넷인 컴포넌트에서는 검정 덩어리가 넷 쌓여
// 조종하려는 대상(작은 버튼 하나)보다 패널이 눈에 먼저 들어왔다. 불리언은 이 시스템에
// 이미 자기 컨트롤이 있다 — Switch 다. 라벨과 한 줄에 앉아 세로도 절반으로 준다.
//
// 텍스트도 Box as="input" 을 손으로 꾸미지 않고 Field 를 쓴다. "값이 곧장 preview 로
// 흐르는 편집 필드라서" 안 썼다고 적혀 있었는데, Field 는 controlled 입력을 그대로 받는다.
//
// enum 의 첫 항목은 "prop 을 주지 않음" 이고, 그때 컴포넌트가 쓰는 값을 괄호에 적는다.
const OMITTED = "__pui_default__";

const ControlRow = ({ control, value, defaults, onChange }: { control: Control; value: string | boolean | undefined; defaults: Readonly<Record<string, unknown>>; onChange: (v: string | boolean | undefined) => void }) => {
  if (control.kind === "bool") {
    return (
      <Inline as="label" justify="between" align="center" gap="sm">
        <Text variant="label" as="span">{control.label}</Text>
        <Switch checked={Boolean(value)} onChange={(e) => onChange(e.currentTarget.checked)} />
      </Inline>
    );
  }
  return (
    <Stack gap="xs">
      <Text variant="label">{control.label}</Text>
      {control.kind === "enum" ? (
        <Select
          aria-label={control.label}
          value={value === undefined ? OMITTED : String(value)}
          onChange={(e) => onChange(e.currentTarget.value === OMITTED ? undefined : e.currentTarget.value)}
        >
          {control.required ? null : <Select.Option value={OMITTED}>{`default (${String(defaults[control.prop] ?? control.rootDefault ?? control.omitted ?? "none")})`}</Select.Option>}
          {control.options.map((option) => <Select.Option key={option} value={option}>{control.labels?.[option] ?? option}</Select.Option>)}
        </Select>
      ) : (
        <Field
          value={value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.currentTarget.value)}
          aria-label={control.label}
        />
      )}
    </Stack>
  );
};

const CodeBlock = ({ code, onChange, error }: { code: string; onChange: (code: string) => void; error?: string }) => {
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
    <div className={joinClass(s.codeBlock, editing && s.codeBlockEditing, error && s.codeBlockError)} data-testid="code-block">
      <div className={s.codeActions}>
        <Button variant="hairline" size="sm" fontSize="label" onClick={copy}>{copied ? "복사됨" : "복사"}</Button>
        <IconButton
          variant="hairline"
          size="sm"
          aria-label={editing ? "코드 편집 닫기" : "코드 편집"}
          className={s.codeEdit}
          onClick={() => setEditing((current) => !current)}
        >
          {editing ? <CloseIcon /> : <EditIcon />}
        </IconButton>
      </div>
      {editing ? <textarea className={s.codeEditor} value={code} onChange={(event) => onChange(event.currentTarget.value)} spellCheck={false} aria-label="컴포넌트 코드 편집" /> : <pre><code>{code}</code></pre>}
      {error ? <Text variant="caption" ink="error" className={s.codeError}>{error}</Text> : null}
    </div>
  );
};

// 상태를 든 몸통. slug 마다 remount(key) 돼 첫 화면으로 새로 시작한다.
const DetailView = ({ entry }: { entry: Entry }) => {
  const { useHarness, Stage } = entry;
  const harness = useHarness();
  const [state, setState] = useState<State>(() => normalized(entry, initialState(entry)));
  const [previewBackground, setPreviewBackground] = useState<PreviewBackground>(readPreviewBackground);
  const [draft, setDraft] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const { probes, folded } = useFoldedSurfaces();
  const subject = entry.subject(state, harness);
  const code = draft ?? codeOf(entry, state, harness);
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
    const parsed = stateFromCode(entry, nextCode, state);
    if ("error" in parsed) {
      setCodeError(parsed.error);
      return;
    }
    setState(parsed.state);
    setCodeError(undefined);
  };

  return (
    <Stack gap="xl">
      <PageHeader group={entry.part === "atoms" ? "Atoms" : `Primitives / ${entry.group}`} name={entry.name} description={entry.blurb} />

      <div className={s.detailBody}>
        {/* preview + code */}
        <Stack gap="md" className={s.previewColumn}>
          <div className={s.previewFrame}>
            <div ref={probes} hidden>
              {[FOLDED.surface, FOLDED.into].map((surface) => <Surface key={surface} fill={surface} />)}
            </div>
            <Surface fill={previewBackground === "track" ? undefined : previewBackground} className={joinClass(s.previewStage, entry.preview === "flush" && s.previewStageFlush, previewBackground === "track" && s.previewStageTrack)} data-preview-background={previewBackground}>
              {Stage ? <Stage subject={subject} state={state} harness={harness} /> : subject}
            </Surface>
            <SelectableGroup
              className={s.surfaceSwitcher}
              aria-label="미리보기 배경"
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
                  title={background === FOLDED.surface && folded ? FOLDED_TITLE : `${background} background`}
                >
                  {previewBackground === background ? <CheckIcon size="caption" /> : null}
                </Pressable>
              ))}
            </SelectableGroup>
          </div>
          <Stack gap="xs">
            <SectionHeading title="코드" variant="label" />
            <CodeBlock code={code} onChange={editCode} error={codeError} />
          </Stack>
        </Stack>

        {/* controls */}
        <Surface fill="canvas" radius="md" padding="lg" elevation="sticky" border className={s.propsPanel}>
          <Stack gap="lg">
            <Inline justify="between" align="center">
              <SectionHeading title="Props" variant="label" />
              {/* 손으로 꾸민 raw <button> 이었다 — muted 변형이 바로 그 자리다. */}
              {entry.controls.length > 0 && (
                <Button variant="muted" size="sm" onClick={() => { setState(normalized(entry, initialState(entry))); setDraft(undefined); setCodeError(undefined); }}>
                  초기화
                </Button>
              )}
            </Inline>
            {entry.controls.length === 0 ? (
              <Text variant="caption" ink="secondary">토글할 prop 이 없는 컴포넌트입니다. 위 미리보기가 기본 형태입니다.</Text>
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
  if (!entry) return <Navigate to="/playground" replace />;
  // key=slug — 컴포넌트가 바뀌면 상태를 새로 시작
  return <DetailView entry={entry} key={entry.slug} />;
};
