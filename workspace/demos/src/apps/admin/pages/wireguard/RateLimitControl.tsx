import { useEffect, useState } from "react";

import { Box, Button, Field, Grid, Inline, Stack, Text } from "@studio-baeks/paper-ui";

import { RateSlider, type RateValue } from "../../content/RateSlider";

export const RateLimitControl = ({ name, saved, busy, onSave }: { name: string; saved: RateValue; busy: boolean; onSave: (value: RateValue) => Promise<boolean> }) => {
  const [value, setValue] = useState<RateValue>(saved);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setValue(saved);
  }, [editing, saved]);

  const set = (next: RateValue) => {
    setValue(next === "unlimited" ? next : Number.isFinite(next) ? Math.max(0, Math.min(300, Math.round(next))) : 0);
    setEditing(true);
  };

  return (
    <Grid columns={{ base: "minmax(0, 1fr)", sm: "minmax(0, 1fr) auto" }} gap="md" align="end">
      <Stack gap="xs">
        <Text as="span" variant="label">속도 제한</Text>
        <RateSlider label={`${name} 속도 제한 슬라이더`} value={value} disabled={busy} onChange={set} />
      </Stack>
      <Inline gap="sm">
        <Box width="md">
          <Field
            aria-label={`${name} 속도 제한 Mbps`}
            type="number"
            min={0}
            max={300}
            step={1}
            numeric
            value={value === "unlimited" ? "" : value}
            placeholder={value === "unlimited" ? "제한 없음" : undefined}
            trailing={value === "unlimited" ? undefined : "Mbps"}
            disabled={busy}
            onChange={(event) => set(event.currentTarget.value === "" ? "unlimited" : Number(event.currentTarget.value))}
          />
        </Box>
        <Button
          variant="soft"
          loading={busy}
          loadingLabel="저장 중"
          disabled={!editing}
          onClick={() => void onSave(value).then((done) => { if (done) setEditing(false); })}
        >
          저장
        </Button>
      </Inline>
    </Grid>
  );
};
