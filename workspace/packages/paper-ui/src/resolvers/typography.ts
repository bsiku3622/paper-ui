import type { ControlSize } from "../tokens";
import { controlTypography } from "../styles/typography.css";

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
