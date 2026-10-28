import type { Page } from "@playwright/test";

// One Tab press (Shift+Tab with shift), the way a keyboard user moves focus in each engine. macOS WebKit
// gives plain Tab only to text fields and lists; Option+Tab reaches every focusable element, so the
// webkit project sends Alt+Tab on darwin. Every Tab press in the specs goes through here.
export const tab = async (page: Page, { shift = false }: { shift?: boolean } = {}) => {
  const option = process.platform === "darwin" && page.context().browser()?.browserType().name() === "webkit";
  await page.keyboard.press(`${option ? "Alt+" : ""}${shift ? "Shift+" : ""}Tab`);
};
