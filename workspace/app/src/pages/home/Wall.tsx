// The wall under the landing page's hero: real Paper cards, each a small piece of a product, in columns that drift against each
// other as the page scrolls. Every control works; the wall shows the system's range at a glance, as a product would use it.

import type { ReactNode } from "react";

import { Badge, Button, Checkbox, Divider, Field, Inline, Paint, SegmentControl, Select, Slider, Stack, Surface, Switch, Text, reveal } from "@studio-baeks/paper-ui";
import type { Status } from "@studio-baeks/paper-ui/tokens";

import { BoxIcon, DeployIcon, SearchIcon } from "../../compositions/icons";
import { joinClass } from "../../joinClass";
import * as w from "../../site/home-wall.css";

const Card = ({ title, note, children }: { title: string; note?: string; children: ReactNode }) => (
  <Surface fill="raised" radius="lg" padding="lg" shadow className={reveal.scroll}>
    <Stack gap="xs" className={w.cardHead}>
      <Text variant="subheading" as="p">{title}</Text>
      {note ? <Text variant="caption" ink="secondary" as="p">{note}</Text> : null}
    </Stack>
    {children}
  </Surface>
);

const Setting = ({ label, checked }: { label: string; checked?: boolean }) => (
  <label className={w.settingRow}>
    <Text variant="body" as="span">{label}</Text>
    <Switch defaultChecked={checked} />
  </label>
);

const Notifications = () => (
  <Card title="Notifications" note="Only the news you want.">
    <Stack gap="md">
      <Setting label="When I'm mentioned" checked />
      <Setting label="When an issue opens" checked />
      <Setting label="Weekly digest" />
      <Divider />
      <Stack gap="xs">
        <Text variant="label" as="p" ink="secondary">Digest</Text>
        <SegmentControl aria-label="Digest" variant="outline" shape="rounded" size="sm" defaultValue="week" fullWidth>
          <SegmentControl.Item value="day">Daily</SegmentControl.Item>
          <SegmentControl.Item value="week">Weekly</SegmentControl.Item>
          <SegmentControl.Item value="month">Monthly</SegmentControl.Item>
        </SegmentControl>
      </Stack>
    </Stack>
  </Card>
);

const Invite = () => (
  <Card title="Invite a member" note="They get a link by email.">
    <Stack gap="sm">
      <Field aria-label="Email to invite" placeholder="name@example.com" />
      <Select aria-label="Role" defaultValue="editor">
        <Select.Option value="viewer">Viewer</Select.Option>
        <Select.Option value="editor">Editor</Select.Option>
        <Select.Option value="admin">Admin</Select.Option>
      </Select>
      <Button fullWidth>Send invite</Button>
    </Stack>
  </Card>
);

// The week's closed issues, Monday to Sunday; today is the last bar.
const WEEK = ["2.25rem", "3rem", "1.75rem", "3.5rem", "2.75rem", "4rem", "3.25rem"];
const Throughput = () => (
  <Card title="This week" note="Issues closed">
    <Stack gap="md">
      <Inline gap="sm" align="center">
        <Text variant="headline" as="span" numeric>128</Text>
        <Badge accent="success">+12%</Badge>
      </Inline>
      <div className={w.bars} aria-hidden="true">
        {WEEK.map((height, index) => index === WEEK.length - 1
          ? <Paint key={height} accent="primary" variant="solid" className={w.bar} style={{ height }} />
          : <Surface key={height} fill="sunken" className={w.bar} style={{ height }} />)}
      </div>
    </Stack>
  </Card>
);

const Plan = () => (
  <Card title="Team plan" note="Change it whenever the team grows.">
    <Stack gap="md">
      <SegmentControl aria-label="Billing" size="sm" defaultValue="year" fullWidth>
        <SegmentControl.Item value="month">Monthly</SegmentControl.Item>
        <SegmentControl.Item value="year">Yearly</SegmentControl.Item>
      </SegmentControl>
      <Inline gap="xs" align="baseline">
        <Text variant="display" as="span" numeric>$8</Text>
        <Text variant="caption" ink="secondary" as="span">/ seat · month</Text>
      </Inline>
      <Stack gap="sm">
        {["Unlimited projects", "Role-based access", "Audit log"].map((feature) => (
          <Inline key={feature} as="label" gap="sm" align="center">
            <Checkbox defaultChecked />
            <Text variant="body" as="span">{feature}</Text>
          </Inline>
        ))}
      </Stack>
      <Button variant="hairline" fullWidth>Change plan</Button>
    </Stack>
  </Card>
);

