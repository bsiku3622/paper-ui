import { useState } from "react";

import { Badge, IconButton, Sidebar, Stack, Text, type SidebarFooterProps, type SidebarItemProps, type SidebarProps } from "@studio-baeks/paper-ui";

import { glyph } from "../demo";
import { named } from "../jsx";
import { boolControl, defineSpec, enumControl, flag, local, pick } from "../schema";
import { pick as inLocale, useSiteLocale } from "../../../site/locale";
import { sidebarBar, sidebarFit, sidebarMenu, sidebarPage, sidebarShell } from "./examples.css";

const WORDS = {
  ko: { label: "주 메뉴", menu: "메뉴 열기", close: "메뉴 닫기", printer: "프린터", dashboard: "대시보드", files: "파일", history: "기록", settings: "설정", upload: "업로드", title: "페이지 내용", note: "collapseBelow를 always로 두면 이 틀 안에서 메뉴 버튼으로 서랍을 열고 닫아 볼 수 있습니다. breakpoint로 두면 창을 그 폭 아래로 줄였을 때 서랍이 되고, 메뉴 버튼도 그때만 보입니다." },
  en: { label: "Main", menu: "Open menu", close: "Close menu", printer: "Printer", dashboard: "Dashboard", files: "Files", history: "History", settings: "Settings", upload: "Upload", title: "Page content", note: "Set collapseBelow to always to open and close the drawer inside this frame with the menu button. With a breakpoint it becomes a drawer once the window is narrower than that width, and the menu button shows only then." },
};

export default defineSpec({
  name: "Sidebar",
  blurb: { ko: "내비게이션 사이드바입니다. breakpoint 위에서는 화면 가장자리에 붙어 따라오는 레일이고, 그 아래에서는 스크림과 함께 미끄러져 나오는 서랍이 됩니다. 서랍은 닫혀 있으면 inert이고, 열리면 포커스를 가두며 Escape와 항목을 누르는 것으로 닫히고 페이지 스크롤을 잠급니다. 메뉴 버튼은 앱의 것이라 aria-expanded와 aria-controls로 직접 잇습니다. offset은 위의 바 높이이고, 레일의 sticky 위치와 서랍의 위쪽과 스크림의 안쪽 가장자리가 모두 이 한 값을 읽습니다. 터치 화면에서는 항목이 한 단계 큰 높이에 서고 글자는 그대로입니다.", en: "The navigation sidebar. Above its breakpoint it is a rail that sticks beside the page; below it, a drawer slides in over a scrim. A closed drawer is inert; an open one contains focus, closes on Escape and when an item is pressed, and locks the page scroll. The menu button is the app's own, joined by aria-expanded and aria-controls. offset is the height of the bar above, and the rail's sticky position, the drawer's top and the scrim's edge all read that one value. On a touch screen the items stand one step taller and the text stays." },
  controls: [
    enumControl<SidebarProps, "collapseBelow">("collapseBelow", local<SidebarProps, "collapseBelow">()(["never", "always", "xl", "lg", "md", "sm"], "Sidebar's own union: a breakpoint from the Layout scale, never for a rail at every width, or always for a drawer at every width")),
    boolControl<SidebarProps, "offset">("offset", true, { example: { ko: "상단 바 높이", en: "height of the bar" }, type: "string" }),
    boolControl<SidebarItemProps, "current">("current", true, { target: "Sidebar.Item" }),
    boolControl<SidebarFooterProps, "hidden">("hidden", false, { target: "Sidebar.Footer" }),
  ],
  defaults: { collapseBelow: "md" },
  useHarness: () => {
    const [open, setOpen] = useState(false);
    return { open, setOpen };
  },
  subject: (state, { open, setOpen }, locale) => {
    const w = inLocale(WORDS, locale);
    return (
      <Sidebar
        id="sidebar-preview"
        label={w.label}
        collapseBelow={pick<NonNullable<SidebarProps["collapseBelow"]>>(state, "collapseBelow")}
        offset={flag(state, "offset") ? "3.5rem" : undefined}
        open={open}
        onOpenChange={named("setOpen", setOpen)}
        className={sidebarFit}
      >
        <Sidebar.Group title={w.printer}>
          <Sidebar.Item icon={glyph.home} current={flag(state, "current")}>{w.dashboard}</Sidebar.Item>
          <Sidebar.Item icon={glyph.file} badge={<Badge size="xs">3</Badge>}>{w.files}</Sidebar.Item>
          <Sidebar.Item icon={glyph.clock}>{w.history}</Sidebar.Item>
        </Sidebar.Group>
        <Sidebar.Divider />
        <Sidebar.Item icon={glyph.gear}>{w.settings}</Sidebar.Item>
        <Sidebar.Footer hidden={flag(state, "hidden")}>
          <Sidebar.Item icon={glyph.upload}>{w.upload}</Sidebar.Item>
        </Sidebar.Footer>
      </Sidebar>
    );
  },
  Stage: ({ subject, state, harness }) => {
    const { open, setOpen } = harness as { open: boolean; setOpen: (open: boolean) => void };
    const mode = pick<NonNullable<SidebarProps["collapseBelow"]>>(state, "collapseBelow") ?? "md";
    const { locale } = useSiteLocale();
    const w = inLocale(WORDS, locale);
    return (
      <div className={sidebarShell}>
        <div className={sidebarBar}>
          <IconButton variant="ghost" shape="rounded" className={sidebarMenu[mode]} aria-label={open ? w.close : w.menu} aria-expanded={open} aria-controls="sidebar-preview" onClick={() => setOpen(!open)}>{glyph.menu}</IconButton>
          <Text strong>Paper</Text>
        </div>
        {subject}
        <Stack gap="sm" className={sidebarPage}>
          <Text variant="heading" as="h3">{w.title}</Text>
          <Text ink="secondary">{w.note}</Text>
        </Stack>
      </div>
    );
  },
  preview: "flush",
});
