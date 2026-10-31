# Float

Float Primitive는 떠 있는 층의 위치와 elevation(z와 그림자), 닫는 방식을 맡는 2차 primitive입니다. Trigger · Content · Close로 열린 상태를 연결하고, 입력 정규화와 배치 · 중첩 dismissal · 배경 inert · 스크롤 잠금은 React Aria에 위임하며 Paper가 공개 API와 상태 연결을 소유합니다(`Placement`를 포함해 타입은 모두 Paper가 선언합니다). Floating은 elevation 한 단위(z와 그림자)와 modal의 scrim 및 그 gutter를 스스로 소유하고, 그 밖의 색은 입히지 않습니다 — 면 · 테두리 · 모서리 · 여백은 Content의 className이 지정하며(`surfaceClass()`로 fill · border · radius를 고릅니다), modal의 scrim만 Paint 층의 `scrimPaint`를 씁니다. Trigger와 Close는 `onClick`을 받는 native button이라 press를 안에 두지 않습니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| Floating | useFloating · useFloatingContext | open/defaultOpen/onOpenChange, modal | non-modal. Trigger · Content · Close로 Portal · 배치 · 닫기 · focus 연결 |

## Floating

[contract:primitives.floating.portal]: #
Floating은 열린 상태와 Trigger·Content·Close를 연결합니다. Root는 DOM wrapper를 만들지 않고 Content가 열릴 때 [Portal](a11y.md#portal)과 focus 범위를 mount합니다. 기본값은 non-modal dialog overlay입니다. Content의 면·여백·테두리·모서리는 className으로 지정합니다. 기본 popover는 overlay tier, modal은 modal tier에 서고 둘 다 floating 그림자를 스스로 그립니다. 앱이 넘긴 class는 로드 순서가 아니라 레이어로 패키지 스타일을 이깁니다([우선순위](../get-started/install.md#우선순위)).

명시적으로 연 모달에 이름과 닫기 버튼을 제공하는 예시입니다.

```tsx
<Floating modal>
  <Floating.Trigger>설정 열기</Floating.Trigger>
  <Floating.Content aria-label="설정" className={dialogClass}>
    <Field aria-label="표시 이름" />
    <Floating.Close>닫기</Floating.Close>
  </Floating.Content>
</Floating>
```

Root의 open/defaultOpen/onOpenChange는 controlled·uncontrolled 상태를 선택합니다. useFloating은 같은 옵션을 받아 `FloatingResult`(isOpen·setOpen·open·close·toggle)를 돌려주는 상태 hook이고, 같은 값이면 알리지 않습니다. Floating 안의 부품은 `useFloatingContext()`로 같은 결과를 읽어 직접 만든 button으로 열고 닫습니다. DOM 동작은 Content가 연결합니다. Trigger·Close(`FloatingTriggerProps` · `FloatingCloseProps`)는 `type="button"`인 native button이고 `ButtonHTMLAttributes<HTMLButtonElement>`를 받습니다. 호출자의 `onClick`이 먼저 실행된 뒤 열기·닫기가 따르며([합성 도구](README.md#합성-도구)), 호출자가 `preventDefault()`를 부르면 열고 닫지 않습니다. Trigger는 focus가 돌아오는 opener라서 클릭에 스스로 focus를 가져옵니다 — Safari는 클릭한 button에 focus를 주지 않기 때문입니다. `onPress`와 `data-active`가 필요하면 [Press](press.md)의 Pressable에 `as`로 올립니다(`<Pressable as={Floating.Trigger}>`). 요소는 하나이고 press 장치도 하나이며, 열기는 한 번만 일어납니다. Trigger의 aria-haspopup=dialog·aria-expanded·aria-controls가 Content에 연결됩니다.

Content role은 dialog / alertdialog이며 기본값은 dialog입니다. aria-label 또는 aria-labelledby로 이름을 제공해주세요. Modal에만 aria-modal=true가 붙습니다. Menu·Tooltip 등의 의미론은 이 API에 임의로 부여하지 않습니다.

| Content 옵션 | 기본값 | 계약 |
| --- | --- | --- |
| dismissable | true | 바깥 pointer 조작으로 닫기 |
| keyboardDismissDisabled | false | true이면 Escape 닫기 해제 |
| closeOnBlur | false | focus 이탈 시 닫기 요청 |
| autoFocus / restoreFocus | true / true | 진입 / 해제 후 복원 |
| initialFocusRef | 없음 | 내부의 명시적 focus 대상 |
| anchored | non-modal이면 true | Trigger 기준 배치 |
| placement | bottom start | 방향·정렬(`Placement`, 논리 방향이라 오른쪽에서 왼쪽으로 쓰는 페이지에서는 거울상) |
| offset / crossOffset | 0 / 0 | 실행 중 계산하는 배치 간격 |
| flip | true | 공간이 부족하면 방향 전환 |
| portalContainer | document.body | Portal을 붙일 Element |
| closeOnInteractOutside | 없음 | 바깥 조작 필터 |
| underlayClassName | 없음 | Modal scrim class |

초기 focus는 initialFocusRef, 첫 내부 대상, 대상이 없는 경우 Content 순서입니다. 제목에 명시적으로 이동하려면 tabIndex=-1을 제공해주세요. AutoFocus=false이면 자동 이동을 하지 않습니다. Portal의 root가 열린 자리의 theme를 다시 걸어, 옮겨진 내용도 Paper의 해석된 theme를 유지합니다. 임의의 지역 CSS 상속이 필요하면 portalContainer를 지정합니다.

[contract:primitives.floating.nesting]: #
[contract:primitives.floating.focus-restore]: #
[contract:primitives.floating.dismiss]: #
Modal은 React Aria의 focus containment·배경 inert·스크롤 잠금을 사용합니다. 중첩 Floating은 안쪽부터 Escape를 처리하고 각 이전 대상을 복원합니다. 중첩은 elevation의 nudge로 반영합니다 — 같은 tier의 panel 위에 열린 panel은 한 걸음씩 올라가고(`ELEVATION_NEST_LIMIT`번까지) 다음 tier에 닿지 않으며, 더 높은 tier 위에서 연 panel은 그 tier를 따릅니다. 그래서 popover 위에서 연 modal의 scrim이 그 popover를 덮고, modal 위에서 연 popover는 그 scrim 위에 섭니다. React Aria가 배치한 panel의 z는 쓰지 않습니다. 마지막 모달 해제 시 배경과 스크롤을 복원합니다. Dismissable과 Escape는 독립적입니다. 모두 끄면 명시적인 닫기 수단을 제공해야 합니다. 호출 버튼 제거 후의 제품별 목적지, 라우팅과 exit 애니메이션은 소비자가 결정합니다.
