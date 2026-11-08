// The formatting toolbar, in the original's order and groups: history; paragraph kind, face and size; marks and link;
// alignment and leading; lists and quote; image, table, formula and rule; and at the far end the page options and the zoom.
// A control tells the editor what to do (`run`) or the page what to change (`onSettings`); what the buttons show (bold on, a
// list, a table) is read from the selection.

import { useEffect, useState, type ReactNode } from "react";

import { Box, Button, Divider, Field, Floating, IconButton, Inline, Select, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, type GlyphName } from "../../../kit";
import type { Command, EditorState } from "../content/paper";
import { LEADINGS, SIZES, type FontFace, type Settings } from "../lib/types";
import { PageOptions, ZoomSelect } from "./PageOptions";

// An icon button that can be switched on. The pressed look is Paper's own selected face; IconButton's type does not offer
// `selected` (Button's does), but its body takes it, so it is passed through. The buttons keep the focus where it was: the
// selection in the paper must stay.
const Tool = ({ label, glyph, on, disabled, onPress }: { label: string; glyph: GlyphName; on?: boolean; disabled?: boolean; onPress: () => void }) => {
  const toggle = on === undefined ? {} : { selected: on };
  return (
    <IconButton size="xs" variant="ghost" aria-label={label} title={label} disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={onPress} {...toggle}>
      <Glyph name={glyph} ink={on ? "primary" : "secondary"} />
    </IconButton>
  );
};

const Group = ({ children }: { children: ReactNode }) => <Inline gap="xs" align="center">{children}</Inline>;

// The size of the letters, in points. A number is applied when the field is left or Enter is pressed.
const SizeField = ({ value, onApply }: { value: number; onApply: (text: string) => void }) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  return (
    <Box width="sm">
      <Field
        size="xs"
        type="number"
        min={6}
        max={96}
        step={0.5}
        numeric
        list="paperdown-sizes"
        aria-label="글자 크기"
        value={draft}
        trailing={<Text as="span" variant="caption" ink="tertiary">pt</Text>}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          if (draft !== String(value)) onApply(draft);
        }}
        onKeyDown={(event) => {
          // The key must not go on to the paper, which the change gives the focus to.
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
      <Box as="datalist" id="paperdown-sizes">
        {SIZES.map((size) => <Box as="option" key={size} value={size} />)}
      </Box>
    </Box>
  );
};

export type ToolbarProps = {
  state: EditorState;
  settings: Settings;
  pages: number;
  narrow: boolean;
  run: (command: Command) => void;
  onSettings: (patch: Partial<Settings>) => void;
  onFont: (font: FontFace) => void;
  onSize: (text: string) => void;
  onLink: () => void;
  onImage: () => void;
  onMath: () => void;
};

