import { Select } from "@studio-baeks/paper-ui";
import type { Breakpoint } from "@studio-baeks/paper-ui/tokens";

import { Segmented } from "../../../kit";
import { useAtLeast } from "../content/viewport";

export type ChoiceOption = { id: string; label: string; count?: number | string };

export const Choice = ({ label, value, onChange, options, breakpoint = "sm" }: { label: string; value: string; onChange: (id: string) => void; options: readonly ChoiceOption[]; breakpoint?: Breakpoint }) => {
  const wide = useAtLeast(breakpoint);
  if (wide) return <Segmented label={label} value={value} onChange={onChange} options={options} />;
  return (
    <Select size="sm" aria-label={label} value={value} onChange={(event) => onChange(event.currentTarget.value)}>
      {options.map((option) => (
        <Select.Option key={option.id} value={option.id}>{option.count !== undefined ? `${option.label} ${option.count}` : option.label}</Select.Option>
      ))}
    </Select>
  );
};
