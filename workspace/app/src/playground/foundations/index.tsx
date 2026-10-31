// Foundations — one inspector page per system. Every page follows its system's own build order:
// source values, the roles that select from them, then the presets or recipes built from roles.

import { Navigate, useParams } from "react-router-dom";

import { Stack } from "@studio-baeks/paper-ui";

import { PageHeader } from "../../site/PageHeader";
import { FOUNDATIONS, type FoundationId } from "../../site/site-map";
import { ColorPage } from "./ColorPage";
import { LayoutPage } from "./LayoutPage";
import { MotionPage } from "./MotionPage";
import { ShapePage } from "./ShapePage";
import { TypographyPage } from "./TypographyPage";
import * as s from "./kit.css";

const PAGES: Record<FoundationId, () => React.ReactElement> = {
  color: ColorPage,
  typography: TypographyPage,
  shape: ShapePage,
  layout: LayoutPage,
  motion: MotionPage,
};

export const Foundations = () => {
  const { section: slug } = useParams<{ section: string }>();
  const foundation = FOUNDATIONS.find(({ id }) => id === slug);
  if (!foundation) return <Navigate to={`/playground/foundations/${FOUNDATIONS[0].id}`} replace />;
  const { id, label, summary } = foundation;
  const Page = PAGES[id];
  return (
    <Stack className={s.page} gap="xl">
      <PageHeader group="Foundations" name={label} description={`${summary} 실제 tokens.*에서 값을 읽으며 현재 테마에 따라 갱신됩니다.`} />
      <Page />
    </Stack>
  );
};
