// paper-ui exports layout primitives and individual controls.

import "./styles/theme.css";
import "./styles/utility.css";
import "./styles/color.css";

// Layout, Content, Interaction, and A11y primitives.
export * from "./primitives";

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
