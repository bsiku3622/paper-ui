// ComponentDetail — 컴포넌트 하나를 만져보는 상세 페이지 (/playground/:slug).
//
// 왼쪽 위에 살아 있는 preview, 그 아래 그 상태 그대로의 코드, 오른쪽에 prop 토글.
// 토글을 만지면 preview 와 코드가 같은 state 를 보고 함께 바뀐다 — 화면과 코드가
// 어긋날 수 없다. 전수 레퍼런스(/playground)와 사이드바를 공유한다.

import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { Box, Button, Divider, Inline, Select, Stack, Text } from "@studio-baeks/paper-ui";

import { PlaygroundLayout } from "./shell";
import { bySlug, defaultState, type Control, type State } from "./registry";
import "./detail.css";

// prop 토글 한 줄. bool 은 켬/끔 pill, enum 은 Select, text 는 입력.
const ControlRow = ({ control, value, onChange }: { control: Control; value: string | boolean | undefined; onChange: (v: string | boolean) => void }) => (
  <Stack gap="xs">
    <Text variant="label">{control.label}</Text>
    {control.kind === "bool" && (
      <Inline gap="xs">
        <Button kind={value ? "solid" : "outline"} onClick={() => onChange(true)}>true</Button>
        <Button kind={!value ? "solid" : "outline"} onClick={() => onChange(false)}>false</Button>
      </Inline>
    )}
    {control.kind === "enum" && (
      <Select
        value={String(value)}
        onChange={(e) => onChange(e.currentTarget.value)}
        options={control.options.map((o) => ({ value: o, label: o }))}
      />
    )}
    {control.kind === "text" && (
      <Box
        as="input"
        // Field 를 쓰지 않는 건 여기 값이 곧장 preview 로 흐르는 편집 필드라서.
        // paper 프리미티브(Box as=input)로 최소 구성.
        paper="subtle"
        radius="sm"
        paddingX="sm"
        value={String(value)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.currentTarget.value)}
        style={{ height: "2rem", border: "1px solid var(--pui-color-border-base)", fontSize: "0.8125rem", width: "100%" }}
      />
    )}
  </Stack>
);

const CodeBlock = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);
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
    <div className="code-block">
      <button type="button" className="code-copy" onClick={copy}>
        {copied ? "복사됨" : "복사"}
      </button>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const ComponentDetail = () => {
  const { slug = "" } = useParams();
  const spec = bySlug(slug);
  const [state, setState] = useState<State>(() => (spec ? defaultState(spec) : {}));

  // slug 가 바뀌면 state 를 그 컴포넌트 기본값으로 초기화 (키로 리마운트 유도)
  const key = spec?.slug;

  const preview = useMemo(() => (spec ? spec.render(state) : null), [spec, state]);
  const code = useMemo(() => (spec ? spec.code(state) : ""), [spec, state]);

  if (!spec) return <Navigate to="/playground" replace />;

  const set = (prop: string) => (v: string | boolean) => setState((s) => ({ ...s, [prop]: v }));

  return (
    <PlaygroundLayout active={spec.slug} key={key}>
      <Stack gap="xl" style={{ maxWidth: "52rem" }}>
        {/* 머리 */}
        <Stack gap="xs">
          <Inline gap="xs" align="center">
            <Text variant="caption" ink="faint" as="span">{spec.group}</Text>
            <Text variant="caption" ink="faint" as="span">/</Text>
            <Text variant="caption" ink="soft" as="span">Component</Text>
          </Inline>
          <Text variant="title">{spec.name}</Text>
          <Text variant="body" ink="soft" style={{ maxWidth: "40rem" }}>{spec.blurb}</Text>
        </Stack>

        <div className="detail-body">
          {/* preview + code */}
          <Stack gap="md" style={{ minWidth: 0 }}>
            <div className="preview-stage">{preview}</div>
            <Stack gap="xs">
              <Text variant="label">코드</Text>
              <CodeBlock code={code} />
            </Stack>
          </Stack>

          {/* controls */}
          <Box paper="subtle" radius="md" padding="lg" style={{ position: "sticky", top: "5rem" }}>
            <Stack gap="lg">
              <Inline justify="between" align="center">
                <Text variant="label">Props</Text>
                {spec.controls.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setState(defaultState(spec))}
                    style={{ appearance: "none", background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "var(--pui-color-ink-soft)", padding: 0 }}
                  >
                    초기화
                  </button>
                )}
              </Inline>
              {spec.controls.length === 0 ? (
                <Text variant="caption" ink="soft">토글할 prop 이 없는 컴포넌트입니다. 위 미리보기가 기본 형태입니다.</Text>
              ) : (
                <Stack gap="md">
                  {spec.controls.map((c, i) => (
                    <Stack gap="md" key={c.prop}>
                      {i > 0 && <Divider />}
                      <ControlRow control={c} value={state[c.prop]} onChange={set(c.prop)} />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          </Box>
        </div>
      </Stack>
    </PlaygroundLayout>
  );
};
