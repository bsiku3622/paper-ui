// paper-ui exports layout primitives and individual controls.
// Values and vocabulary come from "@studio-baeks/paper-ui/tokens"; styles load only through
// "@studio-baeks/paper-ui/styles.css".

// The Primitives, in two orders (see primitives/index.ts).
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

// Inventory — every name above by category and order, as data
export { INVENTORY, PRIMITIVE_ORDERS, PRIMITIVE_GROUPS } from "./inventory";
export type { PrimitiveOrder, PrimitiveGroup } from "./inventory";
