// Cafeteria menus, made up from pools of dishes: the same date always has the same three meals.

import { pick, random, shuffle } from "../../../kit";

export type MealSlot = "breakfast" | "lunch" | "dinner";
export type Menu = Record<MealSlot, string[]>;

export const SLOT_LABEL: Record<MealSlot, string> = { breakfast: "아침", lunch: "점심", dinner: "저녁" };
export const SLOT_TIME: Record<MealSlot, string> = { breakfast: "07:10–08:30", lunch: "12:30–13:10", dinner: "17:30–19:00" };

const RICE = ["쌀밥", "잡곡밥", "흑미밥", "귀리밥", "콩나물밥", "카레라이스", "김치볶음밥"];
const SOUP = ["미역국", "된장찌개", "북엇국", "소고기뭇국", "순두부찌개", "감자국", "콩나물국", "어묵탕", "김치찌개", "유부장국"];
const MAIN = ["제육볶음", "닭갈비", "생선구이", "불고기", "돈육간장조림", "함박스테이크", "치킨마요", "오징어볶음", "닭강정", "동그랑땡", "두부스테이크", "탕수육", "소시지야채볶음", "계란말이", "고등어조림"];
const SIDE = ["콩나물무침", "시금치나물", "어묵볶음", "감자채볶음", "브로콜리초무침", "애호박볶음", "도토리묵무침", "멸치볶음", "숙주나물", "파프리카잡채", "양배추쌈", "연근조림"];
const KIMCHI = ["배추김치", "깍두기", "열무김치", "총각김치"];
const EXTRA = ["요구르트", "과일", "푸딩", "아이스크림", "우유", "식빵과 딸기잼", "시리얼", "삶은 달걀"];
const BREAKFAST_MAIN = ["스크램블에그", "소시지구이", "치즈오믈렛", "닭가슴살샐러드", "고구마맛탕", "감자전", "햄구이"];

export const mealFor = (key: string): Menu => {
  const r = random(`meal:${key}`);
  const rice = pick(r, RICE);
  const kimchi = pick(r, KIMCHI);
  const sides = shuffle(r, SIDE);
  return {
    breakfast: [pick(r, ["쌀밥", "잡곡밥", "흑미밥"]), pick(r, SOUP), pick(r, BREAKFAST_MAIN), sides[0]!, kimchi, pick(r, EXTRA)],
    lunch: [rice, pick(r, SOUP), pick(r, MAIN), sides[1]!, sides[2]!, kimchi, pick(r, EXTRA)],
    dinner: [pick(r, RICE), pick(r, SOUP), pick(r, MAIN), sides[3]!, sides[4]!, pick(r, KIMCHI), pick(r, EXTRA)],
  };
};

// The meal being served at a minute of the day (a meal is "now" a little before it starts and until it ends).
export const slotAt = (minute: number): MealSlot | null => {
  if (minute < 8 * 60 + 30) return "breakfast";
  if (minute < 13 * 60 + 10) return "lunch";
  if (minute < 19 * 60) return "dinner";
  return null;
};
