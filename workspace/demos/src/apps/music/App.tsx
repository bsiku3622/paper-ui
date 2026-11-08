// 음악: 데스크톱 음악 앱. 사이드바(보관함과 플레이리스트), 가운데 페이지, 오른쪽의 가사 창,
// 아래에 떠 있는 미니 플레이어. 카탈로그는 지어낸 것이고, 재생은 타이머로 흉내 냅니다.

import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { Box } from "@studio-baeks/paper-ui";

import { AppShell } from "../../kit";
import { ASIDE_WIDTH, SIDEBAR_WIDTH } from "./content/frame";
import { AlbumPage } from "./pages/Album";
import { ArtistPage } from "./pages/Artist";
import { BrowsePage } from "./pages/Browse";
import { GenrePage } from "./pages/Genre";
import { HomePage } from "./pages/Home";
import { LibraryAlbumsPage, LibraryArtistsPage, LibrarySongsPage, RecentPage } from "./pages/Library";
import { NowPlayingPage } from "./pages/NowPlaying";
import { PlaylistPage } from "./pages/Playlist";
import { PlaylistsPage } from "./pages/Playlists";
import { QueuePage } from "./pages/Queue";
import { RadioPage } from "./pages/Radio";
import { SearchPage } from "./pages/Search";
import { SettingsPage } from "./pages/Settings";
import { MiniPlayer } from "./shell/MiniPlayer";
import { Pane } from "./shell/Pane";
import { Side } from "./shell/Side";
import { DialogProvider } from "./state/dialogs";
import { LibraryProvider } from "./state/library";
import { PlayerProvider, usePlayer } from "./state/player";
import { SettingsProvider, useSettings } from "./state/settings";

const Frame = () => {
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const { toggle } = usePlayer();
  // 재생 화면은 가사와 대기열을 스스로 갖고 있어서 오른쪽 창과 미니 플레이어를 비웁니다.
  const immersive = pathname.startsWith("/music/now-playing");
  const aside = !immersive && settings.pane !== "none";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // 스페이스바로 재생과 일시정지. 단추나 입력칸에 초점이 있을 때는 그 요소가 스페이스를 씁니다.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space" || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && target !== document.body && target.closest("input, textarea, select, button, a, summary, [role], [contenteditable]")) return;
      event.preventDefault();
      toggle();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  // key: 좁은 화면에서 메뉴의 링크를 누르면 kit의 메뉴 시트가 닫혀야 하는데, Paper의 눌림이 click을 시트까지 올려 보내지
  // 않아서 열린 채 남습니다. 페이지가 바뀔 때 셸을 새로 세워서 닫습니다(검색어처럼 주소의 ?뒤가 바뀔 때는 그대로입니다).
  return (
    <AppShell
      key={pathname}
      kind="page"
      name="음악"
      sidebar={<Side />}
      aside={aside ? <Pane /> : undefined}
      bottom={immersive ? undefined : <MiniPlayer aside={aside} />}
      sidebarWidth={SIDEBAR_WIDTH}
      asideWidth={ASIDE_WIDTH}
    >
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="genre/:id" element={<GenrePage />} />
        <Route path="radio" element={<RadioPage />} />
        <Route path="library">
          <Route index element={<Navigate to="/music/library/recent" replace />} />
          <Route path="recent" element={<RecentPage />} />
          <Route path="artists" element={<LibraryArtistsPage />} />
          <Route path="albums" element={<LibraryAlbumsPage />} />
          <Route path="songs" element={<LibrarySongsPage />} />
        </Route>
        <Route path="playlists" element={<PlaylistsPage />} />
        <Route path="playlist/:id" element={<PlaylistPage />} />
        <Route path="album/:id" element={<AlbumPage />} />
        <Route path="artist/:id" element={<ArtistPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="now-playing" element={<NowPlayingPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/music" replace />} />
      </Routes>
      <Box height="xs" aria-hidden />
    </AppShell>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <LibraryProvider>
        <PlayerProvider>
          <DialogProvider>
            <Frame />
          </DialogProvider>
        </PlayerProvider>
      </LibraryProvider>
    </SettingsProvider>
  );
}
