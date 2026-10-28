import { useRef } from "react";

import { Field, FormField, Overlay, Stack, Text, type OverlayContentProps, type OverlayProps } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, flag } from "../schema";
import { control, formField, overlayContent } from "./examples.css";

export default defineSpec({
  name: "Overlay",
  blurb: "Trigger·Content·Close로 열린 상태, Portal, 배치, 중첩 닫기와 focus 복원을 연결합니다. modal은 배경 조작과 스크롤을 차단합니다.",
  controls: [
    boolControl<OverlayProps, "modal">("modal", false, { behaviorOnly: "Overlay renders nothing until it opens, so a closed render has no markup for it" }),
    boolControl<OverlayContentProps, "dismissable">("dismissable", true, { target: "Overlay.Content", behaviorOnly: "dismissal happens after the overlay opens" }),
  ],
  defaults: { modal: false, dismissable: true },
  useHarness: () => ({ title: useRef<HTMLHeadingElement>(null) }),
  subject: (state, { title }) => (
    <Overlay modal={flag(state, "modal")}>
      <Overlay.Trigger className={control}>설정 열기</Overlay.Trigger>
      <Overlay.Content className={overlayContent} aria-label="설정" dismissable={flag(state, "dismissable")} offset={8} initialFocusRef={named("titleRef", title)}>
        <Stack gap="md">
          <Text as="h2" variant="heading" ref={named("titleRef", title)} tabIndex={-1}>설정</Text>
          <FormField label="표시 이름" description="화면에 표시할 이름입니다." className={formField}>
            {named("({ controlProps }) => <Field {...controlProps} />", ({ controlProps }) => <Field {...controlProps} />)}
          </FormField>
          <Overlay modal>
            <Overlay.Trigger className={control}>확인 창 열기</Overlay.Trigger>
            <Overlay.Content className={overlayContent} aria-label="중첩 확인">
              <Stack gap="md">
                <Text>안쪽 창부터 닫힙니다.</Text>
                <Overlay.Close className={control}>확인 창 닫기</Overlay.Close>
              </Stack>
            </Overlay.Content>
          </Overlay>
          <Overlay.Close className={control}>설정 닫기</Overlay.Close>
        </Stack>
      </Overlay.Content>
    </Overlay>
  ),
});
