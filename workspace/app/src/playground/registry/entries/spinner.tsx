import { Spinner, type SpinnerProps } from "@studio-baeks/paper-ui";
import { CONTROL_SIZES } from "@studio-baeks/paper-ui/tokens";

import { boolControl, defineSpec, enumControl, flag, local, pick, textControl, words } from "../schema";

export default defineSpec({
  name: "Spinner",
  blurb: "진행 중 표시입니다. 옅은 링에 한 조각만 진해 회전으로 읽힙니다. 주기는 motion 토큰이 정하고, 혼자 서면 label이 접근성 이름인 progressbar이며 컨트롤 안에서는 decorative로 장식이 됩니다. inline은 글줄 안에서 글자만큼, ink inherit은 둘러싼 글자색을 따라 돕니다.",
  controls: [
    enumControl<SpinnerProps, "size">("size", local<SpinnerProps, "size">()([...CONTROL_SIZES, "inline"], "the control size ladder, and inline, the size of the line of text the ring sits in")),
    enumControl<SpinnerProps, "ink">("ink", local<SpinnerProps, "ink">()(["inherit"], "the one ink a spinner takes beyond its own: the colour of the text around it")),
    boolControl<SpinnerProps, "decorative">("decorative"),
    textControl<SpinnerProps, "label">("label", ""),
  ],
  defaults: { size: "md" },
  subject: (state) => (
    <Spinner
      size={pick<NonNullable<SpinnerProps["size"]>>(state, "size")}
      ink={pick<NonNullable<SpinnerProps["ink"]>>(state, "ink")}
      decorative={flag(state, "decorative")}
      label={words(state, "label") || undefined}
    />
  ),
});
