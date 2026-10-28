import type { Page } from "@playwright/test";

// Everything a page reports as broken — uncaught exceptions and console errors — in the order it
// happened. The returned list keeps filling; read it after the step that has to stay clean.
export const pageErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
};
