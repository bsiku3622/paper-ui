// The notes of the signed-in account the demo draws: invented, in plain Korean, each with a few of the things a paper
// holds (a list, a quote, a table, a formula). Dates count back from the demos' present.

import { NOW, daysAgo } from "../../../kit";
import { markdownToHtml } from "../lib/markdown";
import { DEFAULT_SETTINGS, type DocumentData, type Settings } from "../lib/types";

type Seed = { id: string; title: string; days: number; hour?: number; markdown: string; settings?: Partial<Settings> };

const SEEDS: Seed[] = [
  {
    id: "reading-club",
    title: "독서 모임 발제문",
    days: 1,
    markdown: `# 독서 모임 발제문

이번 달에는 짧은 소설집 《느린 편지》를 함께 읽었습니다. 발제는 세 가지 질문으로 정리했습니다.

## 1. 편지는 왜 느려야 했을까

작품 속 인물들은 답장이 도착하기까지 일주일을 기다립니다. 그 기다림이 **문장을 고르는 시간**이 된다는 점이 인상 깊었습니다.

> 쓰는 사람은 늘 받는 사람보다 먼저 서두른다.

## 2. 함께 이야기할 것

- 가장 오래 남은 장면은 어디였나요
- 나라면 마지막 편지에 무엇을 적었을까요
- 느림이 불편하게 느껴진 순간이 있었나요

## 3. 다음 모임

12월 첫째 주 토요일, 같은 시간에 만납니다.
`,
  },
  {
    id: "research-plan",
    title: "2학기 연구 계획서 초안",
    days: 3,
    markdown: `# 2학기 연구 계획서 초안

## 연구 질문

학교 안 소음이 학습 집중도에 미치는 영향을 *측정 가능한 값*으로 나타낼 수 있을까?

## 방법

교실 세 곳에서 같은 시간대에 소음 수준을 기록하고, 같은 날 쪽지 시험의 평균 점수와 나란히 놓고 비교합니다.

| 단계 | 내용 | 시기 |
| --- | --- | --- |
| 준비 | 측정 도구 점검과 장소 허락 | 9월 |
| 측정 | 교실 세 곳, 매주 두 번 | 10월 ~ 11월 |
| 정리 | 자료 정리와 그래프 | 12월 |

## 해야 할 일

- [x] 지도 선생님께 계획 보여 드리기
- [x] 측정 장소 세 곳 정하기
- [ ] 측정 일정표 만들기
- [ ] 중간 발표 자료 준비
`,
  },
  {
    id: "club-minutes",
    title: "동아리 회의록 · 11월 첫째 주",
    days: 5,
    markdown: `# 동아리 회의록

## 참석

열두 명 가운데 열한 명이 참석했습니다. 한 명은 사정이 있어 글로 의견을 보냈습니다.

## 결정한 것

1. 학교 축제 부스는 **엽서 인쇄**로 정한다.
2. 엽서 그림은 다음 주 수요일까지 각자 두 장씩 낸다.
3. 인쇄 비용은 동아리 지원금에서 먼저 쓰고, 남으면 회식에 보탠다.

## 다음 회의

다음 회의는 11월 둘째 주 목요일 점심시간입니다. 그림이 모이면 함께 고릅니다.
`,
  },
  {
    id: "trip-list",
    title: "여행 준비 목록",
    days: 9,
    markdown: `# 여행 준비 목록

## 챙길 것

- [x] 여권과 비행기 표 사본
- [x] 충전기와 보조 배터리
- [ ] 우산 겸 양산
- [ ] 얇은 겉옷
- [ ] 읽을 책 두 권

## 가기 전에

- [x] 숙소 예약 확인
- [ ] 환전
- [ ] 집 앞 화분 부탁하기
`,
  },
  {
    id: "garden-essay",
    title: "에세이: 책상 위의 작은 정원",
    days: 12,
    markdown: `# 책상 위의 작은 정원

책상 한쪽 구석에 작은 화분 하나를 들인 지 두 달이 지났다. 처음에는 그저 초록색이 필요해서 샀을 뿐이었다. 잎이 몇 장인지 세어 본 적도 없었다.

어느 날 아침, 새 잎이 말려 있던 몸을 펴고 있는 것을 보았다. **하루 사이에** 그렇게 달라질 수 있다는 것이 신기했다. 그날부터 나는 문제를 풀다가 막히면 화분을 바라보게 되었다.

> 자라는 것들은 보고 있을 때는 자라지 않는 것처럼 보인다.

정원이라고 부르기에는 민망한 크기다. 그래도 나는 이것을 정원이라고 부르기로 했다. 이름을 붙이고 나니 물을 주는 시간이 하루에서 가장 조용한 시간이 되었다.
`,
  },
  {
    id: "series-notes",
    title: "수학 노트 — 급수와 수렴",
    days: 18,
    markdown: `# 급수와 수렴

## 등비급수

첫째항이 $a$, 공비가 $r$인 등비급수는 $|r| < 1$일 때 수렴합니다.

$$
\\sum_{n=0}^{\\infty} a r^n = \\frac{a}{1 - r}
$$

## 예

$a = 3$, $r = \\frac{1}{2}$이면 합은 $6$입니다.

## 확인할 것

- 공비가 $-1$에 가까울 때 부분합의 모양
- 교대급수의 수렴 판정과 오차의 크기
`,
  },
  {
    id: "talk-script",
    title: "발표 대본: 도시의 소리 지도",
    days: 25,
    markdown: `# 도시의 소리 지도

안녕하세요. 오늘은 우리 동네의 소리를 지도 위에 올려 본 이야기를 하려고 합니다.

## 시작

한 달 동안 같은 길을 걸으며 들리는 소리를 적었습니다. 버스가 멈추는 소리, 가게 문에 달린 종소리, 그리고 이른 아침의 빗자루 소리였습니다.

## 지도

소리를 **사람의 소리**, **기계의 소리**, **자연의 소리**로 나누어 점으로 찍었습니다. 한눈에 보면 큰길에는 기계의 소리가, 골목 안쪽에는 사람의 소리가 모여 있습니다.

## 마치며

들으려고 하지 않으면 들리지 않는 소리가 많았습니다. 여러분도 오늘 집에 가는 길에 한 가지만 적어 보세요.
`,
  },
  {
    id: "english-draft",
    title: "영어 에세이 초고",
    days: 33,
    markdown: `# Quiet Mornings

I usually wake up before anyone else in the house. The kitchen is cold, the window is still blue, and for a few minutes nothing is expected of me.

I have started to protect those minutes. I make tea, open a notebook, and write one sentence about yesterday. Some days the sentence is long. Most days it is not.
`,
    settings: { font: "sans", sizePt: 11 },
  },
  {
    id: "empty-note",
    title: "새로운 노트",
    days: 41,
    markdown: "# \n\n",
  },
];

export const seedNotes = (): DocumentData[] =>
  SEEDS.map((seed) => {
    const at = daysAgo(seed.days);
    at.setHours(seed.hour ?? 9 + (seed.days % 9), (seed.days * 7) % 60);
    return {
      id: seed.id,
      title: seed.title,
      html: markdownToHtml(seed.markdown),
      settings: { ...DEFAULT_SETTINGS, ...seed.settings },
      updatedAt: Math.min(at.getTime(), NOW.getTime()),
    };
  });
