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
  const immersive = pathname.startsWith("/music/now-playing");
  const aside = !immersive && settings.pane !== "none";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
