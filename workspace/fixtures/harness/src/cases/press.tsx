import { useState, type ReactNode, type SyntheticEvent } from "react";

import { Button, Floating, Pressable, Selectable, mergeProps, usePressable, type PressEvent } from "@studio-baeks/paper-ui";

const useCounts = () => {
  const [counts, setCounts] = useState({ clicks: 0, presses: 0 });
  return {
    counted: { "data-clicks": counts.clicks, "data-presses": counts.presses },
    onClick: () => setCounts((current) => ({ ...current, clicks: current.clicks + 1 })),
    onPress: () => setCounts((current) => ({ ...current, presses: current.presses + 1 })),
  };
};

const ButtonTarget = ({ disabled }: { disabled?: boolean }) => {
  const { counted, onClick, onPress } = useCounts();
  return <Pressable data-testid={disabled ? "disabled" : "button"} disabled={disabled} {...counted} onClick={onClick} onPress={onPress}>Button</Pressable>;
};

const RoleTarget = () => {
  const { counted, onClick, onPress } = useCounts();
  const { pressProps } = usePressable({ onPress });
  return <div data-testid="role-button" role="button" tabIndex={0} {...counted} {...mergeProps(pressProps, { onClick })}>Role</div>;
};

const LinkTarget = () => {
  const { counted, onClick, onPress } = useCounts();
  const { pressProps } = usePressable({ onPress });
  return <a data-testid="link" href="#target" {...counted} {...mergeProps(pressProps, { onClick })}>Link</a>;
};

const SubmitTarget = () => {
  const [submits, setSubmits] = useState(0);
  return (
    <form data-testid="form" data-submits={submits} onSubmit={(event) => { event.preventDefault(); setSubmits((count) => count + 1); }}>
      <Pressable data-testid="submit" type="submit">Submit</Pressable>
    </form>
  );
};

const BareSelectable = () => {
  const { counted, onClick } = useCounts();
  return <Selectable data-testid="selectable" {...counted} onClick={onClick}>Selectable</Selectable>;
};

const PressedSelectable = () => {
  const { counted, onClick, onPress } = useCounts();
  return <Pressable as={Selectable} data-testid="pressable-selectable" {...counted} onClick={onClick} onPress={onPress}>Pressable Selectable</Pressable>;
};

const PressedTrigger = () => {
  const { counted, onClick, onPress } = useCounts();
  return (
    <Floating>
      <Pressable as={Floating.Trigger} data-testid="pressable-trigger" {...counted} onClick={onClick} onPress={onPress}>Pressable Trigger</Pressable>
      <Floating.Content aria-label="Panel">Panel</Floating.Content>
    </Floating>
  );
};

const DivSelectable = () => {
  const { counted, onClick } = useCounts();
  return <Selectable as="div" data-testid="div-selectable" {...counted} onClick={onClick}>Div Selectable</Selectable>;
};

const DivTrigger = () => {
  const { counted, onClick } = useCounts();
  return (
    <Floating>
      <Floating.Trigger as="div" data-testid="div-trigger" {...counted} onClick={onClick}>Div Trigger</Floating.Trigger>
      <Floating.Content aria-label="Div panel"><Floating.Close>Close</Floating.Close></Floating.Content>
    </Floating>
  );
};

// The Atom over each kind of target: a plain Button, and a Button that takes the look of a Paper part. The Atom has no
// press of its own to count, so these count their clicks.
const AtomButton = () => {
  const { counted, onClick } = useCounts();
  return <Button data-testid="atom-button" {...counted} onClick={onClick}>Atom Button</Button>;
};

const AtomSelectable = () => {
  const { counted, onClick } = useCounts();
  return <Button as={Selectable} variant="ghost" data-testid="atom-selectable" {...counted} onClick={onClick}>Atom Selectable</Button>;
};

const AtomTrigger = () => {
  const { counted, onClick } = useCounts();
  return (
    <Floating>
      <Button as={Floating.Trigger} variant="hairline" data-testid="atom-trigger" {...counted} onClick={onClick}>Atom Trigger</Button>
      <Floating.Content aria-label="Atom panel">Atom panel</Floating.Content>
    </Floating>
  );
};

// A Pressable that writes its callbacks down, in the order they ran.
const LoggedTarget = ({ id, ...options }: { id: string; cancelOnPointerExit?: boolean; allowTextSelection?: boolean }) => {
  const [log, setLog] = useState<string[]>([]);
  const note = (name: string) => setLog((current) => [...current, name]);
  return (
    <Pressable {...options} data-testid={id} data-log={log.join(" ")} onPressStart={() => note("start")} onPressEnd={() => note("end")} onPressUp={() => note("up")}
      onPressChange={(isActive) => note(`change:${isActive}`)} onPress={() => note("press")}>{id}</Pressable>
  );
};

// A parent that writes down the React events that reach it, in order, on its own element: writing them there is no state
// of React's, so the writing cannot change what a press does.
const write = (name: string, attribute = "data-log") => (event: SyntheticEvent<HTMLElement>) => {
  const log = event.currentTarget.getAttribute(attribute);
  event.currentTarget.setAttribute(attribute, log ? `${log} ${name}` : name);
};
const Parent = ({ id, children }: { id: string; children: ReactNode }) => (
  <div
    role="presentation"
    data-testid={`parent-${id}`}
    onPointerDown={write("pointerdown")}
    onMouseDown={write("mousedown")}
    onPointerUp={write("pointerup")}
    onMouseUp={write("mouseup")}
    onClick={write("click")}
    onKeyDown={write("keydown")}
    onKeyUp={write("keyup")}
    onPointerDownCapture={write("pointerdown", "data-captured")}
    onMouseDownCapture={write("mousedown", "data-captured")}
    onClickCapture={write("click", "data-captured")}
  >
    {children}
  </div>
);
const declines = (event: PressEvent) => event.continuePropagation();

// What each kind of target lets through to a parent: a plain button for comparison, then a Pressable and a Button as they
// come, then a Pressable that declines the press in one callback at a time, and a Button that declines it.
const Propagation = () => (
  <>
    <Parent id="plain"><button type="button" data-testid="from-plain">Plain</button></Parent>
    <Parent id="pressable"><Pressable data-testid="from-pressable">Pressable</Pressable></Parent>
    <Parent id="button"><Button data-testid="from-button">Button</Button></Parent>
    <Parent id="start"><Pressable data-testid="from-start" onPressStart={declines}>Declines at start</Pressable></Parent>
    <Parent id="up"><Pressable data-testid="from-up" onPressUp={declines}>Declines at up</Pressable></Parent>
    <Parent id="end"><Pressable data-testid="from-end" onPressEnd={declines}>Declines at end</Pressable></Parent>
    <Parent id="press"><Pressable data-testid="from-press" onPress={declines}>Declines at press</Pressable></Parent>
    <Parent id="declines-button"><Button as={Pressable} data-testid="from-declines-button" onPressStart={declines} onPress={declines}>Button that declines</Button></Parent>
  </>
);

// The elements a press lands on, each counting its clicks and presses in data attributes.
export const PressCase = () => (
  <>
    <LoggedTarget id="logged" />
    <LoggedTarget id="exits" cancelOnPointerExit />
    <LoggedTarget id="selects" allowTextSelection />
    <ButtonTarget />
    <ButtonTarget disabled />
    <RoleTarget />
    <LinkTarget />
    <SubmitTarget />
    <BareSelectable />
    <PressedSelectable />
    <PressedTrigger />
    <DivSelectable />
    <DivTrigger />
    <AtomButton />
    <AtomSelectable />
    <AtomTrigger />
    <Propagation />
  </>
);