export const Toolbar = ({ state, settings, pages, narrow, run, onSettings, onFont, onSize, onLink, onImage, onMath }: ToolbarProps) => {
  const font = state.font ?? settings.font;
  const size = state.size ?? settings.sizePt;
  return (
    <Surface as="div" role="toolbar" aria-label="문서 도구 모음" fill="raised" border="bottom" elevation="sticky" top="none" paddingX="xl" paddingY="md">
      <Box overflowX={narrow ? "auto" : undefined}>
        <Inline justify="between" align="center" gap="md" wrap={!narrow} minWidth={narrow ? "max-content" : undefined}>
          <Inline align="stretch" gap="sm" wrap={!narrow}>
            <Group>
              <Tool label="실행 취소 (⌘Z)" glyph="undo-2" disabled={!state.canUndo} onPress={() => run({ type: "undo" })} />
              <Tool label="다시 실행 (⇧⌘Z)" glyph="redo-2" disabled={!state.canRedo} onPress={() => run({ type: "redo" })} />
            </Group>
            <Divider orientation="vertical" />
            <Group>
              <Select size="xs" aria-label="문단 종류" value={state.block} onChange={(event) => run({ type: "block", kind: event.target.value as Extract<Command, { type: "block" }>["kind"] })}>
                <Select.Option value="p">본문</Select.Option>
                <Select.Option value="h1">제목 1</Select.Option>
                <Select.Option value="h2">제목 2</Select.Option>
                <Select.Option value="h3">제목 3</Select.Option>
                <Select.Option value="code">코드 블록</Select.Option>
              </Select>
              <Select size="xs" aria-label="서체" value={font} onChange={(event) => onFont(event.target.value as FontFace)}>
                <Select.Option value="myeongjo">명조</Select.Option>
                <Select.Option value="sans">고딕</Select.Option>
              </Select>
              <SizeField value={size} onApply={onSize} />
            </Group>
            <Divider orientation="vertical" />
            <Group>
              <Tool label="굵게 (⌘B)" glyph="bold" on={state.bold} onPress={() => run({ type: "mark", mark: "bold" })} />
              <Tool label="기울임 (⌘I)" glyph="italic" on={state.italic} onPress={() => run({ type: "mark", mark: "italic" })} />
              <Tool label="취소선" glyph="strikethrough" on={state.strike} onPress={() => run({ type: "mark", mark: "strike" })} />
              <Tool label="강조" glyph="highlighter" on={state.highlight} onPress={() => run({ type: "mark", mark: "highlight" })} />
              <Tool label="인라인 코드" glyph="code-xml" on={state.code} onPress={() => run({ type: "mark", mark: "code" })} />
              <Tool label="링크" glyph="link" on={state.link !== null} onPress={onLink} />
            </Group>
            <Divider orientation="vertical" />
            <Group>
              <Tool label="왼쪽 정렬" glyph="align-left" on={state.align === "left"} onPress={() => run({ type: "align", align: "left" })} />
              <Tool label="가운데 정렬" glyph="align-center" on={state.align === "center"} onPress={() => run({ type: "align", align: "center" })} />
              <Tool label="오른쪽 정렬" glyph="align-right" on={state.align === "right"} onPress={() => run({ type: "align", align: "right" })} />
              <Select size="xs" aria-label="줄 간격" value={String(settings.leading)} onChange={(event) => onSettings({ leading: Number(event.target.value) })}>
                {LEADINGS.map((value) => <Select.Option key={value} value={String(value)}>{`↕ ${value}`}</Select.Option>)}
              </Select>
            </Group>
            <Divider orientation="vertical" />
            <Group>
              <Tool label="글머리 목록" glyph="list" on={state.bullet} onPress={() => run({ type: "list", kind: "bullet" })} />
              <Tool label="번호 목록" glyph="list-ordered" on={state.ordered} onPress={() => run({ type: "list", kind: "ordered" })} />
              <Tool label="체크리스트" glyph="list-todo" on={state.task} onPress={() => run({ type: "list", kind: "task" })} />
              <Tool label="인용" glyph="quote" on={state.quote} onPress={() => run({ type: "quote" })} />
            </Group>
            <Divider orientation="vertical" />
            <Group>
              <Tool label="이미지 넣기" glyph="image-plus" onPress={onImage} />
              <TableMenu inTable={state.table} run={run} />
              <Tool label="수식 넣기" glyph="sigma" onPress={onMath} />
              <Tool label="구분선" glyph="minus" onPress={() => run({ type: "rule" })} />
            </Group>
          </Inline>
          <Inline align="center" gap="sm">
            <PageOptions settings={settings} pages={pages} onChange={onSettings} />
            <ZoomSelect settings={settings} onChange={onSettings} />
          </Inline>
        </Inline>
      </Box>
    </Surface>
  );
};

// The table button: a table is put in; inside one, rows and columns are added and taken away.
const TableMenu = ({ inTable, run }: { inTable: boolean; run: (command: Command) => void }) => {
  const [open, setOpen] = useState(false);
  // The menu does not take the focus, so Escape is heard on the window (the original closes its menus the same way).
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  const item = (label: string, command: Command) => (
    <Button
      key={label}
      variant="ghost"
      size="sm"
      fontSize="body"
      fullWidth
      justify="start"
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        setOpen(false);
        run(command);
      }}
    >
      {label}
    </Button>
  );
  return (
    <Floating open={open} onOpenChange={setOpen}>
      <IconButton as={Floating.Trigger} size="xs" variant="ghost" aria-label="표" title="표" onMouseDown={(event) => event.preventDefault()} {...{ selected: inTable }}>
        <Glyph name="table-2" ink={inTable ? "primary" : "secondary"} />
      </IconButton>
      <Floating.Content as={Surface} fill="raised" radius="md" padding="xs" placement="bottom start" restoreFocus={false} aria-label="표 편집">
        <Stack gap="xs" minWidth="md">
          {inTable ? (
            <>
              {item("아래에 행 추가", { type: "table", op: "row-after" })}
              {item("오른쪽에 열 추가", { type: "table", op: "col-after" })}
              {item("선택 행 삭제", { type: "table", op: "row-delete" })}
              {item("선택 열 삭제", { type: "table", op: "col-delete" })}
              {item("표 삭제", { type: "table", op: "table-delete" })}
            </>
          ) : (
            item("3 × 3 표 넣기", { type: "table" })
          )}
        </Stack>
      </Floating.Content>
    </Floating>
  );
};
