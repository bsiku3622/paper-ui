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
import { useWords } from "../site/locale";
import { Logo } from "../site/Logo";
import * as s from "../site/home.css";
import { frame } from "../site/shell.css";
import { Wall } from "./home/Wall";

// What the page says, in both languages. Each visitor reads their own (site/locale.tsx).
const HOME = {
  ko: {
    darkTheme: "다크 테마",
    heroLabel: "복잡한 웹앱을 위한 조용한 바탕.",
    heroFirst: "복잡한 웹앱을 위한",
    heroBefore: "조용한 ",
    heroAfter: " 바탕.",
    sub: "레이아웃은 Primitive로, 상호작용은 Atom으로 시작합니다. 색은 의미가 있을 때만 쓰고, 순백 위에 부드럽게.",
    docs: "문서 읽기",
    playground: "플레이그라운드 살펴보기",
    statement: "Paper의 버튼은 검정입니다. 파랑은 링크에, 빨강은 오류에 씁니다. 화면에 색이 보이면, 거기에는 이유가 있습니다.",
    demoTitle: "Arcfield 데모의 개요 화면",
    stageEyebrow: "Arcfield",
    stageFirst: "CSS를 한 줄도 쓰지 않고",
    stageSecond: "콘솔 하나를 만들었습니다.",
    stageSub: "Arcfield는 Paper 부품만 조립해 만든 클라우드 콘솔입니다. 사이드바와 표, 검색과 차트까지, 화면 코드 어디에도 className이나 style이 없습니다.",
    stageCaption: "위 화면은 실제로 돌아가는 데모입니다.",
    openDemo: "데모 열기",
    principles: [
      { title: "원본은 한 곳", text: "모든 색 · 크기 · 시간은 원본에 한 번만 적히고, 컴포넌트와 앱은 역할을 고릅니다." },
      { title: "직교하는 축", text: "의미(accent)와 무게(variant), 밀도(size)와 글자(fontSize)를 각각 따로 고릅니다." },
      { title: "검정이 일꾼", text: "1차 행동도 파랑이 아니라 검정입니다. 이 시스템에는 primaryColor가 없습니다." },
      { title: "규칙은 빌드가 지킨다", text: "여덟 규칙과 접근성을 문서가 아니라 eslint와 CI가 매번 검사합니다." },
    ],
    principlesEyebrow: "원칙",
    principlesFirst: "값은 한 곳에,",
    principlesSecond: "화면은 역할로.",
    principlesLead: "Foundations가 값을 정하고, Primitives가 그 값으로 바탕을 만들고, Atoms가 그 위에서 한 가지 일을 합니다. 문서와 Playground가 같은 순서로 나뉩니다.",
    closingFirst: "설치는 한 줄,",
    closingSecond: "나머지는 역할을 고르는 일.",
    copy: "복사",
    copied: "복사됨",
    install: "설치 안내",
    foundations: "Foundations 둘러보기",
    footerPrinciples: "원칙",
    footerDocs: "문서",
    footerAuthor: "만든 사람",
  },
  en: {
    darkTheme: "Dark theme",
    heroLabel: "Complex web apps on quiet ground.",
    heroFirst: "Complex web apps",
    heroBefore: "on quiet ",
    heroAfter: " ground.",
    sub: "Layout starts with Primitives, interaction with Atoms. Color shows up only where it means something — softly, on white.",
    docs: "Read the docs",
    playground: "Explore the Playground",
    statement: "Paper's buttons are black. Blue is for links, red is for errors. When color shows up on a screen, there is a reason.",
    demoTitle: "The Arcfield demo, on its overview",
    stageEyebrow: "Arcfield",
    stageFirst: "A whole console,",
    stageSecond: "without a line of CSS.",
    stageSub: "Arcfield is a cloud console assembled from Paper parts alone. Its sidebar, tables, search and charts carry no className and no style anywhere in the screen code.",
    stageCaption: "The screen above is the live demo.",
    openDemo: "Open the demo",
    principles: [
      { title: "One source", text: "Every color, size and duration is written once, at the source. Components and apps pick roles." },
      { title: "Orthogonal axes", text: "Meaning (accent), weight (variant), density (size) and type (fontSize) are each chosen on their own." },
      { title: "Black does the work", text: "Primary actions are black, not blue. There is no primaryColor in this system." },
      { title: "The build keeps the rules", text: "ESLint and CI check the eight rules and accessibility on every change — not a page of guidelines." },
    ],
    principlesEyebrow: "Principles",
    principlesFirst: "Values in one place.",
    principlesSecond: "Screens by role.",
    principlesLead: "Foundations set the values, Primitives build the ground from them, and every Atom does one job on top. The docs and the Playground follow the same order.",
    closingFirst: "One line to install.",
    closingSecond: "The rest is picking roles.",
    copy: "Copy",
    copied: "Copied",
    install: "Install guide",
    foundations: "Browse Foundations",
    footerPrinciples: "Principles",
    footerDocs: "Docs",
    footerAuthor: "Made by",
  },
} as const;

