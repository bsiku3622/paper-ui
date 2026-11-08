import { Glyph } from "../../../kit";
import type { JobStatus } from "../data/history";

export const JOB_LABEL: Record<JobStatus, string> = {
  completed: "완료",
  cancelled: "취소",
  in_progress: "진행 중",
  klippy_shutdown: "Klipper 종료",
};

const GLYPH = { completed: "circle-check", cancelled: "circle-x", in_progress: "clock", klippy_shutdown: "triangle-alert" } as const;
const INK = { completed: "success", cancelled: "error", in_progress: "info", klippy_shutdown: "warning" } as const;

export const JobGlyph = ({ status, label = true }: { status: JobStatus; label?: boolean }) => (
  <Glyph name={GLYPH[status]} ink={INK[status]} label={label ? JOB_LABEL[status] : undefined} />
);
