import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Box, Button, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Art, Glyph, SectionHeader, SurfaceLink } from "../../../kit";
import { ARTIST_BY_ID, type Album, type Artist } from "../data/catalog";
import type { Playlist } from "../data/collections";
import { AlbumArt, ArtistArt, PlaylistArt } from "./pictures";

const Words = ({ title, sub, center = false }: { title: string; sub?: ReactNode; center?: boolean }) => (
  <Stack align={center ? "center" : undefined}>
    <Text as="span" strong truncate>{title}</Text>
    {sub ? <Text as="span" variant="caption" ink="tertiary" truncate>{sub}</Text> : null}
  </Stack>
);

export const AlbumCard = ({ album, sub }: { album: Album; sub?: ReactNode }) => (
  <SurfaceLink to={`/music/album/${album.id}`} padding="xs" radius="md" aria-label={`${album.title}, ${ARTIST_BY_ID.get(album.artistId)!.name}`}>
    <Stack gap="sm">
      <AlbumArt album={album} />
      <Words title={album.title} sub={sub ?? ARTIST_BY_ID.get(album.artistId)!.name} />
    </Stack>
  </SurfaceLink>
);

export const PlaylistCard = ({ playlist, sub }: { playlist: Playlist; sub?: ReactNode }) => (
  <SurfaceLink to={`/music/playlist/${playlist.id}`} padding="xs" radius="md" aria-label={playlist.name}>
    <Stack gap="sm">
      <PlaylistArt playlist={playlist} />
      <Words title={playlist.name} sub={sub ?? playlist.description} />
    </Stack>
  </SurfaceLink>
);

export const ArtistCard = ({ artist, sub }: { artist: Artist; sub?: ReactNode }) => (
  <SurfaceLink to={`/music/artist/${artist.id}`} padding="xs" radius="md" aria-label={artist.name}>
    <Stack gap="sm" align="center">
      <ArtistArt artist={artist} />
      <Words title={artist.name} sub={sub ?? artist.kind} center />
    </Stack>
  </SurfaceLink>
);

export const TileLink = ({ to, seed, title, sub }: { to: string; seed: string; title: string; sub?: string }) => (
  <SurfaceLink to={to} padding="xs" radius="md" aria-label={title}>
    <Stack gap="sm">
      <Art seed={seed} kind="pattern" ratio="16 / 9" radius="md" />
      <Words title={title} sub={sub} />
    </Stack>
  </SurfaceLink>
);

export const Shelf = ({ title, description, to, children }: { title: string; description?: string; to?: string; children: ReactNode }) => (
  <Stack as="section" gap="md" aria-label={title}>
    <SectionHeader
      title={title}
      description={description}
      actions={to ? <Button as={RouterLink} to={to} variant="ghost" size="sm">모두 보기<Glyph name="chevron-right" /></Button> : undefined}
    />
    <Box overflowX="auto">
      <Inline gap="md" align="start">{children}</Inline>
    </Box>
  </Stack>
);

export const Slot = ({ children, wide = false }: { children: ReactNode; wide?: boolean }) => (
  <Stack width={wide ? "lg" : "md"} minWidth={wide ? "lg" : "md"}>{children}</Stack>
);
