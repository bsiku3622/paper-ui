import { createContext, forwardRef, useContext, useRef, type HTMLAttributes, type ReactNode } from "react";

import { joinClass } from "../internal/joinClass";
import { useSlidingThumb } from "../internal/measure";
import { useMergedRef } from "../internal/refs";
import { useControllableState } from "../internal/useControllableState";
import { controlClass, type ControlForm } from "../primitives/control/Control";
import { useControlShape } from "../primitives/control/shape";
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
const VariantContext = createContext<SegmentVariant>("track");

const SegmentControlRoot = forwardRef<HTMLDivElement, SegmentControlProps>(function SegmentControl(
  { value, defaultValue, onValueChange, variant = "track", size, shape: givenShape, fullWidth, disabled = false, children, className, ...rest },
  ref,
) {
  const [selected, setSelected] = useControllableState<string | null>({ value, defaultValue: defaultValue ?? null, onChange: (next) => { if (next !== null) onValueChange?.(next); } });
  const shape = useControlShape(givenShape, "pill");
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
