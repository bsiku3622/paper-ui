import type { ReactNode } from "react";

import { Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { ARTIST_BY_ID, type Track } from "../data/catalog";
import { TrackThumb } from "./pictures";

export const MiniTrack = ({ track, trailing, strong = false, size = "sm" }: { track: Track; trailing?: ReactNode; strong?: boolean; size?: "xs" | "sm" | "md" }) => (
  <Inline gap="md" justify="between" align="center">
    <Inline gap="md" minWidth={0} align="center">
      <TrackThumb track={track} size={size} />
      <Stack minWidth={0}>
        <Text as="span" strong={strong} truncate>{track.title}</Text>
        <Text as="span" variant="caption" ink="tertiary" truncate>{ARTIST_BY_ID.get(track.artistId)!.name}</Text>
      </Stack>
    </Inline>
    {trailing}
  </Inline>
);
