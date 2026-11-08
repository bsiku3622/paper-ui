import { Link as RouterLink, useParams } from "react-router-dom";

import { Button, Grid, Inline, Link, Stack, Text } from "@studio-baeks/paper-ui";

import { Empty } from "../../../kit";
import { articlePath, specialPath, titleOf } from "../lib/paths";
import { initialOf } from "../lib/text";
import { Page } from "../parts/Page";
import { useWiki } from "../state/store";

const NOTES: Record<string, string> = {
  "가상 도시": "이 위키에서 지어낸 도시와 그 안의 장소에 관한 문서입니다.",
  돌담시: "돌담시와 그 안의 장소, 행사, 먹거리를 다룹니다.",
  한빛고등학교: "한빛고등학교와 그 안의 동아리, 행사에 관한 문서입니다.",
  "학교 동아리": "학교 동아리의 활동과 연혁을 적은 문서입니다.",
  축제: "해마다 열리는 축제와 행사입니다.",
  항구: "항구와 항만 시설, 바다와 관련된 문서입니다.",
  건축물: "다리, 등대, 역사 같은 건축물을 다룹니다.",
  음식: "지역의 먹거리와 음식 이야기입니다.",
  디자인: "디자인의 방법과 도구에 관한 문서입니다.",
  "디자인 시스템": "화면의 일관성을 지키는 규칙과 부품에 관한 문서입니다.",
  "3D 프린팅": "3D 프린터와 재료, 출력 방법에 관한 문서입니다.",
  "프로그래밍 언어": "프로그래밍 언어와 그 도구를 다룹니다.",
  소프트웨어: "프로그램과 개발 도구에 관한 문서입니다.",
  도구: "일을 돕는 도구와 장비에 관한 문서입니다.",
  천문학: "별과 행성, 관측과 관련된 문서입니다.",
  태양계: "태양과 그 둘레를 도는 천체에 관한 문서입니다.",
  한국어: "한국어와 한글에 관한 문서입니다.",
  음료: "마시는 것에 관한 문서입니다.",
  보드게임: "판 위에서 하는 게임에 관한 문서입니다.",
  스포츠: "운동 경기와 훈련에 관한 문서입니다.",
  달리기: "달리기와 마라톤에 관한 문서입니다.",
};

export const CategoryPage = () => {
  const name = titleOf(useParams()["*"]);
  const { index } = useWiki();
  const members = index.categories.get(name) ?? [];
  const groups = new Map<string, string[]>();
  for (const title of members) groups.set(initialOf(title), [...(groups.get(initialOf(title)) ?? []), title]);

  return (
    <Page
      title={name}
      eyebrow="분류"
      docTitle={`분류: ${name}`}
      description={NOTES[name] ?? "이 분류에 모인 문서입니다."}
      meta={<Text as="span" variant="caption" ink="tertiary" numeric>문서 {members.length}개</Text>}
      actions={
        <Button as={RouterLink} to={specialPath("categories")} variant="hairline" size="sm">
          모든 분류
        </Button>
      }
    >
      {members.length === 0 ? (
        <Empty glyph="folder-open" title="이 분류에는 문서가 없습니다" description="문서 끝에 [[분류:이름]]을 적으면 분류에 들어갑니다." />
      ) : (
        <Stack gap="xl">
          {[...groups.entries()].map(([initial, titles]) => (
            <Stack key={initial} gap="sm">
              <Inline gap="sm" align="baseline">
                <Text as="h2" variant="heading">{initial}</Text>
                <Text as="span" variant="caption" ink="tertiary" numeric>{titles.length}</Text>
              </Inline>
              <Grid as="ul" columns={{ base: 1, md: 2, lg: 3 }} gap="sm">
                {titles.map((title) => (
                  <Text as="li" key={title} variant="body">
                    <Link as={RouterLink} to={articlePath(title)} underline="hover">{title}</Link>
                  </Text>
                ))}
              </Grid>
            </Stack>
          ))}
        </Stack>
      )}
    </Page>
  );
};
