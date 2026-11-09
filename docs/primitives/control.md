# Control

Control은 Box에 크기를 더하는 2차 Primitive입니다. `size` 하나가 높이와 안쪽 여백과 모서리와 글자와 안의 아이콘 크기를 함께 정하고, `anatomy`는 그 크기로 무엇을 그리는가를 정합니다. 크기가 있는 Atom의 형태는 모두 여기서 옵니다. Atom은 Control(크기)과 Paint(색)와 행동(Press · Select · Field)을 묶은 것입니다.

| 컴포넌트 | 공개 축 | 기본값 |
| --- | --- | --- |
| Control | Box 전체 + `size` · `anatomy` · `shape` · `fontSize` · `strong` · `gap` · `align` · `justify` · `iconSize` | md · label · rounded. 색과 선은 없음 |

[contract:primitives.control.class]: #
Atom이 컨트롤 크기에 닿는 길은 class 함수 `controlClass({ size, anatomy, shape, fontSize, strong, gap, align, justify, iconSize })` 하나입니다. `Control`은 그 class를 입힌 Box 하나이고 `as`와 ref와 Box의 prop을 그대로 받습니다.

## 크기와 모양

[contract:primitives.control.size]: #
크기는 값을 정할 뿐이고 모양은 그 값을 읽을 뿐입니다. 그래서 크기 하나를 고치면 모든 모양이 따라오고, 모양 하나를 더해도 크기마다 다시 적지 않습니다. 모양마다 값의 사다리가 달라도 마찬가지입니다. 크기가 변수를 하나 더 정하고 모양이 그것을 고를 뿐입니다. 값은 [Shape](../foundations/shape.md#control)의 역할과 [2차 Control](../foundations/README.md#control)의 식에서 옵니다.

[contract:primitives.control.anatomy]: #

| `anatomy` | 그리는 것 | 쓰는 곳 |
| --- | --- | --- |
| `label` | 글자가 상자를 정합니다. 높이와 넉넉한 여백, 내용은 가운데 | Button |
| `icon` | 높이를 변으로 하는 정사각형입니다. 꽉 찬 줄에서도 줄지 않습니다 | IconButton |
| `input` | 상자가 먼저 있고 글자가 그 안에 놓입니다 | Field |
| `frame` | 높이만 정합니다. 여백은 안쪽 요소가 갖습니다 | Select |
| `area` | 높이는 줄 수가 정합니다. 여백만 정합니다 | Textarea |
| `mark` | 선택 상자 크기의 네모입니다. 글자 옆에 서므로 컨트롤 높이를 따르지 않습니다 | Checkbox · Radio |
| `track` | 선택 상자에서 나온 막대입니다. 높이는 손잡이에 테를 더한 값이고 폭은 높이의 두 배입니다 | Switch |
| `badge` | 낱말 하나를 담는 상자입니다. 높이와 여백은 자기 원본이고, 글자는 크기와 무관하게 고정입니다 | Badge |
| `spinner` | 컨트롤의 아이콘만 한 지름입니다 | Spinner |
| `segment` | 컨트롤 높이의 트랙입니다. 안쪽으로 `inset.xs` 들어간 칸의 줄이 폭을 정합니다 | SegmentControl |
| `slider` | 폭을 다 채우는 막대입니다. 높이는 Switch 트랙과 같습니다 | Slider |

`shape`는 모서리를 네 단계(sharp · small · rounded · pill)에서 고르고, 안 주면 `PaperProvider`의 `controlShape`를, 그것도 없으면 rounded를 씁니다. 글자 preset은 anatomy가 고릅니다. `label` · `icon` · `segment`는 button, `input`과 `frame`은 field, `area`는 textarea, `badge`는 badge이고, `mark` · `track` · `spinner` · `slider`는 글자가 없습니다. 모서리도 anatomy를 따릅니다. 상자는 크기에 맞는 컨트롤 곡선이고, `mark` · `track` · `spinner`의 모서리는 각 Atom이 정합니다.

## 내용 배치

[contract:primitives.control.arrangement]: #
`gap` · `align` · `justify`는 상자 안의 내용을 늘어놓는 방식이고 크기와 따로 고릅니다. 어휘는 Inline과 같은 `SPACES` · `ALIGNS` · `JUSTIFIES`입니다. 안 주면 anatomy의 기본을 씁니다. `label`과 `icon`은 가로세로 가운데에 `control.gap`이고, `badge`는 세로 가운데에 앞으로 붙고 간격은 xs이며, `input`의 간격은 `control.gap`입니다. 내용을 늘어놓는 anatomy(`label` · `icon` · `badge` · `input`)에서 뜻이 있습니다. Atom 중에는 Button과 Badge가 셋을 다 받고, Field는 어도먼트 · 입력칸 · 액션 사이의 `gap`만 받습니다. 입력칸이 남는 폭을 채우므로 `justify`는 없고, 입력값의 글자 정렬은 `textAlign`이라는 다른 축입니다.

[contract:primitives.control.paints-nothing]: #
Control은 색을 칠하지 않고 선도 긋지 않습니다. 색과 선은 [Paint](paint.md)가, 눌림은 [Press](press.md)가 맡습니다. 선 하나를 조립하는 일은 [Line](../foundations/README.md#line)이 합니다.

[contract:primitives.control.parts]: #
크기는 CSS 변수로 정해져서 안쪽 요소도 같은 값을 읽습니다. Select의 화살표와 값이 멈추는 자리, Field 입력값의 줄상자, 안의 Icon이 그렇습니다. 변수는 컨트롤 자신에 선언되므로 위쪽에서 원본을 덮어도 그 자리에서 다시 계산됩니다.

```tsx
import { Control, Icon, Paint } from "@studio-baeks/paper-ui";

export const Row = () => (
  <Control as={Paint} accent="primary" variant="soft" size="sm" justify="start">
    <Icon><path d="M12 5v14M5 12h14" /></Icon>
    항목 더하기
  </Control>
);
```
