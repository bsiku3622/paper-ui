// 캐릭터 — 축을 한 몸으로 묶은 완성된 입장.
//
// 축을 따로 고르는 것만으로는 시스템이 되지 않는다. awesome-design-md 의 DESIGN.md 들이
// 보여주는 건 색·형태·타이포·밀도가 서로를 강화하며 하나의 주장을 이룬다는 것이다.
// Linear 를 Linear 로 만드는 건 "어두운 캔버스" 하나가 아니라 "어두운 캔버스 + 그림자 금지 +
// 80px 에 -3.0px + 4px 사다리" 가 함께 걸린 상태다. 하나만 빼도 다른 시스템이 된다.
//
// ⚠ 2026-09-07 평가에서 타이포·밀도는 **compact · comfort 가 가장 낫다** 는 판단이 나왔다.
//   editorial 의 큰 제목과 airy 의 넓은 여백은 실제 화면에서 과했고, terminal 의 mono 본문은
//   한글 자간이 벌어졌다. 그래서 캐릭터는 전부 그 둘로 고정하고, 차이를 팔레트와 형태에서만
//   만든다. 나머지 타이포·밀도는 축에 남겨 뒀으니 개별로 시험할 수 있다.

import type { PaletteKey } from "./palettes";
import type { ShapeKey } from "./shapes";
import type { TypeKey } from "./types";
import type { DensityKey } from "./densities";

export type Character = {
  label: string;
  claim: string;
  palette: PaletteKey;
  shape: ShapeKey;
  type: TypeKey;
  density: DensityKey;
  do: string[];
  dont: string[];
};

const BASE = { type: "compact", density: "comfort" } as const satisfies { type: TypeKey; density: DensityKey };

