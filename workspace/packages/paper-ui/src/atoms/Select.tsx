// Select — 여럿 중 하나를 고르는 칸이고, 펼친 목록까지 Paper 가 그린다.
//
// 틀(inputFrame)은 Field · Textarea 와 같은 입력 틀이다. 그 안의 버튼(role=combobox)이 고른 값을 보이고, 누르면 틀 아래로 목록
// (Floating, role=listbox)이 열린다. 포커스는 버튼에 머물고, 목록에서 가리키는 항목은 aria-activedescendant 가 말한다 — studio-ui 의
// Select 와 같은 구조다. ↑↓ · Home/End · PageUp/PageDown 이 가리키는 항목을 옮기고, Enter · Space 가 고르고, Esc 가 닫고, Tab 은
// 고르지 않고 닫기만 하며, 글자를 치면 그 글자로 시작하는 항목으로 간다. 고를 수 없는 항목은 건너뛴다.
//
// 폼과 이미 쓰던 코드는 보이지 않는 native select 가 맡는다. Option · Group 은 그 안에 예전처럼 그려지고, 목록에서 고르면 그 select 의
// 값이 바뀌며 native change 이벤트가 난다 — name · required · form · reset · FormData, onChange 의 e.currentTarget.value, ref 가 모두
// 예전과 같다. status 는 Field 와 같은 축이다(error 는 aria-invalid 도). 여러 개 고르기(multiple)는 없다.

import {
  Children,
  Fragment,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type CSSProperties,
  type FocusEvent,
  type ForwardedRef,
  type KeyboardEvent,
  type MouseEvent,
  type OptgroupHTMLAttributes,
  type OptionHTMLAttributes,
  type PointerEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

import { joinClass } from "../internal/joinClass";
import { useMergedRef } from "../internal/refs";
import { bareButton } from "../primitives/bare-button.css";
import { composeEventHandlers } from "../primitives/composition";
import { controlClass, type ControlForm } from "../primitives/control/Control";
import { controlSize } from "../primitives/control/Control.css";
import { Floating, useFloatingContentId } from "../primitives/float/Floating";
import { Icon } from "../primitives/Icon";
import { selectArrowPaint, selectCheckPaint, selectEmptyPaint, selectOptionPaint } from "../primitives/paint/recipes.css";
import { surfaceClass } from "../primitives/paint/Surface";
import { Text } from "../primitives/Text";
import { stateAttributes } from "../tokens";
import { inputFrameClass, useInputControl, type InputFrameProps } from "./input-control";
import * as styles from "./Select.css";

const useIsomorphicLayoutEffect = typeof document === "undefined" ? useEffect : useLayoutEffect;

// className/style/data-testid target the visible wrapper; ref and the form's attributes target the native select; the rest, and the
// handlers, the button that stands for it.
export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children" | "size" | "multiple" | "style"> & InputFrameProps & Pick<ControlForm, "shape"> & {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  "data-testid"?: string;
};

export type SelectOptionProps = Omit<OptionHTMLAttributes<HTMLOptionElement>, "children"> & {
  children: string | number;
};

export type SelectGroupProps = Omit<OptgroupHTMLAttributes<HTMLOptGroupElement>, "children"> & {
  label: string;
  children: ReactNode;
};

// An Option and a Group are what they always were inside the native select. The list reads them from there.
const SelectOption = forwardRef<HTMLOptionElement, SelectOptionProps>(function SelectOption({ children, ...rest }, ref) {
  return <option ref={ref} {...rest}>{children}</option>;
});

const SelectGroup = forwardRef<HTMLOptGroupElement, SelectGroupProps>(function SelectGroup({ children, ...rest }, ref) {
  return <optgroup ref={ref} {...rest}>{children}</optgroup>;
});

type SelectItem = { index: number; value: string; label: string; disabled: boolean };
type SelectEntry = { kind: "option"; item: SelectItem } | { kind: "group"; label: string; items: SelectItem[] };

