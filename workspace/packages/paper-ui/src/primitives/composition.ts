export { mergeProps, mergeRefs } from "@react-aria/utils";

/** Run the caller first; preventDefault cancels the internal handler. */
export function composeEventHandlers<Event extends { defaultPrevented: boolean }>(
  caller?: (event: Event) => void,
  internal?: (event: Event) => void,
) {
  return (event: Event) => {
    caller?.(event);
    if (!event.defaultPrevented) internal?.(event);
  };
}
