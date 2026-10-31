// The inventory tables: the names of the package, in the two orders, read from INVENTORY and PRIMITIVE_ORDERS.
import { INVENTORY, PRIMITIVE_ORDERS, type PrimitiveGroup } from "@studio-baeks/paper-ui";

import { FOUNDATIONS } from "../../site/site-core";

import type { GeneratedBlock } from "./markers";
import { codes, list, plain, table } from "./table";

const components = (group: PrimitiveGroup) => INVENTORY.primitives[group].components;
const hooks = (group: PrimitiveGroup) => INVENTORY.primitives[group].hooks;
const second = PRIMITIVE_ORDERS.second;
const functionsOf = (group: PrimitiveGroup): readonly string[] => (INVENTORY.primitives[group] as { functions?: readonly string[] }).functions ?? [];
const classFunctions = INVENTORY.classes.filter((name) => name.endsWith("Class"));
const classMaps = INVENTORY.classes.filter((name) => !name.endsWith("Class"));
const primitiveCount = (Object.keys(INVENTORY.primitives) as PrimitiveGroup[]).reduce((sum, group) => sum + components(group).length, 0);

type Format = (names: readonly string[]) => string;

// The Paint row names its class helpers too: the functions that build a class and the map the stylesheet keeps.
const extrasOf = (group: PrimitiveGroup, format: Format): string => {
  if (group === "A11y") return `함수 ${format(functionsOf(group))}`;
  if (group === "Paint") return `class 함수 ${format(classFunctions)}, class 지도 ${format(classMaps)}`;
  return "";
};

const agentsRows = (): string[][] => {
  const row = (group: string, order: string) => {
    const names = components(group as PrimitiveGroup);
    return [`${group} (${order})`, String(names.length), [list(names), extrasOf(group as PrimitiveGroup, list)].filter(Boolean).join(" — ")];
  };
  return [
    ...PRIMITIVE_ORDERS.first.map((group) => row(group, "1차")),
    ...second.map((group) => row(group, "2차")),
    ["Provider", String(INVENTORY.utilities.Theme.length), `${list(INVENTORY.utilities.Theme)} — 테마 엔진의 entry이고 문서당 저장소 하나에 붙습니다. \`locale\` · \`messages\`로 언어도 정합니다. 첫 화면 전에 모드를 정하는 \`themeBootScript\`는 \`/theme-boot\`에서 나갑니다`],
    ["Atoms", String(INVENTORY.atoms.length), list(INVENTORY.atoms)],
  ];
};

// The primitive table of docs/primitives/README.md: where each group lives, its order, its names and its doc.
const hooksOf = (group: PrimitiveGroup): string => {
  const hookNames = hooks(group).length > 0 ? plain(hooks(group)) : "—";
  const extra = extrasOf(group, plain);
  return extra && group === "Paint" ? `— (${extra})` : group === "A11y" ? `${hookNames} (${extra})` : hookNames;
};
const docLink = (group: string) => `[${group}](${group.toLowerCase()}.md)`;
const primitiveRows = (): string[][] => [
  ...PRIMITIVE_ORDERS.first.map((group) => [group, "1차", plain(components(group as PrimitiveGroup)), hooksOf(group as PrimitiveGroup), docLink(group)]),
  ...second.map((group) => [group, "2차", plain(components(group as PrimitiveGroup)), hooksOf(group as PrimitiveGroup), docLink(group)]),
];

// "열한": the number of groups, as the docs write a count before a noun.
const KOREAN_COUNT = ["", "한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열", "열한", "열두"];
const countSentence = () => {
  const groups = Object.keys(INVENTORY.primitives).length;
  return `\`Draggable.Handle\`은 Draggable의 anatomy라 따로 세지 않고, 합성 도구와 ${codes(functionsOf("A11y"))}는 컴포넌트가 아니라서 위 ${KOREAN_COUNT[groups] ?? groups} 분류 밖에 따로 둡니다. 합계 ${primitiveCount}개입니다.`;
};

export const INVENTORY_BLOCKS: GeneratedBlock[] = [
  {
    id: "inventory.agents",
    files: ["AGENTS.md"],
    render: () =>
      table(["계층", "수", ""], agentsRows()),
  },
  {
    id: "inventory.primitives",
    files: ["docs/primitives/README.md"],
    render: () =>
      [
        table(["분류", "차수", "컴포넌트", "Hook", "문서"], [
          ...primitiveRows(),
          ["합성 도구 (분류 밖)", "—", "—", plain(INVENTORY.utilities.Composition), "[합성 도구](#합성-도구)"],
        ]),
        "",
        countSentence(),
      ].join("\n"),
  },
  {
    id: "polymorphic",
    files: ["docs/primitives/README.md"],
    inline: true,
    render: () => `${plain(INVENTORY.polymorphic)}입니다. native props와 ref는 같은 요소로 전달합니다.`,
  },
  {
    id: "inventory.en",
    files: ["README.md"],
    render: () =>
      table(["Part", "Count", "Exports"], [
        ["Foundations", `${FOUNDATIONS.length} systems`, `\`${FOUNDATIONS.map(({ label }) => label).join(" → ")}\` — each reads only the ones before it`],
        ...PRIMITIVE_ORDERS.first.map((group, index) => [index === 0 ? "Primitives, first order" : "", `${group} ${components(group as PrimitiveGroup).length}`, list(components(group as PrimitiveGroup))]),
        ...second.map((group, index) => [index === 0 ? "Primitives, second order" : "", `${group} ${components(group as PrimitiveGroup).length}`, list(components(group as PrimitiveGroup))]),
        ["Atoms", String(INVENTORY.atoms.length), list(INVENTORY.atoms)],
      ]),
  },
  {
    id: "inventory.package",
    files: ["workspace/packages/paper-ui/README.md"],
    render: () =>
      table(["", "Exports"], [
        ["Primitives, first order", `${list(PRIMITIVE_ORDERS.first.flatMap((group) => components(group as PrimitiveGroup)))} (and ${list(functionsOf("A11y"))})`],
        ["Primitives, second order", list(second.flatMap((group) => components(group as PrimitiveGroup)))],
        ["Atoms", list(INVENTORY.atoms)],
        ["`/tokens`", "`tokens`, and the vocabulary: one constant and one type for each axis (`ACCENTS` · `Accent`, `VARIANTS` · `Variant`, `SPACES` · `Space` …)"],
      ]),
  },
];
