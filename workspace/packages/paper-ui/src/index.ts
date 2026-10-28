// paper-ui exports layout primitives and individual controls.
// Values and vocabulary come from "@studio-baeks/paper-ui/tokens"; styles load only through
// "@studio-baeks/paper-ui/styles.css".

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

// Theme — the Provider and the hooks; the boot script is the entry "theme-boot"
export { PaperProvider, useTheme, useResolvedTheme } from "./theme";
export type { PaperProviderProps, ThemeControl } from "./theme";

// Resolver — 앱이 자기 컨트롤 글자를 같은 preset 으로 고를 때
export { resolveControlTypography } from "./resolvers";

// Inventory — every name above by category and order, as data
export { INVENTORY, PRIMITIVE_GROUPS } from "./inventory";
export type { PrimitiveGroup } from "./inventory";
