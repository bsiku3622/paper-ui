// The height map: the bed mesh as a heat map with its legend, the numbers of the current mesh, the saved profiles, and the
// measurements as a table. Calibrating is disabled while a print runs, as on the real printer; clearing, loading, saving,
// renaming and deleting a profile send the BED_MESH_* commands to the mock.

import { useRef, useState } from "react";

import { Box, Button, Divider, Field, FormField, Grid, IconButton, Inline, Stack, Switch, Text } from "@studio-baeks/paper-ui";

import { Empty, Glyph, PageHeader, useStored, useToast } from "../../../kit";
import { HeatMap } from "../content/HeatMap";
import { Slider } from "../content/Slider";
import { MESH_PARAMS } from "../data/mesh";
import { printing, type Mesh } from "../model";
import { useActions, useSim } from "../sim/Provider";
import { KeyValue } from "../ui/Controls";
import { ConfirmDialog, Dialog } from "../ui/Dialog";
import { Panel } from "../ui/Panel";

type View = { smooth: boolean; probed: boolean; values: boolean; grid: boolean; auto: boolean; limit: number };

const DEFAULT_VIEW: View = { smooth: true, probed: true, values: false, grid: false, auto: false, limit: 0.5 };

const flat = (mesh: Mesh) => mesh.points.flat();
const range = (mesh: Mesh) => Math.max(...flat(mesh)) - Math.min(...flat(mesh));
const signed = (value: number) => `${value >= 0 ? "" : "−"}${Math.abs(value).toFixed(3)}`;

const Options = ({ view, set }: { view: View; set: (next: Partial<View>) => void }) => {
  const options: readonly { key: "smooth" | "probed" | "values" | "grid" | "auto"; label: string }[] = [
    { key: "smooth", label: "보간 메시" },
    { key: "probed", label: "측정점" },
    { key: "values", label: "값 표시" },
    { key: "grid", label: "격자선" },
    { key: "auto", label: "색 범위 자동" },
  ];
  return (
    <Inline gap="lg" wrap>
      {options.map((option) => (
        <Inline key={option.key} as="label" gap="sm" align="center">
          <Switch aria-label={option.label} checked={view[option.key]} onChange={(event) => set({ [option.key]: event.target.checked } as Partial<View>)} />
          <Text as="span" ink="secondary">{option.label}</Text>
        </Inline>
      ))}
    </Inline>
  );
};

const Table = ({ mesh }: { mesh: Mesh }) => {
  const { points } = mesh;
  const rows = points.length;
  const cols = points[0]?.length ?? 0;
  const high = Math.max(...flat(mesh));
  const low = Math.min(...flat(mesh));
  const template = `3.25rem repeat(${cols}, minmax(3.75rem, 1fr))`;
  const x = (index: number) => MESH_PARAMS.minX + (index / Math.max(1, cols - 1)) * (MESH_PARAMS.maxX - MESH_PARAMS.minX);
  const y = (index: number) => MESH_PARAMS.minY + (index / Math.max(1, rows - 1)) * (MESH_PARAMS.maxY - MESH_PARAMS.minY);
  return (
    <Box overflowX="auto">
      <Box role="table" aria-label="측정값 (mm)" minWidth="min-content" padding="lg">
        <Grid role="row" columns={template} gap="xs" paddingY="xs">
          <Text as="span" variant="label" strong={false} ink="tertiary">Y \ X</Text>
          {Array.from({ length: cols }, (_, col) => <Text key={col} as="span" variant="label" strong={false} ink="tertiary" numeric>{x(col).toFixed(0)}</Text>)}
        </Grid>
        {[...points].map((line, row) => ({ line, row })).reverse().map(({ line, row }) => (
          <Grid key={row} role="row" columns={template} gap="xs" paddingY="xs">
            <Text as="span" variant="label" strong={false} ink="tertiary" numeric>{y(row).toFixed(0)}</Text>
            {line.map((value, col) => (
              <Text key={col} as="span" numeric strong={value === high || value === low} ink={value === high ? "warning" : value === low ? "info" : "primary"}>{signed(value)}</Text>
            ))}
          </Grid>
        ))}
      </Box>
    </Box>
  );
};

