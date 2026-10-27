// ComponentDetail — 컴포넌트 하나를 만져보는 상세 페이지 (/playground/:slug).
//
// 왼쪽 위에 살아 있는 preview, 그 아래 그 상태 그대로의 코드, 오른쪽에 prop 토글.
// 토글을 만지면 preview 와 코드가 같은 state 를 보고 함께 바뀐다 — 화면과 코드가
// 어긋날 수 없다. 전수 레퍼런스(/playground)와 사이드바를 공유한다.
//
// 상태(useState)는 slug 로 keyed 된 DetailView 가 든다 — slug 가 바뀌면 remount 돼
// 그 컴포넌트의 기본값으로 새로 시작한다. (안 그러면 앞 컴포넌트의 값이 남아
// variant="" · children=undefined 같은 유령이 샌다.)

import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { Box, Button, Field, Icon, IconButton, Inline, Select, Stack, Switch, Text, tokens, type Surface } from "@studio-baeks/paper-ui";

import { PlaygroundLayout, ReferenceHeading } from "./shell";
import { NAV_HEIGHT } from "../site/chrome";
import { bySlug, defaultState, type CompSpec, type Control, type State } from "./registry";
import "./detail.css";

const PREVIEW_SURFACES = ["raised", "canvas", "sunken"] as const satisfies readonly Surface[];
const PREVIEW_BACKGROUNDS = [...PREVIEW_SURFACES, "track"] as const;
type PreviewBackground = (typeof PREVIEW_BACKGROUNDS)[number];
const PREVIEW_SURFACE_KEY = "paper-ui-preview-surface";

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

// prop 토글 한 줄.
//
// ⚠ **패널이 미리보기보다 시끄러우면 안 된다.** bool 을 true/false 두 버튼으로 그렸더니
// 고른 쪽이 검정 solid 라, 불리언 prop 이 넷인 컴포넌트에서는 검정 덩어리가 넷 쌓여
// 조종하려는 대상(작은 버튼 하나)보다 패널이 눈에 먼저 들어왔다. 불리언은 이 시스템에
// 이미 자기 컨트롤이 있다 — Switch 다. 라벨과 한 줄에 앉아 세로도 절반으로 준다.
//
// 텍스트도 Box as="input" 을 손으로 꾸미지 않고 Field 를 쓴다. "값이 곧장 preview 로
// 흐르는 편집 필드라서" 안 썼다고 적혀 있었는데, Field 는 controlled 입력을 그대로 받는다.
const ControlRow = ({ control, value, onChange }: { control: Control; value: string | boolean | undefined; onChange: (v: string | boolean) => void }) => {
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
          value={value === undefined || String(value) === control.def ? "__pui_default__" : String(value)}
          onChange={(e) => onChange(e.currentTarget.value === "__pui_default__" ? control.def : e.currentTarget.value)}
        >
          <Select.Option value="__pui_default__">{`default (${control.def})`}</Select.Option>
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

// Read the generated JSX opening tag without executing arbitrary JavaScript.
const parseCodeState = (code: string, spec: CompSpec, previous: State): State | null => {
  const tag = new RegExp(`<${spec.name}\\b([\\s\\S]*?)(?:\\/>|>)`).exec(code)?.[1];
  if (tag === undefined) return null;
  const next = { ...previous };
  const hookValue = /useState\(\s*"([^"]*)"\s*\)/.exec(code)?.[1];
  for (const control of spec.controls) {
    if (control.kind === "bool") {
      next[control.prop] = new RegExp(`(?:^|\\s)${control.prop}(?:\\s|$)`).test(tag);
      continue;
    }
    const match = new RegExp(`${control.prop}\\s*=\\s*"([^"]*)"`).exec(tag);
    if (match) next[control.prop] = match[1] ?? "";
    else if (control.kind === "enum") next[control.prop] = hookValue ?? control.def;
  }
  const childrenProp = spec.controls.find((control) => control.prop === "children");
  if (childrenProp) {
    const children = new RegExp(`<${spec.name}\\b[\\s\\S]*?>([^<]*)<\\/${spec.name}>`).exec(code)?.[1];
    if (children !== undefined && children.trim()) next.children = children.trim();
  }
  return next;
};

const expandCodePlaceholders = (code: string) => code
  .replaceAll("<Box>…</Box>", "<Box surface=\"sunken\" radius=\"sm\" padding=\"sm\"><Text variant=\"caption\">내용</Text></Box>")
  .replaceAll("\n  …\n", "\n  <Text variant=\"caption\">A · B · C</Text>\n")
  .replaceAll("<Icon>…</Icon>", "<Icon><path d=\"M12 5v14M5 12h14\" /></Icon>");

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
    <div className={`code-block${editing ? " code-block--editing" : ""}${error ? " code-block--error" : ""}`}>
      <div className="code-actions">
        <Button variant="hairline" size="sm" fontSize="label" onClick={copy}>{copied ? "복사됨" : "복사"}</Button>
        <IconButton
          variant="hairline"
          size="sm"
          iconSize="caption"
          aria-label={editing ? "코드 편집 닫기" : "코드 편집"}
          className="code-edit"
          onClick={() => setEditing((current) => !current)}
        >
          <Icon>{editing ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="m14.7 6.3 3 3M4 20l4.2-.9L19.2 8a2.1 2.1 0 0 0-3-3L5.2 16.1 4 20Z" />}</Icon>
        </IconButton>
      </div>
      {editing ? <textarea className="code-editor" value={code} onChange={(event) => onChange(event.currentTarget.value)} spellCheck={false} aria-label="컴포넌트 코드 편집" /> : <pre><code>{code}</code></pre>}
      {error ? <Text variant="caption" ink="error" className="code-error">{error}</Text> : null}
    </div>
  );
};

