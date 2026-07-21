// 홈 — paper-ui 랜딩. 정체성 그대로: 순백·검정·여백, 색은 작게.

import { Link } from "react-router-dom";

import { Badge, Box, Button, Card, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { SiteNav } from "../site/chrome";

const PRINCIPLES = [
  { k: "색은 점이다", v: "흰색·검정이 골격. 색은 의미가 있을 때만 작게 얹는다. 검정이 일꾼이라 primary도 파랑이 아니다." },
  { k: "선보다 면", v: "구획은 얇은 선이 아니라 옅은 면과 여백으로. 경계는 거의 안 보인다." },
  { k: "조용한 밀도", v: "복잡한 앱의 밀도(14px)를 지키되 넉넉한 radius로 부드럽게. hover는 어두워지고 포커스는 파랗다." },
  { k: "빌드가 지킨다", v: "원칙은 문서가 아니라 lint·테스트가 강제한다. 정본 하나를 한 번 걷는다." },
] as const;

export const Home = () => (
  <Stack>
    <SiteNav />
    <Box paddingX="xl" paddingY="xl">
      <Stack gap="xl" style={{ maxWidth: "56rem", marginInline: "auto", width: "100%" }}>
        {/* Hero */}
        <Stack gap="md" style={{ paddingBlock: "3rem" }}>
          <Inline gap="sm">
            <Badge status="info">Studio Baeks</Badge>
            <Text variant="caption">Design System</Text>
          </Inline>
          <Text variant="title" style={{ fontSize: "2.5rem", lineHeight: 1.15, letterSpacing: "-0.03em", maxWidth: "34rem" }}>
            순백과 검정, 그리고 의미가 있을 때만의 색.
          </Text>
          <Text variant="body" ink="soft" style={{ maxWidth: "34rem", fontSize: "0.9375rem" }}>
            복잡한 웹앱을 위한 디자인 시스템입니다. Atlassian의 밀도, shadcn의 뉴트럴, ChatGPT의 조용함, SwiftUI의 마감을 한 결로 묶었습니다. 20개 컴포넌트, 빌드가 지키는 네 규칙.
          </Text>
          <Inline gap="sm" style={{ marginTop: "0.5rem" }}>
            <Link to="/docs" style={{ textDecoration: "none" }}>
              <Button kind="solid">문서 보기</Button>
            </Link>
            <Link to="/playground" style={{ textDecoration: "none" }}>
              <Button kind="outline">플레이그라운드</Button>
            </Link>
          </Inline>
        </Stack>

        {/* 원칙 요약 */}
        <Stack gap="md">
          <Text variant="label">원칙</Text>
          <Box style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
            {PRINCIPLES.map((p) => (
              <Card key={p.k}>
                <Stack gap="xs">
                  <Text variant="heading">{p.k}</Text>
                  <Text variant="caption" ink="soft">{p.v}</Text>
                </Stack>
              </Card>
            ))}
          </Box>
        </Stack>

        <Inline gap="sm">
          <Text variant="caption">더 알아보기 —</Text>
          <Link to="/docs/get-started/principles"><Text variant="caption" as="span" className="pui-blue-ink">여섯 원칙 전문</Text></Link>
          <Text variant="caption">·</Text>
          <Link to="/docs/foundations/tokens"><Text variant="caption" as="span" className="pui-blue-ink">토큰</Text></Link>
        </Inline>
      </Stack>
    </Box>
  </Stack>
);
