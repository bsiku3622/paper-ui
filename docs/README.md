# Overview

paper-ui는 복잡한 웹앱을 위한 디자인 시스템입니다. 순백과 검정이 골격이고, 색은 의미가 있을 때만 작게 얹습니다. 이 시스템은 Atlassian의 밀도, shadcn의 절제된 뉴트럴, ChatGPT의 조용함, SwiftUI의 단정한 마감을 한 결로 묶었습니다.

시작점은 두 갈래입니다. 시스템을 **쓰려는** 사람은 [설치](get-started/install.md)에서 시작해 [원칙](get-started/philosophy.md)에서 이 시스템이 왜 이렇게 생겼는지를 잡습니다. 시스템을 **이해하려는** 사람은 [토큰](foundations/tokens.md)에서 값의 정본을 보고 [아키텍처](foundations/architecture.md)에서 그 값이 어떻게 화면까지 흐르는지를 따라갑니다.

## 지도

- **시작하기** — [설치](get-started/install.md) · [원칙](get-started/philosophy.md)
- **기초** — [토큰](foundations/tokens.md) · [아키텍처](foundations/architecture.md)
- **컴포넌트** — [개요](components/overview.md)
- **실전 조합** — [레시피](recipes/README.md)

## 한눈에

- **27 컴포넌트(기준선).** 이 스물일곱은 폼·피드백·로딩까지 시스템이 완결되는 최소 집합입니다. 더 늘리는 잣대는 단계로 갈립니다 — 정식 배포(v1) 이후엔 실제 화면에서 두 번 이상 필요했다는 증거가, v1로 가는 지금은 표준 primitive·semantic 공백인지가 기준입니다.
- **검정이 일꾼.** 1차 액션도 파랑이 아니라 검정입니다. 이 시스템에는 `primaryColor`가 없습니다.
- **직교하는 축.** 컴포넌트는 `variant`(시각 무게) × `status`(의미 색)처럼 뜻의 축만 받고, 형태 값은 토큰이 정합니다.
- **규칙은 빌드가 지킨다.** 네 절대 규칙과 접근성(jsx-a11y)을 문서가 아니라 eslint가 강제합니다.
- **정본은 하나.** 모든 색·크기·시간은 `tokens/`에 한 번 정의되고, 같은 트리를 걷는 헬퍼가 CSS 변수와 TS 참조를 함께 만듭니다.
