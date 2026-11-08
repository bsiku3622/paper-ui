// A video's length the way a player writes it: 0:08, 3:07.

import { formatDuration } from "../../../../kit";

export const duration = (seconds: number) => formatDuration(seconds);
