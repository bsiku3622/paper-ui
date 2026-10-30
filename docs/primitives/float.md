# Float

Float Primitive는 떠 있는 층의 위치와 z, 닫는 방식을 맡는 2차 primitive입니다. Trigger · Content · Close로 열린 상태를 연결하고, 입력 정규화와 배치 · 중첩 dismissal · 배경 inert · 스크롤 잠금은 React Aria에 위임하며 Paper가 공개 API와 상태 연결을 소유합니다. 색은 입히지 않습니다 — 면 · 테두리 · 여백은 Content의 className이 지정하고, modal의 scrim만 Paint 층의 `scrimPaint`를 씁니다. Trigger와 Close는 눌리는 대상이라 [Press](press.md)의 Pressable 위에 섭니다.

| 컴포넌트 | Hook | 책임 | 기본값 |
| --- | --- | --- | --- |
| Floating | useFloating | open/defaultOpen/onOpenChange, modal | non-modal. Trigger · Content · Close로 Portal · 배치 · 닫기 · focus 연결 |

## Floating

[contract:primitives.floating.portal]: #
Floating은 열린 상태와 Trigger·Content·Close를 연결합니다. Root는 DOM wrapper를 만들지 않고 Content가 열릴 때 [Portal](a11y.md#portal)과 focus 범위를 mount합니다. 기본값은 non-modal dialog overlay입니다. Content의 면·여백·테두리는 className으로 지정합니다. 앱이 넘긴 class는 로드 순서가 아니라 레이어로 패키지 스타일을 이깁니다([우선순위](../get-started/install.md#우선순위)).

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

Root의 open/defaultOpen/onOpenChange는 controlled·uncontrolled 상태를 선택합니다. useFloating은 같은 옵션과 isOpen·setOpen·open·close·toggle을 제공하는 상태 hook입니다. DOM 동작은 Content가 연결합니다. Trigger·Close는 Pressable의 native button·ref·onPress 계약을 유지합니다. Trigger의 aria-haspopup=dialog·aria-expanded·aria-controls가 Content에 연결됩니다.

Content role은 dialog / alertdialog이며 기본값은 dialog입니다. aria-label 또는 aria-labelledby로 이름을 제공해주세요. Modal에만 aria-modal=true가 붙습니다. Menu·Tooltip 등의 의미론은 이 API에 임의로 부여하지 않습니다.

| Content 옵션 | 기본값 | 계약 |
| --- | --- | --- |
| dismissable | true | 바깥 pointer 조작으로 닫기 |
| keyboardDismissDisabled | false | true이면 Escape 닫기 해제 |
| closeOnBlur | false | focus 이탈 시 닫기 요청 |
| autoFocus / restoreFocus | true / true | 진입 / 해제 후 복원 |
| initialFocusRef | 없음 | 내부의 명시적 focus 대상 |
| anchored | non-modal이면 true | Trigger 기준 배치 |
| placement | bottom start | 방향·정렬 |
| offset / crossOffset | 0 / 0 | 실행 중 계산하는 배치 간격 |
| shouldFlip | true | 공간이 부족하면 방향 전환 |
| portalContainer | document.body | Portal을 붙일 Element |
| shouldCloseOnInteractOutside | 없음 | 바깥 조작 필터 |
| underlayClassName | 없음 | Modal scrim class |

초기 focus는 initialFocusRef, 첫 내부 대상, 대상이 없는 경우 Content 순서입니다. 제목에 명시적으로 이동하려면 tabIndex=-1을 제공해주세요. AutoFocus=false이면 자동 이동을 하지 않습니다. Portal의 root가 열린 자리의 theme를 다시 걸어, 옮겨진 내용도 Paper의 해석된 theme를 유지합니다. 임의의 지역 CSS 상속이 필요하면 portalContainer를 지정합니다.

[contract:primitives.floating.nesting]: #
[contract:primitives.floating.focus-restore]: #
[contract:primitives.floating.dismiss]: #
Modal은 React Aria의 focus containment·배경 inert·스크롤 잠금을 사용합니다. 중첩 Floating은 안쪽부터 Escape를 처리하고 각 이전 대상을 복원합니다. 중첩 깊이는 Layout의 elevation 층(overlay·modal)에서 파생한 z로 반영합니다 — 깊이마다 한 tier씩 올라갑니다. 마지막 모달 해제 시 배경과 스크롤을 복원합니다. Dismissable과 Escape는 독립적입니다. 모두 끄면 명시적인 닫기 수단을 제공해야 합니다. 호출 버튼 제거 후의 제품별 목적지, 라우팅과 exit 애니메이션은 소비자가 결정합니다.
