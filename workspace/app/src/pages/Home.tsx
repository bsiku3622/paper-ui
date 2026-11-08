// Paper UI landing page — one scroll in five scenes. The hero comes in line by line and opens a slot for a live switch; a wall of
// real components drifts by; a statement lights up line by line as it is read; under a spotlight the Arcfield demo itself rises
// into view; then the principles and the way in. The motion is the reveal role and view timelines, and where less motion is
// asked or a browser has no view timelines, every scene stands in its place from the start. Product compositions stay local.

import { Fragment, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { Badge, Box, Button, Inline, Link, Stack, Surface, Switch, Text, reveal, revealAfter, useTheme } from "@studio-baeks/paper-ui";

import { Dot } from "../compositions/Dot";
import { ArrowRightIcon, GridIcon, LayersIcon, ShieldIcon, StarIcon } from "../compositions/icons";
import { joinClass } from "../joinClass";
import { Logo } from "../site/Logo";
import * as s from "../site/home.css";
import { frame } from "../site/shell.css";
import { Wall } from "./home/Wall";

// A sheet of paper in the second line of the headline, with a live switch on it: the page's theme. It opens last, after the
// lines are in, and its words part to let it in.
const ThemeSlot = () => {
  const { resolved, setTheme } = useTheme();
  return (
    <Surface as="span" fill="raised" shadow radius="md" className={joinClass(s.heroSlot, revealAfter[5])}>
      <Switch size="lg" aria-label="Dark theme" checked={resolved === "dark"} onChange={(event) => setTheme(event.currentTarget.checked ? "dark" : "light")} />
    </Surface>
  );
};

const Hero = () => (
  <Box className={s.heroBand} lang="en">
    <Box className={s.hero}>
      <Inline gap="sm" align="center" justify="center" className={joinClass(s.heroMeta, reveal.load, revealAfter[0])}>
        <Badge>Studio Baeks</Badge>
        <Text variant="caption" ink="secondary">{`Design System · v${__PAPER_UI_VERSION__}`}</Text>
      </Inline>

      {/* The heading is named by its words alone; the switch in its second line is a control of its own. */}
      <Text variant="hero" aria-label="Complex web apps on quiet ground.">
        <span className={joinClass(s.heroLine, reveal.load, revealAfter[1])}>Complex web apps</span>
        <span className={joinClass(s.heroLine, s.heroQuiet, reveal.load, revealAfter[2])}>on quiet <ThemeSlot /> ground.</span>
      </Text>

      <Text variant="body" as="p" ink="secondary" className={joinClass(s.sub, reveal.load, revealAfter[3])}>
        Layout starts with Primitives, interaction with Atoms. Color shows up only where it means something — softly, on white.
      </Text>

      {/* Both actions navigate, so Button renders the router link directly. */}
      <Inline gap="sm" justify="center" className={joinClass(s.heroActions, reveal.load, revealAfter[4])}>
        <Button as={RouterLink} to="/docs" size="lg" shape="pill">
          Read the docs
        </Button>
        <Button as={RouterLink} to="/playground" size="lg" variant="hairline" shape="pill">
          Explore the Playground
        </Button>
      </Inline>
    </Box>
  </Box>
);

// Read line by line: each word lights up from the quiet ink as it comes up the screen to its middle.
const STATEMENT = "Paper builds its frame from white and black. Color goes on small, and only where it means something. Every value is written once, in one place. So the screen stays quiet, and the structure holds.";
const Statement = () => (
  <Box className={joinClass(frame, s.statement)} lang="en">
    <Text variant="headline" as="p" strong className={s.statementText} data-testid="home-statement">
      {STATEMENT.split(" ").map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {index > 0 ? " " : null}
          <span className={s.statementWord}>{word}</span>
        </Fragment>
      ))}
    </Text>
  </Box>
);

// Two lines of a scene's title, the second a step back.
const TwoTone = ({ first, second }: { first: string; second: string }) => (
  <>
    <span className={s.heroLine}>{first}</span>
    <span className={joinClass(s.heroLine, s.heroQuiet)}>{second}</span>
  </>
);

// The Arcfield demo itself, in a window: the real screen, its sidebar and all, built of nothing but Paper. Here it is a picture
// (inert), so the page's scroll never catches in it and its keys stay its own; the link under it opens it to use. It comes up in the
// page's theme, and opens again when the theme changes, because a frame reads the theme when it loads.
const DEMO = `${import.meta.env.BASE_URL}demo/arcfield`;
const DemoWindow = () => {
  const { resolved } = useTheme();
  return (
    <Surface fill="raised" border radius="lg" shadow className={s.demoWindow}>
      <iframe key={resolved} className={s.demoFrame} src={DEMO} title="The Arcfield demo, on its overview" loading="lazy" inert />
    </Surface>
  );
};

