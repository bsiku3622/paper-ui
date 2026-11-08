// The apps the studio can show, in its top bar: Arcfield, drawn with Paper alone, and the owner's own apps where they run. One entry
// is one app — its pages are reached inside the preview, the way a visitor reaches them. Each entry is a link to the app itself: a
// plain click shows it in the preview (and, on the app already shown, opens it afresh), and a modified click (a new tab, a new
// window) opens it on its own. Below lg the same list is a select in the toolbar.

import { Fragment, type MouseEvent } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Button, Divider, Inline, Select } from "@studio-baeks/paper-ui";

import { GROUPS, appById, originOf, visibleApps, type StudioApp } from "./apps";
import { open, useStore } from "./store";
import * as s from "./studio.css";

// A click that means "show it here". One with a key held or a button other than the first means the browser's own: open the link.
const plain = (event: MouseEvent) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

const Entry = ({ app, current }: { app: StudioApp; current: boolean }) => {
  const show = (event: MouseEvent) => {
    if (!plain(event)) return;
    event.preventDefault();
    open(app);
  };
  const aria = current ? "page" : undefined;
  // The site's own screens are routes of this site; the host's are on another origin, a link to the page itself.
  return app.group === "paper" ? (
    <Button as={RouterLink} to={app.path} size="sm" variant="ghost" selected={current} aria-current={aria} onClick={show}>
      {app.label}
    </Button>
  ) : (
    <Button as="a" href={`${originOf(app)}${app.path}`} size="sm" variant="ghost" selected={current} aria-current={aria} onClick={show}>
      {app.label}
    </Button>
  );
};

const groupsOf = (apps: readonly StudioApp[]) => GROUPS.filter((group) => apps.some((app) => app.group === group.id));

export const AppBar = () => {
  const item = useStore((store) => store.view.item);
  const apps = visibleApps();
  return (
    <Inline as="nav" aria-label="앱" gap="xs" align="center" wrap hideBelow="lg" className={s.appBar}>
      {groupsOf(apps).map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 ? <Divider orientation="vertical" /> : null}
          {apps.filter((app) => app.group === group.id).map((app) => <Entry key={app.id} app={app} current={item === app.id} />)}
        </Fragment>
      ))}
    </Inline>
  );
};

// The list for a window too narrow for the bar.
export const AppSelect = () => {
  const item = useStore((store) => store.view.item);
  const apps = visibleApps();
  return (
    <Select size="sm" aria-label="앱" value={item} onChange={(event) => { const next = appById(event.currentTarget.value); if (next) open(next); }}>
      {groupsOf(apps).map((group) => (
        <Select.Group key={group.id} label={group.label}>
          {apps.filter((app) => app.group === group.id).map((app) => <Select.Option key={app.id} value={app.id}>{app.label}</Select.Option>)}
        </Select.Group>
      ))}
    </Select>
  );
};
