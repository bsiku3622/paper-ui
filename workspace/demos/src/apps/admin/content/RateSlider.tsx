import { useFocusRing } from "@studio-baeks/paper-ui";

import { rateSlider } from "./rate-slider.css";

export type RateValue = number | "unlimited";

export const RateSlider = ({ label, value, onChange, disabled }: { label: string; value: RateValue; onChange: (next: RateValue) => void; disabled?: boolean }) => {
  const { focusProps } = useFocusRing();
  return (
    <input
      {...focusProps}
      aria-label={label}
      aria-valuetext={value === "unlimited" ? "제한 없음" : value === 0 ? "차단" : `${value} Mbps`}
      className={rateSlider}
      type="range"
      min={0}
      max={301}
      step={1}
      value={value === "unlimited" ? 301 : value}
      disabled={disabled}
      onChange={(event) => {
        const next = Number(event.currentTarget.value);
        onChange(next > 300 ? "unlimited" : next);
      }}
    />
  );
};
