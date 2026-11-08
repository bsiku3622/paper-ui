import { beforeEach, describe, expect, it } from "vitest";

import { APPS, appById, frameUrl, originOf, visibleApps } from "./apps";
import { kindOf, overridesOf, type Catalog, type Item, type Slot } from "./catalog";
import { hexOf, ROLES, stepByHex } from "./color-source";
import { lengthFrom, lengthParts } from "./controls";
import { directionsOf, mergeTokens, PAPER_LAB } from "./directions";
import { exportCode, exportJson, literal, partLines, providerCode } from "./export";
import { PAPER_SPECS, specOf } from "./parts";
import { allowedOrigin, envelope, isEnvelope, type PartSite } from "./protocol";
import { listen, registerFrame } from "./bridge";
import { sanitizeTokens } from "./sanitize";
import { changeCount, getStore, resetAll, setEdit, setLever, setPartProp, tokensOf, update } from "./store";
import { slotsOf } from "./Stage";

const slot = (root: Slot["root"], mode: Slot["mode"], path: string[], original: string): Slot => ({ id: [root, ...(mode ? [mode] : []), ...path].join("."), root, mode, path, original });
const catalogOf = (...slots: Slot[]): Catalog => ({ groups: [], items: [], slots: new Map(slots.map((one) => [one.id, { item: { key: one.id, kind: "text", slots: [one] } as unknown as Item, slot: one }])) });

describe("the bridge's envelope and origins", () => {
  it("accepts the two dev servers by name and by address, and the site's own origin, and nothing else", () => {
    for (const origin of ["http://localhost:5173", "http://localhost:5310", "http://127.0.0.1:5173", "http://127.0.0.1:5310", window.location.origin]) expect(allowedOrigin(origin), origin).toBe(true);
    for (const origin of ["http://localhost:5174", "https://localhost:5173", "http://evil.example", "http://localhost:5173.evil.example", "null"]) expect(allowedOrigin(origin), origin).toBe(false);
  });

  it("knows its own messages", () => {
    expect(isEnvelope(envelope({ kind: "escape" }))).toBe(true);
    expect(isEnvelope({ channel: "other", v: 1, kind: "escape" })).toBe(false);
    expect(isEnvelope({ channel: "paper-studio", v: 2, kind: "escape" })).toBe(false);
    expect(isEnvelope("paper-studio")).toBe(false);
    expect(isEnvelope(null)).toBe(false);
  });

  it("hears a frame only from its own window and the origin it was opened at", () => {
    const heard: string[] = [];
    const stop = listen((id, message) => heard.push(`${id}:${message.kind}`));
    const off = registerFrame({ id: "frame-9", window: () => window, origin: "http://localhost:5310", theme: () => "light" });
    const say = (origin: string, source: MessageEventSource | null) => window.dispatchEvent(new MessageEvent("message", { data: envelope({ kind: "escape" }), origin, source }));
    say("http://localhost:5310", window);
    say("http://localhost:5173", window);
    say("http://evil.example", window);
    say("http://localhost:5310", null);
    off();
    say("http://localhost:5310", window);
    stop();
    expect(heard).toEqual(["frame-9:escape"]);
  });
});

describe("the apps the studio offers", () => {
  it("lists apps, not their pages: Arcfield once, and the host's apps only on a dev server", () => {
    expect(visibleApps(true)).toHaveLength(APPS.length);
    expect(visibleApps(false).map((app) => [app.id, app.path])).toEqual([["arcfield", "/demo/arcfield"]]);
    expect(APPS.filter((app) => app.path.startsWith("/demo/arcfield"))).toHaveLength(1);
    expect(appById("rne")?.group).toBe("host");
  });

  it("opens a page as a studio frame, in the theme it comes up in, on the host's own port for the host's apps", () => {
    const here = { origin: "http://127.0.0.1:5173", protocol: "http:", hostname: "127.0.0.1" } as Location;
    expect(originOf(appById("admin")!, here)).toBe("http://127.0.0.1:5310");
    expect(originOf(appById("arcfield")!, here)).toBe("http://127.0.0.1:5173");
    expect(frameUrl(appById("admin")!, "/admin/users?page=2", "dark", "/", here)).toBe("http://127.0.0.1:5310/admin/users?page=2&studio=1&theme=dark");
    expect(frameUrl(appById("arcfield")!, "/demo/arcfield", "light", "/paper/", here)).toBe("http://127.0.0.1:5173/paper/demo/arcfield?studio=1&theme=light");
  });

  it("puts the frames side by side: the same page in both themes, or the three widths", () => {
    expect(slotsOf({ compare: "off", theme: "dark", width: 1024 })).toEqual([{ id: "frame-0", theme: "dark", width: 1024, name: "다크 · 1024" }]);
    expect(slotsOf({ compare: "theme", theme: "dark", width: 768 }).map((one) => [one.theme, one.width])).toEqual([["light", 768], ["dark", 768]]);
    expect(slotsOf({ compare: "width", theme: "light", width: 1440 }).map((one) => one.width)).toEqual([1024, 768, 390]);
  });
});

