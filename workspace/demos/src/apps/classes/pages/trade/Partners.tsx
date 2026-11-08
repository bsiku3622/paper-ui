// 교환 상대 — for each move in the combination being looked at, the students who sit in the section you want and could take
// yours without a clash in their own week. The other direction is already known: the combination exists. A post to ask for
// a swap is one press away.

import { Divider, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { buildTradePost } from "../../lib/trade";
import { formatTimes, koreanName, sectionNumber } from "../../lib/utils";
import { Card, Eyebrow, StudentChip } from "../../ui/parts";
import type { TradeModel } from "./model";
import { CopyPost } from "./parts";

export const PartnersCard = ({ model }: { model: TradeModel }) => {
  if (model.partners.length === 0) return null;
  return (
    <Card title="교환 상대" description="고른 조합에서 분반을 맞바꿀 수 있는 사람입니다. 상대가 그 분반을 듣고 있고, 내 자리로 옮겨도 상대 시간표가 겹치지 않는 경우만 나옵니다.">
      <Stack as="ul" gap="md">
        {model.partners.map(({ subject, from, to, partners }, index) => {
          const post = buildTradePost(subject, from, to);
          return (
            <Stack as="li" key={subject} gap="md">
              {index > 0 ? <Divider /> : null}
              <Stack gap="sm">
                <Inline justify="between" align="center" gap="md" wrap>
                  <Stack gap="xs" minWidth={0}>
                    <Text as="span" strong>{koreanName(subject)}</Text>
                    <Text as="span" variant="caption" ink="tertiary">
                      {sectionNumber(from.section)}분반 → {sectionNumber(to.section)}분반 · {to.teacher} · {formatTimes(to.times)}
                    </Text>
                  </Stack>
                  <CopyPost text={post} />
                </Inline>
                <Text as="span" variant="caption" ink="tertiary">{post.split("\n")[0]}</Text>
                {partners.length === 0 ? (
                  <Text ink="tertiary">맞바꿀 상대가 없습니다. 빈자리가 나기를 노려야 합니다.</Text>
                ) : (
                  <Stack gap="xs">
                    <Eyebrow>{partners.length}명</Eyebrow>
                    <Inline gap="xs" wrap>
                      {partners.map((partner) => (
                        <StudentChip key={partner.stuId} stuId={partner.stuId} name={partner.name} />
                      ))}
                    </Inline>
                  </Stack>
                )}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
};
