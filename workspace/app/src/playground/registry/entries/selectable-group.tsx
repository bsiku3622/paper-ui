import { useState } from "react";

import { Button, Inline, SelectableGroup, Stack, Text, type SelectableGroupProps } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, local, pick } from "../schema";
import { control } from "./examples.css";
import { pick as inLocale, useWords } from "../../../site/locale";

const WORDS = {
  ko: { label: "정렬 선택", left: "왼쪽", center: "가운데", unavailable: "사용 불가", right: "오른쪽", selected: "선택: ", none: "없음", removeRight: "오른쪽 제거", restoreRight: "오른쪽 복원" },
  en: { label: "Choose alignment", left: "Left", center: "Center", unavailable: "Unavailable", right: "Right", selected: "Selected: ", none: "none", removeRight: "Remove right", restoreRight: "Restore right" },
};

export default defineSpec({
  name: "SelectableGroup",
  blurb: { ko: "Selectable 항목의 단일·복수 선택과 그룹 focus 탐색을 연결합니다. 그룹은 요소 하나이고 as={Inline}이면 그 요소가 항목을 늘어놓습니다. 항목은 click으로 선택을 바꾸는 native button입니다. 선택과 focus는 별도 상태이고, role을 주면 항목이 그 role의 aria로 선택을 알립니다.", en: "Connects single or multiple selection of Selectable items with focus navigation in the group. The group is one element, and with as={Inline} that element lays out the items. Each item is a native button that changes selection on click. Selection and focus are separate states, and given a role, the items report selection with that role's aria." },
  controls: [
    enumControl<SelectableGroupProps, "selectionMode">("selectionMode", local<SelectableGroupProps, "selectionMode">()(["single", "multiple"], "SelectableGroup's own two selection modes")),
    boolControl<SelectableGroupProps, "selectionRequired">("selectionRequired", false, { behaviorOnly: "a required selection only refuses the last deselect, which a static render does not show" }),
    boolControl<SelectableGroupProps, "disabled">("disabled"),
  ],
  defaults: { selectionMode: "single", selectionRequired: false, disabled: false },
  useHarness: () => {
    const [values, setValues] = useState<string[]>(["left"]);
    const [last, setLast] = useState(true);
    return { values, setValues, last, toggleLast: () => setLast((value) => !value) };
  },
  subject: (state, { values, setValues, last }, locale) => {
    const w = inLocale(WORDS, locale);
    return (
    <SelectableGroup
      as={Inline}
      gap="sm"
      wrap
      aria-label={w.label}
      selectionMode={pick<NonNullable<SelectableGroupProps["selectionMode"]>>(state, "selectionMode")}
      selectionRequired={flag(state, "selectionRequired")}
      disabled={flag(state, "disabled")}
      selectedValues={values}
      onSelectedValuesChange={named("setSelectedValues", setValues)}
      loop
    >
      <SelectableGroup.Item value="left" className={control}>{w.left}</SelectableGroup.Item>
      <SelectableGroup.Item value="center" className={control}>{w.center}</SelectableGroup.Item>
      <SelectableGroup.Item value="unavailable" disabled className={control}>{w.unavailable}</SelectableGroup.Item>
      {last && <SelectableGroup.Item value="right" className={control}>{w.right}</SelectableGroup.Item>}
    </SelectableGroup>
    );
  },
  Stage: ({ subject, harness }) => {
    const w = useWords(WORDS);
    return (
    <Stack gap="md" align="start">
      {subject}
      <Text as="output" aria-live="polite">{w.selected}{harness.values.join(", ") || w.none}</Text>
      <Button onClick={harness.toggleLast}>{harness.last ? w.removeRight : w.restoreRight}</Button>
    </Stack>
    );
  },
});
