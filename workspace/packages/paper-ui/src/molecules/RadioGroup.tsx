// RadioGroup — Radio + Label 한 벌. options 를 data 로 받아 하나만 고르게 한다.
// name 을 자동 부여해 라디오들을 한 그룹으로 묶는다. Molecule 이라 raw 태그를
// 렌더하지 않고 Primitive(Stack·Inline·Text) + Atom(Radio) 조합만 쓴다.

import { useId, type ReactNode } from "react";

import { Stack, Inline, Text } from "../primitives";
import { Radio } from "../atoms";
import type { ControlSize } from "../tokens";

export type RadioOption = { value: string; label: ReactNode; disabled?: boolean };

export type RadioGroupProps = {
  options: readonly RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  // 라디오 크기 3 단 (sm·md·lg). 그룹의 모든 라디오에 적용.
  size?: ControlSize;
  // 그룹의 접근 이름 — 라디오들을 무엇으로 묶는지(예: "결제 수단"). 눈에 보이는 라벨이
  // 있으면 그 id 를 aria-labelledby 로.
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
};

export const RadioGroup = ({
  options,
  value,
  onChange,
  name,
  size = "md",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
}: RadioGroupProps) => {
  const auto = useId();
  const group = name ?? auto;
  return (
    <Stack gap="sm" role="radiogroup" aria-label={ariaLabel} aria-labelledby={ariaLabelledby} className={className}>
      {options.map((o) => (
        <Inline as="label" gap="sm" align="center" key={o.value}>
          <Radio
            name={group}
            value={o.value}
            checked={value === o.value}
            disabled={o.disabled}
            size={size}
            onChange={() => onChange?.(o.value)}
          />
          <Text variant="body" as="span" ink={o.disabled ? "faint" : "base"}>
            {o.label}
          </Text>
        </Inline>
      ))}
    </Stack>
  );
};
