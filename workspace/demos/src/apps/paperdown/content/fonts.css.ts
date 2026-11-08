// Content: the original's two serif faces. Paper's family axis has sans and mono and no serif; Paperdown sets its sheet and its
// name in Myeongjo. KoPub Batang is the original's face for the paper (Google Fonts, SIL OFL 1.1, the licence next to the files)
// and Noto Serif KR 600 (Latin letters only) is its wordmark's.

import { globalFontFace } from "@vanilla-extract/css";

import kopubRegular from "./fonts/kopub-batang/KoPubBatang-Regular.ttf";
import kopubBold from "./fonts/kopub-batang/KoPubBatang-Bold.ttf";
import notoLatin600 from "./fonts/noto-serif-kr/noto-serif-kr-latin-600-normal.woff2";

globalFontFace("KoPub Batang", [
  { src: `url("${kopubRegular}") format("truetype")`, fontWeight: "100 500", fontStyle: "normal", fontDisplay: "swap" },
  { src: `url("${kopubBold}") format("truetype")`, fontWeight: "600 900", fontStyle: "normal", fontDisplay: "swap" },
]);

globalFontFace("Noto Serif KR", {
  src: `url("${notoLatin600}") format("woff2")`,
  fontWeight: 600,
  fontStyle: "normal",
  fontDisplay: "swap",
  unicodeRange: "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
});

export const SERIF_STACK = '"KoPub Batang", "Noto Serif KR", "Noto Serif CJK KR", "Source Han Serif K", "AppleMyungjo", "Batang", serif';
export const WORDMARK_STACK = '"Noto Serif KR", "KoPub Batang", "AppleMyungjo", serif';
export const SANS_STACK = '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
