# Overview

paper-ui는 복잡한 웹앱을 위한 디자인 시스템입니다. 순백과 검정이 골격이고, 색은 의미가 있을 때만 작게 얹습니다. Atlassian의 밀도, shadcn의 절제된 뉴트럴, ChatGPT의 조용함, SwiftUI의 단정한 마감을 한 결로 묶었습니다.

시스템은 세 계층으로 쌓입니다. **Foundations**가 화면의 모든 값을 정하고, **Primitives**가 그 값으로 바탕(1차)과 Box에 능력 하나를 더한 조각(2차)을 만들고, **Atoms**가 그 위에서 한 가지 역할을 하는 컨트롤이 됩니다. 문서와 Playground가 같은 순서로 나뉩니다.

```text
Foundations   Color → Typography → Shape → Layout → Motion
     ↓
Primitives    1차 Element · Content · A11y
              2차 Paint · Press · Select · Float
                  Drag · Focus · Field · Layout
     ↓
Atoms         Button · Field · Select · Checkbox · Badge …
```

## 지도

<!-- generated:docs-map -->
<!-- 이 블록은 생성됩니다 — pnpm docs:sync -->
- **시작하기** — [원칙](get-started/philosophy.md) · [설치](get-started/install.md) · [Theming](get-started/theming.md)
- **Foundations** — [Overview](foundations/README.md) · [Color](foundations/color.md) · [Typography](foundations/typography.md) · [Shape](foundations/shape.md) · [Layout](foundations/layout.md) · [Motion](foundations/motion.md)
- **Primitives** — [Overview](primitives/README.md) · 1차 [Element](primitives/element.md) · [Content](primitives/content.md) · [A11y](primitives/a11y.md) · 2차 [Paint](primitives/paint.md) · [Control](primitives/control.md) · [Press](primitives/press.md) · [Select](primitives/select.md) · [Float](primitives/float.md) · [Drag](primitives/drag.md) · [Focus](primitives/focus.md) · [Field](primitives/field.md) · [Layout](primitives/layout.md)
- **Atoms** — [Overview](atoms/README.md) · [States](atoms/states.md)
- **Components** — [Overview](components/README.md) · [Calendar · DatePicker](components/date-picker.md)
- **Playground** — [Overview](/playground) · [Foundations](/playground/foundations/color) · [Primitives](/playground/box) · [Atoms](/playground/button) · [Components](/playground/sidebar)
<!-- /generated:docs-map -->

Playground의 [Overview](/playground)는 표본의 파생 색인입니다. 목록은 어휘에서 오고 캡션의 수치는 토큰에서 읽습니다. 컴포넌트 페이지의 코드는 화면에 그려진 그대로를 찍은 것입니다.

시스템을 **쓰려는** 사람은 [설치](get-started/install.md)에서 시작해 [원칙](get-started/philosophy.md)으로 이 시스템이 왜 이렇게 생겼는지를 잡습니다. 시스템을 **이해하려는** 사람은 [Foundations Overview](foundations/README.md)에서 값이 원본에서 화면까지 흐르는 방식을 따라갑니다.

## 한눈에

- **조합은 제품이 소유한다.** 패키지는 Primitive와 Atom까지만 제공합니다. 화면 단위 조합은 실제 제품에서 같은 요구가 반복될 때만 공통 API로 올라옵니다.
- **검정이 일꾼.** 1차 행동도 파랑이 아니라 검정입니다. 이 시스템에는 `primaryColor`가 없습니다.
- **원본은 한 곳.** 모든 색·크기·시간은 각 시스템의 원본에 한 번만 적히고, 컴포넌트와 앱은 역할을 고릅니다.
- **직교하는 축.** 컨트롤은 의미(accent)와 시각적 무게(variant), 밀도(size)와 글자(fontSize)를 각각 다른 축으로 고릅니다.
- **규칙은 빌드가 지킨다.** 여덟 규칙과 접근성(jsx-a11y)을 문서가 아니라 eslint가 강제하고, 패키지 build와 배포 전 검사, CI가 그 검사를 매번 돌립니다.

[contract:guardrails.contracts.one-to-one]: #
문서의 계약 문장 앞에는 화면에 보이지 않는 표시(`[contract:<id>]: #`)가 있고 그 계약을 검사하는 테스트는 제목을 같은 id로 시작하므로, `pnpm test`가 둘을 1:1로 대조해 테스트 없는 계약과 문서에 없는 계약을 가리키는 테스트를 모두 실패로 잡습니다.

[contract:guardrails.testids.no-orphans]: #
앱과 e2e 하네스에 심은 `data-testid`는 테스트가 찾을 때만 남습니다. `pnpm test`의 `check-testids`가 테스트의 `getByTestId` · `[data-testid=…]`와 그 id를 적어 둔 표로 읽히지 않는 값을 모두 실패로 잡으므로, 아무도 읽지 않는 fixture는 지우거나 spec에 묶어야 합니다.

## 사이트 계약

사이트(홈 · 문서 · Playground · Demo)도 테스트가 지키는 약속을 갖습니다.

[contract:app.routes.every-route]: #
사이트가 선언한 모든 경로, 곧 페이지 목록과 문서 목록(`DOC_GROUPS`)과 Playground 사이드바가 그리는 링크는 리다이렉트 없이 열리고, 본문(`main`)에 h1을 그리며, 콘솔 오류를 내지 않고, 휴대폰 폭에서 가로로 넘치지 않습니다. 다크 테마에서는 대표 경로로 같은 확인을 한 번 더 합니다.