describe("the values the studio writes", () => {
  it("nests flat edits the way PaperProvider's props are written", () => {
    const catalog = catalogOf(
      slot("color", "light", ["bg", "canvas"], "#f9f9fb"),
      slot("shape", null, ["control", "height", "md"], "2.5rem"),
      slot("palette", null, ["neutral", "100"], "#f3f3f5"),
      slot("shadow", "dark", ["floating", "0"], "0px 8px 22px -5px"),
      slot("typography", null, ["palette", "fontSize", "12"], "0.75rem"),
      slot("opacity", null, ["disabled"], "0.5"),
    );
    expect(
      overridesOf({ "color.light.bg.canvas": "#ececee", "shape.control.height.md": "3rem", "palette.neutral.100": "#f0f0f2", "shadow.dark.floating.0": "0px 1px 2px 0px", "typography.palette.fontSize.12": "0.8rem", "opacity.disabled": "0.4", "color.light.gone": "#000000" }, catalog),
    ).toEqual({
      color: { light: { bg: { canvas: "#ececee" } } },
      shape: { control: { height: { md: "3rem" } } },
      palette: { neutral: { "100": "#f0f0f2" } },
      shadow: { dark: { floating: { "0": "0px 1px 2px 0px" } } },
      typography: { palette: { fontSize: { "12": "0.8rem" } } },
      opacity: { disabled: "0.4" },
    });
  });

  it("tells a colour, a shadow, a length, a number and a text apart", () => {
    expect([kindOf("#f9f9fb"), kindOf("#1111131a"), kindOf("0px 8px 24px 0px"), kindOf("0.75rem"), kindOf("-0.02em"), kindOf("450"), kindOf("Pretendard, sans-serif")]).toEqual(["color", "color", "shadow", "length", "length", "number", "text"]);
  });

  it("shows a length in px and writes it back in the unit it came in", () => {
    expect(lengthParts("0.75rem")).toEqual({ amount: 0.75, unit: "rem" });
    expect(lengthParts("clamp(1rem, 2vw, 3rem)")).toBeNull();
    expect(lengthFrom(12, "0.75rem")).toBe("0.75rem");
    expect(lengthFrom(40, "2.5rem")).toBe("2.5rem");
    expect(lengthFrom(1.5, "1px")).toBe("1.5px");
    expect(lengthFrom(-0.02, "0em")).toBe("-0.02em");
  });

  it("chooses colours from the palette's steps: a hex is a step, and a role has the step it selects", () => {
    expect(stepByHex(hexOf("neutral.100"))?.path).toBe("neutral.100");
    expect(stepByHex("#123456")).toBeUndefined();
    const canvas = ROLES.find((role) => role.path.join(".") === "bg.canvas");
    expect(canvas?.select.light).toBe("neutral.100");
    expect(canvas?.value.light).toBe(hexOf("neutral.100"));
    expect(ROLES.some((role) => role.path.join(".") === "interaction.bgHover.onSurface")).toBe(true);
  });

  it("keeps what a page does not declare out of the page, and everything when it has no stylesheet to ask", () => {
    const edits = { shape: { control: { height: { md: "3rem" } } } };
    expect(sanitizeTokens(edits)).toEqual(edits);
  });
});

describe("the directions", () => {
  it("writes each lever as the props of PaperProvider, from palette steps", () => {
    expect(directionsOf({})).toEqual({});
    const white = directionsOf({ canvas: "pure", lines: "alpha", round: true, accent: "blue", text: "up" });
    expect(white.color?.light).toMatchObject({ bg: { canvas: hexOf("neutral.0"), sunken: hexOf("neutral.100") }, border: { base: hexOf("alpha10.neutral.950") }, accent: { primary: { solid: hexOf("blue.600") } } });
    expect(white.color?.dark).toMatchObject({ bg: { canvas: hexOf("neutral.925") }, border: { base: hexOf("alpha10.neutral.0") } });
    expect(white.shape).toMatchObject({ radius: { surface: { lg: "28px" } } });
    expect(white.typography).toMatchObject({ palette: { fontSize: { "14": "0.9375rem" } } });
  });

  it("draws a card's edge as a line by turning its shadows into a ring in the colour of the one grey line", () => {
    const line = directionsOf({ edges: "line" });
    expect(line.shadow).toEqual({ light: { resting: { "0": "0px 0px 0px 1px" }, lifted: { "0": "0px 0px 0px 1px" } }, dark: { resting: { "0": "0px 0px 0px 1px" }, lifted: { "0": "0px 0px 0px 1px" } } });
    expect(line.color?.light).toEqual({ shadow: { resting: hexOf("alpha10.neutral.950"), lifted: hexOf("alpha10.neutral.950") } });
    expect(directionsOf({ edges: "shadow" })).toEqual({});
  });

  it("lets an edit win over a lever, and merges what they do not both name", () => {
    const merged = mergeTokens({ color: { light: { bg: { canvas: "#ffffff", sunken: "#f3f3f5" } } } }, { color: { light: { bg: { canvas: "#ececee" } } }, shape: { space: { md: "14px" } } });
    expect(merged).toEqual({ color: { light: { bg: { canvas: "#ececee", sunken: "#f3f3f5" } } }, shape: { space: { md: "14px" } } });
  });

  it("describes its levers, and each preset names only levers it has", () => {
    const keys = new Set(PAPER_LAB.levers.map((lever) => lever.key));
    for (const preset of PAPER_LAB.presets) for (const key of Object.keys(preset.values)) expect(keys.has(key), `${preset.id}.${key}`).toBe(true);
    expect(Object.keys(PAPER_LAB.defaults).sort()).toEqual([...keys].sort());
  });
});

