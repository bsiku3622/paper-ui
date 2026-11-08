import { Badge, Button, Grid, Stack, Surface, Text } from "@studio-baeks/paper-ui";

import { DIVISIONS, trackRule } from "../data/majors";
import { Eyebrow } from "./parts";

export const MajorPicker = ({ value, onChange, suggested, disabled = false }: { value: string | null; onChange: (track: string) => void; suggested?: string | null; disabled?: boolean }) => (
  <Stack gap="md">
    {DIVISIONS.map((division) => (
      <Stack key={division.name} gap="xs">
        <Eyebrow>{division.name}</Eyebrow>
        <Grid columns={2} gap="sm">
          {division.tracks.map((track) => (
            <Button key={track} variant="hairline" selected={value === track} disabled={disabled} fullWidth badge={suggested === track ? <Badge size="xs" variant="solid">추천</Badge> : undefined} onClick={() => onChange(track)}>
              {track}
            </Button>
          ))}
        </Grid>
      </Stack>
    ))}
    <Surface fill="sunken" radius="md" padding="md" minHeight="xs">
      <Stack gap="xs">
        <Text as="span" variant="label" strong={false} ink="tertiary">{value ? `${value} 심화필수` : "심화필수 조건"}</Text>
        <Text as="p" variant="caption" ink={value ? "secondary" : "tertiary"}>{value ? trackRule(value) || "교육과정에 적힌 조건이 아직 없습니다." : "트랙을 누르면 심화필수 조건이 여기에 보입니다."}</Text>
      </Stack>
    </Surface>
  </Stack>
);
