// 밀도 후보.
//
// DESIGN.md 들이 공통으로 명시하는 항목이면서 lab 첫 판에 빠져 있던 축이다. Linear 는
// 버튼 8×14 · 카드 24 · 배너 48 을, Vercel 은 섹션 64~96 · 카드 24~32 를 못 박아 둔다.
// 밀도는 취향이 아니라 그 시스템이 화면을 무엇으로 보는지에 대한 입장이다 — 비싼 자리로
// 보면 조이고, 읽을 자리로 보면 연다.

const REM = (px: number): string => `${px / 16}rem`;

export type Density = {
  label: string;
  motto: string;
  gap: { xs: string; sm: string; md: string; lg: string; xl: string };
  padInteraction: { xs: string; sm: string; md: string; lg: string; xl: string };
  padLayout: { xs: string; sm: string; md: string; lg: string; xl: string };
  controlPadX: { sm: string; md: string; lg: string };
};

export const DENSITIES = {
  // 기준점. 현재 시스템 값 그대로다.
  comfort: {
    label: "Comfort",
    motto: "손이 닿을 만큼은 띄운다",
    gap: { xs: REM(4), sm: REM(8), md: REM(12), lg: REM(16), xl: REM(24) },
    padInteraction: { xs: REM(4), sm: REM(8), md: REM(12), lg: REM(16), xl: REM(24) },
    padLayout: { xs: REM(8), sm: REM(12), md: REM(16), lg: REM(24), xl: REM(32) },
    controlPadX: { sm: REM(10), md: REM(13), lg: REM(17) },
  },

  // 한 화면에 최대한 담는다. 운영 도구가 하루 종일 켜져 있는 화면이라면 스크롤 한 번이
  // 여백보다 비싸다는 입장.
  tight: {
    label: "Tight",
    motto: "화면은 비싸다",
    gap: { xs: REM(2), sm: REM(5), md: REM(8), lg: REM(12), xl: REM(16) },
    padInteraction: { xs: REM(3), sm: REM(6), md: REM(8), lg: REM(12), xl: REM(16) },
    padLayout: { xs: REM(6), sm: REM(8), md: REM(12), lg: REM(16), xl: REM(20) },
    controlPadX: { sm: REM(8), md: REM(10), lg: REM(13) },
  },

  // 여백 자체를 위계로 쓴다. 선이나 상자를 더 그리는 대신 거리로 무리를 나눈다.
  airy: {
    label: "Airy",
    motto: "여백이 위계다",
    gap: { xs: REM(6), sm: REM(12), md: REM(18), lg: REM(28), xl: REM(40) },
    padInteraction: { xs: REM(6), sm: REM(12), md: REM(16), lg: REM(22), xl: REM(32) },
    padLayout: { xs: REM(12), sm: REM(18), md: REM(24), lg: REM(36), xl: REM(48) },
    controlPadX: { sm: REM(14), md: REM(18), lg: REM(24) },
  },
} as const satisfies Record<string, Density>;

export type DensityKey = keyof typeof DENSITIES;
export const DENSITY_KEYS = Object.keys(DENSITIES) as DensityKey[];
