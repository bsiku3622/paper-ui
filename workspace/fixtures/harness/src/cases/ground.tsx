import { Button, Checkbox, Field, Radio, SegmentControl, Select, Slider, Surface, Textarea } from "@studio-baeks/paper-ui";

const Controls = ({ at }: { at: string }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: 16 }}>
    <Field aria-label={`field-${at}`} data-testid={`field-${at}`} />
    <Select aria-label={`select-${at}`} data-testid={`select-${at}`}><Select.Option value="a">A</Select.Option></Select>
    <Textarea aria-label={`textarea-${at}`} data-testid={`textarea-${at}`} rows={1} />
    <Checkbox aria-label={`checkbox-${at}`} data-testid={`checkbox-${at}`} />
    <Radio aria-label={`radio-${at}`} name={`radio-${at}`} data-testid={`radio-${at}`} />
  </div>
);

export const GroundCase = () => (
  <>
    <Controls at="page" />
    <Surface fill="canvas"><Controls at="canvas" /></Surface>
    <Surface fill="sunken"><Controls at="sunken" /></Surface>
    <Surface fill="raised" data-testid="raised">
      <Controls at="raised" />
      <Surface fill="canvas"><Controls at="nested" /></Surface>
    </Surface>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: 16 }}>
      <Field aria-label="hairline" variant="hairline" data-testid="field-hairline" />
      <Field aria-label="chosen" fill="sunken" data-testid="field-chosen" />
      <Field aria-label="no shadow" shadow={false} data-testid="field-no-shadow" />
      <Field aria-label="error" status="error" data-testid="field-error" />
      <Field aria-label="ghost" variant="ghost" fill="sunken" data-testid="field-ghost" />
      <Checkbox aria-label="checkbox error" status="error" data-testid="checkbox-error" />
      <Button data-testid="button-solid">저장</Button>
      <Button variant="hairline" data-testid="button-hairline">저장</Button>
    </div>
    <div style={{ display: "grid", gap: 16, padding: 16, width: 480 }}>
      <div>
        <SegmentControl aria-label="hug" defaultValue="b" data-testid="segment">
          <SegmentControl.Item value="a">하나</SegmentControl.Item>
          <SegmentControl.Item value="b">훨씬 긴 이름의 칸</SegmentControl.Item>
          <SegmentControl.Item value="c" disabled>셋</SegmentControl.Item>
        </SegmentControl>
      </div>
      <SegmentControl aria-label="full" defaultValue="y" fullWidth data-testid="segment-full">
        <SegmentControl.Item value="x">가</SegmentControl.Item>
        <SegmentControl.Item value="y">나다라마</SegmentControl.Item>
      </SegmentControl>
      <div style={{ width: "16rem" }}>
        <SegmentControl aria-label="full outline" variant="outline" shape="rounded" size="sm" defaultValue="c" fullWidth data-testid="segment-full-outline">
          <SegmentControl.Item value="a">가</SegmentControl.Item>
          <SegmentControl.Item value="b">나</SegmentControl.Item>
          <SegmentControl.Item value="c">다라마바사아</SegmentControl.Item>
          <SegmentControl.Item value="d">자</SegmentControl.Item>
        </SegmentControl>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <SegmentControl aria-label="outline" variant="outline" shape="rounded" defaultValue="y" data-testid="segment-outline">
          <SegmentControl.Item value="x">가</SegmentControl.Item>
          <SegmentControl.Item value="y">나다라마</SegmentControl.Item>
          <SegmentControl.Item value="z">바</SegmentControl.Item>
        </SegmentControl>
        <Field aria-label="beside the outline" data-testid="field-beside" />
      </div>
      <Slider aria-label="slider" defaultValue={25} data-testid="slider" />
      <Slider aria-label="slider-error" status="error" data-testid="slider-error" />
    </div>
  </>
);
