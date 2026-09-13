// paper-ui — 순백 위에 부드럽게 그려지는 UI.
//
// 27 개 (Primitives 4 · Atoms 13 · Molecules 6 · Components 4). 이보다 늘리려면
// 그 컴포넌트가 실제 화면에서 두 번 이상 필요했다는 증거가 있어야 한다.
// "있으면 좋을 것 같아서" 는 증거가 아니다.

import "./styles/theme.css";
import "./styles/utility.css";
import "./styles/color.css";

// Primitives (4) — raw HTML 을 렌더하는 유일한 레이어
export { Box, Stack, Inline, Text } from "./primitives";
export type { BoxProps, StackProps, InlineProps, TextProps } from "./primitives";

// 테마 엔진 — 부분 화면 반전(ThemeScope)과 테마 제어(useTheme). Box inverse 도 이 엔진.
export { ThemeScope, useTheme, useResolvedTheme } from "./primitives";
export type { ThemeScopeProps, Theme, ResolvedTheme, ThemeControl } from "./primitives";

// Atoms (13)
export {
  Button,
  Field,
  Label,
  Badge,
  Checkbox,
  Icon,
  Divider,
  Link,
  Select,
  Textarea,
  Switch,
  Radio,
  Spinner,
} from "./atoms";
export type {
  ButtonProps,
  FieldProps,
  LabelProps,
  BadgeProps,
  CheckboxProps,
  IconProps,
  DividerProps,
  LinkProps,
  SelectProps,
  SelectOption,
  TextareaProps,
  SwitchProps,
  RadioProps,
  SpinnerProps,
} from "./atoms";

// Molecules (6)
export { Card, TextField, Tabs, Tooltip, RadioGroup, Alert } from "./molecules";
export type {
  CardProps,
  TextFieldProps,
  TabsProps,
  TabItem,
  TooltipProps,
  RadioGroupProps,
  RadioOption,
  AlertProps,
} from "./molecules";

// Components (4)
export { Table, Modal, Navbar, Banner } from "./components";
export type { TableProps, Column, ModalProps, NavbarProps, NavItem, BannerProps } from "./components";

// Provider
export { PaperProvider } from "./provider/PaperProvider";
export type { PaperProviderProps } from "./provider/PaperProvider";

// Tokens — 앱이 시스템 값에 닿는 유일한 통로
export { tokens, stateTransition, semanticFormHoverShadow } from "./tokens";
export type { AccentName, StatusName, TextVariant, Space, ControlSize } from "./tokens";

// Resolver 타입 — 앱이 자기 컴포넌트를 이 어휘로 만들 때
export type { Color, Surface, Accent, Variant, Ink, Tone } from "./resolvers";
