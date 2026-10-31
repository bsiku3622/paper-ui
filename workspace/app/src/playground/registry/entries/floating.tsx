import { useRef } from "react";

import { Field, FormField, Floating, Stack, Text, surfaceClass, type FloatingContentProps, type FloatingProps } from "@studio-baeks/paper-ui";

import { classNamed, named } from "../jsx";
import { boolControl, defineSpec, flag } from "../schema";
import { control, formField, floatingContent } from "./examples.css";

// The panel's face comes from the caller, as the Floating doc says; floatingContent only sizes and spaces it.
const face = classNamed('surfaceClass({ fill: "raised", border: true, radius: "md" })', surfaceClass({ fill: "raised", border: true, radius: "md" }));
const panel = `${face} ${floatingContent}`;

export default defineSpec({
  name: "Floating",
  blurb: "Trigger·Content·Close로 열린 상태, Portal, 배치, 중첩 닫기와 focus 복원을 연결합니다. Trigger·Close는 onClick을 받는 native button이고, Trigger는 클릭에 스스로 focus를 가져옵니다. modal은 배경 조작과 스크롤을 차단합니다. 위치와 elevation(z와 그림자), 닫는 방식을 맡고 면·테두리·모서리는 호출자의 className이 정합니다.",
  controls: [
    boolControl<FloatingProps, "modal">("modal", false, { behaviorOnly: "Floating renders nothing until it opens, so a closed render has no markup for it" }),
    boolControl<FloatingContentProps, "dismissable">("dismissable", true, { target: "Floating.Content", behaviorOnly: "dismissal happens after the panel opens" }),
  ],
  defaults: { modal: false, dismissable: true },
  useHarness: () => ({ title: useRef<HTMLHeadingElement>(null) }),
  subject: (state, { title }) => (
    <Floating modal={flag(state, "modal")}>
      <Floating.Trigger className={control}>설정 열기</Floating.Trigger>
      <Floating.Content className={panel} aria-label="설정" dismissable={flag(state, "dismissable")} offset={8} initialFocusRef={named("titleRef", title)}>
        <Stack gap="md">
          <Text as="h2" variant="heading" ref={named("titleRef", title)} tabIndex={-1}>설정</Text>
          <FormField label="표시 이름" description="화면에 표시할 이름입니다." className={formField}>
            <Field />
          </FormField>
          <Floating modal>
            <Floating.Trigger className={control}>확인 창 열기</Floating.Trigger>
            <Floating.Content className={panel} aria-label="중첩 확인">
              <Stack gap="md">
                <Text>안쪽 창부터 닫힙니다.</Text>
                <Floating.Close className={control}>확인 창 닫기</Floating.Close>
              </Stack>
            </Floating.Content>
          </Floating>
          <Floating.Close className={control}>설정 닫기</Floating.Close>
        </Stack>
      </Floating.Content>
    </Floating>
  ),
});
