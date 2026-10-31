// Button — 태그가 갈리면 속성도 갈린다, 대상이 무엇이든 눌림 장치는 한 벌이다, 선택과 로딩은 속성으로 말한다.
//
// <button> 만 갖는 속성(type·disabled)을 <a> 에 얹으면 무효 속성이 될 뿐 링크는 그대로
// 눌린다. 조용히 새는 계약이라 여기서 못 박는다.

import { forwardRef, useState, type AnchorHTMLAttributes } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";

import { Draggable, Floating, Pressable, Selectable, SelectableGroup } from "../primitives";
import type { ControlFontSize } from "../tokens";
import { Button, type ButtonProps } from "./Button";

const announcer = vi.hoisted(() => ({ announce: vi.fn(), clearAnnouncer: vi.fn() }));
vi.mock("@react-aria/live-announcer", () => announcer);

afterEach(() => announcer.announce.mockClear());

describe("Button · as", () => {
  it("기본은 <button> 이고 type 이 붙는다", () => {
    render(<Button>저장</Button>);
    const el = screen.getByRole("button", { name: "저장" });
    expect(el.tagName).toBe("BUTTON");
    expect(el.getAttribute("type")).toBe("button");
  });

  it("as='a' 면 링크 하나만 그린다 — 안에 button 이 없다", () => {
    render(
      <Button as="a" href="/docs" shape="pill">
        문서 읽기
      </Button>,
    );
    const el = screen.getByRole("link", { name: "문서 읽기" });
    expect(el.tagName).toBe("A");
    expect(el.querySelector("button")).toBeNull();
    // <button> 전용 속성은 안 새어 나간다.
    expect(el.hasAttribute("type")).toBe(false);
    expect(el.hasAttribute("disabled")).toBe(false);
  });

  it("[atoms.button.target] a disabled link-styled Button is aria-disabled and out of the Tab order, and the click does not reach the link", () => {
    const navigate = vi.fn();
    const Router = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function Router({ onClick, ...rest }, ref) {
      return <a ref={ref} href="/there" {...rest} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented) { event.preventDefault(); navigate(); } }} />;
    });
    render(<><Button as={Router} disabled>이동</Button><Button as={Router}>열기</Button></>);
    const off = screen.getByRole("link", { name: "이동" });
    expect(off.getAttribute("aria-disabled")).toBe("true");
    expect(off.getAttribute("tabindex")).toBe("-1");
    expect(off.getAttribute("data-disabled")).toBe("true");
    expect(off.style.pointerEvents).toBe("");
    fireEvent.click(off);
    expect(navigate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "열기" }));
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("[atoms.button.target] runs one press machinery over a Paper part: <Button as={Floating.Trigger}> opens its panel with one press and one click", () => {
    const click = vi.fn();
    render(
      <Floating>
        <Button as={Floating.Trigger} variant="hairline" onClick={click}>열기</Button>
        <Floating.Content aria-label="패널">내용</Floating.Content>
      </Floating>,
    );
    const trigger = screen.getByRole("button", { name: "열기" });
    expect(document.querySelectorAll("button")).toHaveLength(1);
    fireEvent.keyDown(trigger, { key: " " });
    expect(trigger.getAttribute("data-active")).toBe("true");
    fireEvent.keyUp(trigger, { key: " " });
    expect(click).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("dialog", { name: "패널" })).toBeTruthy();
  });

  it("[atoms.button.target] gives a Selectable the look of a Button, and the selection stays the Selectable's", () => {
    render(<Button as={Selectable} variant="ghost">완료 포함</Button>);
    const toggle = screen.getByRole("button", { name: "완료 포함" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.getAttribute("data-selected")).toBe("true");
  });

  it("[atoms.button.target] hands a controlled selection to the Selectable: the attributes follow the prop and a press asks for its opposite", () => {
    const change = vi.fn();
    const Controlled = () => {
      const [on, setOn] = useState(true);
      return <Button as={Selectable} variant="ghost" selected={on} onSelectedChange={(next) => { change(next); setOn(next); }}>완료 포함</Button>;
    };
    render(<Controlled />);
    const toggle = screen.getByRole("button", { name: "완료 포함" });
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.getAttribute("data-selected")).toBe("true");
    fireEvent.click(toggle);
    expect(change).toHaveBeenLastCalledWith(false);
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(toggle.hasAttribute("data-selected")).toBe(false);
    fireEvent.click(toggle);
    expect(change).toHaveBeenLastCalledWith(true);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.getAttribute("data-selected")).toBe("true");
  });

  it("[atoms.button.target] keeps a controlled Selectable where the parent holds it when the press is not taken up", () => {
    const change = vi.fn();
    render(<Button as={Selectable} variant="ghost" selected onSelectedChange={change}>고정</Button>);
    const toggle = screen.getByRole("button", { name: "고정" });
    fireEvent.click(toggle);
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledWith(false);
    expect(toggle.getAttribute("aria-pressed")).toBe("true");
    expect(toggle.getAttribute("data-selected")).toBe("true");
  });

  it("[atoms.button.target] leaves a SelectableGroup item's selection to the group, whatever the Button is given", () => {
    render(
      <SelectableGroup selectionMode="single" aria-label="필터">
        <Button as={SelectableGroup.Item} value="a" variant="ghost" selected>가</Button>
      </SelectableGroup>,
    );
    const item = screen.getByRole("button", { name: "가" });
    expect(item.getAttribute("aria-pressed")).toBe("false");
    expect(item.hasAttribute("data-selected")).toBe(false);
  });

  it("[atoms.button.target] gives a SelectableGroup item the look of a Button", () => {
    render(
      <SelectableGroup selectionMode="single" aria-label="필터">
        <Button as={SelectableGroup.Item} value="a" variant="ghost">가</Button>
        <Button as={SelectableGroup.Item} value="b" variant="ghost">나</Button>
      </SelectableGroup>,
    );
    fireEvent.click(screen.getByRole("button", { name: "나" }));
    expect(screen.getByRole("button", { name: "나" }).getAttribute("data-selected")).toBe("true");
    expect(screen.getByRole("button", { name: "가" }).hasAttribute("data-selected")).toBe(false);
  });

  it("[atoms.button.target] renders as={Pressable} as the one Pressable, not a second one inside it", () => {
    render(<Button as={Pressable}>눌러</Button>);
    expect(document.querySelectorAll("button")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "눌러" }).getAttribute("type")).toBe("button");
  });

  it("[atoms.button.target] is a developer error for a Draggable.Handle to be given the look of a Button", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <Draggable mode="transfer" activation="handle" getItems={() => []}>
        <Button as={Draggable.Handle} aria-label="끌기">끌기</Button>
      </Draggable>,
    );
    expect(error.mock.calls.flat().join(" ")).toContain("[paper-ui] A Button cannot be a Draggable.Handle");
    error.mockRestore();
  });
});

