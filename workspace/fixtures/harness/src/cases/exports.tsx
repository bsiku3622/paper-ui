import {
  Badge, Box, Button, Calendar, Checkbox, Control, DatePicker, Divider, Draggable, Droppable, Field, Floating, FocusScope, FormField, Grid, Icon, IconButton, INVENTORY, PRIMITIVE_GROUPS, PRIMITIVE_ORDERS, Inline, Label, Link, Marker, LiveRegion, Paint, PaperProvider, Portal, Pressable,
  Radio, RovingFocus, SegmentControl, Sidebar, Select, Selectable, SelectableGroup, Slider, Spinner, Stack, Surface, Switch, Text, Textarea, VisuallyHidden,
  announce, clearAnnouncements, composeEventHandlers, controlClass, elevation, loop, mergeProps, mergeRefs, paintClass, presence, reveal, revealAfter, surfaceClass,
  useDraggable, useDroppable, useFloating, useFloatingContext, useFocusRing, useFocusWithin, useFormField, useFormFieldControl, usePressable, useResolvedTheme, useRovingFocusItem, useSelectable, useSelectableGroup, useTheme,
} from "@studio-baeks/paper-ui";
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, themeBootScript, type ThemeBootOptions } from "@studio-baeks/paper-ui/theme-boot";
import { useEffect, useRef, type ReactNode } from "react";

import { SELECT_OPTIONS } from "./options.js";

type Primitive = (typeof INVENTORY.primitives)[keyof typeof INVENTORY.primitives];
type ComponentName = Primitive["components"][number] | (typeof INVENTORY.atoms)[number] | (typeof INVENTORY.components)[number];
type HookName = Primitive["hooks"][number];

const BOX_ICON = <path d="M4 4h16v16H4z" />;

const COMPONENTS: Record<ComponentName, ReactNode> = {
  Box: <Box padding="sm">Box</Box>,
  Text: <Text>Text</Text>,
  Icon: <Icon aria-label="Icon">{BOX_ICON}</Icon>,
  FocusScope: <FocusScope contain restoreFocus><button type="button">FocusScope</button></FocusScope>,
  VisuallyHidden: <VisuallyHidden>VisuallyHidden</VisuallyHidden>,
  Portal: <Portal>Portal</Portal>,
  LiveRegion: <LiveRegion>LiveRegion</LiveRegion>,
  Surface: <Surface fill="raised" border radius="md" padding="sm">Surface</Surface>,
  Paint: <Paint accent="primary" variant="hairline" padding="sm">Paint</Paint>,
  Control: <Control>control</Control>,
  Pressable: <Pressable>Pressable</Pressable>,
  Selectable: <Selectable>Selectable</Selectable>,
  SelectableGroup: (
    <SelectableGroup aria-label="SelectableGroup" defaultSelectedValues={["a"]}>
      <SelectableGroup.Item value="a">A</SelectableGroup.Item>
      <SelectableGroup.Item value="b">B</SelectableGroup.Item>
    </SelectableGroup>
  ),
  Floating: (
    <Floating defaultOpen>
      <Floating.Trigger>Floating</Floating.Trigger>
      <Floating.Content aria-label="Floating panel">
        Floating panel
        <Floating.Close>Close</Floating.Close>
      </Floating.Content>
    </Floating>
  ),
  Draggable: <Draggable aria-label="Draggable">Draggable<Draggable.Handle aria-label="Handle" /></Draggable>,
  Droppable: <Droppable aria-label="Droppable">Droppable</Droppable>,
  RovingFocus: (
    <RovingFocus aria-label="RovingFocus">
      <RovingFocus.Item value="a">A</RovingFocus.Item>
      <RovingFocus.Item value="b">B</RovingFocus.Item>
    </RovingFocus>
  ),
  FormField: <FormField label="FormField" description="Description" error="Error"><Field /></FormField>,
  Stack: <Stack gap="sm">Stack</Stack>,
  Inline: <Inline gap="sm">Inline</Inline>,
  Grid: <Grid gap="sm">Grid</Grid>,
  Button: <Button>Button</Button>,
  IconButton: <IconButton aria-label="IconButton"><Icon>{BOX_ICON}</Icon></IconButton>,
  Field: <Field aria-label="Field" clearable defaultValue="Field" />,
  Textarea: <Textarea aria-label="Textarea" defaultValue="Textarea" />,
  Select: <Select aria-label="Select" defaultValue="a">{SELECT_OPTIONS}</Select>,
  Checkbox: <Checkbox aria-label="Checkbox" />,
  Switch: <Switch aria-label="Switch" />,
  Radio: <Radio aria-label="Radio" />,
  Label: <Label>Label</Label>,
  Badge: <Badge>Badge</Badge>,
  Spinner: <Spinner />,
  SegmentControl: <SegmentControl aria-label="SegmentControl" defaultValue="a"><SegmentControl.Item value="a">A</SegmentControl.Item></SegmentControl>,
  Slider: <Slider aria-label="Slider" />,
  Calendar: <Calendar aria-label="Calendar" defaultValue="2026-11-20" />,
  DatePicker: <DatePicker aria-label="DatePicker" defaultValue="2026-11-20" />,
  Sidebar: <Sidebar label="Sidebar" collapseBelow="never"><Sidebar.Item as="button">Item</Sidebar.Item></Sidebar>,
  Divider: <Divider />,
  Link: <Link href="#link">Link</Link>,
  Marker: <Marker>Marker</Marker>,
};

