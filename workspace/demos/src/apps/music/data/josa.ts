// 한국어 조사: 앞 말의 받침에 따라 을/를, 은/는, 이/가, 과/와, 으로/로가 갈립니다. 사용자가 지은 플레이리스트 이름에도 맞아야
// 해서 한글은 받침을 읽고, 숫자와 로마자는 읽는 소리(일, 이, 엘 …)로 판단합니다.

const WITH_FINAL = { "을/를": "을", "은/는": "은", "이/가": "이", "과/와": "과", "으로/로": "으로" } as const;
const WITHOUT_FINAL = { "을/를": "를", "은/는": "는", "이/가": "가", "과/와": "와", "으로/로": "로" } as const;

export type Pair = keyof typeof WITH_FINAL;

// 영 일 이 삼 사 오 육 칠 팔 구: 받침이 있는가, 그 받침이 ㄹ인가
const DIGITS: readonly (readonly [boolean, boolean])[] = [[true, false], [true, true], [false, false], [true, false], [false, false], [false, false], [true, false], [true, true], [true, true], [false, false]];
// 엘 엠 엔 알
const LATIN = new Map([["l", false], ["m", false], ["n", false], ["r", true]]);
const RIEUL = 8;

// [받침이 있는가, 그 받침이 ㄹ인가]
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

// 말 뒤에 붙는 조사: josa("목록", "을/를") === "을"
export const josa = (word: string, pair: Pair) => {
  const [has, rieul] = final(word);
  // 으로/로: ㄹ 받침은 받침이 없는 것처럼 "로"
  return has && !(pair === "으로/로" && rieul) ? WITH_FINAL[pair] : WITHOUT_FINAL[pair];
};

// 말과 조사를 붙인 것: withJosa("목록", "을/를") === "목록을"
export const withJosa = (word: string, pair: Pair) => `${word}${josa(word, pair)}`;
