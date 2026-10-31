// The class names of an element, in order, without the ones a condition left out.
export const joinClass = (...names: (string | false | null | undefined)[]): string => names.filter(Boolean).join(" ");
