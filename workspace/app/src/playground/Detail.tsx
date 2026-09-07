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

import { Box, Button, Inline, Select, Stack, Text, tokens } from "@studio-baeks/paper-ui";

import { PlaygroundLayout } from "./shell";
import { bySlug, defaultState, type CompSpec, type Control, type State } from "./registry";
import "./detail.css";

// prop 토글 한 줄. bool 은 켬/끔 pill, enum 은 Select, text 는 입력.
const ControlRow = ({ control, value, onChange }: { control: Control; value: string | boolean | undefined; onChange: (v: string | boolean) => void }) => (
  <Stack gap="xs">
    <Text variant="label">{control.label}</Text>
    {control.kind === "bool" && (
      <Inline gap="xs">
        <Button variant={value ? "solid" : "outline"} onClick={() => onChange(true)}>true</Button>
        <Button variant={!value ? "solid" : "outline"} onClick={() => onChange(false)}>false</Button>
      </Inline>
    )}
    {control.kind === "enum" && (
      <Select
        value={value === undefined ? "" : String(value)}
        onChange={(e) => onChange(e.currentTarget.value)}
        options={control.options.map((o) => ({ value: o, label: o }))}
      />
    )}
    {control.kind === "text" && (
      <Box
        as="input"
        // Field 를 쓰지 않는 건 여기 값이 곧장 preview 로 흐르는 편집 필드라서.
        // paper 프리미티브(Box as=input)로 최소 구성. raised(떠오른 면) + 옅은 테두리(Field 결).
        surface="raised"
        radius="sm"
        paddingX="sm"
        value={value === undefined ? "" : String(value)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.currentTarget.value)}
        style={{
          height: tokens.shape.height.md.interaction,
          border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}`,
          fontSize: tokens.text.size.caption,
          // input 은 color 를 상속하지 않아 다크에서 UA 기본색(어두움)으로 떨어진다 — 명시.
          color: tokens.color.ink.base,
          width: "100%",
        }}
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

// 상태를 든 몸통. slug 마다 remount(key) 돼 defaultState 로 새로 시작한다.
const DetailView = ({ spec }: { spec: CompSpec }) => {
  const [state, setState] = useState<State>(() => defaultState(spec));
  const preview = useMemo(() => spec.render(state), [spec, state]);
  const code = useMemo(() => spec.code(state), [spec, state]);
  const set = (prop: string) => (v: string | boolean) => setState((s) => ({ ...s, [prop]: v }));

  return (
    <Stack gap="xl" style={{ maxWidth: "52rem" }}>
      {/* 머리 — 브레드크럼은 제목에 붙이고, 설명은 한 숨 띄운다 */}
      <Stack gap="md">
        <Stack gap="xs">
          <Inline gap="xs" align="center">
            <Text variant="caption" ink="faint" as="span">{spec.group}</Text>
            <Text variant="caption" ink="faint" as="span">/</Text>
            <Text variant="caption" ink="soft" as="span">Component</Text>
          </Inline>
          <Text variant="title">{spec.name}</Text>
        </Stack>
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
        <Box surface="canvas" radius="md" padding="lg" style={{ position: "sticky", top: `calc(${tokens.shape.atom.navbar} + ${tokens.shape.gap.xl})`, border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}` }}>
          <Stack gap="lg">
            <Inline justify="between" align="center">
              <Text variant="label">Props</Text>
              {spec.controls.length > 0 && (
                <button
                  type="button"
                  onClick={() => setState(defaultState(spec))}
                  style={{ appearance: "none", background: "none", border: "none", cursor: "pointer", fontSize: tokens.text.size.label, color: tokens.color.ink.soft, padding: 0 }}
                >
                  초기화
                </button>
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
    <PlaygroundLayout active={spec.slug}>
      {/* key=slug — 컴포넌트가 바뀌면 상태를 새로 시작 */}
      <DetailView spec={spec} key={spec.slug} />
    </PlaygroundLayout>
  );
};
