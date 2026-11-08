// LocaleToggle — the site's Korean ⇄ English switch, beside the theme switch.

import { IconButton } from "@studio-baeks/paper-ui";

import { useSiteLocale, type SiteLocale } from "../site/locale";
import { LanguagesIcon } from "./icons";

// The name says where the button goes, in that language, so a visitor who cannot read the page still finds their own.
const TO: Record<SiteLocale, { locale: SiteLocale; label: string }> = {
  ko: { locale: "en", label: "View in English" },
  en: { locale: "ko", label: "한국어로 보기" },
};

export const LocaleToggle = () => {
  const { locale, setLocale } = useSiteLocale();
  const next = TO[locale];
  return (
    <IconButton size="sm" shape="pill" variant="muted" lang={next.locale} aria-label={next.label} title={next.label} onClick={() => setLocale(next.locale)}>
      <LanguagesIcon />
    </IconButton>
  );
};