describe("Button · selected", () => {
  it("[atoms.button.selected] announces a selection with aria-pressed and marks it with data-selected, only on a Button that was given one", () => {
    render(
      <>
        <Button variant="ghost" selected>켜짐</Button>
        <Button variant="ghost" selected={false}>꺼짐</Button>
        <Button variant="ghost">없음</Button>
      </>,
    );
    const on = screen.getByRole("button", { name: "켜짐" });
    expect(on.getAttribute("aria-pressed")).toBe("true");
    expect(on.getAttribute("data-selected")).toBe("true");
    const off = screen.getByRole("button", { name: "꺼짐" });
    expect(off.getAttribute("aria-pressed")).toBe("false");
    expect(off.hasAttribute("data-selected")).toBe(false);
    const none = screen.getByRole("button", { name: "없음" });
    expect(none.hasAttribute("aria-pressed")).toBe(false);
    expect(none.hasAttribute("data-selected")).toBe(false);
  });

  it("[atoms.button.selected] says it in the one attribute its role takes", () => {
    render(
      <>
        <Button role="tab" variant="ghost" selected>탭</Button>
        <Button role="switch" variant="ghost" selected={false}>스위치</Button>
      </>,
    );
    const tab = screen.getByRole("tab", { name: "탭" });
    expect(tab.getAttribute("aria-selected")).toBe("true");
    expect(tab.getAttribute("data-selected")).toBe("true");
    expect(tab.hasAttribute("aria-pressed")).toBe(false);
    const toggle = screen.getByRole("switch", { name: "스위치" });
    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(toggle.hasAttribute("aria-pressed")).toBe(false);
  });

  it("[atoms.button.selected] leaves a current item to aria-current, which the colour reads like a selection", () => {
    render(<Button variant="ghost" aria-current="page">현재</Button>);
    const el = screen.getByRole("button", { name: "현재" });
    expect(el.getAttribute("aria-current")).toBe("page");
    expect(el.hasAttribute("aria-pressed")).toBe(false);
  });

  it("[atoms.button.selected] takes a selection only with a variant that can show one", () => {
    expectTypeOf<ButtonProps["selected"]>().toEqualTypeOf<boolean | undefined>();
    const ok = (
      <>
        <Button variant="hairline" selected>가</Button>
        <Button variant="muted" selected={false}>나</Button>
      </>
    );
    // @ts-expect-error solid has no selected face
    const solid = <Button variant="solid" selected>다</Button>;
    // @ts-expect-error a selection needs the variant that shows it
    const bare = <Button selected>라</Button>;
    expect([ok, solid, bare]).toHaveLength(3);
  });
});