export const Heightmap = () => {
  const sim = useSim();
  const { send } = useActions();
  const toast = useToast();
  const [view, setView] = useStored<View>("printer:heightmap", DEFAULT_VIEW);
  const [naming, setNaming] = useState("");
  const [rename, setRename] = useState<string | null>(null);
  const [renamed, setRenamed] = useState("");
  const renameField = useRef<HTMLInputElement>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [probing, setProbing] = useState(false);
  const busy = printing(sim.print.state);
  // The probe takes a moment to touch the bed at each point; the mesh arrives when it is done.
  const calibrate = () => {
    setProbing(true);
    window.setTimeout(() => {
      send("BED_MESH_CALIBRATE");
      setProbing(false);
    }, 1800);
  };
  const mesh = sim.meshProfile ? sim.meshes[sim.meshProfile] : undefined;
  const set = (next: Partial<View>) => setView((now) => ({ ...now, ...next }));
  const profiles = Object.values(sim.meshes);
  const list = mesh ? flat(mesh) : [];
  const high = list.length ? Math.max(...list) : 0;
  const low = list.length ? Math.min(...list) : 0;
  const limit = view.auto ? Math.max(0.05, Math.ceil(Math.max(Math.abs(high), Math.abs(low)) / 0.05) * 0.05) : view.limit;
  const find = (target: number) => {
    if (!mesh) return "";
    for (let row = 0; row < mesh.points.length; row++) {
      const col = mesh.points[row]!.indexOf(target);
      if (col >= 0) {
        const x = MESH_PARAMS.minX + (col / (mesh.points[0]!.length - 1)) * (MESH_PARAMS.maxX - MESH_PARAMS.minX);
        const y = MESH_PARAMS.minY + (row / (mesh.points.length - 1)) * (MESH_PARAMS.maxY - MESH_PARAMS.minY);
        return `[${x.toFixed(1)}, ${y.toFixed(1)}]`;
      }
    }
    return "";
  };
  return (
    <>
      <PageHeader
        title="높이 지도"
        description="프로브로 잰 베드의 높이 차이입니다. 주황색은 노즐에 가까운 높은 곳, 파란색은 먼 낮은 곳입니다."
        actions={
          <>
            <Button variant="hairline" disabled={!mesh} onClick={() => send("BED_MESH_CLEAR")}><Glyph name="x" />지우기</Button>
            <Button variant="solid" disabled={busy} loading={probing} loadingLabel="베드를 재는 중" onClick={calibrate}><Glyph name="crosshair" />보정</Button>
          </>
        }
      />
      <Grid columns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 2fr) minmax(0, 1fr)" }} gap="lg" align="start">
        <Stack gap="lg" minWidth={0}>
          <Panel id="heightmap" title="높이 지도" glyph="grid-3x3" collapsible={false}>
            {mesh ? (
              <Stack gap="lg">
                <HeatMap points={mesh.points} mesh={mesh.interpolated} bounds={MESH_PARAMS} limit={limit} smooth={view.smooth} probed={view.probed} values={view.values} grid={view.grid} />
                <Options view={view} set={set} />
                <Divider />
                <Grid columns="auto minmax(0, 1fr) auto" gap="md" align="center">
                  <Text as="span" ink="secondary">색 범위 ±</Text>
                  <Slider label="색 범위 (mm)" value={limit} min={0.05} max={1} step={0.05} disabled={view.auto} onCommit={(value) => set({ limit: value })} onChange={(value) => set({ limit: value })} />
                  <Text as="span" numeric>{limit.toFixed(2)} mm</Text>
                </Grid>
                {busy ? <Text variant="caption" ink="tertiary">출력 중에는 보정할 수 없습니다. 지우기와 프로필 불러오기는 됩니다.</Text> : null}
              </Stack>
            ) : (
              <Empty glyph="grid-3x3" title="불러온 베드 메시가 없습니다" description={busy ? "오른쪽 프로필에서 하나를 불러오세요." : "보정을 눌러 새로 재거나 오른쪽 프로필에서 하나를 불러오세요."} />
            )}
          </Panel>
          {mesh ? (
            <Panel id="heightmap-table" title="측정값" glyph="list" flush>
              <Table mesh={mesh} />
            </Panel>
          ) : null}
        </Stack>
        <Stack gap="lg" minWidth={0}>
          <Panel id="mesh-current" title="현재 메시" glyph="info" collapsible={false}>
            {mesh ? (
              <KeyValue
                rows={[
                  ["이름", mesh.name],
                  ["크기", `${mesh.points[0]?.length ?? 0}×${mesh.points.length}`],
                  [`최대 ${find(high)}`, `${signed(high)} mm`],
                  [`최소 ${find(low)}`, `${signed(low)} mm`],
                  ["차이", `${(high - low).toFixed(3)} mm`],
                ]}
              />
            ) : (
              <Text ink="tertiary">메시가 없습니다.</Text>
            )}
          </Panel>
          <Panel id="mesh-profiles" title="프로필" glyph="layers" collapsible={false}>
            <Stack gap="md">
              {profiles.length === 0 ? (
                <Text ink="tertiary">저장한 프로필이 없습니다.</Text>
              ) : (
                <Stack as="ul" aria-label="메시 프로필">
                  {profiles.map((profile, index) => {
                    const active = profile.name === sim.meshProfile;
                    return (
                      <Stack as="li" key={profile.name}>
                        {index > 0 ? <Divider aria-hidden /> : null}
                        <Inline justify="between" align="center" gap="sm" paddingY="sm" wrap={false}>
                          <Inline gap="sm" align="center" minWidth={0}>
                            <Text as="span" strong={active} ink={active ? "info" : "primary"} truncate>{profile.name}</Text>
                            <Text as="span" variant="caption" ink="tertiary" numeric>{range(profile).toFixed(3)}</Text>
                          </Inline>
                          <Inline gap="xs">
                            {active ? null : <IconButton variant="ghost" size="sm" aria-label={`${profile.name} 불러오기`} onClick={() => send(`BED_MESH_PROFILE LOAD=${profile.name}`)}><Glyph name="download" /></IconButton>}
                            <IconButton variant="ghost" size="sm" aria-label={`${profile.name} 이름 바꾸기`} onClick={() => { setRename(profile.name); setRenamed(profile.name); }}><Glyph name="pencil" /></IconButton>
                            <IconButton variant="ghost" size="sm" aria-label={`${profile.name} 삭제`} onClick={() => setRemoving(profile.name)}><Glyph name="trash-2" /></IconButton>
                          </Inline>
                        </Inline>
                      </Stack>
                    );
                  })}
                </Stack>
              )}
              <Divider />
              <Grid columns="minmax(0, 1fr) auto" gap="sm" align="end">
                <FormField label="지금 메시를 프로필로 저장">
                  <Field size="sm" placeholder="프로필 이름" value={naming} disabled={!mesh} onChange={(event) => setNaming(event.target.value)} />
                </FormField>
                <Button variant="hairline" size="sm" disabled={!mesh || naming.trim() === ""} onClick={() => { send(`BED_MESH_PROFILE SAVE=${naming.trim()}`); toast(`"${naming.trim()}" 프로필로 저장했습니다`); setNaming(""); }}>저장</Button>
              </Grid>
            </Stack>
          </Panel>
        </Stack>
      </Grid>
      <Dialog
        open={rename !== null}
        onClose={() => setRename(null)}
        title="프로필 이름 바꾸기"
        initialFocusRef={renameField}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRename(null)}>취소</Button>
            <Button
              disabled={renamed.trim() === "" || renamed.trim() === rename}
              onClick={() => {
                if (rename) send([`BED_MESH_PROFILE LOAD=${rename}`, `BED_MESH_PROFILE SAVE=${renamed.trim()}`, `BED_MESH_PROFILE REMOVE=${rename}`]);
                setRename(null);
              }}
            >
              바꾸기
            </Button>
          </>
        }
      >
        <FormField label="새 이름"><Field ref={renameField} value={renamed} onChange={(event) => setRenamed(event.target.value)} /></FormField>
      </Dialog>
      <ConfirmDialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={`"${removing ?? ""}" 프로필을 삭제할까요?`}
        description="저장한 메시가 지워집니다. printer.cfg에 이미 저장된 값은 SAVE_CONFIG를 보내야 바뀝니다."
        confirmLabel="삭제"
        danger
        onConfirm={() => removing && send(`BED_MESH_PROFILE REMOVE=${removing}`)}
      />
    </>
  );
};
