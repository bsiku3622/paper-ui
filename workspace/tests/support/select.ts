import { expect, type Locator } from "@playwright/test";

// A Select is a button (role=combobox) inside its frame, with the native select its form reads beside the button. These read it the way
// the form does and drive it the way a person does: a choice opens the list and presses the option.
export const nativeSelect = (trigger: Locator) => trigger.locator("xpath=..").locator("select");

// The values the Select offers, in order.
export const optionValues = (trigger: Locator) =>
  nativeSelect(trigger).locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value));

// The words an option of the Select shows, found by its value.
export const optionLabel = (trigger: Locator, value: string) =>
  nativeSelect(trigger).locator("option").evaluateAll((options, wanted) => options.find((option) => (option as HTMLOptionElement).value === wanted)?.textContent ?? null, value);

// Opens the list from the button and presses the option that holds the value; the form then holds it.
export const chooseOption = async (trigger: Locator, value: string) => {
  const label = await optionLabel(trigger, value);
  if (label === null) throw new Error(`The Select has no option with the value "${value}".`);
  await trigger.click();
  await trigger.page().getByRole("listbox").getByRole("option", { name: label, exact: true }).click();
  await expect(nativeSelect(trigger)).toHaveValue(value);
};
