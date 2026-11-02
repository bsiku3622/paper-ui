import { joinClass } from "../internal/joinClass";
import { controlFontSizeClass, plainWeightClass, presetClass, textMonoClass, textNumericClass, textRoleClass, textStrongClass, textTruncateClass } from "../styles/typography.css";
import { TEXT_INK, type ControlFontSize, type ControlSize, type Ink, type TextFamily, type TextVariant } from "../tokens";
import { resolveInk } from "./color";

type TextOptions = { variant?: TextVariant; family?: TextFamily; ink?: Ink; numeric?: boolean; strong?: boolean; truncate?: boolean };

// 역할 class, mono 모디파이어, 잉크(생략하면 역할의 기본 잉크), 숫자 표기, 강조, 말줄임.
export const resolveText = ({ variant = "body", family = "sans", ink, numeric, strong, truncate }: TextOptions): string =>
  joinClass(textRoleClass[variant], family === "mono" && textMonoClass[variant], resolveInk(ink ?? TEXT_INK[variant]), numeric && textNumericClass, strong === true && textStrongClass[variant], strong === false && plainWeightClass, truncate && textTruncateClass);

export function resolvePreset(preset: "button" | "field" | "textarea", size: ControlSize): string;
export function resolvePreset(preset: "badge"): string;
export function resolvePreset(preset: "button" | "field" | "textarea" | "badge", size?: ControlSize): string {
  if (preset === "badge") return presetClass.badge;
  return presetClass[preset][size!];
}

export const resolveControlFontSize = (fontSize: ControlFontSize | undefined): string => (fontSize ? controlFontSizeClass[fontSize] : "");

// 컨트롤의 preset 은 이미 강조된 굵기라 false 만 뜻이 있다.
export const resolveControlStrong = (strong: boolean | undefined): string => (strong === false ? plainWeightClass : "");
