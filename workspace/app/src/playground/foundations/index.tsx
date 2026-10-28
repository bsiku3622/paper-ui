// Foundations — one inspector page per system. Every page follows its system's own build order:
// source values, the roles that select from them, then the presets or recipes built from roles.

import { useParams } from "react-router-dom";

import { Stack } from "@studio-baeks/paper-ui";

import { PlaygroundLayout, ReferenceHeading } from "../shell";
import { ColorPage } from "./ColorPage";
import { LayoutPage } from "./LayoutPage";
import { MotionPage } from "./MotionPage";
import { FOUNDATION_SECTIONS, type FoundationSlug } from "./sections";
import { ShapePage } from "./ShapePage";
import { TypographyPage } from "./TypographyPage";
import * as s from "./kit.css";

const PAGES: Record<FoundationSlug, () => React.ReactElement> = {
  color: ColorPage,
  typography: TypographyPage,
  shape: ShapePage,
  layout: LayoutPage,
  motion: MotionPage,
};

export const Foundations = () => {
  const { section: slug } = useParams<{ section: string }>();
  const [id, name, description] = FOUNDATION_SECTIONS.find(([key]) => key === slug) ?? FOUNDATION_SECTIONS[0];
  const Page = PAGES[id];
  return (
    <PlaygroundLayout value={`foundation-${id}`}>
      <Stack className={s.page} gap="xl">
        <ReferenceHeading group="Foundations" name={name} description={`${description} 실제 tokens.*에서 값을 읽으며 현재 테마에 따라 갱신됩니다.`} />
        <Page />
      </Stack>
    </PlaygroundLayout>
  );
};
