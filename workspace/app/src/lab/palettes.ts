/* eslint-disable no-restricted-syntax -- 규칙 1(raw hex 금지)의 의도된 예외 구역이다.
   그 규칙은 "색이 tokens/colors.ts 한 곳에서만 정의된다"를 지키려는 것인데, 이 lab 은
   시스템에 들어가지 않은 *후보* 값을 늘어놓고 비교하는 자리라 정의가 여기 있는 게 맞다.
   낙점된 팔레트는 이 파일이 아니라 tokens/colors.ts 로 옮겨져야 하고, 그때 이 예외도 같이
   사라진다. dev/lab 브랜치 밖으로 나가면 안 되는 이유이기도 하다. */
// 팔레트 후보 — 각 항목은 하나의 완고한 주장이다.
//
// 값은 `~/Bufs/Claude Files/2026-09-07/design-palettes.mjs` 에서 대비 검산을 통과한 것을
// 그대로 옮겼다. 계약은 본문 4.5 · 비텍스트 3.0 이고, 맨 면 기준으로 잰다.
// `edge` 는 wash 의 장식 괘선이라 1.4.11 대상이 아니어서 검산에서 뺐다.
//
// ⚠ `paper` 만 위반 4 건을 안고 있다 — solidFg → solid 가 3.91~4.21 이다. 이건 이 lab 이
//   만든 결함이 아니라 현재 시스템이 이미 갖고 있는 것이고(`tokens/colors.ts` 주석에
//   "값의 문제라 범위 밖" 으로 기록돼 있다), 기준점을 손대면 비교가 흐려져 그대로 뒀다.
//   나머지 다섯은 전부 통과한다.

export type PaletteTheme = "light" | "dark";

export type PaletteAccent = {
  solid: string; solidFg: string; ink: string; wash: string; edge: string;
};

export type Palette = {
  label: string;
  theme: PaletteTheme;
  motto: string;
  paper: { raised: string; canvas: string; sunken: string; well: string };
  ink: { base: string; soft: string; faint: string };
  border: { base: string; strong: string };
  primary: { base: string; fg: string; hover: string };
  accent: Record<"info" | "success" | "warning" | "error", PaletteAccent>;
  focusRing: string;
  interaction: { hover: string; selected: string; active: string };
  scrim: string;
};

