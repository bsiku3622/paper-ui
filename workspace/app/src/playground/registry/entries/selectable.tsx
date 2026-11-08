import { Pressable, Selectable, type SelectableProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, flag } from "../schema";
import { control } from "./examples.css";
import { pick as inLocale } from "../../../site/locale";

const WORDS = {
  ko: { select: "선택" },
  en: { select: "Select" },
};

export default defineSpec({
  name: "Selectable",
  blurb: { ko: "유지되는 boolean 선택 상태를 가진 native button입니다. selected·defaultSelected·onSelectedChange를 연결하고, 선택은 role이 정하는 aria 속성 하나와 data-selected로 알립니다. click으로 선택을 바꾸고 press는 안에 없으며, 색은 입히지 않습니다. Safari는 눌린 button에 focus를 주지 않으므로 예제는 <Pressable as={Selectable}>로 올려 onPress·data-active와 click 뒤의 focus를 얻습니다.", en: "A native button that holds a persistent boolean selection state. It connects selected, defaultSelected and onSelectedChange, and reports the selection with the one aria attribute the role sets and with data-selected. It changes the selection on click, has no press inside, and applies no colour. Safari does not focus a pressed button, so the example is lifted as <Pressable as={Selectable}> to get onPress, data-active and focus after a click." },
  controls: [
    boolControl<SelectableProps, "disabled">("disabled", false, { target: "Pressable" }),
    boolControl<SelectableProps, "defaultSelected">("defaultSelected", false, { target: "Pressable" }),
  ],
  defaults: { disabled: false },
  subject: (state, _harness, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <Pressable as={Selectable} key={String(flag(state, "defaultSelected"))} data-testid="select-example" className={control} disabled={flag(state, "disabled")} defaultSelected={flag(state, "defaultSelected")}>
      {w.select}
    </Pressable>
    );
  },
});
