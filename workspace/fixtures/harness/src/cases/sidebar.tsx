import { Icon, IconButton, Sidebar } from "@studio-baeks/paper-ui";
import { useState } from "react";

const glyph = <Icon><path d="M4 11 12 4l8 7v9H4z" /></Icon>;

export const SidebarCase = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", boxSizing: "border-box", height: "3.5rem", padding: "0 16px", background: "Canvas", borderBottom: "1px solid #ccc" }}>
        <IconButton data-testid="sidebar-menu" aria-label="Menu" aria-expanded={open} aria-controls="sidebar-nav" onClick={() => setOpen(!open)}>
          <Icon><path d="M4 6h16M4 12h16M4 18h16" /></Icon>
        </IconButton>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)" }}>
        <Sidebar id="sidebar-nav" data-testid="sidebar" label="Main" offset="3.5rem" open={open} onOpenChange={setOpen}>
          <Sidebar.Group title="Printer">
            <Sidebar.Item data-testid="sidebar-first" icon={glyph} current>Dashboard</Sidebar.Item>
            <Sidebar.Item icon={glyph}>Files</Sidebar.Item>
          </Sidebar.Group>
          <Sidebar.Divider />
          <Sidebar.Footer>
            <Sidebar.Item data-testid="sidebar-last" icon={glyph}>Upload</Sidebar.Item>
          </Sidebar.Footer>
        </Sidebar>
        <main style={{ height: "300vh", padding: 16 }}>Page</main>
      </div>
    </>
  );
};