describe("Button · loading", () => {
  it("[atoms.button.loading] stays focusable and busy: aria-busy and aria-disabled, no native disabled, one decorative Spinner", () => {
    render(<Button loading>저장 중</Button>);
    const el = screen.getByRole("button", { name: /저장 중/ });
    expect((el as HTMLButtonElement).disabled).toBe(false);
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.getAttribute("data-disabled")).toBe("true");
    act(() => el.focus());
    expect(document.activeElement).toBe(el);
    const spinners = el.querySelectorAll("span");
    expect(spinners).toHaveLength(1);
    expect(spinners[0]!.getAttribute("aria-hidden")).toBe("true");
    expect(spinners[0]!.hasAttribute("role")).toBe(false);
  });

  it("[atoms.button.loading] ignores a press and does not submit its form", () => {
    const click = vi.fn();
    const submit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(<form onSubmit={submit}><Button loading type="submit" onClick={click}>제출</Button></form>);
    const el = screen.getByRole("button", { name: /제출/ });
    fireEvent.click(el);
    fireEvent.keyDown(el, { key: "Enter" });
    fireEvent.keyUp(el, { key: "Enter" });
    expect(click).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
    expect(el.hasAttribute("data-active")).toBe(false);
  });

  it("[atoms.button.loading] keeps a link-styled Button in the Tab order and blocked while it loads", () => {
    render(<Button as="a" href="/docs" loading>저장 중</Button>);
    const el = screen.getByRole("link", { name: /저장 중/ });
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("[atoms.button.loading] is disabled for real when it is also disabled", () => {
    render(<Button loading disabled>저장 중</Button>);
    expect((screen.getByRole("button", { name: /저장 중/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("[atoms.button.loading] announces the loading label once when loading starts while the Button holds focus, and not otherwise", () => {
    const view = render(<><Button loadingLabel="저장하는 중">저장</Button><Button>다른 버튼</Button></>);
    const [first] = screen.getAllByRole("button");
    act(() => first!.focus());
    view.rerender(<><Button loading loadingLabel="저장하는 중">저장</Button><Button>다른 버튼</Button></>);
    expect(announcer.announce.mock.calls).toEqual([["저장하는 중", "polite", undefined]]);
    view.rerender(<><Button loading loadingLabel="저장하는 중">저장</Button><Button>다른 버튼</Button></>);
    expect(announcer.announce).toHaveBeenCalledTimes(1);

    announcer.announce.mockClear();
    const other = render(<Button>대기</Button>);
    other.rerender(<Button loading>대기</Button>);
    expect(announcer.announce).not.toHaveBeenCalled();
  });

  it("[atoms.button.loading] says the catalog's loading message when no label is given", () => {
    const view = render(<Button>저장</Button>);
    act(() => screen.getByRole("button").focus());
    view.rerender(<Button loading>저장</Button>);
    expect(announcer.announce.mock.calls[0]?.[0]).toBe("Loading");
  });
});

describe("Button · fontSize", () => {
  it("takes only the roles a control box can hold", () => {
    expectTypeOf<ButtonProps["fontSize"]>().toEqualTypeOf<ControlFontSize | undefined>();
    // @ts-expect-error display does not fit a control box
    const tooBig = <Button fontSize="display">크게</Button>;
    expect(tooBig).toBeTruthy();
  });
});