const RESULTS: { icon: ReactNode; words: string; status: Status; label: string }[] = [
  { icon: <BoxIcon size="body" ink="secondary" />, words: "STU-142 Emit the token tree", status: "info", label: "In progress" },
  { icon: <DeployIcon size="body" ink="secondary" />, words: "Deploy 318 — production", status: "success", label: "Done" },
  { icon: <BoxIcon size="body" ink="secondary" />, words: "STU-139 Select focus ring", status: "error", label: "Blocked" },
];
const Search = () => (
  <Card title="Search">
    <Stack gap="sm">
      <Field aria-label="Search issues and deploys" placeholder="Issues, deploys, people" leading={<SearchIcon />} />
      <Stack gap="xs">
        {RESULTS.map((result) => (
          <div key={result.words} className={w.result}>
            {result.icon}
            <Text variant="body" as="span" className={w.resultWords}>{result.words}</Text>
            <Badge accent={result.status}>{result.label}</Badge>
          </div>
        ))}
      </Stack>
    </Stack>
  </Card>
);

const Tasks = () => (
  <Card title="Before release" note="Two of three done.">
    <Stack gap="md">
      <Stack gap="sm">
        {([["Accessibility audit", true], ["Dark theme pass", true], ["Release notes", false]] as const).map(([task, done]) => (
          <Inline key={task} as="label" gap="sm" align="center">
            <Checkbox defaultChecked={done} />
            <Text variant="body" as="span" ink={done ? "secondary" : "primary"}>{task}</Text>
          </Inline>
        ))}
      </Stack>
      <Stack gap="xs">
        <Inline justify="between" align="center">
          <Text variant="label" as="span" ink="secondary">Progress</Text>
          <Text variant="label" as="span" numeric>66%</Text>
        </Inline>
        <Slider aria-label="Progress" defaultValue={66} />
      </Stack>
    </Stack>
  </Card>
);

// The faces a screen stands on, the three of them, from the front back.
const Faces = () => (
  <Card title="Surface depth" note="Front to back: raised · canvas · sunken">
    <div className={w.swatches}>
      {(["raised", "canvas", "sunken"] as const).map((fill) => (
        <Stack key={fill} gap="xs">
          <Surface fill={fill} border radius="md" className={w.swatch} />
          <Text variant="caption" family="mono" ink="secondary" as="span">{fill}</Text>
        </Stack>
      ))}
    </div>
  </Card>
);

const Type = () => (
  <Card title="Type roles">
    <Stack gap="xs">
      <Text variant="display" as="p">Quiet ground</Text>
      <Text variant="heading" as="p">Type picked by role</Text>
      <Text variant="body" as="p" ink="secondary">Size comes from a role, not a number. Color comes from the ink's name.</Text>
      <Text variant="caption" family="mono" ink="tertiary" as="p">display · heading · body · caption</Text>
    </Stack>
  </Card>
);

const SignIn = () => (
  <Card title="Sign in" note="Continue with your Studio account.">
    <Stack gap="sm">
      <Field aria-label="Sign-in email" placeholder="Email" type="email" />
      <Field aria-label="Password" placeholder="Password" type="password" showPasswordToggle />
      <Inline as="label" gap="sm" align="center">
        <Checkbox />
        <Text variant="body" as="span">Keep me signed in</Text>
      </Inline>
      <Button fullWidth>Continue</Button>
    </Stack>
  </Card>
);

// The columns, left to right; the second and the fourth drift against the others.
const COLUMNS: ReactNode[][] = [
  [<Notifications key="notifications" />, <Invite key="invite" />],
  [<Throughput key="throughput" />, <Plan key="plan" />],
  [<Search key="search" />, <Tasks key="tasks" />],
  [<Faces key="faces" />, <Type key="type" />, <SignIn key="sign-in" />],
];

export const Wall = () => (
  <section className={w.wallSection} aria-label="Pieces of screens built with Paper components" lang="en">
    <div className={w.wall} data-testid="home-wall">
      {COLUMNS.map((cards, index) => (
        <div key={index} className={joinClass(w.column, index % 2 === 1 && w.columnAgainst)}>{cards}</div>
      ))}
    </div>
  </section>
);
