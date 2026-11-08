import { formatNumber } from "../../../kit";
import { quadPixels } from "./geometry";
import type { Fit, Page, Quad, RatioChoice } from "./types";

const UNSURE_BELOW = 0.65;

export const activeFit = (page: Page): Fit | null => (page.settings.align && page.aligned ? page.aligned : page.fit);

export const isReady = (page: Page) => page.status === "ready" && page.fit !== null;

export const isFlagged = (page: Page) => page.status === "failed" || page.fit?.origin === "none";

export const isUnsure = (page: Page) => {
  const fit = activeFit(page);
  return fit !== null && fit.origin === "auto" && fit.lines !== "ruled" && fit.confidence < UNSURE_BELOW;
};

export const hasSheet = (page: Page) => page.fit?.kind === "sheet" && page.fit.origin !== "none";

export const headingOf = (page: Page): string => {
  const fit = activeFit(page);
  if (page.status !== "ready" || !fit) return page.status === "failed" ? "열지 못했습니다" : "처리하고 있습니다";
  if (fit.origin === "none") return "종이를 찾지 못했습니다";
  if (isUnsure(page)) return "확인이 필요합니다";
  if (fit.origin === "manual") return "직접 맞췄습니다";
  const aligned = Boolean(page.settings.align && page.aligned);
  if (hasSheet(page)) return aligned ? (fit.lines === "ruled" ? "줄에 맞춰 폈습니다" : "격자에 맞춰 폈습니다") : "종이를 찾았습니다";
  return fit.lines === "ruled" ? "줄에 맞춰 폈습니다" : "격자를 찾았습니다";
};

type PaperRatio = { ratio: number; label: string };

const STANDARD = [
  { long: Math.SQRT2, tolerance: 0.045, label: "A 용지" },
  { long: 11 / 8.5, tolerance: 0.02, label: "Letter" },
];

const snapRatio = (ratio: number): PaperRatio => {
  const portrait = ratio < 1;
  const long = portrait ? 1 / ratio : ratio;
  for (const paper of STANDARD) {
    if (Math.abs(long / paper.long - 1) <= paper.tolerance) return { ratio: portrait ? 1 / paper.long : paper.long, label: paper.label };
  }
  return { ratio, label: `1:${long.toFixed(2)}` };
};

const CHOICES: Record<Exclude<RatioChoice, "auto">, PaperRatio> = {
  a: { ratio: Math.SQRT2, label: "A 용지" },
  letter: { ratio: 11 / 8.5, label: "Letter" },
  square: { ratio: 1, label: "정사각형" },
};

export const resolveRatio = (measured: number, choice: RatioChoice): PaperRatio => {
  if (choice === "auto") return snapRatio(measured);
  const { ratio, label } = CHOICES[choice];
  return { ratio: measured < 1 ? 1 / ratio : ratio, label };
};

export const TRIM = 0.03;

export const isTrimmed = (page: Page) => {
  const fit = activeFit(page);
  return fit !== null && fit.kind === "grid" && !fit.rect && page.settings.crop;
};

export type Output = {
  width: number;
  height: number;
  pageRatio: number;
  shownRatio: number;
  label: string;
  quad: Quad;
};

const shrink = (quad: Quad, by: number): Quad => {
  const cx = quad.reduce((sum, p) => sum + p.x, 0) / 4;
  const cy = quad.reduce((sum, p) => sum + p.y, 0) / 4;
  return quad.map((p) => ({ x: cx + (p.x - cx) * (1 - by), y: cy + (p.y - cy) * (1 - by) })) as Quad;
};

export const outputOf = (page: Page): Output | null => {
  const fit = activeFit(page);
  if (!fit) return null;
  const trimmed = isTrimmed(page);
  const quad = trimmed ? shrink(fit.quad, TRIM * 2) : fit.quad;
  let width: number;
  let height: number;
  let label = "";
  if (fit.kind === "sheet") {
    const { ratio, label: name } = resolveRatio(fit.ratio ?? 1, page.settings.ratio);
    const area = quadPixels(fit.quad, page.photo.width, page.photo.height);
    height = Math.sqrt(area / ratio);
    width = height * ratio;
    label = name;
  } else {
    const keep = trimmed ? 1 - TRIM * 2 : 1;
    width = (fit.cols ?? 1) * fit.pxPerCell * keep;
    height = (fit.rows ?? 1) * fit.pxPerCell * keep;
  }
  const sideways = page.settings.rotation % 2 !== 0;
  return {
    width: Math.round(sideways ? height : width),
    height: Math.round(sideways ? width : height),
    pageRatio: width / height,
    shownRatio: sideways ? height / width : width / height,
    label,
    quad,
  };
};

export const sizeLine = (page: Page): string => {
  const out = outputOf(page);
  const fit = activeFit(page);
  if (!out || !fit) return "";
  const size = `${formatNumber(out.width)} × ${formatNumber(out.height)} px`;
  if (fit.kind === "sheet") return `${size} · ${out.label}`;
  if (fit.lines === "ruled") return `${size} · 줄 간격 ${formatNumber(fit.pxPerCell)} px`;
  if (fit.rect) return `${size} · 칸당 ${formatNumber(fit.pxPerCell)} px`;
  const cells = `${fit.cols ?? 1} × ${fit.rows ?? 1}칸, 칸당 ${formatNumber(fit.pxPerCell)} px`;
  return `${size} · ${cells}${fit.origin === "auto" && fit.residual !== undefined ? ` · 오차 ${fit.residual.toFixed(1)} px` : ""}`;
};

export const pdfBytes = (pages: readonly Page[]) =>
  pages.reduce((sum, page) => {
    const out = outputOf(page);
    return sum + (out ? Math.min(out.width * out.height, 3508 * 2480) * 0.11 : 0);
  }, 0);
