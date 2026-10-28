import { Select, type SelectProps } from "@studio-baeks/paper-ui";

import { boolControl, defineSpec, enumControl, flag, pending, pick, vocab } from "../schema";
import { narrow } from "./examples.css";

export default defineSpec({
  name: "Select",
  blurb: "native select anatomy를 Select.Option과 Select.Group으로 드러냅니다. Button·Field와 같은 사다리를 쓰고, option 안에는 native 계약에 맞게 텍스트만 둡니다.",
  controls: [
    enumControl<SelectProps, "size">("size", vocab("CONTROL_SIZES")),
    enumControl<SelectProps, "fontSize">("fontSize", pending(["label", "caption", "body"] as const, "S12", "CONTROL_FONT_SIZES")),
    enumControl<SelectProps, "shape">("shape", vocab("CONTROL_SHAPES")),
    boolControl<SelectProps, "disabled">("disabled"),
  ],
  defaults: { size: "md", shape: "rounded" },
  subject: (state) => (
    <Select
      size={pick<NonNullable<SelectProps["size"]>>(state, "size")}
      fontSize={pick<NonNullable<SelectProps["fontSize"]>>(state, "fontSize")}
      shape={pick<NonNullable<SelectProps["shape"]>>(state, "shape")}
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
