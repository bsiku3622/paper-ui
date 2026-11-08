// What the top bar's search finds: every kind of thing the dashboard holds, in groups, with the words that matched marked. It looks
// in the whole workspace whatever the bar's scope is, because a search that hides what you asked for is the wrong kind of help.

import { useState, type ReactNode } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";

import { Box, Button, Divider, Inline, Link, Marker, Stack, Text } from "@studio-baeks/paper-ui";

import { DOCS, EmptyState, PageTitle, Panel, formatCount, useProjectName, useStore } from "./parts";

type Hit = { key: string; title: string; sub: string; to: string };
type Group = { id: string; title: string; hits: Hit[] };

const SHOWN = 5;
const TRY = ["route-optimizer", "SEC-1042", "production", "롤백", "김서연"];

// The matched words in a marker, the rest as it was.
const Highlight = ({ text, words }: { text: string; words: string }): ReactNode => {
  const at = words ? text.toLowerCase().indexOf(words) : -1;
  if (at < 0) return text;
  return <>{text.slice(0, at)}<Marker>{text.slice(at, at + words.length)}</Marker>{text.slice(at + words.length)}</>;
};

export const SearchScreen = () => {
  const [params] = useSearchParams();
  const { projects, resources, deployments, findings, alerts, members } = useStore();
  const nameOf = useProjectName();
  const [more, setMore] = useState<readonly string[]>([]);
  const q = (params.get("q") ?? "").trim();
  const words = q.toLowerCase();
  const has = (...fields: string[]) => fields.join(" ").toLowerCase().includes(words);

  const groups: Group[] = words ? [
    { id: "projects", title: "프로젝트", hits: projects.filter((project) => has(project.name, project.id, project.summary, project.owner)).map((project) => ({ key: project.id, title: project.name, sub: `${project.id} · ${project.region} 리전 · 담당 ${project.owner}`, to: `/demo/arcfield/projects/${project.id}` })) },
    { id: "resources", title: "자원", hits: resources.filter((resource) => has(resource.id, resource.kind, resource.spec, nameOf(resource.projectId))).map((resource) => ({ key: resource.id, title: resource.id, sub: `${resource.kind} · ${nameOf(resource.projectId)} · ${resource.env}`, to: `/demo/arcfield/projects?tab=resources&open=${resource.id}` })) },
    { id: "deploys", title: "배포", hits: [...deployments].reverse().filter((run) => has(run.message, run.service, run.version, run.commit, `#${run.no}`, run.author, run.trigger)).map((run) => ({ key: run.id, title: run.message, sub: `#${run.no} · ${run.service} ${run.version} · ${run.env} · ${run.status}`, to: `/demo/arcfield/deploy/${run.id}` })) },
    { id: "findings", title: "점검 항목", hits: findings.filter((finding) => has(finding.id, finding.title, finding.resource, finding.owner ?? "")).map((finding) => ({ key: finding.id, title: finding.title, sub: `${finding.id} · ${finding.resource} · ${finding.severity} · ${finding.state}`, to: `/demo/arcfield/security?finding=${finding.id}` })) },
    { id: "alerts", title: "알림", hits: alerts.filter((alert) => has(alert.id, alert.title, alert.service, alert.rule)).map((alert) => ({ key: alert.id, title: alert.title, sub: `${alert.id} · ${alert.service} · ${alert.state}`, to: `/demo/arcfield/monitoring?tab=alerts&alert=${alert.id}` })) },
    { id: "members", title: "멤버", hits: members.filter((person) => has(person.name, person.email, person.team, person.role)).map((person) => ({ key: person.name, title: person.name, sub: `${person.role} · ${person.team} · ${person.email}`, to: "/demo/arcfield/security?tab=access" })) },
    { id: "docs", title: "문서", hits: DOCS.filter((doc) => has(doc.title, doc.summary, doc.category, doc.keywords)).map((doc) => ({ key: doc.slug, title: doc.title, sub: `${doc.category} · ${doc.summary}`, to: `/demo/arcfield/docs/${doc.slug}` })) },
  ].filter((group) => group.hits.length > 0) : [];
  const total = groups.reduce((sum, group) => sum + group.hits.length, 0);

  const suggestions = (
    <Inline gap="xs" wrap>
      {TRY.map((word) => <Button key={word} as={RouterLink} to={`/demo/arcfield/search?q=${encodeURIComponent(word)}`} size="sm" shape="pill" variant="hairline">{word}</Button>)}
    </Inline>
  );

  return (
    <Stack gap="xl">
      <PageTitle title="검색" description={q ? (total ? `“${q}”에 맞는 결과 ${formatCount(total)}건. 위쪽 범위와 관계없이 작업 공간 전체에서 찾았습니다.` : `“${q}”에 맞는 결과가 없습니다.`) : "자원, 배포, 점검 항목, 알림, 멤버, 문서를 한꺼번에 찾습니다."} />
      {total === 0 ? (
        <Panel>
          <EmptyState title={q ? "맞는 결과가 없습니다" : "찾을 말을 입력해주세요"} action={suggestions}>{q ? "철자를 확인하거나 다른 낱말로 찾아보세요." : "위쪽 검색 칸에 입력하거나 아래 낱말로 시작해보세요."}</EmptyState>
        </Panel>
      ) : (
        <Stack gap="xl">
          {groups.map((group) => {
            const open = more.includes(group.id);
            const visible = open ? group.hits : group.hits.slice(0, SHOWN);
            return (
              <Panel key={group.id} title={`${group.title} ${group.hits.length}`}>
                <Stack as="ul" paddingX="xl" paddingY="sm">
                  {visible.map((hit, index) => (
                    <Box as="li" key={hit.key}>
                      {index > 0 ? <Divider aria-hidden /> : null}
                      <Stack gap="xs" paddingY="md">
                        <Link as={RouterLink} to={hit.to} underline="hover"><Highlight text={hit.title} words={words} /></Link>
                        <Text as="span" variant="label" strong={false} ink="tertiary" truncate><Highlight text={hit.sub} words={words} /></Text>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
                {group.hits.length > SHOWN ? (
                  <>
                    <Divider />
                    <Inline justify="center" paddingY="sm">
                      <Button size="sm" variant="ghost" onClick={() => setMore(open ? more.filter((id) => id !== group.id) : [...more, group.id])}>{open ? "접기" : `${group.hits.length - SHOWN}개 더 보기`}</Button>
                    </Inline>
                  </>
                ) : null}
              </Panel>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};
