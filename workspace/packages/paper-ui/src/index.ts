// paper-ui exports layout primitives and individual controls.

import "./styles/theme.css";
import "./styles/utility.css";
import "./styles/color.css";

// Primitives (4) — raw HTML 을 렌더하는 유일한 레이어
export { Box, Stack, Inline, Text, Icon } from "./primitives";
export type { BoxProps, BoxDimension, BoxLayoutProps, StackProps, InlineProps, TextProps, IconProps, IconSize } from "./primitives";

// 테마 엔진 — 부분 화면 반전(ThemeScope)과 테마 제어(useTheme). Box inverse 도 이 엔진.
export { ThemeScope, useTheme, useResolvedTheme } from "./primitives";
export type { ThemeScopeProps, Theme, ResolvedTheme, ThemeControl } from "./primitives";

// Atoms (13)
export {
  Button,
  IconButton,
  Field,
  Label,
  Badge,
  Checkbox,
  Divider,
  Link,
  Select,
  SelectOption,
  SelectGroup,
  Textarea,
  Switch,
  Radio,
  Spinner,
} from "./atoms";
export type {
  ButtonProps,
  IconButtonProps,
  FieldProps,
  LabelProps,
  BadgeProps,
  CheckboxProps,
  DividerProps,
  LinkProps,
  SelectProps,
  SelectOptionProps,
  SelectGroupProps,
  TextareaProps,
  SwitchProps,
  RadioProps,
  SpinnerProps,
} from "./atoms";

// Provider
export { PaperProvider } from "./provider/PaperProvider";
export type { PaperProviderProps } from "./provider/PaperProvider";

// Tokens — 앱이 시스템 값에 닿는 유일한 통로
export { tokens, stateTransition } from "./tokens";
export type { AccentName, StatusName, TextVariant, Space, ControlSize } from "./tokens";

// Resolver 타입 — 앱이 자기 컴포넌트를 이 어휘로 만들 때
export { resolveControlTypography } from "./resolvers";
export type { Surface, Accent, Variant, Ink, Tone } from "./resolvers";