// The choices, read the way a native select reads them: an Option with no value is worth its words, and a disabled Group disables
// what is in it. Fragments and arrays are read through; anything else is not a choice.
function collect(children: ReactNode, items: SelectItem[], disabled: boolean): SelectEntry[] {
  const entries: SelectEntry[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Fragment) {
      entries.push(...collect((child.props as { children?: ReactNode }).children, items, disabled));
    } else if (child.type === SelectOption) {
      const props = child.props as SelectOptionProps;
      const item: SelectItem = { index: items.length, value: String(props.value ?? props.children), label: String(props.children), disabled: disabled || props.disabled === true };
      items.push(item);
      entries.push({ kind: "option", item });
    } else if (child.type === SelectGroup) {
      const props = child.props as SelectGroupProps;
      const inner = collect(props.children, items, disabled || props.disabled === true);
      entries.push({ kind: "group", label: props.label, items: inner.flatMap((entry) => (entry.kind === "option" ? [entry.item] : entry.items)) });
    }
  });
  return entries;
}

// A pause this long starts a new word; quicker keys go on with the word being typed (ms).
const TYPEAHEAD_PAUSE = 500;
// How many options PageUp and PageDown pass over.
const PAGE = 10;

type SelectBodyProps = SelectProps & { isOpen: boolean; setOpen: (open: boolean) => void; forwardedRef: ForwardedRef<HTMLSelectElement> };

