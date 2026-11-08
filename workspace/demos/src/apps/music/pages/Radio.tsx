import { useEffect, useRef, useState } from "react";

import { Badge, Box, Button, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { Anchor, Art, Glyph, PageHeader, SectionHeader } from "../../../kit";
import { ARTISTS, ARTIST_BY_ID } from "../data/catalog";
import { STATIONS, artistStationTracks, onAir, radioQueue, type Station } from "../data/collections";
import { Shelf, Slot } from "../parts/cards";
import { ArtistArt } from "../parts/pictures";
import { usePlayer } from "../state/player";

const GRID = "repeat(auto-fill, minmax(14rem, 1fr))";
const TUNE_MS = 700;

const useTune = (name: string, tracks: () => { id: string }[]) => {
  const player = usePlayer();
  const [tuning, setTuning] = useState(false);
  const latest = useRef({ name, tracks, player });
  latest.current = { name, tracks, player };
  useEffect(() => {
    if (!tuning) return;
    const timer = window.setTimeout(() => {
      latest.current.player.startRadio(latest.current.name, latest.current.tracks().map((track) => track.id));
      setTuning(false);
    }, TUNE_MS);
    return () => window.clearTimeout(timer);
  }, [tuning]);
  return { tuning, tune: () => setTuning(true) };
};

const Featured = ({ station }: { station: Station }) => {
  const { tuning, tune } = useTune(station.name, () => radioQueue(station));
  const now = onAir(station);
  return (
    <Anchor>
      <Grid columns={{ base: "minmax(0, 1fr)", md: "auto minmax(0, 1fr)" }} gap="xl" align="center">
        <Box width="lg" maxWidth="full"><Art seed={station.seed} kind="cover" ratio="1 / 1" radius="md" label={`${station.name} 표지`} /></Box>
        <Stack gap="md" minWidth={0}>
          <Inline gap="sm"><Badge size="sm" dot>LIVE</Badge><Text as="span" variant="label" strong={false} ink="tertiary">진행 {station.host}</Text></Inline>
          <Stack>
            <Text as="h2" variant="display">{station.name}</Text>
            <Text as="p" variant="lead" ink="secondary">{station.tagline}</Text>
          </Stack>
          <Text ink="secondary">지금 · {now.title} — {ARTIST_BY_ID.get(now.artistId)!.name}</Text>
          <Inline gap="sm"><Button loading={tuning} loadingLabel="방송국에 연결하는 중" onClick={tune}><Glyph name="play" />듣기</Button></Inline>
        </Stack>
      </Grid>
    </Anchor>
  );
};

const Tile = ({ station }: { station: Station }) => {
  const { tuning, tune } = useTune(station.name, () => radioQueue(station));
  const now = onAir(station);
  return (
    <Stack gap="sm">
      <Art seed={station.seed} kind="cover" ratio="16 / 9" radius="md" />
      <Inline justify="between" gap="sm">
        <Text as="span" strong truncate>{station.name}</Text>
        {station.kind === "live" ? <Badge size="sm" dot variant="soft">LIVE</Badge> : null}
      </Inline>
      <Text as="span" variant="caption" ink="tertiary">{station.tagline}</Text>
      <Text as="span" variant="caption" ink="secondary" truncate>지금 · {now.title} — {ARTIST_BY_ID.get(now.artistId)!.name}</Text>
      <Inline><Button size="sm" shape="pill" variant="soft" loading={tuning} loadingLabel="방송국에 연결하는 중" onClick={tune}><Glyph name="play" />듣기</Button></Inline>
    </Stack>
  );
};

const ArtistRadio = ({ id }: { id: string }) => {
  const artist = ARTIST_BY_ID.get(id)!;
  const { tuning, tune } = useTune(`${artist.name} 라디오`, () => artistStationTracks(artist));
  return (
    <Stack gap="sm" align="center" padding="xs">
      <ArtistArt artist={artist} />
      <Text as="span" strong truncate>{artist.name}</Text>
      <Button size="xs" shape="pill" variant="soft" loading={tuning} loadingLabel="방송국에 연결하는 중" onClick={tune}><Glyph name="radio" />라디오</Button>
    </Stack>
  );
};

export const RadioPage = () => {
  const live = STATIONS.filter((station) => station.kind === "live");
  const genre = STATIONS.filter((station) => station.kind === "genre");
  return (
    <>
      <PageHeader title="라디오" description="틀어 두면 이어서 흘러나옵니다." />
      <Featured station={live[0]!} />
      <Stack gap="md" as="section" aria-label="라이브 방송국">
        <SectionHeader title="라이브 방송국" description="진행자와 함께 하는 방송" />
        <Grid columns={GRID} gap="xl">{live.slice(1).map((station) => <Tile key={station.id} station={station} />)}</Grid>
      </Stack>
      <Stack gap="md" as="section" aria-label="장르 방송국">
        <SectionHeader title="장르 방송국" description="한 가지 분위기로 쉬지 않고" />
        <Grid columns={GRID} gap="xl">{genre.map((station) => <Tile key={station.id} station={station} />)}</Grid>
      </Stack>
      <Shelf title="아티스트 라디오" description="그 아티스트와 닮은 노래까지 이어서">
        {ARTISTS.slice(0, 10).map((artist) => <Slot key={artist.id}><ArtistRadio id={artist.id} /></Slot>)}
      </Shelf>
    </>
  );
};
