// A button that is a first face of its own on the canvas (the menu button, "일정 열기"): a raised, outlined face that floats over
// the canvas at Paper's floating depth, like the rest of the chrome.

import { elevation } from "@studio-baeks/paper-ui";

export const useButtonFace = () => ({ variant: "hairline", fill: "raised", className: elevation.overlay }) as const;
