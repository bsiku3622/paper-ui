import {
  forwardRef,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { joinClass } from "../internal/joinClass";
import { useMessages } from "../internal/locale";
import { useMergedRef } from "../internal/refs";
import { Icon } from "../primitives/Icon";
import { Pressable } from "../primitives/press/Pressable";
import { Selectable } from "../primitives/select/Selectable";
import type { ControlForm } from "../primitives/control/Control";
import { useControlShape } from "../primitives/control/shape";
import { fieldActionPaint, fieldAdornmentPaint, fieldPlaceholderPaint } from "../primitives/paint/recipes.css";
import { textNumericClass } from "../styles/typography.css";
import { inputFrameClass, useInputControl, type InputFrameProps } from "./input-control";
import { fieldWrap, fieldInput, fieldTextAlign, fieldAdornment, fieldAction, fieldActionReach } from "./Field.css";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size" | "prefix"> & InputFrameProps & Pick<ControlForm, "shape" | "gap"> & {
  numeric?: boolean;
  textAlign?: "start" | "center" | "end";
  leading?: ReactNode;
  trailing?: ReactNode;
  clearable?: boolean;
  clearLabel?: string;
  showPasswordToggle?: boolean;
  showPasswordLabel?: string;
  onClear?: () => void;
  className?: string;
  style?: CSSProperties;
  "data-testid"?: string;
};

const XIcon = (
  <Icon aria-hidden>
    <path d="M6 6 18 18M18 6 6 18" />
  </Icon>
);
const EyeIcon = (
  <Icon aria-hidden>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </Icon>
);
const EyeOffIcon = (
  <Icon aria-hidden>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.75" />
    <path d="M3 3 21 21" />
  </Icon>
);

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  {
    status,
    size,
    fill,
    variant,
    shadow,
    fontSize,
    shape,
    gap,
    numeric,
    textAlign,
    leading,
    trailing,
    clearable,
    clearLabel,
    showPasswordToggle,
    showPasswordLabel,
    onClear,
    type = "text",
    value,
    defaultValue,
    onChange,
    className,
    style,
    "data-testid": testid,
    ...rest
  },
  ref,
) {
  const messages = useMessages();
  const frameShape = useControlShape(shape, "rounded");
  const { inputProps, frameProps, isDisabled } = useInputControl(rest, { status, textInput: true });
  const input = useRef<HTMLInputElement>(null);
  const setRef = useMergedRef(ref, input);

  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password" && !!showPasswordToggle;
  const effectiveType = isPassword ? (revealed ? "text" : "password") : type;

  const [innerHasValue, setInnerHasValue] = useState(() => String(defaultValue ?? "").length > 0);
  const hasValue = value !== undefined ? String(value).length > 0 : innerHasValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    if (value === undefined) setInnerHasValue(e.currentTarget.value.length > 0);
  };

  // Writing through the native setter and dispatching input fires onChange for controlled and uncontrolled alike.
  const clear = () => {
    const el = input.current;
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    setter?.call(el, "");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    onClear?.();
    el.focus();
  };

  const showClear = !!clearable && hasValue && !isDisabled;
  const actionClass = joinClass(fieldAction, fieldActionPaint, fieldActionReach);

  return (
    // 래퍼는 위젯이 아니라 여백 클릭을 안쪽 input 으로 넘기는 표현용 컨테이너다 —
    // 진짜 컨트롤은 input 이라 role·키보드를 붙이는 게 오히려 틀리다.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- 여백 클릭만 안쪽 input 으로 넘긴다
    <span
      className={joinClass(inputFrameClass({ size, anatomy: "input", shape: frameShape, fontSize, gap, fill, variant, shadow }), fieldWrap, numeric && textNumericClass, className)}
      style={style}
      data-testid={testid}
      {...frameProps}
      onMouseDown={(e) => {
        const t = e.target as HTMLElement;
        if (t !== input.current && !t.closest("button")) {
          e.preventDefault();
          input.current?.focus();
        }
      }}
    >
      {leading ? <span className={joinClass(fieldAdornment, fieldAdornmentPaint)}>{leading}</span> : null}
        <input
          ref={setRef}
          type={effectiveType}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          className={joinClass(fieldInput, fieldPlaceholderPaint, textAlign && fieldTextAlign[textAlign])}
          {...inputProps}
        />
        {showClear ? (
          <Pressable className={actionClass} onPress={clear} aria-label={clearLabel ?? messages.clear}>
            {XIcon}
          </Pressable>
        ) : null}
        {isPassword ? (
          <Pressable as={Selectable} className={actionClass} selected={revealed} onSelectedChange={setRevealed} disabled={isDisabled} aria-label={showPasswordLabel ?? messages.showPassword}>
            {revealed ? EyeOffIcon : EyeIcon}
          </Pressable>
        ) : null}
        {trailing ? <span className={joinClass(fieldAdornment, fieldAdornmentPaint)}>{trailing}</span> : null}
    </span>
  );
});
