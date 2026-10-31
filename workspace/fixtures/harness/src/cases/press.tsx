import { useState } from "react";

import { Floating, Pressable, Selectable, mergeProps, usePressable } from "@studio-baeks/paper-ui";

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
      <Floating.Content aria-label="Panel" anchored={false}>Panel</Floating.Content>
    </Floating>
  );
};

// The elements a press lands on, each counting its clicks and presses in data attributes.
export const PressCase = () => (
  <>
    <ButtonTarget />
    <ButtonTarget disabled />
    <RoleTarget />
    <LinkTarget />
    <SubmitTarget />
    <BareSelectable />
    <PressedSelectable />
    <PressedTrigger />
  </>
);
