import { Toggleable, type ToggleableProps, type ToggleableState } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, flag } from "../schema";
import { control } from "./examples.css";

export default defineSpec({
  name: "Toggleable",
  blurb: "유지되는 boolean 선택 상태를 가진 native toggle button입니다. selected·defaultSelected·onSelectedChange와 aria-pressed를 연결합니다.",
  controls: [
    boolControl<ToggleableProps, "disabled">("disabled"),
    boolControl<ToggleableProps, "defaultSelected">("defaultSelected"),
  ],
  defaults: { disabled: false },
  subject: (state) => (
    <Toggleable key={String(flag(state, "defaultSelected"))} data-testid="toggle-example" className={control} disabled={flag(state, "disabled")} defaultSelected={flag(state, "defaultSelected")}>
      {named('({ isSelected }) => (isSelected ? "선택됨" : "선택 안 됨")', ({ isSelected }: ToggleableState) => (isSelected ? "선택됨" : "선택 안 됨"))}
    </Toggleable>
  ),
});
