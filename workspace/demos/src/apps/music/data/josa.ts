const WITH_FINAL = { "을/를": "을", "은/는": "은", "이/가": "이", "과/와": "과", "으로/로": "으로" } as const;
const WITHOUT_FINAL = { "을/를": "를", "은/는": "는", "이/가": "가", "과/와": "와", "으로/로": "로" } as const;

export type Pair = keyof typeof WITH_FINAL;

const DIGITS: readonly (readonly [boolean, boolean])[] = [[true, false], [true, true], [false, false], [true, false], [false, false], [false, false], [true, false], [true, true], [true, true], [false, false]];
const LATIN = new Map([["l", false], ["m", false], ["n", false], ["r", true]]);
const RIEUL = 8;

const final = (word: string): readonly [boolean, boolean] => {
  const chars = Array.from(word.trim().replace(/[^가-힣0-9a-zA-Z]+$/, ""));
  const last = chars[chars.length - 1];
  if (!last) return [false, false];
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const tail = (code - 0xac00) % 28;
    return [tail !== 0, tail === RIEUL];
  }
  if (/[0-9]/.test(last)) return DIGITS[Number(last)]!;
  const latin = LATIN.get(last.toLowerCase());
  return latin === undefined ? [false, false] : [true, latin];
};

export const josa = (word: string, pair: Pair) => {
  const [has, rieul] = final(word);
  return has && !(pair === "으로/로" && rieul) ? WITH_FINAL[pair] : WITHOUT_FINAL[pair];
};

export const withJosa = (word: string, pair: Pair) => `${word}${josa(word, pair)}`;
