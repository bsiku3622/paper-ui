// Tokens(Foundations) — 시스템의 값을 눈으로 보는 자리 (/playground/tokens).
//
// 손으로 쓴 값 표가 아니라 tokens.* 를 *실시간으로* 읽어 그린다 — 토큰을 바꾸면
// 뷰어가 그대로 따라오므로 정의상 드리프트가 없다. 표시값(hex·rem)은 :root 의
// CSS var 를 런타임에 resolve 한다 (raw 값 모듈을 import 하지 않는다).

import { useState } from "react";

import { Box, Divider, Inline, Stack, Text, tokens, useResolvedTheme } from "@studio-baeks/paper-ui";

import { PlaygroundLayout, Crumb } from "./shell";

// ── 값 resolve ────────────────────────────────────────────────────────────────
// 토큰은 "var(--pui-…)" 참조다. 그 var 의 실제 값을 :root 에서 읽어온다. rem 은
// px 를 곁들여 읽기 쉽게. (motion 은 var 가 아니라 값이라 그대로 통과.)
const withPx = (v: string) => {
  const m = /^(-?[\d.]+)rem$/.exec(v);
  return m ? `${v} · ${Math.round(parseFloat(m[1] ?? "0") * 16 * 100) / 100}px` : v;
};
const val = (ref: string): string => {
  if (typeof ref !== "string" || !ref.startsWith("var(")) return withPx(ref);
  const name = (ref.slice(4, -1).split(",")[0] ?? "").trim();
  const resolved = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return withPx(resolved || ref);
};

