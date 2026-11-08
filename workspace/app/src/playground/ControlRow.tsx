// One prop's control: a switch for a boolean, a row of outlined segments for a short choice that holds the resting value, a Select
// for a longer one, a Field for words. A component page's Props panel and the Overview's boards both use it, so a control looks and
// answers the same wherever it moves a component.

import { Field, Inline, SegmentControl, Select, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { DEFAULT_MARK } from "./Reference";
import type { Control } from "./registry";

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
// 기본값은 그 값의 항목에 "(default)" 로 붙인다 — "solid (default)". 예전에는 "default (solid)" 칸을 따로 두어 같은 solid 가
// 목록에 두 번 있었다. 기본값을 고르면 prop 이 코드에서 빠진다. 기본값이 선택지가 아니면(none · auto · inherit) 그 낱말 한
// 칸을 맨 위에 둔다.
const OMITTED = "__pui_default__";

export const ControlRow = ({ control, value, defaults, onChange }: { control: Control; value: string | boolean | undefined; defaults: Readonly<Record<string, unknown>>; onChange: (v: string | boolean | undefined) => void }) => {
  if (control.kind === "bool") {
    return (
      <Inline as="label" justify="between" align="center" gap="sm">
        <Text variant="label" as="span">{control.label}</Text>
        <Switch checked={Boolean(value)} onChange={(e) => onChange(e.currentTarget.checked)} />
      </Inline>
    );
  }
  // A choice of two or three, one of which is what the component does when the prop is left out, is a row of segments: it shows
  // every choice at once, and picking the resting one leaves the prop out again. The segments are the outlined group, the frame the
  // Selects around them have, so the panel reads as one form.
  const resting = control.kind === "enum" ? String(defaults[control.prop] ?? control.rootDefault ?? control.omitted ?? "") : "";
  if (control.kind === "enum" && control.options.length <= 3 && (control.required || control.options.includes(resting))) {
    return (
      <Stack gap="xs">
        <Text variant="label">{control.label}</Text>
        <SegmentControl
          aria-label={control.label}
          variant="outline"
          shape="rounded"
          size="sm"
          fullWidth
          value={value === undefined ? resting : String(value)}
          onValueChange={(next) => onChange(!control.required && next === resting ? undefined : next)}
        >
          {control.options.map((option) => <SegmentControl.Item key={option} value={option}>{control.labels?.[option] ?? option}</SegmentControl.Item>)}
        </SegmentControl>
      </Stack>
    );
  }
  // What the component does with the prop left out: one of the choices, or a word that is not one.
  const restingChoice = control.kind === "enum" && !control.required && control.options.includes(resting);
  const shown = value !== undefined ? String(value) : restingChoice ? resting : OMITTED;
  return (
    <Stack gap="xs">
      <Text variant="label">{control.label}</Text>
      {control.kind === "enum" ? (
        <Select
          size="sm"
          aria-label={control.label}
          value={shown}
          onChange={(e) => {
            const next = e.currentTarget.value;
            onChange(next === OMITTED || (restingChoice && next === resting) ? undefined : next);
          }}
        >
          {control.required || restingChoice ? null : <Select.Option value={OMITTED}>{`${resting || "none"}${DEFAULT_MARK}`}</Select.Option>}
          {control.options.map((option) => (
            <Select.Option key={option} value={option}>{`${control.labels?.[option] ?? option}${restingChoice && option === resting ? DEFAULT_MARK : ""}`}</Select.Option>
          ))}
        </Select>
      ) : (
        <Field
          size="sm"
          value={value === undefined ? "" : String(value)}
          onChange={(e) => onChange(e.currentTarget.value)}
          aria-label={control.label}
        />
      )}
    </Stack>
  );
};
