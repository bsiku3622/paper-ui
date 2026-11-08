import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Button, Divider, Field, Floating, FormField, Grid, IconButton, Inline, Stack, Surface, Switch, Text, Textarea } from "@studio-baeks/paper-ui";

import { Art, Empty, Glyph, Segmented, useToast } from "../../../kit";
import { TRACKS, TRACK_BY_ID, formatTrackCount, totalDuration, spoken, type Track } from "../data/catalog";
import { josa } from "../data/josa";
import { search } from "../data/search";
import { useLibrary } from "../state/library";
import { MiniTrack } from "./MiniTrack";
import { Reorder } from "./Reorder";

type Props = {
  id?: string;
  seed?: readonly string[];
  onClose: () => void;
};

export const PlaylistDialog = ({ id, seed = [], onClose }: Props) => {
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const library = useLibrary();
  const existing = id ? library.playlists.find((item) => item.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [pinned, setPinned] = useState(existing?.pinned === true);
  const [ids, setIds] = useState<string[]>(() => [...(existing?.trackIds ?? seed)]);
  const [mode, setMode] = useState<"tracks" | "add">("tracks");
  const [query, setQuery] = useState("");
  const nameField = useRef<HTMLInputElement>(null);

  const tracks = useMemo(() => ids.map((value) => TRACK_BY_ID.get(value)).filter((track): track is Track => track !== undefined), [ids]);
  const found = useMemo(() => (query.trim() ? search(query, []).tracks.slice(0, 30) : [...TRACKS].sort((a, b) => b.plays - a.plays).slice(0, 12)), [query]);

  const swap = (from: number, to: number) => {
    if (to < 0 || to >= ids.length) return;
    setIds((now) => {
      const next = [...now];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
  };

  const save = () => {
    if (existing) {
      library.updatePlaylist(existing.id, { name, description, trackIds: ids, pinned });
      toast("저장했습니다");
    } else {
      const created = library.createPlaylist({ name, description, trackIds: ids, pinned });
      const made = name.trim() || "새 플레이리스트";
      toast(`'${made}'${josa(made, "을/를")} 만들었습니다`);
      navigate(`/music/playlist/${created}`);
    }
    onClose();
  };

  const remove = () => {
    if (!existing) return;
    const gone = library.deletePlaylist(existing.id);
    onClose();
    if (pathname.includes(existing.id)) navigate("/music/playlists");
    if (gone) toast(`'${gone.name}'${josa(gone.name, "을/를")} 삭제했습니다`, { action: { label: "되돌리기", onSelect: () => library.restorePlaylist(gone) } });
  };

  const title = existing ? "플레이리스트 편집" : "새 플레이리스트";

  return (
    <Floating open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Floating.Content as={Surface} fill="raised" radius="lg" padding="xl" presentation="modal" aria-label={title} width="measure.xl" maxHeight="viewport" overflowY="auto" initialFocusRef={nameField}>
        <Stack gap="xl">
          <Inline justify="between" align="center" gap="md">
            <Text as="h2" variant="heading">{title}</Text>
            <IconButton as={Floating.Close} variant="ghost" aria-label="닫기"><Glyph name="x" /></IconButton>
          </Inline>
          <Grid columns={{ base: "minmax(0, 1fr)", md: "13rem minmax(0, 1fr)" }} gap="xl" align="start">
            <Stack gap="md">
              <Box maxWidth="md"><Art seed={`${name || "새 플레이리스트"}·${id ?? "new"}`} kind="cover" radius="md" /></Box>
              <FormField label="이름"><Field ref={nameField} value={name} onChange={(event) => setName(event.target.value)} placeholder="새 플레이리스트" /></FormField>
              <FormField label="설명"><Textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="어떤 노래를 모은 건가요?" /></FormField>
              <Inline as="label" gap="sm" justify="between">
                <Text as="span">사이드바에 고정</Text>
                <Switch checked={pinned} onChange={(event) => setPinned(event.target.checked)} />
              </Inline>
            </Stack>
            <Stack gap="md" minWidth={0}>
              <Inline justify="between" align="center" gap="md" wrap>
                <Segmented
                  label="보기"
                  value={mode}
                  onChange={(next) => setMode(next === "add" ? "add" : "tracks")}
                  options={[{ id: "tracks", label: "담은 곡", count: tracks.length }, { id: "add", label: "곡 추가", glyph: "plus" }]}
                />
                {mode === "tracks" ? <Text as="span" variant="label" strong={false} ink="tertiary">{formatTrackCount(tracks.length)} · {spoken(totalDuration(tracks))}</Text> : null}
              </Inline>
              {mode === "tracks" ? (
                <Box maxHeight="xl" overflowY="auto">
                  {tracks.length === 0 ? (
                    <Empty glyph="list-music" title="담은 곡이 없습니다" description="곡 추가에서 찾아 담아 보세요." action={<Button size="sm" variant="hairline" onClick={() => setMode("add")}>곡 추가</Button>} />
                  ) : (
                    <Stack as="ul" aria-label="담은 곡">
                      {tracks.map((track, index) => (
                        <Stack as="li" key={`${track.id}-${index}`}>
                          {index > 0 ? <Divider aria-hidden /> : null}
                          <Reorder list="editor" index={index} label={track.title} onMove={swap}>
                            <Box paddingY="sm">
                              <MiniTrack
                                track={track}
                                trailing={
                                  <Inline gap="xs">
                                    <IconButton size="xs" variant="ghost" aria-label={`${track.title} 위로`} disabled={index === 0} onClick={() => swap(index, index - 1)}><Glyph name="chevron-up" /></IconButton>
                                    <IconButton size="xs" variant="ghost" aria-label={`${track.title} 아래로`} disabled={index === tracks.length - 1} onClick={() => swap(index, index + 1)}><Glyph name="chevron-down" /></IconButton>
                                    <IconButton size="xs" variant="ghost" aria-label={`${track.title} 빼기`} onClick={() => setIds((now) => now.filter((_, i) => i !== index))}><Glyph name="x" /></IconButton>
                                  </Inline>
                                }
                              />
                            </Box>
                          </Reorder>
                        </Stack>
                      ))}
                    </Stack>
                  )}
                </Box>
              ) : (
                <Stack gap="md">
                  <Field size="sm" shape="pill" fill="sunken" aria-label="곡 찾기" placeholder="제목이나 아티스트로 찾기" value={query} onChange={(event) => setQuery(event.target.value)} leading={<Glyph name="search" />} clearable />
                  <Box maxHeight="xl" overflowY="auto">
                    {found.length === 0 ? (
                      <Empty glyph="search-x" title="찾는 곡이 없습니다" description="다른 이름으로 찾아 보세요." />
                    ) : (
                      <Stack as="ul" aria-label="찾은 곡">
                        {found.map((track, index) => {
                          const taken = ids.includes(track.id);
                          return (
                            <Stack as="li" key={track.id}>
                              {index > 0 ? <Divider aria-hidden /> : null}
                              <Box paddingY="sm">
                                <MiniTrack
                                  track={track}
                                  trailing={
                                    <Button size="xs" shape="pill" variant={taken ? "ghost" : "soft"} disabled={taken} onClick={() => setIds((now) => [...now, track.id])}>
                                      <Glyph name={taken ? "check" : "plus"} />{taken ? "담음" : "추가"}
                                    </Button>
                                  }
                                />
                              </Box>
                            </Stack>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              )}
            </Stack>
          </Grid>
          <Divider />
          <Inline justify="between" gap="md" wrap>
            {existing ? <Button variant="ghost" accent="error" onClick={remove}><Glyph name="trash-2" />삭제</Button> : <Box />}
            <Inline gap="sm">
              <Button variant="ghost" onClick={onClose}>취소</Button>
              <Button onClick={save}>저장</Button>
            </Inline>
          </Inline>
        </Stack>
      </Floating.Content>
    </Floating>
  );
};
