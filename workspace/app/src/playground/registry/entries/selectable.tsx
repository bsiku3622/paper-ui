import { Selectable, type SelectableProps, type SelectableState } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, flag } from "../schema";
import { control } from "./examples.css";

export default defineSpec({
  name: "Selectable",
  blurb: "유지되는 boolean 선택 상태를 가진 native button입니다. selected·defaultSelected·onSelectedChange를 연결하고, 선택은 role이 정하는 aria 속성 하나와 data-selected로 알립니다. 색은 입히지 않습니다.",
  controls: [
    boolControl<SelectableProps, "disabled">("disabled"),
    boolControl<SelectableProps, "defaultSelected">("defaultSelected"),
  ],
  defaults: { disabled: false },
  subject: (state) => (
    <Selectable key={String(flag(state, "defaultSelected"))} data-testid="select-example" className={control} disabled={flag(state, "disabled")} defaultSelected={flag(state, "defaultSelected")}>
      {named('({ isSelected }) => (isSelected ? "선택됨" : "선택 안 됨")', ({ isSelected }: SelectableState) => (isSelected ? "선택됨" : "선택 안 됨"))}
    </Selectable>
  ),
});