function SelectBody({ isOpen, setOpen, forwardedRef, children, status, size = "md", fill, variant, shadow, fontSize, shape, className, style, "data-testid": testid, ...rest }: SelectBodyProps) {
  const { inputProps, frameProps, isDisabled } = useInputControl(rest, { status });
  const { name, form, value, defaultValue, onChange, onInput, onInvalid, autoComplete, required, ...buttonProps } = inputProps;
  // The handlers the caller wrote for the select run on the button that stands for it; its disabled is the one the frame shows.
  const triggerProps = buttonProps as ButtonHTMLAttributes<HTMLButtonElement>;

  const items: SelectItem[] = [];
  const entries = collect(children, items, false);

  const frameRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nativeRef = useRef<HTMLSelectElement>(null);
  const setNativeRef = useMergedRef(forwardedRef, nativeRef);
  const listboxId = useFloatingContentId();
  const baseId = useId();
  const optionId = (index: number) => `${baseId}-option-${index}`;
  const optionIds = items.map((item) => optionId(item.index));

  // The value. A controlled one is what the caller says; an uncontrolled one is what the native select holds, read when it changes,
  // when its form resets, and once at the start: with no default, that is the browser's own choice, the first option that can be chosen.
  const isControlled = value !== undefined;
  const [observed, setObserved] = useState<string | undefined>(defaultValue === undefined ? undefined : String(defaultValue));
  useIsomorphicLayoutEffect(() => {
    if (!isControlled && nativeRef.current) setObserved(nativeRef.current.value);
  }, [isControlled]);
  useEffect(() => {
    const owner = nativeRef.current?.form;
    if (isControlled || !owner) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // A form resets its controls after its reset event, so the value is read once that has happened.
    const onReset = () => {
      timer = setTimeout(() => setObserved(nativeRef.current?.value));
    };
    owner.addEventListener("reset", onReset);
    return () => {
      owner.removeEventListener("reset", onReset);
      clearTimeout(timer);
    };
  }, [isControlled]);
  const current = isControlled ? String(value) : observed;
  const chosen = items.findIndex((item) => item.value === current);

  const onNativeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!isControlled) setObserved(event.currentTarget.value);
    onChange?.(event);
  };

  // The option the list points at: where the keys move and what Enter chooses.
  const [active, setActive] = useState(-1);
  const [listLabel, setListLabel] = useState<string | undefined>(undefined);
  const usable = (index: number) => items[index] !== undefined && !items[index].disabled;
  const seek = (from: number, step: 1 | -1) => {
    for (let index = from; index >= 0 && index < items.length; index += step) if (usable(index)) return index;
    return -1;
  };
  const first = () => seek(0, 1);
  const last = () => seek(items.length - 1, -1);
  const resting = () => (usable(chosen) ? chosen : first());
  const page = (step: 1 | -1) => {
    const found = seek(Math.max(0, Math.min(items.length - 1, active + step * PAGE)), step === 1 ? -1 : 1);
    return found >= 0 && (found - active) * step > 0 ? found : active;
  };

  const open = (index: number) => {
    setActive(index);
    // The list is named as the select is: its own words, or the label that names the button.
    setListLabel(triggerProps["aria-label"] ?? triggerRef.current?.labels?.[0]?.textContent ?? undefined);
    setOpen(true);
  };
  const close = () => setOpen(false);
  useEffect(() => {
    if (isDisabled) setOpen(false);
  }, [isDisabled, setOpen]);

  // Choosing writes the native select and lets it say so, as a native pick does: input, then change. The same option again says nothing.
  const commit = (index: number) => {
    const item = items[index];
    if (item?.disabled) return;
    close();
    const select = nativeRef.current;
    if (!select || !item || select.value === item.value) return;
    select.value = item.value;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };

  // Typing a word goes to the next option that starts with it. The same letter again steps through the options that start with it.
  const typed = useRef<{ text: string; timer?: ReturnType<typeof setTimeout> }>({ text: "" });
  useEffect(() => {
    const state = typed.current;
    return () => clearTimeout(state.timer);
  }, []);
  const typeahead = (key: string, from: number) => {
    const state = typed.current;
    clearTimeout(state.timer);
    state.text += key.toLocaleLowerCase();
    state.timer = setTimeout(() => {
      state.text = "";
    }, TYPEAHEAD_PAUSE);
    const text = state.text;
    const repeated = [...text].every((char) => char === text[0]);
    const query = repeated ? text.slice(0, 1) : text;
    const start = repeated ? from + 1 : Math.max(from, 0);
    for (let offset = 0; offset < items.length; offset += 1) {
      const index = (start + offset) % items.length;
      if (usable(index) && items[index]!.label.toLocaleLowerCase().startsWith(query)) return index;
    }
    return -1;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;
    const { key } = event;
    const typing = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    if (!isOpen) {
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") open(resting());
      else if (key === "Home") open(first());
      else if (key === "End") open(last());
      else if (typing) {
        const found = typeahead(key, chosen);
        open(found >= 0 ? found : resting());
      } else return;
      event.preventDefault();
      return;
    }
    if (key === "Tab") {
      // Tab leaves without choosing, and the focus moves on as it would.
      close();
      return;
    }
    if (key === "Escape") {
      // Escape closes the list, and not the dialog the Select may stand in.
      event.stopPropagation();
      close();
    } else if (key === "Enter" || (key === " " && typed.current.text === "") || (key === "ArrowUp" && event.altKey)) commit(active);
    else if (key === "ArrowDown") setActive(seek(active + 1, 1) >= 0 ? seek(active + 1, 1) : active);
    else if (key === "ArrowUp") setActive(seek(active - 1, -1) >= 0 ? seek(active - 1, -1) : active);
    else if (key === "Home") setActive(first());
    else if (key === "End") setActive(last());
    else if (key === "PageDown") setActive(page(1));
    else if (key === "PageUp") setActive(page(-1));
    else if (typing) {
      const found = typeahead(key, active);
      if (found >= 0) setActive(found);
    } else return;
    event.preventDefault();
  };
  // Enter and Space are handled as keys, so the click a button makes of them on its own is turned away.
  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") event.preventDefault();
  };
  const onTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Safari leaves a clicked button unfocused, and the keys that follow belong to it.
    event.currentTarget.focus({ preventScroll: true });
    if (isOpen) close();
    else open(resting());
  };
  // Focus that leaves for anything but the list closes it.
  const onTriggerBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const next = event.relatedTarget;
    if (isOpen && !(next instanceof Node && document.getElementById(listboxId)?.contains(next))) close();
  };

  // The list is one target for the pointer: a press keeps the focus on the button, and the option under the pointer is the one pointed at.
  const optionAt = (target: EventTarget | null) => {
    const option = target instanceof Element ? target.closest('[role="option"]') : null;
    return option ? optionIds.indexOf(option.id) : -1;
  };
  const onListMouseDown = (event: MouseEvent<HTMLDivElement>) => event.preventDefault();
  const onListClick = (event: MouseEvent<HTMLDivElement>) => {
    const index = optionAt(event.target);
    if (index >= 0) commit(index);
  };
  const onListPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const index = optionAt(event.target);
    if (index >= 0 && index !== active && usable(index)) setActive(index);
  };

  // The option pointed at is kept in sight. The panel takes its height from where it is placed, which can come a frame after it opens.
  useEffect(() => {
    if (!isOpen || active < 0) return;
    const reveal = () => {
      const list = document.getElementById(listboxId);
      const option = document.getElementById(`${baseId}-option-${active}`);
      if (!list || !option) return;
      if (option.offsetTop < list.scrollTop) list.scrollTop = option.offsetTop;
      else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
    };
    reveal();
    const frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [isOpen, active, listboxId, baseId]);

  const optionRow = controlClass({ size, anatomy: "input", fontSize });
  const renderOption = (item: SelectItem) => {
    const isChosen = item.index === chosen;
    return (
      <div
        key={item.index}
        id={optionId(item.index)}
        role="option"
        aria-selected={isChosen}
        aria-disabled={item.disabled || undefined}
        {...stateAttributes({ focused: item.index === active, selected: isChosen, disabled: item.disabled })}
        className={joinClass(optionRow, styles.selectOption, selectOptionPaint)}
      >
        {/* The check leads the chosen option; the others keep its room empty, so every option's words start on one line. */}
        {isChosen ? <Icon className={joinClass(styles.selectCheck, selectCheckPaint)}><path d="M20 6 9 17l-5-5" /></Icon> : <span aria-hidden className={styles.selectCheck} />}
        <span className={styles.selectOptionLabel}>{item.label}</span>
      </div>
    );
  };

  return (
    <>
      <span
        ref={frameRef}
        style={style}
        data-testid={testid}
        className={joinClass(inputFrameClass({ size, anatomy: "frame", shape, fontSize, fill, variant, shadow }), selectEmptyPaint, styles.selectWrap, className)}
        {...frameProps}
      >
        <button
          {...triggerProps}
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          aria-activedescendant={isOpen && active >= 0 ? optionId(active) : undefined}
          aria-required={required ? true : undefined}
          disabled={isDisabled}
          className={joinClass(bareButton, styles.selectTrigger)}
          onClick={composeEventHandlers(triggerProps.onClick, onTriggerClick)}
          onKeyDown={composeEventHandlers(triggerProps.onKeyDown, onKeyDown)}
          onKeyUp={composeEventHandlers(triggerProps.onKeyUp, onKeyUp)}
          onBlur={composeEventHandlers(triggerProps.onBlur, onTriggerBlur)}
        >
          <span className={styles.selectValue}>
            {items.map((item) => (item.index === chosen
              ? <span key={item.index} className={styles.selectLabel}>{item.label}</span>
              // The other options give the value its width and nothing else: their words are drawn, unseen, from an attribute, so the
              // button's text is the chosen option alone.
              : <span key={item.index} aria-hidden data-label={item.label} className={joinClass(styles.selectLabel, styles.selectSizer)} />))}
          </span>
        </button>
        <Icon className={joinClass(styles.selectArrow, selectArrowPaint)}><path d="m6 9 6 6 6-6" /></Icon>
        <select
          ref={setNativeRef}
          aria-hidden
          tabIndex={-1}
          className={styles.selectNative}
          name={name}
          form={form}
          required={required}
          disabled={isDisabled}
          autoComplete={autoComplete}
          {...(isControlled ? { value } : { defaultValue })}
          onChange={onNativeChange}
          onInput={onInput}
          onInvalid={onInvalid}
          // Whatever sends the focus here (a form pointing at a missing value) finds the button instead.
          onFocus={() => triggerRef.current?.focus()}
        >
          {children}
        </select>
      </span>
      <Floating.Content
        role="listbox"
        anchorRef={frameRef}
        fitAnchor
        offset="xs"
        aria-labelledby={triggerProps["aria-labelledby"]}
        aria-label={triggerProps["aria-labelledby"] ? undefined : listLabel}
        className={joinClass(surfaceClass({ fill: "raised" }), controlSize[size], styles.selectListbox)}
        onMouseDown={onListMouseDown}
        onClick={onListClick}
        onPointerMove={onListPointerMove}
      >
        {entries.map((entry, position) => {
          if (entry.kind === "option") return renderOption(entry.item);
          const labelId = `${baseId}-group-${position}`;
          return (
            <div key={labelId} role="presentation">
              <Text as="div" id={labelId} variant="caption" ink="tertiary" className={styles.selectGroupLabel}>{entry.label}</Text>
              <div role="group" aria-labelledby={labelId}>{entry.items.map(renderOption)}</div>
            </div>
          );
        })}
      </Floating.Content>
    </>
  );
}

const SelectRoot = forwardRef<HTMLSelectElement, SelectProps>(function SelectRoot(props, ref) {
  const [isOpen, setOpen] = useState(false);
  return (
    <Floating open={isOpen} onOpenChange={setOpen}>
      <SelectBody {...props} isOpen={isOpen} setOpen={setOpen} forwardedRef={ref} />
    </Floating>
  );
});

export const Select = Object.assign(SelectRoot, { Option: SelectOption, Group: SelectGroup });
