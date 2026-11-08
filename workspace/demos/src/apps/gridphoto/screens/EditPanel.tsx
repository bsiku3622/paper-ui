// The panel while corners are being placed by hand: what to fit (the sheet or its grid), how many cells there are to count if
// it is the grid, and the two ways out.

import { Link as RouterLink } from "react-router-dom";

import { Button, Field, FormField, Grid, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { Segmented, useFace } from "../../../kit";
import type { EditTarget } from "../model/types";
import { paths } from "../paths";
import { Notice } from "./Notice";

const CountField = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
  <FormField label={label}>
    <Field
      type="number"
      inputMode="numeric"
      numeric
      min={1}
      max={1000}
      value={value}
      onChange={(event) => {
        const next = Math.round(Number(event.currentTarget.value));
        if (Number.isFinite(next) && next >= 1 && next <= 1000) onChange(next);
      }}
    />
  </FormField>
);

export const EditPanel = ({
  pageId,
  target,
  cols,
  rows,
  valid,
  onTarget,
  onCols,
  onRows,
  onApply,
}: {
  pageId: string;
  target: EditTarget;
  cols: number;
  rows: number;
  valid: boolean;
  onTarget: (target: EditTarget) => void;
  onCols: (value: number) => void;
  onRows: (value: number) => void;
  onApply: () => void;
}) => {
  const face = useFace();
  return (
    <Stack gap="lg">
      <Surface as="section" aria-label="직접 맞추기" {...face} radius="lg" padding="lg">
        <Stack gap="lg">
          <Text as="h2" variant="subheading">직접 맞추기</Text>
          <Segmented
            label="맞출 대상"
            stretch
            value={target}
            onChange={(next) => onTarget(next as EditTarget)}
            options={[
              { id: "sheet", label: "종이" },
              { id: "grid", label: "격자" },
            ]}
          />
          <Text variant="caption" ink="secondary">
            {target === "sheet"
              ? "네 모서리를 종이의 네 귀퉁이에 옮겨 주세요. 안쪽이 그대로 직사각형이 됩니다."
              : "네 모서리를 격자의 교차점에 옮기고, 그 안의 칸 수를 적어 주세요. 칸 수가 맞으면 파란 선이 실제 격자선과 겹칩니다."}
          </Text>
          {target === "grid" ? (
            <Grid columns={2} gap="md">
              <CountField label="가로 칸 수" value={cols} onChange={onCols} />
              <CountField label="세로 칸 수" value={rows} onChange={onRows} />
            </Grid>
          ) : null}
          {valid ? null : <Notice tone="warning">모서리가 꼬였습니다. 왼쪽 위부터 시계 방향이 되도록 옮겨 주세요.</Notice>}
        </Stack>
      </Surface>
      <Stack gap="xs">
        <Button size="lg" fullWidth disabled={!valid} onClick={onApply}>이대로 펴기</Button>
        <Button as={RouterLink} to={paths.page(pageId)} variant="ghost" fullWidth>취소</Button>
      </Stack>
    </Stack>
  );
};
