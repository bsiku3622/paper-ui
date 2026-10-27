# Overview

paper-ui는 복잡한 웹앱을 위한 디자인 시스템입니다. 순백과 검정이 골격이고, 색은 의미가 있을 때만 작게 얹습니다. 이 시스템은 Atlassian의 밀도, shadcn의 절제된 뉴트럴, ChatGPT의 조용함, SwiftUI의 단정한 마감을 한 결로 묶었습니다.

시작점은 두 갈래입니다. 시스템을 **쓰려는** 사람은 [설치](get-started/install.md)에서 시작해 [원칙](get-started/philosophy.md)에서 이 시스템이 왜 이렇게 생겼는지를 잡습니다. 시스템을 **이해하려는** 사람은 [토큰](foundations/tokens.md)에서 값의 정본을 보고 [색 아키텍처](foundations/color-architecture.md)와 [아키텍처](foundations/architecture.md)에서 그 값이 화면까지 흐르는 방식을 따라갑니다.

## 지도

- **시작하기** — [설치](get-started/install.md) · [원칙](get-started/philosophy.md)
- **기초** — [토큰](foundations/tokens.md) · [색 아키텍처](foundations/color-architecture.md) · [Shape](foundations/shape.md) · [Layout](foundations/layout.md) · [아키텍처](foundations/architecture.md) · [Interaction](foundations/interaction.md)
- **컴포넌트 검토** — [현재 목록과 계약](components/inventory.md) · [Primitive API](components/primitives.md)
- **플레이그라운드** — [Foundations](/playground/foundations/color-typography) · [Palette](/playground/palette)

## 한눈에

- **Composition stays in the product.** The package contains layout primitives and individual controls. Shared compositions return only when real product use establishes a repeated, common need.
- **검정이 일꾼.** 1차 액션도 파랑이 아니라 검정입니다. 이 시스템에는 `primaryColor`가 없습니다.
- **직교하는 축.** Controls use separate semantic and visual-weight axes. Shape values live in tokens; a control exposes only the finite choices it needs.
- **규칙은 빌드가 지킨다.** 네 절대 규칙과 접근성(jsx-a11y)을 문서가 아니라 eslint가 강제합니다.
- **정본은 하나.** 모든 색·크기·시간은 `tokens/`에 한 번 정의되고, 같은 트리를 걷는 헬퍼가 CSS 변수와 TS 참조를 함께 만듭니다.
