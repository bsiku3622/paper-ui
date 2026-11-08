// AddToPlaylistDialog — 곡을 어느 플레이리스트에 담을지 고르는 대화상자.

import { Box, Button, Divider, Floating, IconButton, Inline, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, useToast } from "../../../kit";
import { formatTrackCount } from "../data/catalog";
import { useLibrary } from "../state/library";
import { SmallArt } from "./pictures";

type Props = {
  trackIds: readonly string[];
  onClose: () => void;
  onCreate: (trackIds: readonly string[]) => void;
};

export const AddToPlaylistDialog = ({ trackIds, onClose, onCreate }: Props) => {
  const toast = useToast();
  const library = useLibrary();

  const add = (id: string, name: string) => {
    const added = library.addToPlaylist(id, trackIds);
    toast(added > 0 ? `${formatTrackCount(added)}을 '${name}'에 담았습니다` : `이미 '${name}'에 들어 있습니다`);
    onClose();
  };

  return (
    <Floating open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Floating.Content as={Surface} fill="raised" radius="lg" padding="xl" presentation="modal" aria-label="플레이리스트에 추가" width="measure.xs" maxHeight="viewport" overflowY="auto">
        <Stack gap="lg">
          <Inline justify="between" align="center" gap="md">
            <Stack>
              <Text as="h2" variant="heading">플레이리스트에 추가</Text>
              <Text as="span" ink="tertiary">{formatTrackCount(trackIds.length)}을 담습니다</Text>
            </Stack>
            <IconButton as={Floating.Close} variant="ghost" aria-label="닫기"><Glyph name="x" /></IconButton>
          </Inline>
          <Button variant="dashed" fullWidth justify="start" onClick={() => onCreate(trackIds)}><Glyph name="plus" />새 플레이리스트</Button>
          <Box maxHeight="xl" overflowY="auto">
            <Stack as="ul" aria-label="내 플레이리스트">
              {library.playlists.map((playlist, index) => (
                <Stack as="li" key={playlist.id}>
                  {index > 0 ? <Divider aria-hidden /> : null}
                  <Button variant="ghost" fullWidth justify="between" onClick={() => add(playlist.id, playlist.name)}>
                    <Inline as="span" gap="md" minWidth={0}>
                      <SmallArt seed={playlist.seed} name={playlist.name} />
                      <Text as="span" truncate>{playlist.name}</Text>
                    </Inline>
                    <Text as="span" variant="caption" ink="tertiary" numeric>{formatTrackCount(playlist.trackIds.length)}</Text>
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Floating.Content>
    </Floating>
  );
};
