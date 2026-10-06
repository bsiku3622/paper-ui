import type { ControlSize } from "../tokens";
import { controlTypography } from "../styles/typography.css";

export function resolveControlTypography(role: "button", size: ControlSize, emphasis: "regular" | "strong"): string;
export function resolveControlTypography(role: "field" | "textarea", size: ControlSize): string;
export function resolveControlTypography(role: "badge"): string;
export function resolveControlTypography(role: "navigation", state: "regular" | "active"): string;
export function resolveControlTypography(role: "navigation", state: "groupLabel"): string;
export function resolveControlTypography(role: "tooltip", state: "regular"): string;
export function resolveControlTypography(
  role: keyof typeof controlTypography,
  sizeOrState?: ControlSize | "regular" | "active" | "groupLabel",
  emphasis?: "regular" | "strong",
): string {
  if (role === "badge") return controlTypography.badge;
  if (role === "button") return controlTypography.button[emphasis ?? "regular"][sizeOrState as ControlSize];
  if (role === "navigation") return controlTypography.navigation[sizeOrState as keyof typeof controlTypography.navigation];
  if (role === "tooltip") return controlTypography.tooltip.regular;
  return controlTypography[role][sizeOrState as ControlSize];
}
