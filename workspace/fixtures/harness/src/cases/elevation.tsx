import { Floating, Surface, elevation } from "@studio-baeks/paper-ui";
import { ELEVATIONS } from "@studio-baeks/paper-ui/tokens";

// A popover at the start of a Trigger in the middle of the page, under the direction ?placed= names.
const Placed = ({ dir }: { dir: "ltr" | "rtl" }) => (
  <div dir={dir} style={{ display: "flex", justifyContent: "center", paddingBlockStart: "40vh" }}>
    <Floating defaultOpen>
      <Floating.Trigger data-testid="anchor">Anchor</Floating.Trigger>
      <Floating.Content aria-label="Placed" data-testid="placed" placement="start" flip={false}>Placed</Floating.Content>
    </Floating>
  </div>
);

// A popover asked to stand above a Trigger at the very top of the page, where ?flipped=off holds it there and otherwise it flips.
const Flipped = ({ flip }: { flip: boolean }) => (
  <Floating defaultOpen>
    <Floating.Trigger>Anchor</Floating.Trigger>
    <Floating.Content aria-label="Flipped" data-testid="flipped" placement="top" flip={flip}>Flipped</Floating.Content>
  </Floating>
);

// Every tier on a Surface in plain block flow, then a popover that is open from the start (a modal with ?modal)
// with a toast, a bare element carrying the toast's class, fixed over the whole viewport.
export const ElevationCase = () => {
  const params = new URLSearchParams(window.location.search);
  const placed = params.get("placed");
  const flipped = params.get("flipped");
  if (placed === "ltr" || placed === "rtl") return <Placed dir={placed} />;
  if (flipped !== null) return <Flipped flip={flipped !== "off"} />;
  return (
    <>
      {ELEVATIONS.map((tier) => <Surface key={tier} elevation={tier} data-testid={`tier-${tier}`}>{tier}</Surface>)}
      <Floating defaultOpen>
        <Floating.Trigger>Open</Floating.Trigger>
        <Floating.Content aria-label="Popover" data-testid="popover" presentation={params.has("modal") ? "modal" : "popover"}>Popover</Floating.Content>
      </Floating>
      <div className={elevation.toast} data-testid="toast" style={{ position: "fixed", inset: 0 }} />
    </>
  );
};
