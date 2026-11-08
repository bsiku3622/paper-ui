import { useEffect, useRef, useState } from "react";

import { Button, Field, FormField, Inline, Spinner, Stack, Text } from "@studio-baeks/paper-ui";

import { Glyph, Meter, Segmented } from "../../../../kit";
import { termLabel, TERMS, type TermKey } from "../../data/build";
import { Dialog, Eyebrow, Hint, Notice } from "../../ui/parts";

export const SYNC_STEPS = [
  "KEIS에 연결하는 중",
  "과목 목록을 받는 중",
  "분반과 시간을 읽는 중",
  "수강생 명단을 맞추는 중",
  "직전 스냅샷을 남기는 중",
  "학기 데이터를 교체하는 중",
  "회차를 기록하는 중",
] as const;
export const STEP_MS = 850;

const FIRST_YEAR = 2023;
const LAST_YEAR = 2027;
export const knownTerm = (term: TermKey) => TERMS.some((item) => termLabel(item) === termLabel(term)) || (term.year >= FIRST_YEAR && term.year <= LAST_YEAR);

type Phase = { kind: "pick" } | { kind: "run"; step: number } | { kind: "fail"; message: string };

export type SyncStart = { state: "pick" | "run" | "fail"; step: number };

export const SyncDialog = ({ open, onClose, onFinish, start }: { open: boolean; onClose: () => void; onFinish: (term: TermKey) => void; start: SyncStart }) => {
  const [phase, setPhase] = useState<Phase>(() =>
    start.state === "run" ? { kind: "run", step: Math.min(Math.max(0, start.step), SYNC_STEPS.length - 1) } : start.state === "fail" ? { kind: "fail", message: "KEIS에서 2031-1 학기를 찾지 못했습니다. 학기를 다시 확인해 주세요." } : { kind: "pick" },
  );
  const [choice, setChoice] = useState<string>(termLabel(TERMS[0]!));
  const [year, setYear] = useState("2027");
  const [semester, setSemester] = useState<1 | 2>(1);

  const typed = Number(year);
  const valid = choice !== "new" || (Number.isInteger(typed) && typed >= 2000 && typed <= 2100);
  const target: TermKey | null = choice === "new" ? (valid ? { year: typed, semester } : null) : (TERMS.find((item) => termLabel(item) === choice) ?? null);
  const label = target ? termLabel(target) : "";
  const known = target ? knownTerm(target) : false;

  const latest = useRef({ target, onFinish });
  useEffect(() => {
    latest.current = { target, onFinish };
  });

  useEffect(() => {
    if (phase.kind !== "run") return;
    const timer = window.setTimeout(() => {
      if (phase.step === 1 && !known) {
        setPhase({ kind: "fail", message: `KEIS에서 ${label} 학기를 찾지 못했습니다. 학기를 다시 확인해 주세요.` });
      } else if (phase.step + 1 >= SYNC_STEPS.length) {
        const { target: done, onFinish: finish } = latest.current;
        setPhase({ kind: "pick" });
        if (done) finish(done);
      } else {
        setPhase({ kind: "run", step: phase.step + 1 });
      }
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [phase, known, label]);

  const running = phase.kind === "run";
  const close = () => {
    setPhase({ kind: "pick" });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !running) close();
      }}
      title="KEIS에서 다시 받기"
      size="measure.sm"
      footer={
        phase.kind === "pick" ? (
          <>
            <Button variant="hairline" onClick={close}>취소</Button>
            <Button variant="solid" disabled={!target} onClick={() => setPhase({ kind: "run", step: 0 })}><Glyph name="refresh-cw" />받기</Button>
          </>
        ) : phase.kind === "fail" ? (
          <>
            <Button variant="hairline" onClick={close}>닫기</Button>
            <Button variant="solid" onClick={() => setPhase({ kind: "pick" })}>학기 다시 고르기</Button>
          </>
        ) : undefined
      }
    >
      {phase.kind === "pick" ? (
        <Stack gap="lg">
          <Text ink="secondary">
            고른 학기의 수업 데이터를 KEIS에서 다시 받아 <Text as="span" strong ink="primary">통째로 교체</Text>합니다. 반영하기 직전의 스냅샷이 백업에 자동으로 남고, 지금 데이터는 그 스냅샷으로 되돌릴 수 있습니다.
          </Text>
          <Stack gap="xs">
            <Eyebrow>받을 학기</Eyebrow>
            <Segmented label="받을 학기" value={choice} onChange={setChoice} options={[...TERMS.map((item) => ({ id: termLabel(item), label: termLabel(item) })), { id: "new", label: "새 학기" }]} />
          </Stack>
          {choice === "new" ? (
            <Inline gap="md" align="end" wrap>
              <FormField label="연도" description="2000에서 2100 사이">
                <Field type="number" inputMode="numeric" min={2000} max={2100} value={year} onChange={(event) => setYear(event.target.value)} />
              </FormField>
              <Segmented label="학기" value={String(semester)} onChange={(id) => setSemester(id === "2" ? 2 : 1)} options={[{ id: "1", label: "1학기" }, { id: "2", label: "2학기" }]} />
            </Inline>
          ) : null}
          <Hint>{target ? `${label} 학기를 받아 옵니다. 실제로는 몇 분 이상 걸릴 수 있습니다.` : "받아 올 학기를 고르세요."}</Hint>
        </Stack>
      ) : phase.kind === "run" ? (
        <Stack gap="lg">
          <Meter value={(phase.step + 1) / SYNC_STEPS.length} label={SYNC_STEPS[phase.step]} valueText={`${phase.step + 1} / ${SYNC_STEPS.length}`} />
          <Stack as="ul" gap="xs" aria-label="진행 단계">
            {SYNC_STEPS.map((text, index) => (
              <Inline as="li" key={text} gap="sm" align="center">
                {index < phase.step ? <Glyph name="check" ink="success" /> : index === phase.step ? <Spinner size="inline" decorative /> : <Glyph name="circle" ink="tertiary" />}
                <Text as="span" ink={index > phase.step ? "tertiary" : "primary"}>{text}</Text>
              </Inline>
            ))}
          </Stack>
          <Hint>{label} 학기를 받는 동안 이 창은 닫히지 않습니다.</Hint>
        </Stack>
      ) : (
        <Notice tone="error" glyph="circle-alert">{phase.message}</Notice>
      )}
    </Dialog>
  );
};