// ── 어휘 (public API 는 tokens 만 노출 — 키 배열은 여기서 편다) ──────────────
const PAPERS = ["canvas", "raised", "sunken", "well"] as const;
const INTERACTIONS = ["hover", "selected", "active"] as const;
const INKS = ["base", "soft", "faint"] as const;
const BORDERS = ["base", "strong"] as const;
const PRIMARIES = ["base", "hover", "fg"] as const;
const ACCENTS = ["info", "success", "warning", "error"] as const;
const TONES = ["solid", "solidFg", "ink", "wash", "edge"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const CONTROLS = ["sm", "md", "lg"] as const;
const VARIANTS = ["display", "title", "heading", "subheading", "body", "caption", "label"] as const;
const WEIGHTS = ["normal", "medium", "semibold", "bold"] as const;
const DURATIONS = ["instant", "fast", "base", "moderate", "slow"] as const;
const EASINGS = ["standard", "decelerate", "accelerate", "overshoot"] as const;

// ── 배치 헬퍼 ─────────────────────────────────────────────────────────────────
const Section = ({ id, title, desc, children }: { id: string; title: string; desc?: string; children: React.ReactNode }) => (
  <Stack as="section" gap="lg" id={id}>
    <Stack gap="xs">
      <Text variant="label">{title}</Text>
      {desc && <Text variant="caption" ink="soft">{desc}</Text>}
    </Stack>
    {children}
  </Stack>
);

// 색 한 칸 — 면 + 이름 + resolve 된 값. border.strong 외곽선으로 옅은 면도 경계가 보인다.
const Swatch = ({ name, token, w = "7.5rem" }: { name: string; token: string; w?: string }) => (
  <Stack gap="xs" style={{ width: w }}>
    <Box style={{ height: "2.75rem", borderRadius: tokens.shape.radius.interaction, background: token, border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.strong}` }} />
    <Text variant="caption" as="span">{name}</Text>
    <Text variant="caption" family="mono" ink="faint" as="span">{val(token)}</Text>
  </Stack>
);

export const Tokens = () => {
  const [hover, setHover] = useState(false);
  // 표시값은 렌더 중 :root 의 var 를 읽어 만든다(val). 그래서 테마가 바뀌면 이
  // 컴포넌트가 **다시 렌더돼야** 값이 따라온다 — 구독하지 않으면 스코프만 바뀌고
  // 숫자는 옛 테마에 머물러, 밝은 화면에 다크 값이 적힌 표가 남는다.
  useResolvedTheme();

  return (
    <PlaygroundLayout active="tokens">
      <Stack gap="xs" style={{ marginBottom: tokens.shape.gap.lg }}>
        <Crumb group="Reference" name="Foundations" />
        <Text variant="title">Tokens</Text>
        <Text variant="caption" ink="soft">
          모든 색·크기·시간의 정본. tokens.* 를 실시간으로 읽어 그린다 — 값이 바뀌면 이 화면이 따라온다.
        </Text>
      </Stack>

      <Stack gap="xl">
        {/* ── Color · 흰과 검정 ─────────────────────────────── */}
        <Section id="tok-neutral" title="Color · surface (면 깊이) · ink · border · primary" desc="surface 는 Box 의 깊이 축(색 아님) — raised(최명)·canvas(기준면)·sunken·well. 토큰은 color.paper.*. 다크는 YouTube·ChatGPT 결의 깊은 중립 base. ⚠ **다크 사다리는 라이트의 거울이다 — 순서가 반대다.** 각 테마에는 목표가 있고 raised 가 거기 가장 가깝다: 라이트는 WHITE|raised|canvas|sunken|well|GRAY, 다크는 BLACK|raised|canvas|sunken|well|GRAY. 그래서 **다크에서는 raised 가 최암, well 이 최명**이다. 간격은 canvas 를 축으로 라이트를 접은 값이라 쌍의 거리가 양 테마에서 거의 같다(canvas↔raised 1.019 vs 1.026). primary(검정 일꾼, 면 채우는 유일한 색)·ink(마크)·border·focus·scrim 은 잉크·경계·오버레이. 값은 현재 테마로 표시된다.">
          <Inline gap="lg" wrap>
            {PAPERS.map((s) => <Swatch key={`p-${s}`} name={`surface.${s}`} token={tokens.color.paper[s]} />)}
            {INKS.map((s) => <Swatch key={`i-${s}`} name={`ink.${s}`} token={tokens.color.ink[s]} />)}
            {BORDERS.map((s) => <Swatch key={`b-${s}`} name={`border.${s}`} token={tokens.color.border[s]} />)}
            {PRIMARIES.map((s) => <Swatch key={`pr-${s}`} name={`primary.${s}`} token={tokens.color.primary[s]} />)}
            <Swatch name="focus.ring" token={tokens.color.focus.ring} />
            <Swatch name="scrim" token={tokens.color.scrim} />
          </Inline>
        </Section>

        <Divider />

        {/* ── Color · interaction (오버레이) ──────────────────── */}
        <Section id="tok-interaction" title="Color · interaction (오버레이)" desc="hover·selected·active 는 solid 회색이 아니라 ink 계열 alpha 틴트. 아래 순백 위에 얹혀 면을 조금 어둡게 만든다 — 어느 면(순백·smoke·well) 위든 같은 규칙이라 자리마다 회색을 새로 고르지 않는다. 다크는 흰빛으로 뒤집혀 밝히는데, **hover 의 alpha 만 라이트보다 작다**(.036 vs .05) — 같은 alpha 가 방향에 따라 다른 크기이기 때문이다. 블렌드는 sRGB 8bit 에서 일어나고 밝기 곡선은 검정 근처에서 가파르다: 예전 다크 값 .055 는 지각적으로 라이트의 1.9 배였고, hover 하나가 면 사다리 세 칸을 건너뛰어 Tabs 트랙 위에서 hover 된 비활성 탭이 활성 pill 을 따라잡았다. alpha 가 아니라 ΔL 로 맞춘다. selected·active 는 라이트가 이미 세서(.13·.16) 그대로 둔다.">
          <Inline gap="lg" wrap>
            {INTERACTIONS.map((s) => (
              <Stack key={`ix-${s}`} gap="xs" style={{ width: "7.5rem" }}>
                <Box style={{ height: "2.75rem", borderRadius: tokens.shape.radius.interaction, background: tokens.color.paper.raised, border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.strong}`, overflow: "hidden" }}>
                  <Box style={{ width: "100%", height: "100%", background: tokens.color.interaction[s] }} />
                </Box>
                <Text variant="caption" as="span">{s}</Text>
                <Text variant="caption" family="mono" ink="faint" as="span">{val(tokens.color.interaction[s])}</Text>
              </Stack>
            ))}
          </Inline>
        </Section>

        <Divider />

        {/* ── Color · accent ─────────────────────────────────── */}
        <Section id="tok-accent" title="Color · accent (4색 × 5자리)" desc="이름이 곧 의미 — info · success · warning · error (hue 이름 없음). solid 채운 면 · solidFg solid 위 글자(대비쌍 — 밝은 배경은 어두운 잉크) · ink 흰 배경 위 글자(AA) · wash 옅은 면 · edge wash 괘선.">
          <Stack gap="lg">
            {ACCENTS.map((a) => (
              <Inline key={a} gap="lg" align="center" wrap>
                <Box style={{ width: "3.5rem" }}>
                  <Text variant="subheading" as="span" className={`pui-${a}-ink`}>{a}</Text>
                </Box>
                {TONES.map((t) => <Swatch key={`${a}-${t}`} name={t} token={tokens.color.accent[a][t]} w="6.5rem" />)}
              </Inline>
            ))}
          </Stack>
        </Section>

        <Divider />

        {/* ── Type ───────────────────────────────────────────── */}
        <Section id="tok-type" title="Type · variant (7단) × family" desc="variant 가 size·weight·leading·tracking 을, family(sans·mono)가 서체를 정한다.">
          <Stack gap="sm">
            {VARIANTS.map((v) => (
              <Inline key={v} gap="lg" align="baseline">
                <Box style={{ width: "6rem" }}><Text variant="caption" as="span">{v}</Text></Box>
                <Text variant={v} as="span">Ag 다람쥐 0123</Text>
                <Text variant="caption" family="mono" ink="faint" as="span">{val(tokens.text.size[v])}</Text>
              </Inline>
            ))}
          </Stack>
          <Divider />
          <Inline gap="xl" wrap>
            {WEIGHTS.map((w) => (
              <Stack key={w} gap="xs" style={{ width: "8rem" }}>
                <Text variant="heading" as="span" style={{ fontWeight: tokens.text.weight[w] }}>Ag 무게</Text>
                <Text variant="caption" as="span">{w}</Text>
                <Text variant="caption" family="mono" ink="faint" as="span">{val(tokens.text.weight[w])}</Text>
              </Stack>
            ))}
          </Inline>
          <Inline gap="xl" wrap>
            <Stack gap="xs">
              <Text variant="heading" as="span">Ag 다람쥐 0123</Text>
              <Text variant="caption" as="span">family — sans (기본)</Text>
            </Stack>
            <Stack gap="xs">
              <Text variant="heading" family="mono" as="span">Ag 다람쥐 0123</Text>
              <Text variant="caption" as="span">family — mono (한글도 등폭)</Text>
            </Stack>
          </Inline>
        </Section>

        <Divider />

        {/* ── Space · gap ────────────────────────────────────── */}
        <Section id="tok-space" title="Space · gap (5단, 4px 그리드)" desc="flex/grid 간격. 촘촘하게 — 복잡한 화면은 여백이 넓으면 스크롤만 는다.">
          <Stack gap="sm">
            {SIZES.map((s) => (
              <Inline key={s} gap="lg" align="center">
                <Box style={{ width: "4rem" }}><Text variant="caption" as="span">{s}</Text></Box>
                <Box style={{ height: "0.75rem", width: tokens.shape.gap[s], background: tokens.color.ink.base, borderRadius: tokens.shape.constants.borderWidth }} />
                <Text variant="caption" family="mono" ink="faint" as="span">{val(tokens.shape.gap[s])}</Text>
              </Inline>
            ))}
          </Stack>
        </Section>

        <Divider />

        {/* ── Radius ─────────────────────────────────────────── */}
        <Section id="tok-radius" title="Radius" desc="절제된 곡선 — 모서리의 날만 죽인다. interaction 은 단일 6, layout 은 큰 면일수록 한 호흡 더(6·8·12).">
          <Inline gap="lg" wrap>
            {[
              { name: "interaction", token: tokens.shape.radius.interaction },
              { name: "layout.sm", token: tokens.shape.radius.layout.sm },
              { name: "layout.md", token: tokens.shape.radius.layout.md },
              { name: "layout.lg", token: tokens.shape.radius.layout.lg },
              { name: "pill", token: tokens.shape.constants.pillRadius },
            ].map((r) => (
              <Stack key={r.name} gap="xs" style={{ width: "7rem" }}>
                <Box style={{ height: "3.5rem", borderRadius: r.token, background: tokens.color.paper.sunken, border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.strong}` }} />
                <Text variant="caption" as="span">{r.name}</Text>
                <Text variant="caption" family="mono" ink="faint" as="span">{val(r.token)}</Text>
              </Stack>
            ))}
          </Inline>
        </Section>

        <Divider />

        {/* ── Control size ───────────────────────────────────── */}
        <Section id="tok-control" title="Control size (3단)" desc="Button·Field·Select·Tabs 의 size. height 와 가로 여백만 세 단으로 움직이고 글자는 14 로 고정. 라벨이 14 고정이라 세로 여백은 height 가 정해 버리므로(8·10·13) 가로(controlPaddingX 10·13·17)와 함께 잡는다 — sm 높이가 30 인 것도 세로 8 을 만들기 위해서다.">
          <Inline gap="lg" align="end" wrap>
            {CONTROLS.map((c) => (
              <Stack key={c} gap="xs" align="start">
                <Box style={{ height: tokens.shape.height[c].interaction, paddingInline: tokens.shape.controlPaddingX[c], borderRadius: tokens.shape.radius.interaction, background: tokens.color.paper.sunken, border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.strong}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <Text variant="body" as="span" style={{ fontSize: tokens.shape.controlFontSize[c] }}>텍스트</Text>
                </Box>
                <Text variant="caption" family="mono" ink="faint" as="span">{c} · h {val(tokens.shape.height[c].interaction)}</Text>
                <Text variant="caption" family="mono" ink="faint" as="span">px {val(tokens.shape.controlPaddingX[c])}</Text>
              </Stack>
            ))}
          </Inline>
        </Section>

        <Divider />

        {/* ── Shadow ─────────────────────────────────────────── */}
        <Section id="tok-shadow" title="Shadow (2단 — 떠 있는 것의 표식)" desc="원칙 4: 떠 있는 것만 그림자를 갖는다. 붙은 면(Button·Field·Card·Table)은 그림자 없음(prop 생략). overlay=자유롭게 뜬 것 · overlayMinimal=아주 살짝. radius 와 나란한 shape 토큰일 뿐 별도 'elevation' 축 아님. 다크에선 near-black 이 사라지므로 더 짙은 그림자로 교체(테마 인식) — 다크 토글로 확인.">
          <Inline gap="xl" wrap>
            {[
              { name: "overlay", desc: "Modal · Tooltip · Popover · 목업", token: tokens.shape.shadow.overlay },
              { name: "overlayMinimal", desc: "Switch 손잡이 — 살짝", token: tokens.shape.shadow.overlayMinimal },
            ].map((e) => (
              <Stack key={e.name} gap="sm" style={{ width: "13rem" }}>
                <Box style={{ height: "4rem", borderRadius: tokens.shape.radius.layout.md, background: tokens.color.paper.raised, boxShadow: e.token, border: `${tokens.shape.constants.borderWidth} solid ${tokens.color.border.base}` }} />
                <Stack gap="xs">
                  <Text variant="caption" as="span">{e.name}</Text>
                  <Text variant="caption" ink="faint" as="span">{e.desc}</Text>
                </Stack>
              </Stack>
            ))}
          </Inline>
        </Section>

        <Divider />

        {/* ── Motion ─────────────────────────────────────────── */}
        <Section id="tok-motion" title="Motion · duration · easing" desc="조용한 밀도의 시스템 — 짧고 차분하게(80~200ms). var 로 굽지 않고 값을 직접 든다.">
          <Inline gap="xl" wrap>
            {DURATIONS.map((d) => (
              <Stack key={d} gap="xs" style={{ width: "6.5rem" }}>
                <Text variant="body" as="span">{d}</Text>
                <Text variant="caption" family="mono" ink="faint" as="span">{val(tokens.motion.duration[d])}</Text>
              </Stack>
            ))}
          </Inline>
          <Inline gap="xl" wrap>
            {EASINGS.map((e) => (
              <Stack key={e} gap="xs" style={{ width: "13rem" }}>
                <Text variant="body" as="span">{e}</Text>
                <Text variant="caption" family="mono" ink="faint" as="span">{val(tokens.motion.easing[e])}</Text>
              </Stack>
            ))}
          </Inline>
          <Box
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              width: "16rem", height: "3rem", borderRadius: tokens.shape.radius.interaction,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: hover ? tokens.color.ink.base : tokens.color.paper.well,
              color: hover ? tokens.color.paper.canvas : tokens.color.ink.base,
              transition: `background ${tokens.motion.duration.base} ${tokens.motion.easing.standard}, color ${tokens.motion.duration.base} ${tokens.motion.easing.standard}`,
              cursor: "default",
            }}
          >
            <Text variant="caption" as="span" style={{ color: "inherit" }}>hover — state 전이 130ms</Text>
          </Box>
        </Section>
      </Stack>
    </PlaygroundLayout>
  );
};