[contract:app.docs.links-resolve]: #
문서가 그리는 모든 링크는 갑니다. 문서 링크는 문서 목록에 있는 쪽으로, 앵커는 그 쪽에 실제로 있는 id로, 앱 링크는 경로를 바꾸지 않는 h1이 있는 쪽으로 닿습니다.

[contract:app.playground.foundations-render]: #
Playground의 Foundations 다섯 쪽(Color · Typography · Shape · Layout · Motion)은 각자 제목과 절을 오류 없이 그립니다.

[contract:app.playground.code-panel]: #
컴포넌트 쪽의 코드 패널은 지금 그려진 것을 그대로 찍습니다. 복사는 찍힌 코드를 클립보드에 담고, 편집한 코드는 읽을 수 있으면 컨트롤과 미리보기를 옮기며, 초기화는 컨트롤과 코드를 기본값으로 되돌립니다. select는 컴포넌트의 실제 기본값을 그 값의 항목에 붙여 말하고(`solid (default)`), 기본값이 선택지가 아니면 맨 위 한 칸이 그 낱말로 말합니다(`none (default)`). 선택지가 셋 이하인 prop은 선 두른 SegmentControl이라 Select와 같은 흰 틀로 섭니다.

[contract:app.playground.reference]: #
Atom 쪽은 코드 아래에 Props 표와 모든 조합을 둡니다. Props 표는 그 쪽이 만지는 prop마다 타입(선택지, `boolean`, 예시로 켜는 자리는 `ReactNode`)과 기본값을 적고, 다른 요소의 prop(라벨 글자)은 적지 않습니다. 모든 조합은 항목이 고른 두 축의 모든 값을 맞세운 표와 한 축씩 움직인 줄을 첫 화면의 상태에서 미리보기와 같은 배경 위에 그리고, 기본값은 그 값의 이름에 `(default)`로 붙습니다. 조합의 컴포넌트는 그림이라 포커스와 포인터를 받지 않고(`inert`) 보조기기에도 읽히지 않으며, 표가 열보다 넓으면 그 안에서 스크롤합니다. Primitive 쪽에는 둘 다 없습니다.

[contract:app.playground.overview-boards]: #
Playground Overview는 크기가 있는 Atom마다 한 판을 둡니다. 판의 왼쪽은 그 Atom의 한 축(대개 variant, 표식은 꺼짐 · 켜짐)의 모든 값을 다섯 크기에 맞세운 표이고, 오른쪽은 그 표를 그릴 상태와 나머지 prop입니다. 그림은 그 Atom 쪽의 subject(registry)라 쪽에서 보는 것과 같고, prop이 바뀌면 따라옵니다. 상태는 기본 · hover · 눌림 · 포커스 · 꺼짐 가운데 그 Atom에 있는 것만 고릅니다 — 표식에는 hover가 없고, Badge와 Spinner에는 상태가 없습니다. hover · 눌림 · 포커스는 [상태 미리보기](atoms/states.md#상태-어휘)로, 꺼짐은 `disabled`로 그리며, 눌림은 포인터가 누를 때처럼 hover를 함께 그리고, SegmentControl은 hover를 고르지 않은 칸에, 포커스를 고른 칸에만 그립니다. 모든 상태를 펼치면 같은 표가 상태마다 되풀이됩니다. 그림은 살아 있어 포인터와 키보드가 닿고 표식은 켜고 꺼지며, 컨트롤마다 판 · 값 · 크기로 된 이름이 있습니다. 표가 판보다 넓으면 그 안에서 스크롤하고, 다섯 크기를 나란히 세우기에 넓은 Atom(SegmentControl)은 크기를 세로로 세웁니다.

[contract:app.home.motion]: #
홈은 한 번의 스크롤로 보는 다섯 장면입니다. 첫 장면은 머리말 · 제목 두 줄 · 문단 · 행동을 `reveal.load`로 한 걸음씩 차례로 들이고, 마지막에 제목 둘째 줄의 단어 사이가 벌어지며 슬롯이 열립니다. 슬롯의 Switch는 페이지 테마를 바꿉니다. 그 아래 실제 컴포넌트의 벽은 네 열이 서로 엇갈려 흐르고, 큰 문장은 화면 가운데로 올라올수록 한 줄씩 본문 잉크로 켜지며, 위에서 비추는 빛 아래 Arcfield 데모(`/demo/arcfield`) 자체가 페이지와 같은 테마로 떠오릅니다 — 그린 화면이 아니라 데모를 띄운 frame이고, 페이지의 스크롤이 걸리지 않게 inert입니다. 스크롤 연출은 view timeline이라 JS가 없고, 움직임을 줄인 환경과 view timeline이 없는 브라우저에서는 모든 장면이 처음부터 제자리에 섭니다.

[contract:app.shell.wide-frame]: #
사이드바가 있는 쪽(문서 · Playground)은 frame의 상한(`container.content`) 없이 화면 폭을 쓰고, 좌우 여백은 `gap.2xl`입니다. 헤더도 같은 폭이라 브랜드와 사이드바가 한 축에 섭니다. 문서의 글과 표와 코드도 Playground처럼 그 열을 끝까지 채우고, 열보다 넓은 표는 제 안에서 스크롤합니다. 그 밖의 쪽(홈)은 `container.content` 안에 섭니다.
