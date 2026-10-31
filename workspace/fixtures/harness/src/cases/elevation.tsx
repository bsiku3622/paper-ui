import { Floating, Surface, elevation } from "@studio-baeks/paper-ui";
import { ELEVATIONS } from "@studio-baeks/paper-ui/tokens";

// Every tier on a Surface in plain block flow, then a popover that is open from the start (a modal with ?modal)
// with a toast, a bare element carrying the toast's class, fixed over the whole viewport.
export const ElevationCase = () => (
  <>
    {ELEVATIONS.map((tier) => <Surface key={tier} elevation={tier} data-testid={`tier-${tier}`}>{tier}</Surface>)}
    <Floating defaultOpen>
      <Floating.Trigger data-testid="popover-trigger">Open</Floating.Trigger>
      <Floating.Content aria-label="Popover" data-testid="popover" presentation={new URLSearchParams(window.location.search).has("modal") ? "modal" : "popover"}>Popover</Floating.Content>
    </Floating>
    <div className={elevation.toast} data-testid="toast" style={{ position: "fixed", inset: 0 }} />
  </>
);
