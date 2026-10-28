# Overview

paper-ui는 복잡한 웹앱을 위한 디자인 시스템입니다. 순백과 검정이 골격이고, 색은 의미가 있을 때만 작게 얹습니다. Atlassian의 밀도, shadcn의 절제된 뉴트럴, ChatGPT의 조용함, SwiftUI의 단정한 마감을 한 결로 묶었습니다.

시스템은 세 층으로 쌓입니다. **Foundations**가 화면의 모든 값을 정하고, **Primitives**가 그 값으로 면·배치·글자·입력 행동·접근성을 만들고, **Atoms**가 그 위에서 한 가지 역할을 하는 컨트롤이 됩니다. 문서와 Playground가 같은 순서로 나뉩니다.

```text
Foundations   Color → Typography → Shape → Layout → Motion
     ↓
Primitives    Layout · Content · Interaction · A11y
     ↓
Atoms         Button · Field · Select · Checkbox · Badge …
```

## 지도

- **시작하기** — [원칙](get-started/philosophy.md) · [설치](get-started/install.md)
- **Foundations** — [Overview](foundations/README.md) · [Color](foundations/color.md) · [Typography](foundations/typography.md) · [Shape](foundations/shape.md) · [Layout](foundations/layout.md) · [Motion](foundations/motion.md)
- **Primitives** — [Overview](primitives/README.md) · [Layout](primitives/layout.md) · [Content](primitives/content.md) · [Interaction](primitives/interaction.md) · [A11y](primitives/a11y.md)
- **Atoms** — [Overview](atoms/README.md) · [States](atoms/states.md)
- **Playground** — [Overview](/playground) · [Foundations](/playground/foundations/color) · [Primitives](/playground/box) · [Atoms](/playground/button)

Playground의 [Overview](/playground)는 표본의 파생 색인입니다. 목록은 어휘에서 오고 캡션의 수치는 토큰에서 읽습니다. 컴포넌트 페이지의 코드는 화면에 그려진 그대로를 찍은 것입니다.

시스템을 **쓰려는** 사람은 [설치](get-started/install.md)에서 시작해 [원칙](get-started/philosophy.md)으로 이 시스템이 왜 이렇게 생겼는지를 잡습니다. 시스템을 **이해하려는** 사람은 [Foundations Overview](foundations/README.md)에서 값이 원본에서 화면까지 흐르는 방식을 따라갑니다.

## 한눈에

- **조합은 제품이 소유한다.** 패키지는 Primitive와 Atom까지만 제공합니다. 화면 단위 조합은 실제 제품에서 같은 요구가 반복될 때만 공통 API로 올라옵니다.
- **검정이 일꾼.** 1차 행동도 파랑이 아니라 검정입니다. 이 시스템에는 `primaryColor`가 없습니다.
- **원본은 한 곳.** 모든 색·크기·시간은 각 시스템의 원본에 한 번만 적히고, 컴포넌트와 앱은 역할을 고릅니다.
- **직교하는 축.** 컨트롤은 의미(accent)와 시각적 무게(variant), 밀도(size)와 글자(fontSize)를 각각 다른 축으로 고릅니다.
- **규칙은 빌드가 지킨다.** 여섯 규칙과 접근성(jsx-a11y)을 문서가 아니라 eslint가 강제하고, 패키지 build와 배포 전 검사, CI가 그 검사를 매번 돌립니다.

[contract:guardrails.contracts.one-to-one]: #
문서의 계약 문장 앞에는 화면에 보이지 않는 표시(`[contract:<id>]: #`)가 있고 그 계약을 검사하는 테스트는 제목을 같은 id로 시작하므로, `pnpm test`가 둘을 1:1로 대조해 테스트 없는 계약과 문서에 없는 계약을 가리키는 테스트를 모두 실패로 잡습니다.
