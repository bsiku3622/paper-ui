// Compile-time guards on the types the Interaction and A11y primitives publish (tsc checks them; an unused
// expect-error directive is a type that accepts what it must reject), and the runtime guard that React Aria stays
// behind src/internal/aria.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { ComponentProps } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";

import { INVENTORY } from "./inventory";
import type { Space } from "./tokens";

import {
  Floating, VisuallyHidden, useDraggable, useDroppable, useFloating, useFloatingContext, useFocusRing, useFocusWithin, useFormField, useFormFieldControl, usePressable, useRovingFocusItem, useSelectable, useSelectableGroup,
  type DraggableProps, type DraggableResult, type DraggableState, type DroppableProps, type DroppableResult, type DroppableState, type FloatingContentProps, type FloatingContentState, type FloatingModalProps, type FloatingPopoverProps, type FloatingPresentation, type FloatingResult, type FocusRingResult, type FocusWithinResult, type FormFieldControlResult, type FormFieldResult, type PressEvent, type PressableOptions,
  type FormFieldProps, type FormFieldState, type PressableProps, type PressableResult, type PressableState, type RovingFocusItemResult, type RovingFocusProps, type RovingFocusState, type SelectableGroupProps,
  type SelectableGroupResult, type SelectableGroupState, type SelectableProps, type SelectableResult, type SelectableState,
} from "./index";

// The hooks are called only to be type-checked, never run.
const typeOnly = (check: () => void): void => void check;

