# Float

Float Primitive는 떠 있는 층의 위치와 elevation(z와 그림자), 열고 닫는 움직임, 닫는 방식을 맡는 2차 primitive입니다. Trigger · Content · Close로 열린 상태를 연결하고, 입력 정규화와 배치 · 중첩 dismissal · 배경 inert · 스크롤 잠금은 React Aria에 위임하며 Paper가 공개 API와 상태 연결을 소유합니다(`Placement`를 포함해 타입은 모두 Paper가 선언합니다). Floating은 elevation 한 단위(z와 그림자)와 modal의 scrim 및 그 gutter를 스스로 소유하고, 그 밖의 색은 입히지 않습니다 — 면 · 테두리 · 모서리 · 여백은 Content의 className이 지정하며(`surfaceClass()`로 fill · border · radius를 고릅니다), modal의 scrim만 Paint 층의 `scrimPaint`를 씁니다. Trigger와 Close는 `onClick`을 받는 native button이라 press를 안에 두지 않습니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| Floating | useFloating · useFloatingContext | open/defaultOpen/onOpenChange. Content의 presentation(popover · modal) | popover. Trigger · Content · Close로 Portal · 배치 · 열고 닫는 움직임 · 닫기 · focus 연결 |

## Floating

[contract:primitives.floating.portal]: #
Floating은 열린 상태와 Trigger·Content·Close를 연결합니다. Root는 열린 상태만 들고 DOM wrapper를 만들지 않으며, Content가 열릴 때 [Portal](a11y.md#portal)과 focus 범위를 mount합니다. Content의 면·여백·테두리·모서리는 className으로 지정합니다. 기본 popover는 overlay tier, modal은 modal tier에 서고 둘 다 floating 그림자를 스스로 그립니다. 앱이 넘긴 class는 로드 순서가 아니라 레이어로 패키지 스타일을 이깁니다([우선순위](../get-started/install.md#우선순위)).

명시적으로 연 모달에 이름과 닫기 버튼을 제공하는 예시입니다.

```tsx
<Floating>
  <Floating.Trigger>설정 열기</Floating.Trigger>
  <Floating.Content presentation="modal" aria-label="설정" className={dialogClass}>
    <Field aria-label="표시 이름" />
    <Floating.Close>닫기</Floating.Close>
  </Floating.Content>
</Floating>
```

[contract:primitives.floating.state]: #
Root의 open/defaultOpen/onOpenChange는 controlled·uncontrolled 상태를 선택합니다. useFloating은 같은 옵션을 받아 `FloatingResult`(isOpen·setOpen·open·close·toggle)를 돌려주는 상태 hook이고, 같은 값이면 알리지 않습니다. Floating 안의 부품은 `useFloatingContext()`로 같은 결과를 읽어 직접 만든 button으로 열고 닫습니다. DOM 동작은 Content가 연결합니다. Trigger·Close(`FloatingTriggerProps` · `FloatingCloseProps`)는 `type="button"`인 native button이고 native button의 props를 받습니다. `as`로 다른 대상을 고를 수 있고 `disabled`는 [공통 계약](README.md#공통-계약)의 투영을 따르며, `role="button"`을 받은 태그도 Enter · Space로 눌립니다. 호출자의 `onClick`이 먼저 실행된 뒤 열기·닫기가 따르며([합성 도구](README.md#합성-도구)), 호출자가 `preventDefault()`를 부르면 열고 닫지 않습니다. Trigger는 focus가 돌아오는 opener라서 클릭에 스스로 focus를 가져옵니다 — Safari는 클릭한 button에 focus를 주지 않기 때문입니다. `onPress`와 `data-active`가 필요하면 [Press](press.md)의 Pressable에 `as`로 올립니다(`<Pressable as={Floating.Trigger}>`). 요소는 하나이고 press 장치도 하나이며, 열기는 한 번만 일어납니다. Trigger의 aria-haspopup=dialog·aria-expanded·aria-controls가 Content에 연결됩니다.

[contract:primitives.floating.content-state]: #
Content의 children은 노드이거나 `FloatingContentState`를 받는 함수입니다 — `{ isOpen, presentation, placement, elevation }`이고, `presentation`은 `popover` 또는 `modal`, `placement`는 panel이 앵커의 어느 쪽에 자리 잡았는지(`top` · `bottom` · `start` · `end`, 앵커 요소의 방향을 따라 오른쪽에서 왼쪽으로 쓰는 페이지에서는 거울상이며 modal에는 없어 undefined), `elevation`은 `{ tier, rank }`입니다. 열고 닫는 동작은 스냅샷이 아니라 `useFloatingContext()`로 합니다. Content는 FormField의 context를 끊어, field에서 연 패널 안의 입력은 그 field와 관계가 없습니다([Field](field.md)).

[contract:primitives.floating.presentation]: #
Content는 `presentation`으로 두 가지 중 하나로 섭니다. `popover`(기본)는 앵커 곁에, `modal`은 scrim 위 가운데에 섭니다. Root가 아니라 Content가 고르므로 열린 상태와 서는 방식은 따로입니다. popover는 `anchorRef`로 앵커를 고르고, 주지 않으면 Floating.Trigger가 앵커입니다. 둘 다 없으면 개발 오류(`[paper-ui] Floating.Content (popover) needs Floating.Trigger or anchorRef.`)를 한 번 내고 아무것도 그리지 않습니다. Trigger는 Content 앞에 두는 것이 자연스럽지만 뒤에 있어도 Content가 한 번 더 자리를 잡습니다. modal에는 앵커가 없고 `aria-modal`, scrim, 배경 inert, 스크롤 잠금이 붙습니다. Content는 `data-presentation`을, popover는 자리 잡은 쪽을 `data-placement`로 답니다. 두 모양의 prop은 타입이 가릅니다 — `anchorRef` · `placement` · `offset` · `crossOffset` · `flip`은 popover(`FloatingPopoverProps`)에만, `underlayClassName`은 modal(`FloatingModalProps`)에만 있습니다.

[contract:primitives.floating.role]: #
Content role은 dialog / alertdialog이며 기본값은 dialog입니다. aria-label 또는 aria-labelledby로 이름을 제공해주세요. Modal에만 aria-modal=true가 붙습니다. Menu·Tooltip 등의 의미론은 이 API에 임의로 부여하지 않습니다.

[contract:primitives.floating.content-options]: #

| Content 옵션 | 기본값 | 계약 |
| --- | --- | --- |
| presentation | popover | `popover`(앵커 곁) 또는 `modal`(scrim 위 가운데) |
| dismissable | true | 바깥 pointer 조작으로 닫기 |
| keyboardDismissDisabled | false | true이면 Escape 닫기 해제. Escape는 포커스가 panel 안에 있을 때만 듣습니다 |
| closeOnBlur | false | focus 이탈 시 닫기 요청 |
| autoFocus / restoreFocus | true / true | 진입 / 해제 후 복원 |
| initialFocusRef | 없음 | 내부의 명시적 focus 대상 |
| anchorRef | Trigger | popover가 곁에 설 요소. 바깥 조작이 이 요소에서 일어나도 닫지 않습니다 |
| placement | bottom start | 방향·정렬(`Placement`, 논리 방향이라 오른쪽에서 왼쪽으로 쓰는 페이지에서는 거울상) |
| offset / crossOffset | sm / none | 앵커와 panel 사이의 간격. gap 단계 이름(`xs`~`3xl`)이나 `none` |
| flip | true | 공간이 부족하면 방향 전환 |
| portalContainer | document.body | Portal을 붙일 Element |
| closeOnInteractOutside | 없음 | 바깥 조작 필터 |
| underlayClassName | 없음 | Modal scrim class |

[contract:primitives.floating.geometry]: #
`offset`과 `crossOffset`은 숫자가 아니라 [gap 단계](../foundations/layout.md#원본--역할) 이름이고, 숫자 픽셀을 받는 React Aria에는 Floating이 그 단계를 panel이 서 있는 자리에서 재어 넘깁니다(`internal/measure`). 그래서 하위 트리가 간격 scale을 덮어도, root 글자 크기가 달라져도 간격이 따라가고, 창 크기가 바뀌면 다시 잽니다. panel이 뷰포트 가장자리에 닿을 때 남기는 여백은 `layout.gutter`(16)입니다.

[contract:primitives.floating.initial-focus]: #
[contract:primitives.floating.portal-container]: #
[contract:primitives.floating.open-from-start]: #
초기 focus는 initialFocusRef, 첫 내부 대상, 대상이 없는 경우 Content 순서입니다. 제목에 명시적으로 이동하려면 tabIndex=-1을 제공해주세요. AutoFocus=false이면 자동 이동을 하지 않습니다. Portal의 root가 열린 자리의 theme를 다시 걸어, 옮겨진 내용도 Paper의 해석된 theme를 유지합니다. 열린 자리의 방향도 같은 root가 옮겨, panel의 배치와 안쪽의 방향키가 같은 방향을 읽습니다([Portal](a11y.md#portal)). 열린 자리(Trigger)가 덮어쓴 Shape · Layout · Typography 원본도 같은 root에 얹혀 옮겨지므로, 간격을 좁힌 영역에서 연 panel 안의 컨트롤도 그 영역의 크기로 그려집니다([Shape](../foundations/shape.md#원본--역할--recipe)). `portalContainer`는 DOM을 붙일 자리만 정하며, 테마와 원본은 어디에 붙여도 열린 자리의 것입니다. 처음부터 열려 있는 panel(`defaultOpen`이나 처음부터 참인 `open`)은 페이지가 commit된 다음, 그려지기 전에 섭니다. 그래서 Trigger를 Content 위에 쓰든 아래에 쓰든, focus가 어디에 있든 그 Trigger의 원본을 받고 첫 화면부터 그 자리에 놓입니다. 다만 첫 render의 부모 effect에는 panel이 아직 없으므로, 처음 focus는 `initialFocusRef`로 정해주세요.

## 열고 닫는 움직임

[contract:primitives.floating.presence]: #
Content가 열리면 panel(modal이면 scrim과 panel)이 Motion의 `enter` 역할로 떠오르며 나타나고(`data-presence="entering"`), popover는 자리를 잡은 뒤에 시작합니다. 닫히면 `exit` 역할로 가라앉고(`data-presence="exiting"`), 그 애니메이션이 끝날 때까지 mount된 채 남습니다. 그동안 root는 `inert`이고 `aria-hidden`이라 입력과 보조기술에서 곧바로 사라지고, focus 가둠도 풀립니다. 애니메이션이 끝나면 노드를 내리고 focus는 Trigger로 돌아갑니다. 퇴장 중에 다시 열면 새 panel이 처음부터 열립니다(자리 · focus · 원본 운반을 다시 정합니다). `prefers-reduced-motion`에서는 움직임이 한 순간으로 줄어 곧바로 내려가고, 애니메이션이 없는 환경에서도 닫는 즉시 내려갑니다. 타이밍은 [Motion](../foundations/motion.md#조합)의 `presence`가 정합니다.

[contract:primitives.floating.nesting]: #
[contract:primitives.floating.focus-restore]: #
[contract:primitives.floating.dismiss]: #
Modal은 React Aria의 focus containment·배경 inert·스크롤 잠금을 사용합니다. 중첩 Floating은 안쪽부터 Escape를 처리하고 각 이전 대상을 복원합니다. 중첩은 elevation의 nudge로 반영합니다 — 같은 tier의 panel 위에 열린 panel은 한 걸음씩 올라가고(`ELEVATION_NEST_LIMIT`번까지) 다음 tier에 닿지 않으며, 더 높은 tier 위에서 연 panel은 그 tier를 따릅니다. 그래서 popover 위에서 연 modal의 scrim이 그 popover를 덮고, modal 위에서 연 popover는 그 scrim 위에 섭니다. React Aria가 배치한 panel의 z는 쓰지 않습니다. 마지막 모달 해제 시 배경과 스크롤을 복원합니다. Dismissable과 Escape는 독립적입니다. 모두 끄면 명시적인 닫기 수단을 제공해야 합니다. Escape는 포커스가 panel 안에 있을 때만 듣습니다 — 듣는 자리가 panel 자신이기 때문입니다. modal은 포커스를 가두므로 언제나 듣지만, `autoFocus={false}`로 포커스 없이 연 popover(코치마크처럼)는 페이지에서 누른 Escape로 닫히지 않습니다. 그런 panel을 Escape로 닫으려면 앱이 `document`에 listener를 달아 닫습니다. 호출 버튼 제거 후의 제품별 목적지와 라우팅은 소비자가 결정합니다.
