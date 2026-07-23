// paper-ui — 화면 위의 장부.
//
// 20 개. 이보다 늘리려면 그 컴포넌트가 실제 화면에서 두 번 이상 필요했다는
// 증거가 있어야 한다. "있으면 좋을 것 같아서" 는 증거가 아니다.

import "./styles/theme.css";
import "./styles/utility.css";
import "./styles/color.css";

// Primitives (4) — raw HTML 을 렌더하는 유일한 레이어
export { Box, Stack, Inline, Text } from "./primitives";
export type { BoxProps, StackProps, InlineProps, TextProps } from "./primitives";

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
export { tokens, stateTransition } from "./tokens";
export type { AccentName, StatusName, TextVariant, Space, ControlSize } from "./tokens";

// Resolver 타입 — 앱이 자기 컴포넌트를 이 어휘로 만들 때
export type { Paper, Ink, Tone } from "./resolvers";