// A sheet of paper in the second line of the headline, with a live switch on it: the page's theme. It opens last, after the
// lines are in, and its words part to let it in.
const ThemeSlot = () => {
  const { resolved, setTheme } = useTheme();
  return (
    <Surface as="span" fill="raised" shadow radius="md" className={joinClass(s.heroSlot, revealAfter[5])}>
      <Switch size="lg" aria-label={useWords(HOME).darkTheme} checked={resolved === "dark"} onChange={(event) => setTheme(event.currentTarget.checked ? "dark" : "light")} />
    </Surface>
  );
};

const Hero = () => {
  const t = useWords(HOME);
  return (
  <Box className={s.heroBand}>
    <Box className={s.hero}>
      <Inline gap="sm" align="center" justify="center" className={joinClass(s.heroMeta, reveal.load, revealAfter[0])}>
        <Badge>Studio Baeks</Badge>
        <Text variant="caption" ink="secondary">{`Design System · v${__PAPER_UI_VERSION__}`}</Text>
      </Inline>

      {/* The heading is named by its words alone; the switch in its second line is a control of its own. */}
      <Text variant="hero" aria-label={t.heroLabel}>
        <span className={joinClass(s.heroLine, reveal.load, revealAfter[1])}>{t.heroFirst}</span>
        <span className={joinClass(s.heroLine, s.heroQuiet, reveal.load, revealAfter[2])}>{t.heroBefore}<ThemeSlot />{t.heroAfter}</span>
      </Text>

      <Text variant="body" as="p" ink="secondary" className={joinClass(s.sub, reveal.load, revealAfter[3])}>
        {t.sub}
      </Text>

      {/* Both actions navigate, so Button renders the router link directly. */}
      <Inline gap="sm" justify="center" className={joinClass(s.heroActions, reveal.load, revealAfter[4])}>
        <Button as={RouterLink} to="/docs" size="lg" shape="pill">
          {t.docs}
        </Button>
        <Button as={RouterLink} to="/playground" size="lg" variant="hairline" shape="pill">
          {t.playground}
        </Button>
      </Inline>
    </Box>
  </Box>
  );
};