const Probe = ({ name, children }: { name: string; children?: ReactNode }) => <div data-export={name}>{children}</div>;

const HOOKS: Record<HookName, () => unknown> = {
  useFocusRing: () => useFocusRing(),
  useFocusWithin: () => useFocusWithin(),
  usePressable: () => usePressable(),
  useSelectable: () => useSelectable(),
  useSelectableGroup: () => useSelectableGroup(),
  useFloating: () => useFloating(),
  useFloatingContext: () => useFloatingContext(),
  useDraggable: () => useDraggable(),
  useDroppable: () => useDroppable(),
  useRovingFocusItem: () => useRovingFocusItem({ value: "a" }),
  useFormField: () => useFormField(),
  useFormFieldControl: () => useFormFieldControl(),
};

const HookProbe = ({ name }: { name: HookName }) => {
  const result = HOOKS[name]();
  return <Probe name={name}>{typeof result}</Probe>;
};

const HookProbes = () => (
  <>
    {(Object.keys(HOOKS) as HookName[])
      .filter((name) => name !== "useFloatingContext" && name !== "useRovingFocusItem")
      .map((name) => <HookProbe key={name} name={name} />)}
    <Floating defaultOpen>
      <Floating.Trigger>Context probe</Floating.Trigger>
      <Floating.Content aria-label="Context probe">
        <HookProbe name="useFloatingContext" />
      </Floating.Content>
    </Floating>
    <RovingFocus aria-label="Context probe">
      <HookProbe name="useRovingFocusItem" />
    </RovingFocus>
  </>
);

const ThemeProbes = () => {
  const control = useTheme();
  const resolved = useResolvedTheme();
  return (
    <>
      <Probe name="useTheme">{typeof control.setTheme}</Probe>
      <Probe name="useResolvedTheme">{resolved}</Probe>
    </>
  );
};

const FunctionProbes = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    announce("exports");
    clearAnnouncements();
  }, []);
  const composed = composeEventHandlers(undefined, undefined);
  return (
    <>
      <Probe name="announce">{typeof announce}</Probe>
      <Probe name="clearAnnouncements">{typeof clearAnnouncements}</Probe>
      <Probe name="composeEventHandlers">{typeof composed}</Probe>
      <Probe name="mergeProps">{typeof mergeProps({ id: "a" }, { id: "b" })}</Probe>
      <Probe name="mergeRefs">{typeof mergeRefs(ref, null)}</Probe>
    </>
  );
};

const ClassProbes = () => (
  <>
    <Probe name="surfaceClass"><span className={surfaceClass({ fill: "raised", border: true })}>surfaceClass</span></Probe>
    <Probe name="paintClass"><span className={paintClass({ accent: "primary", variant: "hairline" })}>paintClass</span></Probe>
    <Probe name="controlClass"><span className={controlClass({ size: "sm" })}>controlClass</span></Probe>
    <Probe name="elevation"><span className={elevation.overlay}>elevation</span></Probe>
    <Probe name="presence"><span className={presence.surface}>presence</span></Probe>
    <Probe name="loop"><span className={loop.pulse}>loop</span></Probe>
    <Probe name="reveal"><span className={reveal.load}>reveal</span></Probe>
    <Probe name="revealAfter"><span className={revealAfter[1]}>revealAfter</span></Probe>
  </>
);

const BOOT_OPTIONS: ThemeBootOptions = { storageKey: THEME_STORAGE_KEY, defaultTheme: "system" };
const BootProbe = () => <div data-boot-attribute={THEME_ATTRIBUTE}>{typeof themeBootScript(BOOT_OPTIONS)}</div>;

export const ExportsCase = () => (
  <PaperProvider>
    {(Object.keys(COMPONENTS) as ComponentName[]).map((name) => (
      <Probe key={name} name={name}>{COMPONENTS[name]}</Probe>
    ))}
    <HookProbes />
    <ThemeProbes />
    <FunctionProbes />
    <ClassProbes />
    <Probe name="PaperProvider">{typeof PaperProvider}</Probe>
    <Probe name="INVENTORY">{Object.keys(INVENTORY).join(" ")}</Probe>
    <Probe name="PRIMITIVE_ORDERS">{Object.keys(PRIMITIVE_ORDERS).join(" ")}</Probe>
    <Probe name="PRIMITIVE_GROUPS">{PRIMITIVE_GROUPS.join(" ")}</Probe>
    <BootProbe />
  </PaperProvider>
);