// 상태를 든 몸통. slug 마다 remount(key) 돼 defaultState 로 새로 시작한다.
const DetailView = ({ spec }: { spec: CompSpec }) => {
  const [state, setState] = useState<State>(() => defaultState(spec));
  const [previewBackground, setPreviewBackground] = useState<PreviewBackground>(readPreviewBackground);
  const [draft, setDraft] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const preview = useMemo(() => spec.render(state), [spec, state]);
  const generatedCode = useMemo(() => expandCodePlaceholders(spec.code(state)), [spec, state]);
  const code = draft ?? generatedCode;
  const selectPreviewBackground = (background: PreviewBackground) => {
    setPreviewBackground(background);
    try { window.localStorage.setItem(PREVIEW_SURFACE_KEY, background); } catch { /* Keep the current page usable when storage is unavailable. */ }
  };
  const set = (prop: string) => (v: string | boolean) => {
    setState((s) => ({ ...s, [prop]: v }));
    setDraft(undefined);
    setCodeError(undefined);
  };
  const editCode = (nextCode: string) => {
    setDraft(nextCode);
    const parsed = parseCodeState(nextCode, spec, state);
    if (!parsed) {
      setCodeError(`${spec.name} JSX를 읽을 수 없습니다.`);
      return;
    }
    setState(parsed);
    setCodeError(undefined);
  };

  return (
    <Stack gap="xl" style={{ maxWidth: "52rem" }}>
      <ReferenceHeading group={spec.group} name={spec.name} description={spec.blurb} />

      <div className="detail-body">
        {/* preview + code */}
        <Stack gap="md" style={{ minWidth: 0 }}>
          <div className="preview-frame">
            <Box surface={previewBackground === "track" ? undefined : previewBackground} className={`preview-stage${spec.preview === "flush" ? " preview-stage--flush" : ""}${previewBackground === "track" ? " preview-stage--track" : ""}`} data-preview-background={previewBackground}>{preview}</Box>
            <div className="preview-surface-switcher" role="group" aria-label="미리보기 배경">
              {PREVIEW_BACKGROUNDS.map((background) => (
                <Box
                  as="button"
                  type="button"
                  key={background}
                  surface={background === "track" ? undefined : background}
                  className={`preview-surface-button${background === "track" ? " preview-surface-button--track" : ""}`}
                  aria-label={`${background} background`}
                  aria-pressed={previewBackground === background}
                  title={`${background} background`}
                  onClick={() => selectPreviewBackground(background)}
                >
                  {previewBackground === background ? <Icon size="caption"><path d="m5 12 4 4L19 6" /></Icon> : null}
                </Box>
              ))}
            </div>
          </div>
          <Stack gap="xs">
            <Text variant="label">코드</Text>
            <CodeBlock code={code} onChange={editCode} error={codeError} />
          </Stack>
        </Stack>

        {/* controls */}
        <Box surface="canvas" radius="md" padding="lg" style={{ position: "sticky", top: `calc(${NAV_HEIGHT} + ${tokens.shape.space.xl})`, border: `${tokens.shape.stroke.border} solid ${tokens.color.border.base}` }}>
          <Stack gap="lg">
            <Inline justify="between" align="center">
              <Text variant="label">Props</Text>
              {/* 손으로 꾸민 raw <button> 이었다 — muted 변형이 바로 그 자리다. */}
              {spec.controls.length > 0 && (
                <Button variant="muted" size="sm" onClick={() => { setState(defaultState(spec)); setDraft(undefined); setCodeError(undefined); }}>
                  초기화
                </Button>
              )}
            </Inline>
            {spec.controls.length === 0 ? (
              <Text variant="caption" ink="soft">토글할 prop 이 없는 컴포넌트입니다. 위 미리보기가 기본 형태입니다.</Text>
            ) : (
              <Stack gap="md">
                {spec.controls.map((c) => (
                  <ControlRow key={c.prop} control={c} value={state[c.prop]} onChange={set(c.prop)} />
                ))}
              </Stack>
            )}
          </Stack>
        </Box>
      </div>
    </Stack>
  );
};

export const ComponentDetail = () => {
  const { slug = "" } = useParams();
  const spec = bySlug(slug);
  if (!spec) return <Navigate to="/playground" replace />;
  return (
    <PlaygroundLayout value={spec.slug}>
      {/* key=slug — 컴포넌트가 바뀌면 상태를 새로 시작 */}
      <DetailView spec={spec} key={spec.slug} />
    </PlaygroundLayout>
  );
};
