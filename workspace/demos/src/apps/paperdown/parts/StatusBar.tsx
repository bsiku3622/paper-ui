// The bar at the foot of the window (App.tsx's `statusbar`): how the paper is cut, how long it takes to read, the counts of the
// words, lines and characters (and of what is selected), and where it is kept.

import type { ReactNode } from "react";

import { Box, Divider, Inline, Surface, Text } from "@studio-baeks/paper-ui";

import { Pin } from "../content/Pin";
import type { PageMode } from "../lib/types";

const Quiet = ({ children }: { children: ReactNode }) => <Text as="span" variant="label" strong={false} ink="tertiary">{children}</Text>;

// A count, its unit, and what it counts.
const Count = ({ value, unit, of }: { value: number; unit: string; of?: string }) => (
  <Inline as="span" gap="xs" align="baseline">
    <Text as="span" variant="label" strong={false} ink="secondary" numeric>{value.toLocaleString()}</Text>
    <Quiet>{unit}</Quiet>
    {of ? <Quiet>{of}</Quiet> : null}
  </Inline>
);

export type Stats = { words: number; lines: number; chars: number; compact: number };

export const StatusBar = ({ mode, pages, stats, selected, hint }: { mode: PageMode; pages: number; stats: Stats; selected: number; hint: string }) => (
  <Pin at="bottom">
    <Surface fill="raised" border="top" paddingX="xl" paddingY="sm">
      <Inline justify="between" align="center" gap="xl" wrap>
        <Inline gap="xl" align="center" wrap>
          <Inline gap="md" align="stretch">
            <Quiet>{mode === "pages" ? `${pages}페이지` : "무한 높이"}</Quiet>
            <Divider orientation="vertical" />
            <Quiet>{Math.max(1, Math.ceil(stats.words / 200))}분 읽기</Quiet>
          </Inline>
          <Inline gap="lg" align="center" wrap role="group" aria-label="문서 통계">
            <Count value={stats.words} unit="단어" />
            <Count value={stats.lines} unit="줄" />
            <Count value={stats.chars} unit="자" of="공백 포함" />
            <Count value={stats.compact} unit="자" of="공백 제외" />
            {selected > 0 ? (
              <Inline gap="lg" align="stretch">
                <Divider orientation="vertical" />
                <Quiet>선택 {selected}자</Quiet>
              </Inline>
            ) : null}
          </Inline>
        </Inline>
        <Box hideBelow="lg">
          <Quiet>{hint}</Quiet>
        </Box>
      </Inline>
    </Surface>
  </Pin>
);
