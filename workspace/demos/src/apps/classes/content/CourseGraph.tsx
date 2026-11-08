import { useMemo, useState } from "react";

import { Box, Stack, Text } from "@studio-baeks/paper-ui";

import { TIER_LABEL, type Course, type Prereq } from "../data/catalog";
import { edge as edgeClass, edgeActive, graphSvg, lane as laneClass, laneLabel, nodeBox, nodeBoxSelected, nodeGroup } from "./CourseGraph.css";
import { layoutFullGraph, layoutGraph, NODE_HEIGHT, NODE_WIDTH, outsidePrereqs, prereqLine, type FullGraph, type Graph } from "../lib/graph";

export const ALL_DEPARTMENTS = "__all__";

type Props = {
  courses: readonly Course[];
  prerequisites: readonly Prereq[];
  departments: readonly string[];
  department: string;
  focused: string | null;
  onFocus: (name: string | null) => void;
};

export const CourseGraph = ({ courses, prerequisites, departments, department, focused, onFocus }: Props) => {
  const all = department === ALL_DEPARTMENTS;
  const [selected, setSelected] = useState<string | null>(null);

  const graph = useMemo<FullGraph | Graph | null>(() => {
    if (all) return layoutFullGraph(courses, prerequisites, departments);
    const scoped = courses.filter((course) => course.department === department);
    return scoped.length ? layoutGraph(scoped, prerequisites) : null;
  }, [all, courses, prerequisites, departments, department]);

  const outside = useMemo(() => (all ? new Map<string, Prereq[]>() : outsidePrereqs(courses.filter((course) => course.department === department), prerequisites)), [all, courses, prerequisites, department]);
  const related = useMemo(() => {
    if (!selected) return null;
    const set = new Set<string>([selected]);
    for (const edge of prerequisites) {
      if (edge.before === selected) set.add(edge.after);
      if (edge.after === selected) set.add(edge.before);
    }
    return set;
  }, [selected, prerequisites]);

  if (!graph) return null;
  const lanes = "lanes" in graph ? graph.lanes : [];
  const pad = 8;

  return (
    <Box overflowX="auto" paddingY="xs">
      <svg
        width={graph.width + pad * 2}
        height={graph.height + pad * 2}
        viewBox={`${-pad} ${-pad} ${graph.width + pad * 2} ${graph.height + pad * 2}`}
        className={graphSvg}
        role="group"
        aria-label={all ? "전체 교육과정 선수 관계도" : `${department} 교육과정 선수 관계도`}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setSelected(null);
            onFocus(null);
          }
        }}
      >
        {lanes.map((lane) => (
          <g key={lane.department}>
            <rect x={-pad} y={lane.y - 6} width={graph.width + pad * 2} height={lane.height + 12} rx={12} className={laneClass} />
            <text x={0} y={lane.y - 10} className={laneLabel}>
              {lane.department}
            </text>
          </g>
        ))}

        {graph.edges.map((edge) => {
          const linked = selected !== null && (edge.before === selected || edge.after === selected);
          const faded = selected !== null && !linked;
          const touched = focused !== null && (edge.before === focused || edge.after === focused);
          return (
            <path
              key={`${edge.before}→${edge.after}`}
              d={edge.path}
              strokeDasharray={edge.alternative ? "5 4" : undefined}
              opacity={faded ? 0.25 : 1}
              className={linked || touched ? `${edgeClass} ${edgeActive}` : edgeClass}
            />
          );
        })}

        {graph.nodes.map((node) => {
          const isSelected = node.name === selected;
          const faded = related !== null && !related.has(node.name);
          const needs = outside.get(node.name);
          const sub = needs ? `선수 ${prereqLine(needs)}` : `${node.course.credits}학점 · ${TIER_LABEL[node.course.tier]}${node.course.pf ? " · P/F" : ""}${all ? "" : node.course.department !== department ? ` · ${node.course.department}` : ""}`;
          const press = () => {
            const next = isSelected ? null : node.name;
            setSelected(next);
            onFocus(next);
          };
          return (
            <g
              key={node.name}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${node.course.name}, ${sub}`}
              opacity={faded ? 0.3 : 1}
              className={nodeGroup}
              onClick={press}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  press();
                }
              }}
              onMouseEnter={() => onFocus(node.name)}
              onMouseLeave={() => onFocus(selected)}
              onFocus={() => onFocus(node.name)}
            >
              <rect
                x={node.x}
                y={node.y}
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={10}
                className={isSelected ? `${nodeBox} ${nodeBoxSelected}` : nodeBox}
              />
              <foreignObject x={node.x} y={node.y} width={NODE_WIDTH} height={NODE_HEIGHT}>
                <Stack height="full" justify="center" gap="xs" paddingX="sm" minWidth={0}>
                  <Text as="div" variant="label" truncate>{node.course.name}</Text>
                  <Text as="div" variant="label" strong={false} ink={needs ? "warning" : "tertiary"} truncate>{sub}</Text>
                </Stack>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};
