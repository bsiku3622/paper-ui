import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Box, Button, Inline, Link, Select, Surface, Text, useResolvedTheme } from "@studio-baeks/paper-ui";

import { LocaleToggle } from "../../compositions/LocaleToggle";
import { ThemeToggle } from "../../compositions/ThemeToggle";
import { useSiteLocale, useWords } from "../../site/locale";
import { Logo } from "../../site/Logo";
import { SITE_NAV } from "../../site/site-map";
import * as shell from "../../site/shell.css";
import { SHOWCASE_APPS, appOf, showcaseTo } from "./apps";
import * as s from "./showcase.css";

const WORDS = {
  ko: { title: "데모", home: "Paper UI 홈", nav: "주요 메뉴", apps: "앱", open: "새 탭에서 열기", frame: (name: string) => `${name} 데모` },
  en: { title: "Demo", home: "Paper UI home", nav: "Main menu", apps: "Apps", open: "Open in a new tab", frame: (name: string) => `${name} demo` },
} as const;

export const Showcase = () => {
  const [params] = useSearchParams();
  const { locale } = useSiteLocale();
  const words = useWords(WORDS);
  const navigate = useNavigateTo();
  const theme = useResolvedTheme();
  const app = appOf(params.get("app"));
  const name = app.name[locale];
  return (
    <Box className={s.page}>
      <Surface as="header" fill="canvas" border="bottom" paddingX="lg" paddingY="sm">
        <Inline justify="between" align="center" gap="lg" wrap>
          <Inline gap="md" align="center">
            <Link as={RouterLink} to="/" underline="hover" className={shell.navLink.plain} aria-label={words.home}>
              <Logo height={20} />
            </Link>
            <Text as="h1" variant="subheading">{words.title}</Text>
          </Inline>
          <Inline gap="lg" align="center">
            <Inline as="nav" aria-label={words.nav} gap="lg" hideBelow="md">
              {SITE_NAV.filter((entry) => entry.to !== "/demo").map(({ to, label }) => (
                <Link as={RouterLink} key={to} to={to} underline="hover" className={shell.navLink.bar}>{label[locale]}</Link>
              ))}
            </Inline>
            <Inline gap="xs" align="center">
              <LocaleToggle />
              <ThemeToggle />
            </Inline>
          </Inline>
        </Inline>
      </Surface>
      <Surface fill="canvas" border="bottom" paddingX="lg" paddingY="sm">
        <Inline justify="between" align="center" gap="md" wrap>
          <Inline as="nav" aria-label={words.apps} gap="xs" align="center" wrap hideBelow="lg" className={s.apps}>
            {SHOWCASE_APPS.map((one) => (
              <Button as={RouterLink} key={one.id} to={showcaseTo(one)} size="sm" variant="ghost" selected={one.id === app.id} aria-current={one.id === app.id ? "page" : undefined}>
                {one.name[locale]}
              </Button>
            ))}
          </Inline>
          <Box className={s.onlyNarrow}>
            <Select size="sm" aria-label={words.apps} value={app.id} onChange={(event) => navigate(appOf(event.currentTarget.value))}>
              {SHOWCASE_APPS.map((one) => <Select.Option key={one.id} value={one.id}>{one.name[locale]}</Select.Option>)}
            </Select>
          </Box>
          <Inline gap="md" align="center">
            <Box hideBelow="md"><Text variant="caption" ink="secondary">{app.about[locale]}</Text></Box>
            <Link href={app.src} target="_blank" rel="noopener" underline="hover">{words.open}</Link>
          </Inline>
        </Inline>
      </Surface>
      <Box as="main" id="main" tabIndex={-1}>
        <iframe key={`${app.id}:${theme}`} src={app.src} title={words.frame(name)} className={s.frame} />
      </Box>
    </Box>
  );
};

const useNavigateTo = () => {
  const [, setParams] = useSearchParams();
  return (app: ReturnType<typeof appOf>) => setParams(app.id === SHOWCASE_APPS[0]!.id ? {} : { app: app.id });
};
