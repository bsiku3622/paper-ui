import { useState } from "react";

import { Button, SelectableGroup, Stack, Text, type SelectableGroupProps } from "@studio-baeks/paper-ui";

import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, local, pick } from "../schema";
import { control, roving } from "./examples.css";

export default defineSpec({
  name: "SelectableGroup",
  blurb: "Selectable 항목의 단일·복수 선택과 그룹 focus 탐색을 연결합니다. 선택과 focus는 별도 상태이고, role을 주면 항목이 그 role의 aria로 선택을 알립니다.",
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
  subject: (state, { values, setValues, last }) => (
    <SelectableGroup
      className={roving}
      aria-label="정렬 선택"
      selectionMode={pick<NonNullable<SelectableGroupProps["selectionMode"]>>(state, "selectionMode")}
      selectionRequired={flag(state, "selectionRequired")}
      disabled={flag(state, "disabled")}
      selectedValues={values}
      onSelectedValuesChange={named("setSelectedValues", setValues)}
      loop
    >
      <SelectableGroup.Item value="left" className={control}>왼쪽</SelectableGroup.Item>
      <SelectableGroup.Item value="center" className={control}>가운데</SelectableGroup.Item>
      <SelectableGroup.Item value="unavailable" disabled className={control}>사용 불가</SelectableGroup.Item>
      {last && <SelectableGroup.Item value="right" className={control}>오른쪽</SelectableGroup.Item>}
    </SelectableGroup>
  ),
  Stage: ({ subject, harness }) => (
    <Stack gap="md" align="start">
      {subject}
      <Text as="output" aria-live="polite">선택: {harness.values.join(", ") || "없음"}</Text>
      <Button onClick={harness.toggleLast}>{harness.last ? "오른쪽 제거" : "오른쪽 복원"}</Button>
    </Stack>
  ),
});
