export type PaperMessages = {
  clear: string;
  showPassword: string;
  loading: string;
};

export const MESSAGES = {
  en: { clear: "Clear", showPassword: "Show password", loading: "Loading" },
  ko: { clear: "지우기", showPassword: "비밀번호 보기", loading: "불러오는 중" },
} satisfies Record<string, PaperMessages>;

const catalogs: Record<string, PaperMessages> = MESSAGES;

export function resolveMessages(locale: string, overrides?: Partial<PaperMessages>): PaperMessages {
  const language = (locale.split(/[-_]/)[0] ?? "").toLowerCase();
  const catalog = { ...(catalogs[language] ?? MESSAGES.en) };
  for (const key of Object.keys(catalog) as Array<keyof PaperMessages>) {
    const override = overrides?.[key];
    if (override !== undefined) catalog[key] = override;
  }
  return catalog;
}
