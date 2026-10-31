import { joinClass } from "../internal/joinClass";
import { controlFontSizeClass, presetClass, textMonoClass, textNumericClass, textRoleClass } from "../styles/typography.css";
import { TEXT_INK, type ButtonWeight, type ControlFontSize, type ControlSize, type Ink, type TextFamily, type TextVariant } from "../tokens";
import { resolveInk } from "./color";

type TextOptions = { variant?: TextVariant; family?: TextFamily; ink?: Ink; numeric?: boolean };

// 역할 class, mono 모디파이어, 잉크(생략하면 역할의 기본 잉크), 숫자 표기.
export const resolveText = ({ variant = "body", family = "sans", ink, numeric }: TextOptions): string =>
  joinClass(textRoleClass[variant], family === "mono" && textMonoClass[variant], resolveInk(ink ?? TEXT_INK[variant]), numeric && textNumericClass);

export function resolvePreset(preset: "button", size: ControlSize, weight: ButtonWeight): string;
export function resolvePreset(preset: "field" | "textarea", size: ControlSize): string;
export function resolvePreset(preset: "badge"): string;
export function resolvePreset(preset: "button" | "field" | "textarea" | "badge", size?: ControlSize, weight?: ButtonWeight): string {
  if (preset === "badge") return presetClass.badge;
  if (preset === "button") return presetClass.button[weight!][size!];
  return presetClass[preset][size!];
}

export const resolveControlFontSize = (fontSize: ControlFontSize | undefined): string => (fontSize ? controlFontSizeClass[fontSize] : "");
