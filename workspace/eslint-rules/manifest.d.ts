// The types of the manifest's rule list, for the docs generators that read it from TypeScript.
export type RuleText = { title: string; summary: string };
export type Rule = { id: string; eslint: string[]; ko: RuleText; en: RuleText };
export const RULES: Rule[];
