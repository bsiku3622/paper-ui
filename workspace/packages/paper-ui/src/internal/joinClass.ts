export const joinClass = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(" ");
