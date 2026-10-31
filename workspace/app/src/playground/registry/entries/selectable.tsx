import { Pressable, Selectable, type SelectableProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, flag } from "../schema";
import { control } from "./examples.css";

export default defineSpec({
  name: "Selectable",
  blurb: "유지되는 boolean 선택 상태를 가진 native button입니다. selected·defaultSelected·onSelectedChange를 연결하고, 선택은 role이 정하는 aria 속성 하나와 data-selected로 알립니다. click으로 선택을 바꾸고 press는 안에 없으며, 색은 입히지 않습니다. Safari는 눌린 button에 focus를 주지 않으므로 예제는 `<Pressable as={Selectable}>`로 올려 onPress·data-active와 click 뒤의 focus를 얻습니다.",
  controls: [
    boolControl<SelectableProps, "disabled">("disabled", false, { target: "Pressable" }),
    boolControl<SelectableProps, "defaultSelected">("defaultSelected", false, { target: "Pressable" }),
  ],
  defaults: { disabled: false },
  subject: (state) => (
    <Pressable as={Selectable} key={String(flag(state, "defaultSelected"))} data-testid="select-example" className={control} disabled={flag(state, "disabled")} defaultSelected={flag(state, "defaultSelected")}>
      선택
    </Pressable>
  ),
});