// Read line by line: each word lights up from the quiet ink as it comes up the screen to its middle.
const Statement = () => (
  <Box className={joinClass(frame, s.statement)}>
    <Text variant="headline" as="p" strong className={s.statementText} data-testid="home-statement">
      {useWords(HOME).statement.split(" ").map((word, index) => (
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
      <iframe key={resolved} className={s.demoFrame} src={DEMO} title={useWords(HOME).demoTitle} loading="lazy" inert />
    </Surface>
  );
};

// The real screen under a spotlight, in the page's own theme: it rises into view as the other scenes do.
const Stage = () => {
  const t = useWords(HOME);
  return (
  <Box as="section" className={s.stageSection} aria-labelledby="home-stage-title">
    <Box className={s.stage}>
      <Box className={s.sceneHeadCentered}>
        <Inline gap="xs" align="center" justify="center" className={joinClass(s.eyebrow, reveal.scroll)}>
          <Dot ink="primary" size="xs" data-testid="home-live-dot" />
          <Text variant="label" ink="secondary" as="span">{t.stageEyebrow}</Text>
        </Inline>
        <Text variant="headline" as="h2" id="home-stage-title" className={reveal.scroll}>
          <TwoTone first={t.stageFirst} second={t.stageSecond} />
        </Text>
        <Text variant="body" ink="secondary" as="p" className={joinClass(s.sub, reveal.scroll)}>
          {t.stageSub}
        </Text>
      </Box>
      <Box as="figure" className={joinClass(s.stageFigure, reveal.scroll)}>
        <DemoWindow />
        <Inline as="figcaption" gap="sm" align="center" justify="center" wrap paddingY="xl">
          <Text variant="caption" ink="secondary">{t.stageCaption}</Text>
          <Link as={RouterLink} to="/demo" underline="hover">
            <Text variant="caption" as="span" ink="inherit" className={s.demoLink}>{t.openDemo}<ArrowRightIcon size="label" className={s.demoArrow} /></Text>
          </Link>
        </Inline>
      </Box>
    </Box>
  </Box>
  );
};

// The principles' marks, in the order HOME lists them.
const PRINCIPLE_ICONS = [<LayersIcon key="layers" />, <GridIcon key="grid" />, <StarIcon key="star" />, <ShieldIcon key="shield" />];

const Principles = () => {
  const t = useWords(HOME);
  return (
  <Box as="section" className={s.principlesSection} aria-labelledby="home-principles-title">
    <div className={s.sceneHead} data-testid="home-principles-head">
      <div>
        <Inline gap="sm" align="center" className={s.eyebrow}>
          <LayersIcon size="body" ink="secondary" />
          <Text variant="label" ink="secondary" as="span">{t.principlesEyebrow}</Text>
        </Inline>
        <Text variant="headline" as="h2" id="home-principles-title" className={reveal.scroll}>
          <TwoTone first={t.principlesFirst} second={t.principlesSecond} />
        </Text>
      </div>
      <Text variant="lead" ink="secondary" as="p" className={reveal.scroll}>
        {t.principlesLead}
      </Text>
    </div>
    <div className={s.principles}>
      {t.principles.map((principle, index) => (
        <Stack key={principle.title} gap="sm" className={reveal.scroll}>
          <Surface fill="sunken" className={s.principleMark}>{PRINCIPLE_ICONS[index]}</Surface>
          <Text variant="subheading" as="h3">{principle.title}</Text>
          <Text variant="body" ink="secondary" as="p">{principle.text}</Text>
        </Stack>
      ))}
    </div>
  </Box>
  );
};

const INSTALL = "pnpm add @studio-baeks/paper-ui";
const Closing = () => {
  const t = useWords(HOME);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(INSTALL).then(() => setCopied(true), () => {});
  };
  return (
    <Box as="section" className={s.closing} aria-labelledby="home-closing-title">
      <Text variant="headline" as="h2" id="home-closing-title" className={reveal.scroll}>
        <TwoTone first={t.closingFirst} second={t.closingSecond} />
      </Text>
      <Surface fill="sunken" radius="full" className={joinClass(s.install, reveal.scroll)}>
        <Text variant="body" family="mono" as="code">{INSTALL}</Text>
        <Button size="sm" variant="soft" shape="pill" onClick={copy}>{copied ? t.copied : t.copy}</Button>
      </Surface>
      <Inline gap="sm" justify="center">
        <Button as={RouterLink} to="/docs/get-started/install" size="lg" shape="pill">{t.install}</Button>
        <Button as={RouterLink} to="/docs/foundations" size="lg" variant="hairline" shape="pill">{t.foundations}</Button>
      </Inline>
    </Box>
  );
};

// Who made it and where to find them. The name is written the way each language writes it.
const AUTHOR = {
  name: { ko: "백재원 (Jaewon Baek)", en: "Jaewon Baek (백재원)" },
  links: [
    { label: "GitHub", href: "https://github.com/bsiku3622/paper-ui" },
    { label: "Instagram @_baek.jw", href: "https://www.instagram.com/_baek.jw/" },
    { label: "jaewon@bsiku.dev", href: "mailto:jaewon@bsiku.dev" },
  ],
} as const;

const FooterLink = ({ children, ...link }: { children: string } & ({ to: string } | { href: string })) =>
  "to" in link ? (
    <Link as={RouterLink} to={link.to} underline="hover" className={s.footerLink}><Text variant="caption" as="span" ink="inherit">{children}</Text></Link>
  ) : (
    <Link href={link.href} underline="hover" className={s.footerLink}><Text variant="caption" as="span" ink="inherit">{children}</Text></Link>
  );

const Footer = () => {
  const t = useWords(HOME);
  const name = useWords(AUTHOR.name);
  return (
    <Box as="footer" className={s.footer}>
      <Stack gap="md">
        <Inline justify="between" align="center" wrap gap="md">
          <Logo height={18} className={s.footerLogo} />
          <Inline gap="md" wrap align="center">
            <FooterLink to="/docs/get-started/philosophy">{t.footerPrinciples}</FooterLink>
            <FooterLink to="/docs/foundations">Foundations</FooterLink>
            <FooterLink to="/docs">{t.footerDocs}</FooterLink>
            <FooterLink href={AUTHOR.links[0].href}>{AUTHOR.links[0].label}</FooterLink>
          </Inline>
        </Inline>
        <Inline justify="between" align="center" wrap gap="md">
          <Text variant="caption" ink="secondary" as="p">{`${t.footerAuthor} ${name}`}</Text>
          <Inline gap="md" wrap align="center">
            {AUTHOR.links.slice(1).map((link) => <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>)}
            <Text variant="caption" ink="tertiary" as="span">© 2026 Studio Baeks</Text>
          </Inline>
        </Inline>
      </Stack>
    </Box>
  );
};

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
