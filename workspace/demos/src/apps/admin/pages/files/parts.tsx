// What the files screens say about a file the same way everywhere: its state, its limits, its kind.

import { Badge } from "@studio-baeks/paper-ui";

import type { GlyphName } from "../../../../kit";
import { fileKind } from "../../data/files";
import type { AdminFile } from "../../data/types";
import { remaining } from "../../lib/format";

export const StateBadge = ({ file }: { file: AdminFile }) => {
  if (file.state === "expired") return <Badge>만료됨</Badge>;
  if (file.state === "exhausted") return <Badge>횟수 소진</Badge>;
  if (file.locked) return <Badge accent="warning">비밀번호</Badge>;
  return <Badge>공개</Badge>;
};

export const expiryText = (file: AdminFile) => (file.expiresAt === null ? "만료 없음" : remaining(file.expiresAt));
export const downloadText = (file: AdminFile) => (file.maxDownloads === null ? `${file.downloadCount}회 받아감` : `${file.downloadCount} / ${file.maxDownloads}회`);
export const limitText = (file: AdminFile) => `${expiryText(file)} · ${downloadText(file)}`;

export const glyphOf = (name: string): GlyphName => {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mov", "webm"].includes(extension)) return "file-video";
  if (["mp3", "m4a", "wav"].includes(extension)) return "file-audio";
  const kind = fileKind(name);
  return kind === "archive" ? "file-archive" : kind === "image" ? "file-image" : kind === "document" ? "file-text" : "file";
};