// The real screen under a spotlight, in the page's own theme: it rises into view as the other scenes do.
const Stage = () => (
  <Box as="section" className={s.stageSection} aria-labelledby="home-stage-title" lang="en">
    <Box className={s.stage}>
      <Box className={s.sceneHeadCentered}>
        <Inline gap="xs" align="center" justify="center" className={joinClass(s.eyebrow, reveal.scroll)}>
          <Dot ink="primary" size="xs" data-testid="home-live-dot" />
          <Text variant="label" ink="secondary" as="span">The real thing</Text>
        </Inline>
        <Text variant="headline" as="h2" id="home-stage-title" className={reveal.scroll}>
          <TwoTone first="Not a gallery." second="Proven on a real screen." />
        </Text>
        <Text variant="body" ink="secondary" as="p" className={joinClass(s.sub, reveal.scroll)}>
          Arcfield is a cloud console built from Paper parts alone. Sidebar, tables, search and charts — no stylesheet, no className, no inline style.
        </Text>
      </Box>
      <Box as="figure" className={joinClass(s.stageFigure, reveal.scroll)}>
        <DemoWindow />
        <Inline as="figcaption" gap="sm" align="center" justify="center" wrap paddingY="xl">
          <Text variant="caption" ink="secondary">That is the live demo, framed as it is.</Text>
          <Link as={RouterLink} to="/demo/arcfield" underline="hover">
            <Text variant="caption" as="span" ink="inherit" className={s.demoLink}>Open the demo<ArrowRightIcon size="label" className={s.demoArrow} /></Text>
          </Link>
        </Inline>
      </Box>
    </Box>
  </Box>
);

const PRINCIPLES = [
  { icon: <LayersIcon />, title: "One source", text: "Every color, size and duration is written once, at the source. Components and apps pick roles." },
  { icon: <GridIcon />, title: "Orthogonal axes", text: "Meaning (accent), weight (variant), density (size) and type (fontSize) are each chosen on their own." },
  { icon: <StarIcon />, title: "Black does the work", text: "Primary actions are black, not blue. There is no primaryColor in this system." },
  { icon: <ShieldIcon />, title: "The build keeps the rules", text: "ESLint and CI check the eight rules and accessibility on every change — not a page of guidelines." },
];

const Principles = () => (
  <Box as="section" className={s.principlesSection} aria-labelledby="home-principles-title" lang="en">
    <div className={s.sceneHead} data-testid="home-principles-head">
      <div>
        <Inline gap="sm" align="center" className={s.eyebrow}>
          <LayersIcon size="body" ink="secondary" />
          <Text variant="label" ink="secondary" as="span">Principles</Text>
        </Inline>
        <Text variant="headline" as="h2" id="home-principles-title" className={reveal.scroll}>
          <TwoTone first="Values in one place." second="Screens by role." />
        </Text>
      </div>
      <Text variant="lead" ink="secondary" as="p" className={reveal.scroll}>
        Foundations set the values, Primitives build the ground from them, and every Atom does one job on top. The docs and the Playground follow the same order.
      </Text>
    </div>
    <div className={s.principles}>
      {PRINCIPLES.map((principle) => (
        <Stack key={principle.title} gap="sm" className={reveal.scroll}>
          <Surface fill="sunken" className={s.principleMark}>{principle.icon}</Surface>
          <Text variant="subheading" as="h3">{principle.title}</Text>
          <Text variant="body" ink="secondary" as="p">{principle.text}</Text>
        </Stack>
      ))}
    </div>
  </Box>
);

const INSTALL = "pnpm add @studio-baeks/paper-ui";
const Closing = () => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(INSTALL).then(() => setCopied(true), () => {});
  };
  return (
    <Box as="section" className={s.closing} aria-labelledby="home-closing-title" lang="en">
      <Text variant="headline" as="h2" id="home-closing-title" className={reveal.scroll}>
        <TwoTone first="One line to install." second="The rest is picking roles." />
      </Text>
      <Surface fill="sunken" radius="full" className={joinClass(s.install, reveal.scroll)}>
        <Text variant="body" family="mono" as="code">{INSTALL}</Text>
        <Button size="sm" variant="soft" shape="pill" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
      </Surface>
      <Inline gap="sm" justify="center">
        <Button as={RouterLink} to="/docs/get-started/install" size="lg" shape="pill">Install guide</Button>
        <Button as={RouterLink} to="/docs/foundations" size="lg" variant="hairline" shape="pill">Browse Foundations</Button>
      </Inline>
    </Box>
  );
};

const Footer = () => (
  <Box as="footer" className={s.footer} lang="en">
    <Inline justify="between" align="center" wrap gap="md">
      <Logo height={18} className={s.footerLogo} />
      <Inline gap="md" wrap align="center">
        <Link as={RouterLink} to="/docs/get-started/philosophy" underline="hover" className={s.footerLink}><Text variant="caption" as="span" ink="inherit">Principles</Text></Link>
        <Link as={RouterLink} to="/docs/foundations" underline="hover" className={s.footerLink}><Text variant="caption" as="span" ink="inherit">Foundations</Text></Link>
        <Link as={RouterLink} to="/docs" underline="hover" className={s.footerLink}><Text variant="caption" as="span" ink="inherit">Docs</Text></Link>
        <Text variant="caption" ink="tertiary" as="span">© Studio Baeks</Text>
      </Inline>
    </Inline>
  </Box>
);

export const Home = () => (
  <>
    <Box data-testid="home-column" className={`${frame} ${s.column}`}>
      <Hero />
    </Box>
    <Wall />
    <Statement />
    <Stage />
    <Box className={`${frame} ${s.column}`}>
      <Principles />
      <Closing />
      <Footer />
    </Box>
  </>
);
