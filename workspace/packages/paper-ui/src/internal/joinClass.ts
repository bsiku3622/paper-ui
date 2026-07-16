// 클래스 문자열 합치기 — falsy 는 버린다.
export const joinClass = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(" ");
