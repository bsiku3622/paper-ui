// 사이드바: 검색 · 지금 듣기 · 둘러보기 · 라디오, 보관함, 고정 항목, 플레이리스트. 작은 표지가 붙은 줄은 kit의 NavItem `art`입니다.

import { IconButton } from "@studio-baeks/paper-ui";

import { Glyph, Person, Sidebar, SidebarCard, type NavItem, type NavSection } from "../../../kit";
import { SmallArt } from "../parts/pictures";
import { useDialogs } from "../state/dialogs";
import { useLibrary } from "../state/library";

export const Side = () => {
  const library = useLibrary();
  const dialogs = useDialogs();

  // 고정한 것을 먼저, 그다음 최근에 바꾼 것. 목록이 길어지면 사이드바가 스크롤되므로 몇 개만 보입니다.
  const shown = [...library.playlists.filter((playlist) => playlist.pinned), ...library.playlists.filter((playlist) => !playlist.pinned)].slice(0, 5);
  const listed: NavItem[] = shown.map((playlist) => ({ id: playlist.id, label: playlist.name, to: `/music/playlist/${playlist.id}`, art: <SmallArt seed={playlist.seed} name={playlist.name} /> }));

  const sections: NavSection[] = [
    {
      items: [
        { id: "search", label: "검색", glyph: "search", to: "/music/search" },
        { id: "home", label: "지금 듣기", glyph: "circle-play", to: "/music", end: true },
        { id: "browse", label: "둘러보기", glyph: "layout-grid", to: "/music/browse" },
        { id: "radio", label: "라디오", glyph: "radio", to: "/music/radio" },
      ],
    },
    {
      label: "보관함",
      items: [
        { id: "recent", label: "최근 추가", glyph: "clock", to: "/music/library/recent" },
        { id: "artists", label: "아티스트", glyph: "mic-vocal", to: "/music/library/artists" },
        { id: "albums", label: "앨범", glyph: "disc-3", to: "/music/library/albums" },
        { id: "songs", label: "노래", glyph: "music", to: "/music/library/songs" },
      ],
    },
    {
      label: "플레이리스트",
      action: <IconButton size="xs" variant="ghost" aria-label="새 플레이리스트" onClick={() => dialogs.editPlaylist()}><Glyph name="plus" /></IconButton>,
      items: [
        { id: "all", label: "모든 플레이리스트", glyph: "list-music", to: "/music/playlists", end: true },
        { id: "liked", label: "즐겨찾는 노래", glyph: "star", to: "/music/playlist/liked" },
        ...listed,
      ],
    },
  ];

  return (
    <Sidebar
      label="음악 메뉴"
      sections={sections}
      footerItems={[{ id: "settings", label: "설정", glyph: "settings", to: "/music/settings" }]}
      footer={<SidebarCard><Person name="한지우" sub="개인 요금제" /></SidebarCard>}
    />
  );
};
