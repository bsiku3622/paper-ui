import type { Page } from "@playwright/test";

// macOS WebKit gives plain Tab only to text fields and lists; Option+Tab reaches every focusable element,
// so the webkit project sends Alt+Tab on darwin.
export const tab = async (page: Page, { shift = false }: { shift?: boolean } = {}) => {
  const option = process.platform === "darwin" && page.context().browser()?.browserType().name() === "webkit";
  await page.keyboard.press(`${option ? "Alt+" : ""}${shift ? "Shift+" : ""}Tab`);
};
