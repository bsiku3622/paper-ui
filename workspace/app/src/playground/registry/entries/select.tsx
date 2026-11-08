import { Select, type SelectProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pick, vocab } from "../schema";
import { narrow } from "./examples.css";

export default defineSpec({
  name: "Select",
  blurb: "native select anatomy를 Select.Option과 Select.Group으로 드러냅니다. Button·Field와 같은 사다리와 status·variant·fill 축을 쓰고, 면을 고르지 않으면 Field처럼 흰 면에 회색 선 한 줄로 서며, option 안에는 native 계약에 맞게 텍스트만 둡니다.",
  controls: [
    enumControl<SelectProps, "status">("status", vocab("STATUSES")),
    enumControl<SelectProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<SelectProps, "fontSize">("fontSize", vocab("CONTROL_FONT_SIZES")),
    enumControl<SelectProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    enumControl<SelectProps, "variant">("variant", vocab("INPUT_VARIANTS")),
    enumControl<SelectProps, "fill">("fill", vocab("SURFACE_FILLS")),
    boolControl<SelectProps, "shadow">("shadow"),
    boolControl<SelectProps, "disabled">("disabled"),
  ],
  defaults: { size: "md", shape: "rounded", variant: "hairline" },
  sheet: { matrix: { rows: "fill", columns: "variant" }, strips: [{ key: "shape" }, { key: "size" }, { key: "status" }] },
  subject: (state) => (
    <Select
      status={pick<NonNullable<SelectProps["status"]>>(state, "status")}
      size={pick<NonNullable<SelectProps["size"]>>(state, "size")}
      fontSize={pick<NonNullable<SelectProps["fontSize"]>>(state, "fontSize")}
      shape={pick<NonNullable<SelectProps["shape"]>>(state, "shape")}
      variant={pick<NonNullable<SelectProps["variant"]>>(state, "variant")}
      fill={pick<NonNullable<SelectProps["fill"]>>(state, "fill")}
      shadow={flag(state, "shadow")}
      disabled={flag(state, "disabled")}
    >
      <Select.Option value="a">옵션 A</Select.Option>
      <Select.Group label="추가 옵션">
        <Select.Option value="b">옵션 B</Select.Option>
        <Select.Option value="c">옵션 C</Select.Option>
      </Select.Group>
    </Select>
  ),
  Stage: ({ subject }) => <div className={narrow}>{subject}</div>,
});
