// 캐릭터 — 네 축을 한 몸으로 묶은 완성된 입장.
//
// 축을 따로 고르는 것만으로는 시스템이 되지 않는다. awesome-design-md 의 DESIGN.md 들이
// 보여주는 건 색·타이포·밀도·깊이가 서로를 강화하며 하나의 주장을 이룬다는 것이다.
// Linear 를 Linear 로 만드는 건 "어두운 캔버스" 하나가 아니라 "어두운 캔버스 + 그림자 금지 +
// 80px 에 -3.0px + 4px 사다리" 가 함께 걸린 상태다. 하나만 빼도 다른 시스템이 된다.
//
// 그래서 lab 은 두 층으로 고른다. 캐릭터를 고르면 네 축이 한꺼번에 서고, 그 뒤에 개별 축을
// 만져 어디까지가 그 캐릭터인지 시험한다. do/don't 는 장식이 아니라 그 경계선이다.

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

export const CHARACTERS = {
  // 기준점. 지금까지 만들어 온 시스템이 실제로 어떤 입장이었는지 말로 옮긴 것이다.
  paper: {
    label: "Paper",
    claim: "종이는 조용하다. 색과 형태는 상태를 말할 때만 나선다.",
    palette: "paper", shape: "paper", type: "compact", density: "comfort",
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

  // 인쇄물의 논리. 색을 거의 쓰지 않는 대신 크기와 여백으로만 말한다. 경고에만 색이 있어서
  // 그 하나가 페이지에서 유일하게 튀는 것이 이 캐릭터의 전부다.
  broadsheet: {
    label: "Broadsheet",
    claim: "지면은 흑백이고, 색은 사고가 났을 때만 켜진다.",
    palette: "vermilion", shape: "blade", type: "editorial", density: "airy",
    do: [
      "제목과 본문의 크기 차이를 네 배 이상 벌린다",
      "무리는 선이 아니라 거리로 나눈다",
      "주홍은 error 에만 쓴다 — 페이지에서 유일한 색이어야 한다",
    ],
    dont: [
      "곡률을 한 칸도 넣지 않는다. 알약 트랙까지 사각이다",
      "정보 전달용으로 그림자를 쓰지 않는다",
      "success·info 에 색을 주지 않는다. 먹의 농도로만 구분한다",
    ],
  },

  // 운영 화면의 논리. 하루 종일 켜져 있고 데이터가 많다는 전제 위에 선다. 스크롤 한 번이
  // 여백보다 비싸다고 보기 때문에 밀도가 가장 높고, 글자가 전부 같은 폭이다.
  console: {
    label: "Console",
    claim: "빛나는 것만 정보다. 나머지는 어둠에 둔다.",
    palette: "neonNight", shape: "blade", type: "terminal", density: "tight",
    do: [
      "수치는 tabular 로 세로줄을 맞춘다",
      "형광은 지금 살아 있는 것에만 쓴다 — 상태·선택·포커스",
      "빈 자리를 남기지 말고 정보로 채운다",
    ],
    dont: [
      "형광을 넓은 면에 깔지 않는다. 어둠이 기본 지면이다",
      "곡률로 부드럽게 만들지 않는다",
      "본문을 sans 로 돌리지 않는다 — 폭이 흔들리면 표가 무너진다",
    ],
  },

  // 형광을 지면으로 내린 캐릭터. 검산이 강제한 구조다 — 형광은 밝은 면 위에서 3:1 을
  // 못 넘으므로 면이 될 수 없고, 지면이 되면 그 위 검정이 16:1 로 읽힌다.
  poster: {
    label: "Poster",
    claim: "형광은 잉크가 아니라 종이다. 그 위에 올라가는 건 검정뿐.",
    palette: "acid", shape: "pillow", type: "editorial", density: "airy",
    do: [
      "형광 위에는 검정만 올린다",
      "콘텐츠는 흰 판으로 띄워 지면과 분리한다",
      "제목을 크게 써서 지면의 채도와 맞선다",
    ],
    dont: [
      "형광을 버튼·배지 같은 작은 면에 쓰지 않는다. 지면에서만 산다",
      "형광 위에 중간 명도의 회색을 올리지 않는다",
      "두 번째 형광을 들이지 않는다",
    ],
  },

  // 도구가 조용히 뒤로 물러나는 쪽. 중립 회색을 한 칸도 두지 않아 화면 전체에 같은 온도가
  // 흐르고, 읽는 것을 우선해 본문이 가장 크다.
  atelier: {
    label: "Atelier",
    claim: "중립 회색은 없다. 모든 무채색이 같은 온도를 지난다.",
    palette: "lavender", shape: "pillow", type: "humanist", density: "comfort",
    do: [
      "회색을 쓸 자리마다 팔레트의 색조를 통과시킨다",
      "본문을 16px 이상으로 두고 행간을 1.6 이상 연다",
      "깊이는 선이 아니라 그림자로 만든다",
    ],
    dont: [
      "순수 무채색(#888 류)을 섞지 않는다. 한 칸이라도 들어가면 온도가 깨진다",
      "음수 tracking 을 본문에 걸지 않는다",
      "테두리를 굵게 세워 깊이를 대신하지 않는다",
    ],
  },

  // 지면이 주인공인 쪽. 멀리서도 읽히는 것이 목표라 색이 가장 세고 컨트롤이 알약이다.
  signage: {
    label: "Signage",
    claim: "배경이 주인공이다. 콘텐츠는 그 위에 놓인 흰 판이다.",
    palette: "citrus", shape: "capsule", type: "editorial", density: "comfort",
    do: [
      "지면을 채도 높은 색으로 두고 콘텐츠를 흰 판으로 올린다",
      "누르는 것은 알약, 담는 것은 판 — 두 곡률을 일부러 부딪힌다",
      "지면 위 글자는 거의 검정으로 내린다",
    ],
    dont: [
      "지면 색을 카드 안쪽까지 끌고 들어가지 않는다",
      "판과 컨트롤의 곡률을 같게 맞추지 않는다. 대비가 이 캐릭터의 전부다",
      "지면 위에 중간 명도의 글자를 올리지 않는다",
    ],
  },
} as const satisfies Record<string, Character>;

export type CharacterKey = keyof typeof CHARACTERS;
export const CHARACTER_KEYS = Object.keys(CHARACTERS) as CharacterKey[];