export const CHARACTERS = {
  // 기준점. 지금까지 만들어 온 시스템이 실제로 어떤 입장이었는지 말로 옮긴 것이다.
  paper: {
    label: "Paper", ...BASE,
    claim: "종이는 조용하다. 색과 형태는 상태를 말할 때만 나선다.",
    palette: "paper", shape: "paper",
    do: [
      "면은 네 단 사다리로만 나눈다 — raised · canvas · sunken · well",
      "색은 의미를 짊어질 때만 쓴다. 큰 면을 채우는 건 primary 하나뿐",
      "위계는 크기 대신 무게와 색으로 준다",
    ],
    dont: [
      "장식으로 면을 채우지 않는다",
      "그림자를 위계의 주 수단으로 쓰지 않는다",
      "사다리를 건너뛰지 않는다",
    ],
  },

  // 인쇄물의 논리. 색을 거의 쓰지 않는 대신 농도로만 말한다. 경고에만 색이 있어서
  // 그 하나가 페이지에서 유일하게 튄다. 형태는 Paper 를 그대로 쓰기 때문에 기준점과
  // 나란히 놓으면 **같은 구조가 얼마나 더 중립적으로 갈 수 있는지** 가 보인다.
  broadsheet: {
    label: "Broadsheet", ...BASE,
    claim: "지면은 흑백이고, 색은 사고가 났을 때만 켜진다.",
    palette: "vermilion", shape: "paper",
    do: [
      "주홍은 error 에만 쓴다 — 페이지에서 유일한 색이어야 한다",
      "success·info 는 먹의 농도로만 구분한다",
      "형태는 건드리지 않는다. 절제는 색에서만 온다",
    ],
    dont: [
      "두 번째 색을 들이지 않는다",
      "상태를 색상으로 구분하려 들지 않는다 — 농도와 자리로 읽힌다",
      "강조하려고 면을 채우지 않는다",
    ],
  },

  // 같은 구조를 따뜻한 지면 위에 올린 것. Notion 이 그러듯 먹까지 따뜻하게 맞춰서
  // 무채색이 한 칸도 남지 않게 한다 — 회색이 하나라도 섞이면 종이가 아니라 인쇄물로 읽힌다.
  cream: {
    label: "Cream", ...BASE,
    claim: "종이는 원래 희지 않다.",
    palette: "cream", shape: "paper",
    do: [
      "먹도 따뜻하게 맞춘다 — 검정이 아니라 갈색 먹(#211d18)",
      "카드는 지면보다 밝게 띄운다. 더 희게가 아니라 더 밝게",
      "상태색도 지면의 온도를 따라간다",
    ],
    dont: [
      "순수 무채색을 한 칸도 섞지 않는다",
      "순백 카드를 올리지 않는다. 지면이 누렇게 보인다",
      "차가운 파랑을 accent 로 쓰지 않는다",
    ],
  },

  // 도구가 조용히 뒤로 물러나는 쪽. 중립 회색을 한 칸도 두지 않아 화면 전체에 같은 온도가
  // 흐르고, 컨트롤은 알약이되 판은 부드럽게 둥글어 알약이 튀지 않는다.
  atelier: {
    label: "Atelier", ...BASE,
    claim: "중립 회색은 없다. 모든 무채색이 같은 온도를 지난다.",
    palette: "lavender", shape: "lozenge",
    do: [
      "회색을 쓸 자리마다 팔레트의 색조를 통과시킨다",
      "깊이는 선이 아니라 그림자로 만든다",
      "컨트롤을 알약으로 두되 판을 함께 둥글려 대비를 죽인다",
    ],
    dont: [
      "순수 무채색(#888 류)을 섞지 않는다. 한 칸이라도 들어가면 온도가 깨진다",
      "테두리를 굵게 세워 깊이를 대신하지 않는다",
      "두 번째 색상 계열을 들이지 않는다",
    ],
  },

  // Stripe 계열. 먹을 검정이 아니라 남색으로 두면 흰 면이 차가워지고, 그 위에서 인디고
  // 하나가 모든 행동을 가져간다. 판은 거의 각져서 알약 컨트롤과 일부러 부딪힌다.
  ledger: {
    label: "Ledger", ...BASE,
    claim: "먹은 검정이 아니라 남색이다.",
    palette: "indigo", shape: "capsule",
    do: [
      "본문 먹에 푸른 기를 남긴다 — 순수 검정을 쓰지 않는다",
      "행동은 전부 인디고 하나로 모은다",
      "누르는 것은 알약, 담는 것은 판 — 두 곡률을 일부러 부딪힌다",
    ],
    dont: [
      "인디고를 넓은 면에 깔지 않는다. 버튼과 링에만 쓴다",
      "판과 컨트롤의 곡률을 같게 맞추지 않는다",
      "따뜻한 회색을 섞지 않는다",
    ],
  },

  // 지면이 주인공인 쪽. 멀리서도 읽히는 것이 목표라 색이 가장 세고, 판은 순백이 아니라
  // 크림이다 — 따뜻한 지면 위의 순백은 한 장의 종이가 아니라 덧댄 조각으로 읽힌다.
  signage: {
    label: "Signage", ...BASE,
    claim: "배경이 주인공이다. 콘텐츠는 그 위에 놓인 판이다.",
    palette: "citrus", shape: "capsule",
    do: [
      "지면을 채도 높은 색으로 두고 콘텐츠를 판으로 올린다",
      "판은 지면과 같은 온도로 둔다 — 크림이지 순백이 아니다",
      "지면 위 글자는 거의 검정으로 내린다",
    ],
    dont: [
      "지면 색을 판 안쪽까지 끌고 들어가지 않는다",
      "순백 판을 올리지 않는다",
      "지면 위에 중간 명도의 글자를 올리지 않는다",
    ],
  },

  // 형광을 지면으로 내린 캐릭터. 검산이 강제한 구조다 — 형광은 밝은 면 위에서 3:1 을
  // 못 넘으므로 면이 될 수 없고, 지면이 되면 그 위 검정이 16:1 로 읽힌다.
  poster: {
    label: "Poster", ...BASE,
    claim: "형광은 잉크가 아니라 종이다. 그 위에 올라가는 건 검정뿐.",
    palette: "acid", shape: "lozenge",
    do: [
      "형광 위에는 검정만 올린다",
      "콘텐츠는 흰 판으로 띄워 지면과 분리한다",
      "판을 둥글려 형광 지면과의 경계를 부드럽게 만든다",
    ],
    dont: [
      "형광을 버튼·배지 같은 작은 면에 쓰지 않는다. 지면에서만 산다",
      "형광 위에 중간 명도의 회색을 올리지 않는다",
      "두 번째 형광을 들이지 않는다",
    ],
  },

  // 운영 화면의 논리. 어둠이 기본 지면이고 형광은 지금 살아 있는 것에만 붙는다.
  // 컨트롤만 알약이고 판은 각져서, 누를 수 있는 것과 읽는 것이 형태로 갈린다.
  console: {
    label: "Console", ...BASE,
    claim: "빛나는 것만 정보다. 나머지는 어둠에 둔다.",
    palette: "neonNight", shape: "capsule",
    do: [
      "형광은 지금 살아 있는 것에만 쓴다 — 상태·선택·포커스",
      "수치는 tabular 로 세로줄을 맞춘다",
      "깊이는 그림자가 아니라 면의 밝기로 만든다",
    ],
    dont: [
      "형광을 넓은 면에 깔지 않는다. 어둠이 기본 지면이다",
      "판까지 둥글리지 않는다 — 알약은 손이 닿는 것에만 준다",
      "두 형광을 나란히 놓지 않는다",
    ],
  },
} as const satisfies Record<string, Character>;

export type CharacterKey = keyof typeof CHARACTERS;
export const CHARACTER_KEYS = Object.keys(CHARACTERS) as CharacterKey[];
