import { Hoverable, type HoverableProps, type HoverableState } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, flag } from "../schema";
import { control } from "./examples.css";

export default defineSpec({
  name: "Hoverable",
  blurb: "포인터 hover 상태와 이벤트를 제공합니다. 자체 button 역할이나 tab stop을 만들지 않고, as로 기존 요소에 합성합니다.",
  controls: [boolControl<HoverableProps, "disabled">("disabled", false, { behaviorOnly: "hover is a pointer state, so a static render has no markup for it" })],
  defaults: { disabled: false },
  subject: (state) => (
    <Hoverable data-testid="hover-example" className={control} disabled={flag(state, "disabled")}>
      {named('({ isHovered }) => (isHovered ? "Hover 중" : "포인터를 올려보세요")', ({ isHovered }: HoverableState) => (isHovered ? "Hover 중" : "포인터를 올려보세요"))}
    </Hoverable>
  ),
});
