import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

import { IconButton, Inline, Link, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Glyph, useFace } from "../../../kit";
import type { Rev } from "../data/types";
import { articlePath, recentPath, searchPath } from "../lib/paths";
import { clock, collator, hash, present, since } from "../lib/text";
import { useWiki } from "../state/store";

const AsideCard = ({ label, children }: { label: string; children: ReactNode }) => (
  <Surface as="section" aria-label={label} {...useFace()} radius="lg" padding="lg">
    {children}
  </Surface>
);

const useRanking = () => {
  const { index } = useWiki();
  const pool = useMemo(
    () => [
      ...[...index.articles.values()]
        .filter((article) => !article.redirect && article.title !== "대문")
        .sort((a, b) => b.stars - a.stars || collator.compare(a.title, b.title))
        .slice(0, 14)
        .map((article) => article.title),
      ...index.wanted.slice(0, 2).map((item) => item.title),
    ],
    [index],
  );
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((now) => now + 1), 6000);
    return () => window.clearInterval(id);
  }, []);
  return useMemo(
    () =>
      pool
        .map((title, i) => ({ title, score: (pool.length - i) * 10 + 14 * Math.sin(tick * 0.8 + (hash(title) % 17)) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item) => item.title),
    [pool, tick],
  );
};

const Ranking = () => {
  const { index } = useWiki();
  const titles = useRanking();
  return (
    <AsideCard label="실시간 검색어">
      <Stack gap="md">
        <Inline justify="between" align="center" gap="sm">
          <Inline gap="sm" align="center">
            <Glyph name="trending-up" size="subheading" ink="secondary" />
            <Text as="h2" variant="subheading">실시간 검색어</Text>
          </Inline>
          <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{clock(present())} 기준</Text>
        </Inline>
        <Stack as="ol" gap="sm">
          {titles.map((title, rank) => (
            <Inline as="li" key={title} gap="md" align="baseline">
              <Text as="span" variant="body" ink={rank < 3 ? "primary" : "tertiary"} strong={rank < 3} numeric>{rank + 1}</Text>
              <Text as="span" variant="body" truncate>
                <Link as={RouterLink} to={index.resolve(title) ? articlePath(title) : searchPath(title)} underline="hover">{title}</Link>
              </Text>
            </Inline>
          ))}
        </Stack>
      </Stack>
    </AsideCard>
  );
};

const Recent = () => {
  const { index } = useWiki();
  const rows = useMemo(() => {
    const seen = new Set<string>();
    const out: Rev[] = [];
    for (const rev of index.revs) {
      if (seen.has(rev.title)) continue;
      seen.add(rev.title);
      out.push(rev);
      if (out.length === 10) break;
    }
    return out;
  }, [index]);
  return (
    <AsideCard label="최근 변경">
      <Stack gap="md">
        <Inline justify="between" align="center" gap="sm">
          <Inline gap="sm" align="center">
            <Glyph name="refresh-cw" size="subheading" ink="secondary" />
            <Text as="h2" variant="subheading">최근 변경</Text>
          </Inline>
          <IconButton as={RouterLink} to={recentPath()} variant="ghost" size="sm" aria-label="최근 변경 전체 보기">
            <Glyph name="chevron-right" />
          </IconButton>
        </Inline>
        <Stack as="ul" gap="sm">
          {rows.map((rev) => (
            <Inline as="li" key={rev.title} justify="between" align="center" gap="md">
              <Text as="span" variant="body" truncate>
                <Link as={RouterLink} to={articlePath(rev.title)} underline="hover">{rev.title}</Link>
              </Text>
              <Text as="span" variant="caption" ink="tertiary" numeric>{since(rev.at).replace(" ", " ")}</Text>
            </Inline>
          ))}
        </Stack>
      </Stack>
    </AsideCard>
  );
};

export const Aside = () => (
  <Stack as="aside" aria-label="위키 소식" gap="lg">
    <Ranking />
    <Recent />
  </Stack>
);
