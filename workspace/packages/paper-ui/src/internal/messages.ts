// The words an Atom says on its own behalf: the accessible names of its actions. An Atom takes each as a prop and
// falls back to this catalog, in the language the locale names. A developer error is never here; it is English.

export type PaperMessages = {
  /** The action that empties an input. */
  clear: string;
  /** The action that reveals a password. */
  showPassword: string;
  /** The name of something that is loading. */
  loading: string;
};

export const MESSAGES = {
  en: { clear: "Clear", showPassword: "Show password", loading: "Loading" },
  ko: { clear: "지우기", showPassword: "비밀번호 보기", loading: "불러오는 중" },
} satisfies Record<string, PaperMessages>;

const catalogs: Record<string, PaperMessages> = MESSAGES;

// The catalog of the locale's language (the subtag before the first dash), English when there is none, with the
// keys the caller overrides taken from them.
export function resolveMessages(locale: string, overrides?: Partial<PaperMessages>): PaperMessages {
  const language = (locale.split(/[-_]/)[0] ?? "").toLowerCase();
  const catalog = { ...(catalogs[language] ?? MESSAGES.en) };
  for (const key of Object.keys(catalog) as Array<keyof PaperMessages>) {
    const override = overrides?.[key];
    if (override !== undefined) catalog[key] = override;
  }
  return catalog;
}
