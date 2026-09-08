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

import { Box, Button, Field, Inline, Select, Stack, Switch, Text, tokens } from "@studio-baeks/paper-ui";

import { PlaygroundLayout } from "./shell";
import { bySlug, defaultState, type CompSpec, type Control, type State } from "./registry";
import "./detail.css";

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
          value={value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.currentTarget.value)}
          options={control.options.map((o) => ({ value: o, label: o }))}
        />
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
              {/* 손으로 꾸민 raw <button> 이었다 — quiet 변형이 바로 그 자리다. */}
              {spec.controls.length > 0 && (
                <Button variant="quiet" size="sm" onClick={() => setState(defaultState(spec))}>
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
    <PlaygroundLayout active={spec.slug}>
      {/* key=slug — 컴포넌트가 바뀌면 상태를 새로 시작 */}
      <DetailView spec={spec} key={spec.slug} />
    </PlaygroundLayout>
  );
};
