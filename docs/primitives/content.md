# Content

Content Primitive는 화면에 읽히는 것 — 글자와 아이콘 — 을 그립니다. 둘 다 크기를 숫자로 받지 않고 Typography의 역할 이름으로 받습니다.

| 컴포넌트 | 공개 축 | 기본값 |
| --- | --- | --- |
| Text | `as` · variant · ink · family=sans/mono | variant=body, family=sans. 기본 태그는 display·title=h1, heading=h2, subheading=h3, body·caption=p, label=span |
| Icon | size=label/caption/body/subheading · ink · SVG children · className · aria-label | size=body. artboard 14 / 16 / 18 / 20, viewBox 24, 기본 currentColor |

## Text

`variant`가 크기·굵기·행간·자간·기본 잉크를 한 번에 정하고, 태그는 `as`가 따로 정합니다. 시각 위계와 의미 태그가 직교하므로, 같은 `title`이 페이지에서는 `h1`, 대화상자 안에서는 `h2`가 될 수 있습니다. 역할별 값은 [Typography](../foundations/typography.md)에 있습니다.

[contract:primitives.text.ink-beats-variant]: #
크기·굵기·색을 따로 고르는 prop은 없습니다. `ink`만 variant 기본값 위로 한 번 덮을 수 있습니다.

| ink | 뜻 |
| --- | --- |
| base · soft · faint | Color `ink.primary` · `secondary` · `tertiary` |
| info · success · warning · error | 그 상태색의 `ink` |
| inherit | 내 색을 정하지 않고 부모 면의 글자색을 받음 — 색면 위의 글자 |

`family="mono"`는 어느 variant에도 얹어 등폭 서체로 바꿉니다. 코드·토큰·식별자에만 쓰고, 숫자 열은 mono 대신 `tabular-nums`로 자리만 맞춥니다.

```tsx
<Text as="h1" variant="title">웹사이트 리뉴얼</Text>
<Text variant="caption">마지막 수정 · 오늘 오전 10:42</Text>
<Text variant="body" family="mono" ink="soft">WEB-24</Text>
```

## Icon

아이콘 세트는 시스템이 소유하지 않습니다. 24 단위 viewBox의 path를 앱이 children으로 넣고(Lucide 등), 크기와 선 굵기는 Paper UI가 정합니다. 크기 이름은 옆에 서는 Text 역할입니다 — `label` 글자 옆이면 `size="label"`(14), 본문 옆이면 `body`(18). 선 굵기는 Shape의 `stroke.icon`(1.75)입니다.

`ink`를 주지 않으면 부모의 글자색(currentColor)을 따릅니다. `aria-label`이 있으면 이미지로 읽히고, 없으면 장식으로 보조 기술에서 숨겨집니다.

```tsx
<Icon><path d="M12 5v14M5 12h14" /></Icon>
<Icon size="label" ink="soft"><circle cx="12" cy="12" r="8" /></Icon>
<Icon aria-label="경고" ink="warning"><path d="M12 8v5M12 16h.01" /></Icon>
```
