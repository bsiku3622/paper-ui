// SegmentControl — 여럿 중 하나를 한 줄 위에서 고른다. 기간 · 보기처럼 고른 즉시 화면이 바뀌는 자리에 쓴다.
//   variant    track(기본)은 회색 홈 위로 흰 칸이 미끄러진다. outline 은 입력 틀과 같은 흰 틀을 나눔선으로 가르고, 고른 칸에
//              control.chosen 면과 앞 체크를 둔다 — Field · Select 사이(Props 패널 같은 폼)에 놓일 때 같은 가족으로 읽힌다.
//   size       컨트롤 사다리. 트랙이 그 높이이고, 칸은 트랙 안에 한 단계 들어가 앉는다(outline 은 틀 안을 그대로 채운다).
//   fullWidth  주어진 폭을 칸이 같게 나눠 갖는다. 안 주면 글자가 폭을 정한다.
//
// 라디오 묶음이다. 방향키가 고르는 칸을 옮기고, Tab 정지는 하나다. SelectableGroup 이 상태와 aria 를 맡고, 이 Atom 은 트랙과
// 그 위를 미끄러지는 칸만 더한다. 칸의 자리는 고른 항목을 재서 얻으니 글자 폭이 달라도 맞는다.
//
// 예) <SegmentControl aria-label="기간" defaultValue="7d">
//       <SegmentControl.Item value="1d">1일</SegmentControl.Item>
//       <SegmentControl.Item value="7d">7일</SegmentControl.Item>
//     </SegmentControl>

import { createContext, forwardRef, useContext, useRef, type HTMLAttributes, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { useSlidingThumb } from "../internal/measure";
import { useMergedRef } from "../internal/refs";
import { useControllableState } from "../internal/useControllableState";
import { controlClass, type ControlForm } from "../primitives/control/Control";
import { Icon } from "../primitives/Icon";
import { segmentPaint } from "../primitives/paint/recipes.css";
import { trackInset } from "../primitives/paint/Surface.css";
import { Pressable } from "../primitives/press/Pressable";
import { SelectableGroup } from "../primitives/select/SelectableGroup";
import { stateAttributes, stateSelector, type SegmentVariant } from "../tokens";
import { segmentCheck, segmentFull, segmentItem, segmentOutline, segmentOutlineItem, segmentRoot, segmentSettled, segmentThumb } from "./SegmentControl.css";

export type SegmentControlProps = Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "defaultValue" | "onChange" | "dir"> & Pick<ControlForm, "size" | "shape"> & {
  dir?: "ltr" | "rtl";
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: SegmentVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

export type SegmentControlItemProps = Omit<HTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
};

const SELECTED = stateSelector("selected");
// The items draw what their group's variant asks of them: the outlined group's dividers, chosen face and check.
const VariantContext = createContext<SegmentVariant>("track");

const SegmentControlRoot = forwardRef<HTMLDivElement, SegmentControlProps>(function SegmentControl(
  { value, defaultValue, onValueChange, variant = "track", size, shape = "pill", fullWidth, disabled = false, children, className, ...rest },
  ref,
) {
  const [selected, setSelected] = useControllableState<string | null>({ value, defaultValue: defaultValue ?? null, onChange: (next) => { if (next !== null) onValueChange?.(next); } });
  const root = useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(ref, root);
  const thumb = useRef<HTMLSpanElement>(null);
  // The chip is placed again when the variant changes too: back on the track it mounts anew and has no place until it is measured.
  const settled = useSlidingThumb(root, thumb, SELECTED, `${variant}:${String(selected)}`);
  const outlined = variant === "outline";
  return (
    <SelectableGroup
      ref={setRef}
      role="radiogroup"
      selectionRequired
      disabled={disabled}
      selectedValues={selected === null ? [] : [selected]}
      onSelectedValuesChange={([next]: string[]) => { if (next !== undefined) setSelected(next); }}
      currentValue={selected ?? undefined}
      onCurrentValueChange={setSelected}
      className={joinClass(controlClass({ size, anatomy: "segment", shape }), outlined ? joinClass(segmentPaint.outline, segmentOutline) : joinClass(trackInset, segmentPaint.track), segmentRoot, fullWidth && segmentFull, settled && segmentSettled, className)}
      {...stateAttributes({ disabled })}
      {...rest}
    >
      {outlined ? null : <span ref={thumb} aria-hidden className={joinClass(segmentThumb, segmentPaint.thumb)} />}
      <VariantContext.Provider value={variant}>{children}</VariantContext.Provider>
    </SelectableGroup>
  );
});

const SegmentControlItem = forwardRef<HTMLButtonElement, SegmentControlItemProps>(function SegmentControlItem({ className, children, ...rest }, ref) {
  const outlined = useContext(VariantContext) === "outline";
  return (
    <Pressable as={SelectableGroup.Item} ref={ref} role="radio" className={joinClass(segmentItem, segmentPaint.item, outlined && joinClass(segmentOutlineItem, segmentPaint.outlineItem), className)} {...rest}>
      {outlined ? <Icon className={segmentCheck}><path d="M20 6 9 17l-5-5" /></Icon> : null}
      {children}
    </Pressable>
  );
});

export const SegmentControl = Object.assign(SegmentControlRoot, { Item: SegmentControlItem });
