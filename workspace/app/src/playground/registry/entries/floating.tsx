import { useRef } from "react";

import { Button, Field, FormField, Floating, Stack, Surface, Text, type FloatingContentProps, type FloatingPopoverProps, type FloatingPresentation } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, local, pick, subset } from "../schema";
import { pick as inLocale } from "../../../site/locale";

const WORDS = {
  ko: { open: "설정 열기", settings: "설정", nameLabel: "표시 이름", nameHint: "화면에 표시할 이름입니다.", openConfirm: "확인 창 열기", nested: "중첩 확인", inner: "안쪽 창부터 닫힙니다.", closeConfirm: "확인 창 닫기", close: "설정 닫기" },
  en: { open: "Open settings", settings: "Settings", nameLabel: "Display name", nameHint: "The name shown on screen.", openConfirm: "Open confirmation", nested: "Nested confirmation", inner: "The inner window closes first.", closeConfirm: "Close confirmation", close: "Close settings" },
};

const panel = { as: Surface, fill: "raised", border: true, radius: "md", padding: "lg", width: "md", maxWidth: "full" } as const;

export default defineSpec({
  name: "Floating",
  blurb: { ko: "Trigger·Content·Close로 열린 상태, Portal, 배치, 중첩 닫기와 focus 복원을 연결합니다. Trigger·Close는 onClick을 받는 native button이고, Trigger는 클릭에 스스로 focus를 가져옵니다. presentation이 modal이면 배경 조작과 스크롤을 차단하고, popover이면 anchorRef나 Trigger 곁에 서며 offset은 gap 단계로 고릅니다. 위치와 elevation(z와 그림자), 열고 닫는 움직임과 닫는 방식을 맡고 면·테두리·모서리는 호출자의 className이 정합니다.", en: "Connects the open state, Portal, placement, nested closing and focus restoration through Trigger, Content and Close. Trigger and Close are native buttons that take onClick, and Trigger takes focus itself on click. With presentation modal it blocks background interaction and scrolling; popover stands by anchorRef or the Trigger, with offset chosen from the gap steps. It owns position and elevation (z and shadow), the motion of opening and closing, and how it is dismissed; face, border and corners are the caller's className." },
  controls: [
    enumControl<FloatingContentProps, "presentation">("presentation", local<FloatingContentProps, "presentation">()(["popover", "modal"], "Floating.Content's own two ways to stand: beside its anchor, or over a scrim"), { target: "Floating.Content", behaviorOnly: "Floating renders nothing until it opens, so a closed render has no markup for it" }),
    boolControl<FloatingContentProps, "dismissable">("dismissable", true, { target: "Floating.Content", behaviorOnly: "dismissal happens after the panel opens" }),
    enumControl<FloatingPopoverProps, "offset">("offset", subset("SPACES", ["xs", "sm", "md", "lg"], "xl and above are page distances, too wide a gap between an anchor and its panel", ["none"]), { target: "Floating.Content", behaviorOnly: "the gap is the distance of the open panel from its anchor" }),
  ],
  defaults: { presentation: "popover", dismissable: true, offset: "sm" },
  useHarness: () => ({ title: useRef<HTMLHeadingElement>(null) }),
  subject: (state, { title }, locale) => {
    const w = inLocale(WORDS, locale);
    const standing = pick<FloatingPresentation>(state, "presentation") === "modal" ? { presentation: "modal" as const } : { offset: pick<NonNullable<FloatingPopoverProps["offset"]>>(state, "offset") };
    return (
      <Floating>
        <Button as={Floating.Trigger} variant="hairline">{w.open}</Button>
        <Floating.Content {...panel} aria-label={w.settings} {...standing} dismissable={flag(state, "dismissable")} initialFocusRef={named("titleRef", title)}>
          <Stack gap="md">
            <Text as="h2" variant="heading" ref={named("titleRef", title)} tabIndex={-1}>{w.settings}</Text>
            <FormField label={w.nameLabel} description={w.nameHint}>
              <Field />
            </FormField>
            <Floating>
              <Button as={Floating.Trigger} variant="hairline">{w.openConfirm}</Button>
              <Floating.Content {...panel} presentation="modal" aria-label={w.nested}>
                <Stack gap="md">
                  <Text>{w.inner}</Text>
                  <Button as={Floating.Close} variant="hairline">{w.closeConfirm}</Button>
                </Stack>
              </Floating.Content>
            </Floating>
            <Button as={Floating.Close} variant="hairline">{w.close}</Button>
          </Stack>
        </Floating.Content>
      </Floating>
    );
  },
});
