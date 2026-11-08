import { I18nProvider } from "@react-aria/i18n";
import type { ReactNode } from "react";

// Tells React Aria which locale the page is in, so its direction-aware behaviour follows the page and not the browser's language.
export function LocaleHost({ locale, children }: { locale: string; children: ReactNode }) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
