export const joinClass = (...names: (string | false | null | undefined)[]): string => names.filter(Boolean).join(" ");
