import { joinClass } from "../internal/joinClass";
import { controlTypography, textMonoClass, textRoleClass } from "../styles/typography.css";
import type { ControlSize, Ink, TextFamily, TextVariant } from "../tokens";
import { resolveInk } from "./color";

export const resolveText = ({ variant = "body", family = "sans", ink }: { variant?: TextVariant; family?: TextFamily; ink?: Ink }): string =>
  joinClass(textRoleClass[variant], family === "mono" && textMonoClass[variant], resolveInk(ink));

export function resolveControlTypography(role: "button", size: ControlSize, emphasis: "regular" | "strong"): string;
export function resolveControlTypography(role: "field" | "textarea", size: ControlSize): string;
export function resolveControlTypography(role: "badge"): string;
export function resolveControlTypography(
  role: keyof typeof controlTypography,
  sizeOrState?: ControlSize | "regular" | "active" | "groupLabel",
  emphasis?: "regular" | "strong",
): string {
  if (role === "badge") return controlTypography.badge;
  if (role === "button") return controlTypography.button[emphasis ?? "regular"][sizeOrState as ControlSize];
  return controlTypography[role][sizeOrState as ControlSize];
}
