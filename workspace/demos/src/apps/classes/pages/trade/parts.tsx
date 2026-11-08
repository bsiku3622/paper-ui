// Small pieces the parts of the 수강 정정 page share: the dot that ties a row to the colour of its cells, a section written
// out, and the button that copies a post.

import { Badge, Button } from "@studio-baeks/paper-ui";
import type { Accent } from "@studio-baeks/paper-ui/tokens";

import { Glyph, useToast } from "../../../../kit";
import type { SectionInfo } from "../../lib/trade";
import { formatTimes, sectionNumber } from "../../lib/utils";
import type { TradeModel } from "./model";

// "2분반 · 윤다인 · 화4, 수9, 목6"
export const sectionText = (section: SectionInfo, withTeacher = true) => [`${sectionNumber(section.section)}분반`, withTeacher ? section.teacher : "", formatTimes(section.times)].filter(Boolean).join(" · ");

// What a subject means in the grid at this moment: the colour its cells wear, or nothing.
export const markOf = (model: TradeModel, subject: string): { accent: Accent; label: string } | null => {
  const { planned } = model;
  if (planned.conflicting.has(subject)) return { accent: "warning", label: "시간이 겹칩니다" };
  if (planned.moved.has(subject)) return { accent: "info", label: "분반을 옮깁니다" };
  if (planned.entering.has(subject)) return { accent: "success", label: "새로 들어옵니다" };
  return null;
};

export const MarkDot = ({ model, subject }: { model: TradeModel; subject: string }) => {
  const mark = markOf(model, subject);
  return mark ? <Badge dot variant="soft" size="xs" accent={mark.accent} aria-label={mark.label} /> : null;
};

// Copies a post for a swap, and says whether it worked.
export const CopyPost = ({ text, label = "구인 글 복사", size = "sm" }: { text: string; label?: string; size?: "xs" | "sm" }) => {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast("구인 글을 복사했습니다");
    } catch {
      toast("복사하지 못했습니다. 글을 직접 선택해 복사해 주세요", { tone: "error" });
    }
  };
  return (
    <Button variant="hairline" size={size} onClick={copy}>
      <Glyph name="copy" />
      {label}
    </Button>
  );
};