export const PALETTES = {
  "paper": {
    "label": "Paper",
    "theme": "light",
    "motto": "종이는 조용하다 — 색은 상태에만",
    "paper": {
      "raised": "#ffffff",
      "canvas": "#fcfcfc",
      "sunken": "#f4f4f5",
      "well": "#e2e2e5"
    },
    "ink": {
      "base": "#18181b",
      "soft": "#71717a",
      "faint": "#737373"
    },
    "border": {
      "base": "#e8e8ea",
      "strong": "#d8d8dc"
    },
    "primary": {
      "base": "#18181b",
      "fg": "#ffffff",
      "hover": "#3f3f46"
    },
    "accent": {
      "info": {
        "solid": "#2563eb",
        "solidFg": "#d6e4fd",
        "ink": "#1d4ed8",
        "wash": "#eff6ff",
        "edge": "#bfdbfe"
      },
      "success": {
        "solid": "#15803d",
        "solidFg": "#d6f2df",
        "ink": "#15803d",
        "wash": "#f0fdf4",
        "edge": "#bbf7d0"
      },
      "warning": {
        "solid": "#b45309",
        "solidFg": "#fbe7b4",
        "ink": "#b45309",
        "wash": "#fffbeb",
        "edge": "#fde68a"
      },
      "error": {
        "solid": "#dc2626",
        "solidFg": "#ffe0e0",
        "ink": "#b91c1c",
        "wash": "#fef2f2",
        "edge": "#fecaca"
      }
    },
    "focusRing": "#2563eb",
    "interaction": {
      "hover": "rgba(24,25,28,.05)",
      "selected": "rgba(24,25,28,.13)",
      "active": "rgba(24,25,28,.16)"
    },
    "scrim": "rgba(24,25,28,.32)"
  },
  "acid": {
    "label": "Acid",
    "theme": "light",
    "motto": "형광은 잉크가 아니라 종이다",
    "paper": {
      "raised": "#ffffff",
      "canvas": "#e4fb52",
      "sunken": "#d7f02f",
      "well": "#c2db1e"
    },
    "ink": {
      "base": "#0f1005",
      "soft": "#3f4416",
      "faint": "#4a5019"
    },
    "border": {
      "base": "#a9c018",
      "strong": "#7d9012"
    },
    "primary": {
      "base": "#0f1005",
      "fg": "#e4fb52",
      "hover": "#2a2d10"
    },
    "accent": {
      "info": {
        "solid": "#4c1d95",
        "solidFg": "#e9d5ff",
        "ink": "#4c1d95",
        "wash": "#efe6ff",
        "edge": "#c4a8f5"
      },
      "success": {
        "solid": "#14532d",
        "solidFg": "#dcfce7",
        "ink": "#14532d",
        "wash": "#e7f7ec",
        "edge": "#93c5a8"
      },
      "warning": {
        "solid": "#7c2d12",
        "solidFg": "#ffedd5",
        "ink": "#7c2d12",
        "wash": "#fdeee2",
        "edge": "#e0a882"
      },
      "error": {
        "solid": "#9f1239",
        "solidFg": "#ffe4e6",
        "ink": "#9f1239",
        "wash": "#fde8ec",
        "edge": "#eda1b4"
      }
    },
    "focusRing": "#4c1d95",
    "interaction": {
      "hover": "rgba(15,16,5,.07)",
      "selected": "rgba(15,16,5,.15)",
      "active": "rgba(15,16,5,.19)"
    },
    "scrim": "rgba(15,16,5,.44)"
  },
  "lavender": {
    "label": "Lavender",
    "theme": "light",
    "motto": "중립 회색은 없다",
    "paper": {
      "raised": "#ffffff",
      "canvas": "#eeefff",
      "sunken": "#e4e5fb",
      "well": "#d2d4f2"
    },
    "ink": {
      "base": "#1b1a33",
      "soft": "#5b5a80",
      "faint": "#6a6990"
    },
    "border": {
      "base": "#dcdcf5",
      "strong": "#c6c6e8"
    },
    "primary": {
      "base": "#4338ca",
      "fg": "#ffffff",
      "hover": "#3730a3"
    },
    "accent": {
      "info": {
        "solid": "#4338ca",
        "solidFg": "#e0e7ff",
        "ink": "#3730a3",
        "wash": "#eef0ff",
        "edge": "#c0c3f0"
      },
      "success": {
        "solid": "#0f766e",
        "solidFg": "#ccfbf1",
        "ink": "#0f766e",
        "wash": "#e8f6f4",
        "edge": "#8fd4cc"
      },
      "warning": {
        "solid": "#854d0e",
        "solidFg": "#fef3c7",
        "ink": "#78450c",
        "wash": "#fbf3df",
        "edge": "#e2c383"
      },
      "error": {
        "solid": "#be123c",
        "solidFg": "#ffe4e6",
        "ink": "#be123c",
        "wash": "#fceaee",
        "edge": "#f0a3b5"
      }
    },
    "focusRing": "#4338ca",
    "interaction": {
      "hover": "rgba(27,26,51,.05)",
      "selected": "rgba(67,56,202,.12)",
      "active": "rgba(67,56,202,.16)"
    },
    "scrim": "rgba(27,26,51,.36)"
  },
  "neonNight": {
    "label": "Neon Night",
    "theme": "dark",
    "motto": "어둠은 배경이 아니라 재료다",
    "paper": {
      "raised": "#0d0d10",
      "canvas": "#101014",
      "sunken": "#16161c",
      "well": "#24242e"
    },
    "ink": {
      "base": "#e8e8f0",
      "soft": "#a0a0b4",
      "faint": "#8b8b9e"
    },
    "border": {
      "base": "#2a2a36",
      "strong": "#3d3d4d"
    },
    "primary": {
      "base": "#ccff00",
      "fg": "#0d0d10",
      "hover": "#b5e600"
    },
    "accent": {
      "info": {
        "solid": "#22d3ee",
        "solidFg": "#06232b",
        "ink": "#4ce0f5",
        "wash": "#10333c",
        "edge": "#1c5e6d"
      },
      "success": {
        "solid": "#4ade80",
        "solidFg": "#07240f",
        "ink": "#6ee7a0",
        "wash": "#123322",
        "edge": "#1e5c3a"
      },
      "warning": {
        "solid": "#fbbf24",
        "solidFg": "#2a1c00",
        "ink": "#fcd34d",
        "wash": "#33280a",
        "edge": "#5e4a14"
      },
      "error": {
        "solid": "#fb7185",
        "solidFg": "#2b0710",
        "ink": "#fda4af",
        "wash": "#3a121c",
        "edge": "#68222f"
      }
    },
    "focusRing": "#ccff00",
    "interaction": {
      "hover": "rgba(204,255,0,.07)",
      "selected": "rgba(204,255,0,.14)",
      "active": "rgba(204,255,0,.2)"
    },
    "scrim": "rgba(0,0,0,.66)"
  },
  "citrus": {
    "label": "Citrus",
    "theme": "light",
    "motto": "배경이 주인공이다",
    "paper": {
      "raised": "#ffffff",
      "canvas": "#f8b957",
      "sunken": "#f0a52e",
      "well": "#d98d18"
    },
    "ink": {
      "base": "#1c1206",
      "soft": "#48300f",
      "faint": "#523713"
    },
    "border": {
      "base": "#dd9422",
      "strong": "#ab690e"
    },
    "primary": {
      "base": "#4c1d95",
      "fg": "#ffffff",
      "hover": "#3f177d"
    },
    "accent": {
      "info": {
        "solid": "#4c1d95",
        "solidFg": "#ece3ff",
        "ink": "#42167f",
        "wash": "#efe7ff",
        "edge": "#b79df0"
      },
      "success": {
        "solid": "#0b4a31",
        "solidFg": "#d7f5e6",
        "ink": "#083c28",
        "wash": "#e3f5ec",
        "edge": "#7fc3a5"
      },
      "warning": {
        "solid": "#5c3104",
        "solidFg": "#ffeacc",
        "ink": "#4d2903",
        "wash": "#fdeed9",
        "edge": "#e0ab63"
      },
      "error": {
        "solid": "#8d1027",
        "solidFg": "#ffe1e6",
        "ink": "#780d21",
        "wash": "#fde7ea",
        "edge": "#eb96a6"
      }
    },
    "focusRing": "#1c1206",
    "interaction": {
      "hover": "rgba(28,18,6,.08)",
      "selected": "rgba(28,18,6,.16)",
      "active": "rgba(28,18,6,.2)"
    },
    "scrim": "rgba(28,18,6,.46)"
  },
  "vermilion": {
    "label": "Vermilion",
    "theme": "light",
    "motto": "경고만 색을 가진다",
    "paper": {
      "raised": "#ffffff",
      "canvas": "#fbfaf9",
      "sunken": "#f2f0ee",
      "well": "#e0dcd8"
    },
    "ink": {
      "base": "#16130f",
      "soft": "#6b6560",
      "faint": "#6e6862"
    },
    "border": {
      "base": "#e6e2de",
      "strong": "#d3cec9"
    },
    "primary": {
      "base": "#16130f",
      "fg": "#fbfaf9",
      "hover": "#3a342d"
    },
    "accent": {
      "info": {
        "solid": "#3a342d",
        "solidFg": "#f2f0ee",
        "ink": "#3a342d",
        "wash": "#f2f0ee",
        "edge": "#c9c3bc"
      },
      "success": {
        "solid": "#16130f",
        "solidFg": "#fbfaf9",
        "ink": "#16130f",
        "wash": "#eeece9",
        "edge": "#bdb7b0"
      },
      "warning": {
        "solid": "#6b6560",
        "solidFg": "#fbfaf9",
        "ink": "#575049",
        "wash": "#f4f2f0",
        "edge": "#d0cac4"
      },
      "error": {
        "solid": "#d1341f",
        "solidFg": "#fff1ee",
        "ink": "#b52a17",
        "wash": "#fdefec",
        "edge": "#eda596"
      }
    },
    "focusRing": "#d1341f",
    "interaction": {
      "hover": "rgba(22,19,15,.05)",
      "selected": "rgba(22,19,15,.12)",
      "active": "rgba(22,19,15,.16)"
    },
    "scrim": "rgba(22,19,15,.34)"
  }
} as const satisfies Record<string, Palette>;

export type PaletteKey = keyof typeof PALETTES;
export const PALETTE_KEYS = Object.keys(PALETTES) as PaletteKey[];
