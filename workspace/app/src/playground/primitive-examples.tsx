import { useRef, useState } from "react";
import { Box, Button, Draggable, Droppable, Field, FocusScope, FormField, Grid, Hoverable, Icon, Inline, Overlay, Pressable, RovingFocus, Stack, Text, Toggleable, ToggleGroup, VisuallyHidden, mergeProps, mergeRefs, usePress, useHover, useFocusRing } from "@studio-baeks/paper-ui";
import * as styles from "./primitive-examples.css";

const Grip = () => <Icon size="caption"><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" /></Icon>;
export function GridExample({ columns = 3 }: { columns?: number }) {
  return <Grid columns={columns} gap="sm" width="full">{[1, 2, 3, 4, 5, 6].map((n) => <Box key={n} border radius="sm" padding="md"><Text>{n}</Text></Box>)}</Grid>;
}
export function PressExample({ disabled = false }: { disabled?: boolean }) {
  const [count, setCount] = useState(0);
  return <Stack gap="md" align="start"><Pressable data-testid="press-example" disabled={disabled} className={styles.control} onPress={() => setCount((n) => n + 1)}>
    {({ isPressed }) => isPressed ? "누르는 중" : "실행"}
  </Pressable><Text as="output" variant="caption" aria-live="polite">실행: {count}</Text></Stack>;
}
export function HoverExample({ disabled = false }: { disabled?: boolean }) {
  return <Hoverable data-testid="hover-example" disabled={disabled} className={styles.control}>{({ isHovered }) => isHovered ? "Hover 중" : "포인터를 올려보세요"}</Hoverable>;
}
export function ToggleExample({ disabled = false, defaultSelected = false }: { disabled?: boolean; defaultSelected?: boolean }) {
  return <Toggleable data-testid="toggle-example" key={String(defaultSelected)} disabled={disabled} defaultSelected={defaultSelected} className={styles.control}>
    {({ isSelected }) => isSelected ? "선택됨" : "선택 안 됨"}
  </Toggleable>;
}
export function DragExample({ disabled = false, activation = "handle", axis = "both" }: { disabled?: boolean; activation?: "surface" | "handle"; axis?: "both" | "x" | "y" }) {
  const [count, setCount] = useState(0);
  return <div className={styles.stage}>
    <Draggable disabled={disabled} activation={activation} axis={axis} className={styles.moving} aria-label="이동 패널" data-testid="moving-panel">
      {({ position }) => <Stack gap="sm">
        <Inline gap="sm"><Draggable.Handle className={styles.handle} aria-label="패널 이동"><Grip /></Draggable.Handle><Text>이동할 박스</Text></Inline>
        <Text variant="caption">손잡이를 끌거나 방향키로 이동합니다. Escape는 이동을 취소합니다.</Text>
        <Text as="output" variant="caption" family="mono" data-testid="position">x: {Math.round(position.x)}, y: {Math.round(position.y)}</Text>
        <Button size="sm" variant="hairline" onClick={() => setCount((n) => n + 1)}>내부 버튼: {count}</Button>
      </Stack>}
    </Draggable>
  </div>;
}
export function DropExample({ disabled = false }: { disabled?: boolean }) {
  const [received, setReceived] = useState("");
  return <Stack gap="lg" width="full">
    <Draggable mode="transfer" activation="handle" disabled={disabled} getItems={() => [{ "text/plain": "Paper item" }]} className={styles.transfer} aria-label="전달할 항목">
      <Inline gap="sm"><Draggable.Handle className={styles.handle} aria-label="항목 전달"><Grip /></Draggable.Handle><Text>Paper item</Text></Inline>
    </Draggable>
    <Droppable aria-label="항목 받기" disabled={disabled} className={styles.dropTarget}
      getDropOperation={(types, allowed) => types.has("text/plain") && allowed.includes("copy") ? "copy" : "cancel"}
      onDrop={async (event) => {
        const values = await Promise.all(event.items.map((item) => item.kind === "text" && item.types.has("text/plain") ? item.getText("text/plain") : ""));
        setReceived(values.filter(Boolean).join(", "));
      }}>
      {({ isDropTarget }) => <Text>{isDropTarget ? "여기에 놓으세요" : received ? `받음: ${received}` : "항목을 받는 영역"}</Text>}
    </Droppable>
    <Text variant="caption">손잡이에서 Enter로 시작하고 Tab으로 대상에 이동한 뒤 Enter로 놓습니다.</Text>
  </Stack>;
}
export function FocusExample() {
  const [open, setOpen] = useState(false);
  return <Stack gap="md" width="full" align="start">
    <Pressable className={styles.control} onPress={() => setOpen(true)} disabled={open}>Focus scope 열기</Pressable>
    {/* Opened by an explicit user action; focus enters the new scope and is restored on close. */}
    {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
    {open && <FocusScope contain restoreFocus autoFocus>
      <Stack role="group" aria-label="포커스 범위" gap="sm" padding="md" border radius="md" width="full">
        <Field aria-label="첫 입력" placeholder="자동 포커스" />
        <Button onClick={() => setOpen(false)}>Focus scope 닫기</Button>
      </Stack>
    </FocusScope>}
  </Stack>;
}
export function HiddenExample() {
  return <Stack gap="md" align="start">
    <Pressable className={styles.control}><Icon><path d="M12 4v16M4 12h16" /></Icon><VisuallyHidden>새 항목 추가</VisuallyHidden></Pressable>
    <Text variant="caption">화면에는 아이콘만, 접근성 이름에는 숨긴 텍스트를 사용합니다.</Text>
    <VisuallyHidden isFocusable><a href="#hidden-target">본문으로 건너뛰기</a></VisuallyHidden>
    <Text id="hidden-target" tabIndex={-1}>건너뛰기 링크의 도착점</Text>
  </Stack>;
}

export function RovingExample({ orientation = "horizontal", dir = "ltr", loop = true }: { orientation?: "horizontal" | "vertical" | "both"; dir?: "ltr" | "rtl"; loop?: boolean }) {
  const [last, setLast] = useState(true);
  return <Stack gap="md" align="start">
    <RovingFocus role="toolbar" aria-label="텍스트 도구" className={styles.roving} orientation={orientation} dir={dir} loop={loop}>
      <RovingFocus.Item value="bold" className={styles.control}>굵게</RovingFocus.Item>
      <RovingFocus.Item value="italic" disabled className={styles.control}>기울임</RovingFocus.Item>
      <RovingFocus.Item as={Pressable} value="underline" className={styles.control}>밑줄</RovingFocus.Item>
      {last && <RovingFocus.Item value="remove" className={styles.control} onClick={() => setLast(false)}>이 항목 제거</RovingFocus.Item>}
    </RovingFocus>
    <Button onClick={() => setLast(true)}>항목 복원</Button>
    <Text variant="caption">Tab으로 들어온 뒤 방향키·Home·End로 탐색합니다. 기울임은 건너뜁니다.</Text>
  </Stack>;
}

export function ToggleGroupExample({ selectionMode = "single", selectionRequired = false, disabled = false }: { selectionMode?: "single" | "multiple"; selectionRequired?: boolean; disabled?: boolean }) {
  const [values, setValues] = useState<string[]>(["left"]);
  const [last, setLast] = useState(true);
  return <Stack gap="md" align="start">
    <ToggleGroup className={styles.roving} aria-label="정렬 선택" selectionMode={selectionMode} selectionRequired={selectionRequired}
      disabled={disabled} selectedValues={values} onSelectedValuesChange={setValues} loop>
      <ToggleGroup.Item value="left" className={styles.control}>왼쪽</ToggleGroup.Item>
      <ToggleGroup.Item value="center" className={styles.control}>가운데</ToggleGroup.Item>
      <ToggleGroup.Item value="unavailable" disabled className={styles.control}>사용 불가</ToggleGroup.Item>
      {last && <ToggleGroup.Item value="right" className={styles.control}>오른쪽</ToggleGroup.Item>}
    </ToggleGroup>
    <Text as="output" aria-live="polite">선택: {values.join(", ") || "없음"}</Text>
    <Button onClick={() => setLast((value) => !value)}>{last ? "오른쪽 제거" : "오른쪽 복원"}</Button>
  </Stack>;
}

export function OverlayExample({ modal = false, dismissable = true }: { modal?: boolean; dismissable?: boolean }) {
  const title = useRef<HTMLHeadingElement>(null);
  return <Overlay modal={modal}>
    <Overlay.Trigger className={styles.control}>설정 열기</Overlay.Trigger>
    <Overlay.Content className={styles.overlayContent} aria-label="설정" dismissable={dismissable} offset={8} initialFocusRef={title}>
      <Stack gap="md">
        <Text as="h2" variant="heading" ref={title} tabIndex={-1}>설정</Text>
        <FormField label="표시 이름" description="화면에 표시할 이름입니다." className={styles.formField}>
          {({ controlProps }) => <Field {...controlProps} />}
        </FormField>
        <Overlay modal>
          <Overlay.Trigger className={styles.control}>확인 창 열기</Overlay.Trigger>
          <Overlay.Content className={styles.overlayContent} aria-label="중첩 확인">
            <Stack gap="md"><Text>안쪽 창부터 닫힙니다.</Text><Overlay.Close className={styles.control}>확인 창 닫기</Overlay.Close></Stack>
          </Overlay.Content>
        </Overlay>
        <Overlay.Close className={styles.control}>설정 닫기</Overlay.Close>
      </Stack>
    </Overlay.Content>
  </Overlay>;
}

export function FormFieldExample({ disabled = false, required = true }: { disabled?: boolean; required?: boolean }) {
  const [invalid, setInvalid] = useState(false);
  return <Stack gap="md" width="full">
    <FormField label="이메일" description="연락받을 이메일을 입력해주세요." error="이메일 형식을 확인해주세요."
      invalid={invalid} required={required} disabled={disabled} className={styles.formField}>
      {({ controlProps }) => <Field {...controlProps} type="email" status={invalid ? "error" : "default"} />}
    </FormField>
    <Button onClick={() => setInvalid((value) => !value)}>{invalid ? "오류 해제" : "오류 표시"}</Button>
  </Stack>;
}

export function CompositionExample() {
  const ref = useRef<HTMLButtonElement>(null);
  const forwarded = useRef<HTMLButtonElement>(null);
  const [count, setCount] = useState(0);
  const { pressProps, isPressed } = usePress({ onPress: () => setCount((value) => value + 1) }, ref);
  const { hoverProps, isHovered } = useHover();
  const { focusProps, isFocusVisible } = useFocusRing();
  return <Stack gap="md" align="start">
    <Box as="button" {...mergeProps(pressProps, hoverProps, focusProps)} ref={mergeRefs(ref, forwarded)} type="button"
      className={styles.control} data-pressed={isPressed || undefined} data-hovered={isHovered || undefined} data-focus-visible={isFocusVisible || undefined}>
      Hook으로 조립한 버튼
    </Box>
    <Text as="output" aria-live="polite">실행: {count}</Text>
  </Stack>;
}
