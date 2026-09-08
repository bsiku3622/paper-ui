// Field — 한 줄 입력. input group 이다: 래퍼가 면·테두리·포커스링·상태를 지고, 안쪽
// input 이 값을 담으며, 양옆에 어도먼트(아이콘·$·단위)와 액션(clear·비밀번호 보기)이 앉는다.
//   status   default · info · success · warning · error (테두리 색). error 는 aria-invalid 도.
//   shape    default · pill — Button·Badge 와 같은 어휘. 검색창이 이 어휘의 본진이다.
//   numeric  포맷 축 — 숫자 글리프만 등폭(tabular-nums). 정렬은 안 건드린다.
//   align    정렬 축 — start · center · end. numeric 과 직교 (우측정렬 숫자열은 numeric + align="end").
//   leading  왼쪽 어도먼트 (검색 아이콘 · "$" 프리픽스 등)
//   trailing 오른쪽 어도먼트 (단위 "kg" · 아이콘 등)
//   clearable  값이 있으면 × 로 지우기 (controlled·uncontrolled 양쪽)
//   showPasswordToggle  type="password" 일 때 👁 보기 토글을 켠다 (clearable 과 대칭인 opt-in).
//
// ref 는 안쪽 input 을 가리킨다. className·style·data-testid 는 래퍼(보이는 필드)로.

import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { joinClass } from "../internal/joinClass";
import type { StatusName, ControlSize } from "../tokens";
import { Icon } from "./Icon";
import { fieldWrap, fieldInput, fieldSize, fieldStatus, fieldNumeric, fieldAlign, fieldAdornment, fieldAction, fieldPill } from "./Field.css";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size" | "prefix"> & {
  status?: "default" | StatusName;
  // 크기 3 단 (sm·md·lg). Button 과 같은 사다리 — 나란히 두면 높이가 맞는다.
  size?: ControlSize;
  // 실루엣 — Button·Badge 와 같은 어휘. pill 은 알약(검색창 결).
  shape?: "default" | "pill";
  numeric?: boolean;
  align?: "start" | "center" | "end";
  leading?: ReactNode;
  trailing?: ReactNode;
  clearable?: boolean;
  // type="password" 일 때 👁 보기 토글을 켠다 (clearable 과 대칭인 opt-in).
  showPasswordToggle?: boolean;
  onClear?: () => void;
  className?: string;
  style?: CSSProperties;
  "data-testid"?: string;
};

const XIcon = (
  <Icon size="sm" aria-hidden>
    <path d="M6 6 18 18M18 6 6 18" />
  </Icon>
);
const EyeIcon = (
  <Icon size="sm" aria-hidden>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </Icon>
);
const EyeOffIcon = (
  <Icon size="sm" aria-hidden>
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
    <circle cx="12" cy="12" r="2.75" />
    <path d="M3 3 21 21" />
  </Icon>
);

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  {
    status = "default",
    size = "md",
    shape = "default",
    numeric,
    align,
    leading,
    trailing,
    clearable,
    showPasswordToggle,
    onClear,
    type = "text",
    value,
    defaultValue,
    onChange,
    disabled,
    className,
    style,
    "data-testid": testid,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  const setRef = useCallback(
    (el: HTMLInputElement | null) => {
      innerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password" && !!showPasswordToggle;
  const effectiveType = isPassword ? (revealed ? "text" : "password") : type;

  // clear 버튼 가시성 — controlled 면 value, 아니면 내부 추적.
  const [innerHasValue, setInnerHasValue] = useState(() => String(defaultValue ?? "").length > 0);
  const hasValue = value !== undefined ? String(value).length > 0 : innerHasValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setInnerHasValue(e.currentTarget.value.length > 0);
    onChange?.(e);
  };

  // native setter + input 이벤트로 controlled·uncontrolled 양쪽에서 onChange 를 발화시킨다.
  const clear = () => {
    const el = innerRef.current;
    if (!el) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    setter?.call(el, "");
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.focus();
    onClear?.();
  };

  const showClear = !!clearable && hasValue && !disabled;

  return (
    // 래퍼는 위젯이 아니라 여백 클릭을 안쪽 input 으로 넘기는 표현용 컨테이너다 —
    // 진짜 컨트롤은 input 이라 role·키보드를 붙이는 게 오히려 틀리다.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={joinClass(fieldWrap, fieldSize[size], shape === "pill" && fieldPill, status !== "default" && fieldStatus[status], className)}
      style={style}
      data-testid={testid}
      // 래퍼 여백을 클릭해도 input 이 포커스되게 (액션 버튼은 제외)
      onMouseDown={(e) => {
        const t = e.target as HTMLElement;
        if (t !== innerRef.current && !t.closest("button")) {
          e.preventDefault();
          innerRef.current?.focus();
        }
      }}
    >
      {leading ? <span className={fieldAdornment}>{leading}</span> : null}
      <input
        ref={setRef}
        type={effectiveType}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        disabled={disabled}
        aria-invalid={status === "error" || undefined}
        className={joinClass(fieldInput, numeric && fieldNumeric, align && fieldAlign[align])}
        {...rest}
      />
      {showClear ? (
        <button type="button" className={fieldAction} onClick={clear} aria-label="지우기">
          {XIcon}
        </button>
      ) : null}
      {isPassword ? (
        <button
          type="button"
          className={fieldAction}
          onClick={() => setRevealed((v) => !v)}
          aria-label={revealed ? "비밀번호 숨기기" : "비밀번호 보기"}
          aria-pressed={revealed}
        >
          {revealed ? EyeOffIcon : EyeIcon}
        </button>
      ) : null}
      {trailing ? <span className={fieldAdornment}>{trailing}</span> : null}
    </div>
  );
});
