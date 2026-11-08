// The block menu that opens when a "/" is typed in the paper (App.tsx's `slash-menu`): "블록 추가" and the nine things the
// original offers, narrowed by what is typed after the slash. Arrow keys choose, Enter takes, Escape closes. It stands at the
// caret and never takes the focus from the paper.

import { useEffect, useMemo, useRef, useState } from "react";

import { Box, Button, Floating, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { CaretAnchor } from "../content/caret";
import type { Command, SlashInfo } from "../content/paper";

export type SlashItem = { id: string; label: string; hint: string; key: string; command?: Command; open?: "image" | "math" };

const ITEMS: SlashItem[] = [
  { id: "text", label: "본문", hint: "일반 텍스트", key: "text 본문", command: { type: "block", kind: "p" } },
  { id: "h1", label: "제목 1", hint: "큰 제목", key: "h1 제목", command: { type: "block", kind: "h1" } },
  { id: "h2", label: "제목 2", hint: "소제목", key: "h2 제목", command: { type: "block", kind: "h2" } },
  { id: "list", label: "글머리 목록", hint: "순서 없는 목록", key: "list 목록", command: { type: "list", kind: "bullet" } },
  { id: "todo", label: "체크리스트", hint: "할 일과 기록", key: "todo 체크", command: { type: "list", kind: "task" } },
  { id: "quote", label: "인용", hint: "문장에 다른 목소리", key: "quote 인용", command: { type: "quote" } },
  { id: "table", label: "표", hint: "3 × 3 표", key: "table 표", command: { type: "table" } },
  { id: "image", label: "이미지", hint: "파일에서 가져오기", key: "image 이미지", open: "image" },
  { id: "math", label: "수식", hint: "LaTeX 수식", key: "math 수식", open: "math" },
];

export const SlashMenu = ({ slash, onPick, onDismiss }: { slash: SlashInfo | null; onPick: (item: SlashItem) => void; onDismiss: () => void }) => {
  const anchor = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const items = useMemo(() => ITEMS.filter((item) => item.key.toLowerCase().includes(slash?.filter.toLowerCase() ?? "")), [slash?.filter]);
  const open = slash !== null && items.length > 0;

  useEffect(() => setActive(0), [slash?.filter]);

  // The keys are taken before the paper sees them.
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (!["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(event.key) || event.isComposing) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") onDismiss();
      else if (event.key === "Enter") {
        const item = items[Math.min(active, items.length - 1)];
        if (item) onPick(item);
      } else setActive((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length);
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [open, items, active, onPick, onDismiss]);

  return (
    <>
      <CaretAnchor ref={anchor} left={slash?.left ?? 0} top={slash?.top ?? 0} height={slash ? slash.bottom - slash.top : 0} />
      <Floating open={open} onOpenChange={() => {}}>
        <Floating.Content
          as={Surface}
          fill="raised"
          radius="md"
          padding="xs"
          width="lg"
          maxHeight="xl"
          overflowY="auto"
          anchorRef={anchor}
          placement="bottom start"
          role="listbox"
          dismissable={false}
          keyboardDismissDisabled
          aria-label="블록 추가"
        >
          <Stack gap="xs">
            <Box paddingX="md" paddingY="sm">
              <Text as="span" variant="label" strong={false} ink="tertiary">블록 추가</Text>
            </Box>
            {items.map((item, index) => (
              <Button
                key={item.id}
                variant="ghost"
                size="lg"
                fullWidth
                justify="start"
                selected={index === active}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onPick(item)}
              >
                <Stack as="span" align="start">
                  <Text as="span" ink="inherit">{item.label}</Text>
                  <Text as="span" variant="label" strong={false} ink="tertiary">{item.hint}</Text>
                </Stack>
              </Button>
            ))}
          </Stack>
        </Floating.Content>
      </Floating>
    </>
  );
};
