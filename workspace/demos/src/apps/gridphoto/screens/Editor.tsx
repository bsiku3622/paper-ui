import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { Box, Grid, Stack } from "@studio-baeks/paper-ui";

import { CornerEditor } from "../content/CornerEditor";
import { clampQuad, quadIsValid } from "../model/geometry";
import { manualGrid, manualSheet } from "../model/mock";
import type { EditTarget, Page, Quad } from "../model/types";
import { paths } from "../paths";
import { useGridphoto } from "../state/document";
import { DropStage, Well } from "./DropStage";
import { EditPanel } from "./EditPanel";
import { PageStrip } from "./PageStrip";
import { ResultPanel } from "./Panel";
import { Stage, widthFor } from "./Stage";

const Layout = ({ currentId, stage, panel }: { currentId: string; stage: ReactNode; panel: ReactNode }) => (
  <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 22rem" }} gap="lg" align="start">
    <Stack gap="md" minWidth={0}>
      {stage}
      <PageStrip currentId={currentId} />
    </Stack>
    {panel}
  </Grid>
);

const STARTING: Quad = [{ x: 0.14, y: 0.14 }, { x: 0.86, y: 0.14 }, { x: 0.86, y: 0.86 }, { x: 0.14, y: 0.86 }];

const startFrom = (page: Page): { quad: Quad; target: EditTarget; cols: number; rows: number } => {
  const fit = page.fit;
  const quad = fit && fit.origin !== "none" && fit.lines !== "ruled" ? clampQuad(fit.quad) : null;
  if (!fit || !quad || !quadIsValid(quad)) return { quad: STARTING, target: "sheet", cols: 10, rows: 10 };
  return fit.kind === "sheet" ? { quad, target: "sheet", cols: 10, rows: 10 } : { quad, target: "grid", cols: fit.cols ?? 10, rows: fit.rows ?? 10 };
};

const Corners = ({ page }: { page: Page }) => {
  const { applyManual } = useGridphoto();
  const navigate = useNavigate();
  const [state, setState] = useState(() => startFrom(page));
  const valid = quadIsValid(state.quad);
  const apply = () => {
    if (!valid) return;
    applyManual(page.id, state.target === "sheet" ? manualSheet(page, state.quad) : manualGrid(page, state.quad, state.cols, state.rows));
    navigate(paths.page(page.id));
  };
  return (
    <Layout
      currentId={page.id}
      stage={
        <Well>
          <Stack align="center" paddingY="sm">
            <Box as="section" width="full" maxWidth={widthFor(page.photo.ratio)} aria-label="네 모서리 직접 맞추기">
              <CornerEditor
                photo={page.photo}
                quad={state.quad}
                cols={state.target === "sheet" ? 1 : state.cols}
                rows={state.target === "sheet" ? 1 : state.rows}
                onQuad={(quad) => setState((now) => ({ ...now, quad }))}
              />
            </Box>
          </Stack>
        </Well>
      }
      panel={
        <EditPanel
          pageId={page.id}
          target={state.target}
          cols={state.cols}
          rows={state.rows}
          valid={valid}
          onTarget={(target) => setState((now) => ({ ...now, target }))}
          onCols={(cols) => setState((now) => ({ ...now, cols }))}
          onRows={(rows) => setState((now) => ({ ...now, rows }))}
          onApply={apply}
        />
      }
    />
  );
};

export const Editor = ({ view }: { view: "result" | "source" | "corners" }) => {
  const { pageId } = useParams();
  const { pages, doc, select } = useGridphoto();
  const page = pages.find((item) => item.id === pageId);

  useEffect(() => {
    if (page && doc.currentId !== page.id) select(page.id);
  }, [page, doc.currentId, select]);

  if (!page) return <Navigate to={paths.home} replace />;
  if (view === "corners") {
    if (page.status !== "ready" || !page.fit) return <Navigate to={paths.page(page.id)} replace />;
    return <Corners key={page.id} page={page} />;
  }
  return (
    <Layout
      currentId={page.id}
      stage={
        <DropStage>
          <Stage page={page} view={view} />
        </DropStage>
      }
      panel={<ResultPanel page={page} view={view} />}
    />
  );
};