describe("public types", () => {
  it("[primitives.aria.boundary] declares the press options by Paper's names", () => {
    expectTypeOf(usePressable).parameters.toEqualTypeOf<[options?: PressableOptions]>();
    typeOnly(() => {
      // @ts-expect-error React Aria's isPressed is not an input
      usePressable({ isPressed: true });
      // @ts-expect-error the hook takes no ref argument
      usePressable({}, { current: null });
      // @ts-expect-error React Aria's name for cancelOnPointerExit
      usePressable({ shouldCancelOnPointerExit: true });
    });
    expectTypeOf<PressableProps>().toHaveProperty("cancelOnPointerExit");
    expectTypeOf<PressableProps>().toHaveProperty("allowTextSelection");
    expectTypeOf<PressableProps>().not.toHaveProperty("isPressed");
    expectTypeOf<PressableProps>().not.toHaveProperty("shouldCancelOnPointerExit");
  });

  it("[primitives.aria.boundary] declares the focus options by Paper's names", () => {
    typeOnly(() => {
      // @ts-expect-error React Aria's isTextInput
      useFocusRing({ isTextInput: true });
      useFocusRing({ within: true, textInput: true, autoFocus: true });
    });
    expectTypeOf<ComponentProps<typeof VisuallyHidden>>().toHaveProperty("focusable");
    expectTypeOf<ComponentProps<typeof VisuallyHidden>>().not.toHaveProperty("isFocusable");
    expectTypeOf<ComponentProps<typeof VisuallyHidden>>().not.toHaveProperty("elementType");
  });

  it("[primitives.hooks.result-shape] names the result of each hook", () => {
    expectTypeOf<ReturnType<typeof usePressable>>().toEqualTypeOf<PressableResult>();
    expectTypeOf<ReturnType<typeof useSelectable>>().toEqualTypeOf<SelectableResult>();
    expectTypeOf<ReturnType<typeof useSelectableGroup>>().toEqualTypeOf<SelectableGroupResult>();
    expectTypeOf<ReturnType<typeof useDraggable>>().toEqualTypeOf<DraggableResult>();
    expectTypeOf<ReturnType<typeof useDroppable>>().toEqualTypeOf<DroppableResult>();
    expectTypeOf<ReturnType<typeof useFloating>>().toEqualTypeOf<FloatingResult>();
    expectTypeOf<ReturnType<typeof useFocusRing>>().toEqualTypeOf<FocusRingResult>();
    expectTypeOf<ReturnType<typeof useFocusWithin>>().toEqualTypeOf<FocusWithinResult>();
    expectTypeOf<ReturnType<typeof useRovingFocusItem>>().toEqualTypeOf<RovingFocusItemResult>();
    expectTypeOf<ReturnType<typeof useFormField>>().toEqualTypeOf<FormFieldResult>();
    expectTypeOf<ReturnType<typeof useFormFieldControl>>().toEqualTypeOf<FormFieldControlResult>();
  });

  it("[primitives.hooks.naming] keeps a controlled state to x, defaultX and onXChange, and a state read back to is*", () => {
    expectTypeOf<SelectableProps>().toHaveProperty("selected");
    expectTypeOf<SelectableProps>().toHaveProperty("defaultSelected");
    expectTypeOf<SelectableProps>().toHaveProperty("onSelectedChange");
    expectTypeOf<SelectableGroupProps>().toHaveProperty("selectedValues");
    expectTypeOf<SelectableGroupProps>().toHaveProperty("defaultSelectedValues");
    expectTypeOf<SelectableGroupProps>().toHaveProperty("onSelectedValuesChange");
    expectTypeOf<RovingFocusProps>().toHaveProperty("currentValue");
    expectTypeOf<RovingFocusProps>().toHaveProperty("defaultCurrentValue");
    expectTypeOf<RovingFocusProps>().toHaveProperty("onCurrentValueChange");
    expectTypeOf<ComponentProps<typeof Floating>>().toHaveProperty("open");
    expectTypeOf<ComponentProps<typeof Floating>>().toHaveProperty("defaultOpen");
    expectTypeOf<ComponentProps<typeof Floating>>().toHaveProperty("onOpenChange");
    expectTypeOf<PressableResult>().toHaveProperty("isActive");
    expectTypeOf<SelectableResult>().toHaveProperty("isSelected");
    expectTypeOf<FloatingResult>().toHaveProperty("isOpen");
    expectTypeOf<FocusRingResult>().toHaveProperty("isFocusVisible");
    expectTypeOf<DraggableResult>().toHaveProperty("isDragging");
    expectTypeOf<DroppableResult>().toHaveProperty("isDropTarget");
  });

  it("[primitives.hooks.naming] gives no input an is or should, wherever an options type is declared", () => {
    const options = /export type \w*(?:Options|OwnProps) = (?:[^{;]*&\s*)?\{([\s\S]*?)\n?\};/g;
    const primitives = join(dirname(fileURLToPath(import.meta.url)), "primitives");
    const files = readdirSync(primitives, { recursive: true, encoding: "utf8" }).filter((file) => /\.tsx?$/.test(file) && !/\.(test|css)\./.test(file)).map((file) => join(primitives, file));
    expect(files.length).toBeGreaterThan(0);
    let seen = 0;
    for (const file of files) {
      for (const [, body = ""] of readFileSync(file, "utf8").matchAll(options)) {
        seen += 1;
        expect(body.match(/^\s*(?:is|should)[A-Z]\w*\??:/gm), relative(primitives, file)).toBeNull();
      }
    }
    expect(seen).toBeGreaterThan(5);
  });

  it("[primitives.hooks.naming] publishes XOptions and XResult for every hook of a primitive, and the event types under Paper's names", () => {
    const { types } = (JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../api/surface.json"), "utf8")) as { entries: Record<string, { types: string[] }> }).entries["."]!;
    // useFloatingContext reads the Floating it stands in, so it takes no options and answers with useFloating's result.
    const hooks = Object.values(INVENTORY.primitives).flatMap(({ hooks }) => [...hooks]).filter((hook) => hook !== "useFloatingContext");
    expect(hooks.length).toBeGreaterThan(5);
    for (const hook of hooks) {
      const name = hook.slice("use".length);
      expect(types, `${name}Options`).toContain(`${name}Options`);
      expect(types, `${name}Result`).toContain(`${name}Result`);
    }
    expectTypeOf<ReturnType<typeof useFloatingContext>>().toEqualTypeOf<FloatingResult>();
    for (const event of ["PressEvent", "DropEvent", "DropEnterEvent", "TransferDragEvent", "MoveDragEvent", "Placement"]) expect(types, event).toContain(event);
  });

  it("[primitives.snapshots.children] names the snapshot each children function receives", () => {
    type Snapshot<Children> = Parameters<Extract<Children, (state: never) => unknown>>[0];
    expectTypeOf<Snapshot<PressableProps["children"]>>().toEqualTypeOf<PressableState>();
    expectTypeOf<Snapshot<SelectableProps["children"]>>().toEqualTypeOf<SelectableState>();
    expectTypeOf<Snapshot<SelectableGroupProps["children"]>>().toEqualTypeOf<SelectableGroupState>();
    expectTypeOf<Snapshot<RovingFocusProps["children"]>>().toEqualTypeOf<RovingFocusState>();
    expectTypeOf<Snapshot<DraggableProps["children"]>>().toEqualTypeOf<DraggableState>();
    expectTypeOf<Snapshot<DroppableProps["children"]>>().toEqualTypeOf<DroppableState>();
    expectTypeOf<Snapshot<FloatingContentProps["children"]>>().toEqualTypeOf<FloatingContentState>();
    expectTypeOf<Snapshot<FormFieldProps["children"]>>().toEqualTypeOf<FormFieldState>();
  });

  it("[primitives.floating.presentation] types what a popover takes away from what a modal takes", () => {
    expectTypeOf<NonNullable<FloatingContentProps["presentation"]>>().toEqualTypeOf<FloatingPresentation>();
    expectTypeOf<NonNullable<FloatingPopoverProps["offset"]>>().toEqualTypeOf<Space | "none">();
    expectTypeOf<NonNullable<FloatingPopoverProps["crossOffset"]>>().toEqualTypeOf<Space | "none">();
    expectTypeOf<FloatingModalProps["presentation"]>().toEqualTypeOf<"modal">();
    expectTypeOf<FloatingModalProps["offset"]>().toEqualTypeOf<undefined>();
    expectTypeOf<FloatingModalProps["anchorRef"]>().toEqualTypeOf<undefined>();
    expectTypeOf<FloatingPopoverProps["underlayClassName"]>().toEqualTypeOf<undefined>();
    typeOnly(() => {
      // @ts-expect-error a modal is not placed against an anchor
      const modal: FloatingContentProps = { presentation: "modal", offset: "sm", children: null };
      // @ts-expect-error an offset is a step of the gap scale or none, not a number of pixels
      const pixels: FloatingContentProps = { offset: 8, children: null };
      void [modal, pixels];
    });
  });

  it("[primitives.hooks.result-shape] gives a DOM hook its part's props, with the ref and the state attributes", () => {
    expectTypeOf<PressableResult["pressProps"]>().toHaveProperty("ref");
    expectTypeOf<PressableResult["pressProps"]>().toHaveProperty("data-active");
    expectTypeOf<PressableResult["pressProps"]>().toHaveProperty("data-disabled");
    expectTypeOf<PressableResult>().toHaveProperty("isActive");
    expectTypeOf<PressableResult>().not.toHaveProperty("isPressed");
    expectTypeOf<DraggableResult["dragProps"]>().toHaveProperty("ref");
    expectTypeOf<DroppableResult["dropProps"]>().toHaveProperty("ref");
    expectTypeOf<DroppableResult["dropProps"]>().toHaveProperty("data-drop-target");
    expectTypeOf<FocusRingResult["focusProps"]>().toHaveProperty("data-focus-visible");
    expectTypeOf<RovingFocusItemResult["itemProps"]>().toHaveProperty("ref");
    expectTypeOf<SelectableResult>().not.toHaveProperty("pressProps");
    expectTypeOf<SelectableResult["selectProps"]>().toHaveProperty("data-selected");
  });

  it("[primitives.aria.boundary] accepts a handler typed with Paper's event, without importing React Aria", () => {
    const onPress = (event: PressEvent): void => void event.pointerType;
    typeOnly(() => usePressable({ onPress }));
    expectTypeOf(onPress).toMatchTypeOf<NonNullable<PressableOptions["onPress"]>>();
  });
});

describe("the React Aria boundary", () => {
  const src = dirname(fileURLToPath(import.meta.url));
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));
  const sources = walk(src).filter((file) => /\.(ts|tsx)$/.test(file) && !/\.test\.(ts|tsx)$/.test(file));
  const ARIA = /["'](?:@react-aria|@react-stately|@react-types)\/|["'](?:react-aria|react-stately|react-aria-components)(?:\/|["'])/;

  it("[primitives.aria.boundary] imports React Aria only inside src/internal/aria", () => {
    expect(sources.length).toBeGreaterThan(0);
    const outside = sources.filter((file) => ARIA.test(readFileSync(file, "utf8")) && !relative(src, file).startsWith(join("internal", "aria")));
    expect(outside.map((file) => relative(src, file))).toEqual([]);
  });

  it("[primitives.aria.boundary] keeps the adapters in one folder, one file per concern", () => {
    const adapters = readdirSync(join(src, "internal", "aria")).sort();
    expect(adapters).toEqual(["dnd.ts", "focus.tsx", "i18n.tsx", "live.ts", "move.ts", "overlay.ts", "portal.tsx", "press.ts", "visually-hidden.ts"]);
    const importing = adapters.filter((file) => ARIA.test(readFileSync(join(src, "internal", "aria", file), "utf8")));
    expect(importing).toEqual(adapters);
  });
});
