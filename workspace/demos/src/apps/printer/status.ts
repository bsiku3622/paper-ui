import type { Accent } from "@studio-baeks/paper-ui/tokens";

import type { PrintState, SimState } from "./model";
import type { EstimateMethod } from "./settings";
import { estimates } from "./sim/engine";

export const STATE_LABEL: Record<PrintState, string> = {
  standby: "대기 중",
  printing: "출력 중",
  paused: "일시 정지",
  complete: "출력 완료",
  cancelled: "취소됨",
  error: "오류",
};

export const STATE_ACCENT: Record<PrintState, Accent> = {
  standby: "primary",
  printing: "info",
  paused: "warning",
  complete: "success",
  cancelled: "error",
  error: "error",
};

export const remainingBy = (s: SimState, method: EstimateMethod): number => {
  const all = estimates(s);
  if (method === "file") return all.file;
  if (method === "filament") return all.filament ?? all.file;
  if (method === "slicer") return all.slicer ?? all.file;
  const known = [all.file, all.filament, all.slicer].filter((value): value is number => value !== null);
  return known.reduce((sum, value) => sum + value, 0) / known.length;
};