describe("what leaves the studio", () => {
  const site: PartSite = { key: "pages/demo/Overview.tsx#Button:3", component: "Button", file: "pages/demo/Overview.tsx", line: 42, literals: { variant: "ghost" }, dynamic: [] };

  it("writes a tree as the object literal one pastes into code", () => {
    expect(literal({ light: { bg: { canvas: "#ececee" } }, "2xl": "32px" })).toBe('{\n  light: {\n    bg: {\n      canvas: "#ececee",\n    },\n  },\n  "2xl": "32px",\n}');
    expect(providerCode({})).toBe("");
    expect(providerCode({ shape: { radius: { pill: "999px" } } })).toContain("<PaperProvider\n  shape={{\n    radius: {");
  });

  it("writes a line for each prop set on a part: file:line — prop=value", () => {
    expect(partLines({ [site.key]: { variant: "solid", disabled: true, size: null } }, { [site.key]: site })).toEqual([
      "// Button",
      'pages/demo/Overview.tsx:42 — variant="solid"',
      "pages/demo/Overview.tsx:42 — disabled=true",
      "pages/demo/Overview.tsx:42 — size=(prop 빼기)",
    ]);
  });

  it("gathers levers, values and parts in one text, and the same as data", () => {
    const snapshot = { levers: { canvas: "pure" }, tokens: { shape: { space: { md: "14px" } } }, edits: { "shape.space.md": "14px" }, parts: { [site.key]: { variant: "solid" } }, sites: { [site.key]: site } };
    const code = exportCode(snapshot, ["바탕: 전부 흰색"]);
    expect(code).toContain("// 바탕: 전부 흰색");
    expect(code).toContain("md: \"14px\"");
    expect(code).toContain('pages/demo/Overview.tsx:42 — variant="solid"');
    expect(JSON.parse(exportJson(snapshot))).toMatchObject({ studio: 1, levers: { canvas: "pure" }, values: { "shape.space.md": "14px" }, parts: { [site.key]: { variant: "solid" } } });
  });
});

describe("the parts' props", () => {
  it("offers props Paper's own parts have, from the system's vocabulary", () => {
    expect(PAPER_SPECS.Button?.props.find((prop) => prop.key === "variant")?.options).toContain("hairline");
    expect(PAPER_SPECS.Stack?.props.find((prop) => prop.key === "gap")?.options).toContain("2xl");
    expect(specOf("Tabs")).toBeUndefined();
    expect(specOf("Tabs", { Tabs: { label: "탭", props: [] } })?.label).toBe("탭");
  });
});

describe("what the studio holds", () => {
  beforeEach(() => {
    resetAll();
    update({ frames: {} });
  });

  it("holds a lever, an edit and a prop, counts them, and lets go of all of them", () => {
    const site: PartSite = { key: "pages/demo/A.tsx#Text:1", component: "Text", file: "pages/demo/A.tsx", line: 7, literals: {}, dynamic: [] };
    setLever("canvas", "pure");
    setEdit("shape.space.md", "14px");
    setPartProp(site, "variant", "title");
    setPartProp(site, "ink", null);
    expect(getStore().parts[site.key]).toEqual({ variant: "title", ink: null });
    expect(getStore().sites[site.key]).toEqual(site);
    expect(changeCount(getStore())).toBe(4);
    setPartProp(site, "ink", undefined);
    setPartProp(site, "variant", undefined);
    expect(getStore().parts[site.key]).toBeUndefined();
    resetAll();
    expect(changeCount(getStore())).toBe(0);
  });

  it("derives the tokens a frame is sent from the edits, the same object while they are the same", () => {
    const edits = getStore().edits;
    expect(tokensOf(edits)).toBe(tokensOf(edits));
  });
});
