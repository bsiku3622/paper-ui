import { expect, type Locator } from "@playwright/test";

export const nativeSelect = (trigger: Locator) => trigger.locator("xpath=..").locator("select");

export const optionValues = (trigger: Locator) =>
  nativeSelect(trigger).locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));

export const optionLabel = (trigger: Locator, value: string) =>
  nativeSelect(trigger).locator("option").evaluateAll((options, wanted) => options.find((option) => (option as HTMLOptionElement).value === wanted)?.textContent ?? null, value);

export const chooseOption = async (trigger: Locator, value: string) => {
  const label = await optionLabel(trigger, value);
  if (label === null) throw new Error(`The Select has no option with the value "${value}".`);
  await trigger.click();
  await trigger.page().getByRole("listbox").getByRole("option", { name: label, exact: true }).click();
  await expect(nativeSelect(trigger)).toHaveValue(value);
};
