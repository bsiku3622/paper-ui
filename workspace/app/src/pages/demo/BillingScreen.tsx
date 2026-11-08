import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { Badge, Box, Button, Divider, Field, Floating, FormField, Grid, Inline, Radio, Stack, Text } from "@studio-baeks/paper-ui";

import { PlusIcon } from "../../compositions/icons";
import {
  Bars, ConfirmDialog, DataTable, Dialog, DialogFooter, EmptyState, FilterChip, Meter, NETWORK_COST, Notice, PageTitle, Pager, Panel, PLANS, RESOURCES, SearchField, StatStrip, TabCount, TableBar, Tabs, Two, KINDS,
  budgetAccent, clock, costHistory, formatLongDate, formatMonth, formatPercent, formatWon, formatWonShort, monthShare, monthlyOf, planPrice, seeded, summarize, useParam, useProjectName, useStore, useTable, wait,
  type Card, type Column,
} from "./parts";

type InvoiceStatus = "결제 완료" | "결제 실패" | "집계 중";
type Invoice = { id: string; at: number; amount: number; status: InvoiceStatus; method: string };

const FORECAST = monthlyOf(RESOURCES) + NETWORK_COST + planPrice("business");

const monthKey = (at: number) => {
  const date = new Date(at);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

const makeInvoices = (): Invoice[] => {
  const chance = seeded(2026);
  const older = Array.from({ length: 12 }, (_, index) => ({ at: Date.UTC(2024, 10 + index, 1), amount: Math.round((FORECAST * (0.34 + index * 0.022 + chance() * 0.015)) / 1000) * 1000 }));
  const closed = [...older, ...costHistory(FORECAST)].map(({ at, amount }, index): Invoice => ({
    id: `INV-${monthKey(at)}`, at, amount: Math.round(amount * 1.1), status: index === 22 ? "결제 실패" : "결제 완료", method: index < 14 ? "법인카드 •••• 0005" : "신용카드 •••• 4242",
  }));
  return [...closed, { id: `INV-${monthKey(Date.UTC(2026, 10, 1))}`, at: Date.UTC(2026, 10, 1), amount: Math.round(FORECAST * monthShare() * 1.1), status: "집계 중", method: "신용카드 •••• 4242" }];
};

const SHARES: readonly (readonly [string, number])[] = [
  ...KINDS.map((kind) => [kind, RESOURCES.filter((resource) => resource.kind === kind).reduce((sum, resource) => sum + resource.cost, 0)] as const),
  ["네트워크 전송", NETWORK_COST],
  ["지원 플랜 (Business)", planPrice("business")],
];
const linesOf = (subtotal: number) => {
  const whole = SHARES.reduce((sum, [, value]) => sum + value, 0);
  const rows = SHARES.map(([name, value]) => [name, Math.round((subtotal * value) / whole)] as [string, number]);
  rows[0]![1] += subtotal - rows.reduce((sum, [, value]) => sum + value, 0);
  return rows.filter(([, value]) => value > 0);
};

const StatusTag = ({ status }: { status: InvoiceStatus }) =>
  status === "결제 완료" ? <Badge accent="success" variant="ghost" dot>{status}</Badge> : status === "결제 실패" ? <Badge accent="error" variant="soft" dot>{status}</Badge> : <Badge accent="info" variant="soft" dot>{status}</Badge>;

const InvoiceBody = ({ invoice, onPaid }: { invoice: Invoice; onPaid: (id: string) => void }) => {
  const { notify, record } = useStore();
  const [paying, setPaying] = useState(false);
  const subtotal = Math.round(invoice.amount / 1.1);
  const pay = async () => {
    setPaying(true);
    await wait(1200);
    onPaid(invoice.id);
    record({ code: "billing.pay", action: "청구서를 결제했습니다", target: invoice.id });
    notify("success", `${invoice.id}을(를) 결제했습니다`, `${invoice.method}로 ${formatWon(invoice.amount)}이 결제되었습니다.`);
  };
  return (
    <Stack gap="lg">
      {invoice.status === "결제 실패" ? <Notice accent="error" title="결제하지 못했습니다">카드 한도를 넘어 승인이 거절되었습니다. 결제 수단을 확인하고 다시 결제해주세요.</Notice> : null}
      <Stack gap="md">
        <Inline justify="between"><Text as="span" ink="tertiary">청구 기간</Text><Text as="span">{formatMonth(invoice.at)}</Text></Inline>
        <Inline justify="between"><Text as="span" ink="tertiary">결제 수단</Text><Text as="span">{invoice.method}</Text></Inline>
        <Inline justify="between"><Text as="span" ink="tertiary">상태</Text><StatusTag status={invoice.status} /></Inline>
      </Stack>
      <Divider />
      <Stack gap="sm">
        {linesOf(subtotal).map(([name, value]) => (
          <Inline key={name} justify="between" gap="md"><Text as="span" ink="secondary">{name}</Text><Text as="span" numeric>{formatWon(value)}</Text></Inline>
        ))}
        <Divider />
        <Inline justify="between"><Text as="span" ink="tertiary">공급가액</Text><Text as="span" numeric>{formatWon(subtotal)}</Text></Inline>
        <Inline justify="between"><Text as="span" ink="tertiary">부가세 10%</Text><Text as="span" numeric>{formatWon(invoice.amount - subtotal)}</Text></Inline>
        <Inline justify="between"><Text as="span" strong>합계</Text><Text as="span" variant="subheading" numeric>{formatWon(invoice.amount)}</Text></Inline>
      </Stack>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">닫기</Button>
        <Button variant="hairline" onClick={() => notify("info", `${invoice.id} PDF를 준비했습니다`, "데모에서는 실제 파일을 내려받지 않습니다.")}>PDF 내려받기</Button>
        {invoice.status === "결제 실패" ? <Button loading={paying} loadingLabel="결제하는 중" onClick={pay}>다시 결제</Button> : null}
      </DialogFooter>
    </Stack>
  );
};

const BudgetForm = ({ onDone }: { onDone: () => void }) => {
  const { budget, setBudget, notify, record } = useStore();
  const [amount, setAmount] = useState(String(budget));
  const [submitted, setSubmitted] = useState(false);
  const value = Number(amount.replace(/[^\d]/g, ""));
  const error = !amount.trim() ? "금액을 입력해주세요." : value < 1000000 ? "예산은 100만 원 이상으로 정해주세요." : value > 100000000 ? "예산은 1억 원 이하로 정해주세요." : undefined;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (error) return;
    setBudget(value);
    record({ code: "billing.budget", action: "월 예산을 바꿨습니다", target: formatWon(value) });
    notify("success", "월 예산을 바꿨습니다", `${formatWon(value)}을(를) 넘기 전에 알림을 보냅니다.`);
    onDone();
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <FormField label="월 예산 (원)" required description={error ? undefined : `${formatWon(value)} · 80%와 100%에 닿으면 메일로 알립니다.`} invalid={submitted && Boolean(error)} error={error}>
        <Field inputMode="numeric" numeric value={amount} onChange={(event) => setAmount(event.target.value)} />
      </FormField>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit">저장</Button>
      </DialogFooter>
    </Stack>
  );
};

const PlanForm = ({ onDone }: { onDone: () => void }) => {
  const { plan, setPlan, notify, record } = useStore();
  const [picked, setPicked] = useState(plan);
  const [busy, setBusy] = useState(false);
  const current = PLANS.find((entry) => entry.id === plan)!;
  const next = PLANS.find((entry) => entry.id === picked)!;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (picked === plan || busy) return;
    setBusy(true);
    await wait(700);
    setPlan(picked);
    record({ code: "billing.plan", action: "플랜을 바꿨습니다", target: `${current.name} → ${next.name}` });
    notify("success", `${next.name} 플랜으로 바꿨습니다`, "새 요금은 다음 청구서부터 적용됩니다.");
    onDone();
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <Stack gap="sm" role="radiogroup" aria-label="플랜">
        {PLANS.map((entry) => (
          <Grid key={entry.id} as="label" columns="auto minmax(0, 1fr)" columnGap="sm" rowGap="xs" align="center">
            <Radio name="plan" checked={picked === entry.id} onChange={() => setPicked(entry.id)} />
            <Text as="span" strong>{entry.name}{entry.id === plan ? " (현재)" : ""}</Text>
            <Box />
            <Text as="span" variant="label" strong={false} ink="tertiary">{`월 ${formatWon(entry.price)} · ${entry.summary}`}</Text>
          </Grid>
        ))}
      </Stack>
      {picked !== plan ? <Text as="p" ink="secondary">월 {formatWon(Math.abs(next.price - current.price))}{next.price > current.price ? " 늘어납니다." : " 줄어듭니다."}</Text> : null}
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" disabled={picked === plan} loading={busy} loadingLabel="바꾸는 중">플랜 바꾸기</Button>
      </DialogFooter>
    </Stack>
  );
};

const luhn = (digits: string) => {
  let sum = 0;
  Array.from(digits).reverse().forEach((digit, index) => {
    let value = Number(digit);
    if (index % 2 === 1) value = value * 2 > 9 ? value * 2 - 9 : value * 2;
    sum += value;
  });
  return sum % 10 === 0;
};

const CardForm = ({ onDone }: { onDone: () => void }) => {
  const { cards, setCards, notify, record } = useStore();
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [expires, setExpires] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const digits = number.replace(/\D/g, "");
  const [month, year] = expires.split("/").map((part) => Number(part));
  const ends = year === undefined || month === undefined ? 0 : 2000 + year;
  const errors = {
    holder: holder.trim() ? undefined : "카드에 적힌 이름을 입력해주세요.",
    number: digits.length < 15 || digits.length > 16 ? "카드 번호 15~16자리를 입력해주세요." : !luhn(digits) ? "카드 번호를 다시 확인해주세요." : undefined,
    expires: !/^\d{2}\/\d{2}$/.test(expires) || !month || month > 12 ? "만료일을 MM/YY로 입력해주세요." : ends < 2026 || (ends === 2026 && month < 11) ? "이미 만료된 카드입니다." : undefined,
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (errors.holder || errors.number || errors.expires || busy) return;
    setBusy(true);
    await wait(900);
    const card: Card = { id: `card-${cards.length + 1}-${digits.slice(-4)}`, brand: "신용카드", last4: digits.slice(-4), holder: holder.trim().toUpperCase(), expires, primary: false };
    setCards([...cards, card]);
    record({ code: "billing.card", action: "결제 수단을 추가했습니다", target: `신용카드 •••• ${card.last4}` });
    notify("success", "카드를 추가했습니다", `•••• ${card.last4} 카드를 확인했습니다.`);
    onDone();
  };
  return (
    <Stack as="form" noValidate gap="lg" onSubmit={submit}>
      <FormField label="카드 번호" required description="데모에서는 4242 4242 4242 4242를 쓸 수 있습니다. 마지막 네 자리만 남깁니다." invalid={submitted && Boolean(errors.number)} error={errors.number}>
        <Field inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" value={number} onChange={(event) => setNumber(event.target.value.replace(/[^\d ]/g, "").slice(0, 19))} />
      </FormField>
      <Inline gap="lg" align="start" wrap>
        <Box width="md" maxWidth="full">
          <FormField label="만료일" required invalid={submitted && Boolean(errors.expires)} error={errors.expires}>
            <Field inputMode="numeric" autoComplete="off" placeholder="MM/YY" value={expires} onChange={(event) => setExpires(event.target.value.replace(/[^\d/]/g, "").slice(0, 5))} />
          </FormField>
        </Box>
        <Box width="lg" maxWidth="full">
          <FormField label="카드에 적힌 이름" required invalid={submitted && Boolean(errors.holder)} error={errors.holder}>
            <Field autoComplete="off" value={holder} onChange={(event) => setHolder(event.target.value)} />
          </FormField>
        </Box>
      </Inline>
      <DialogFooter>
        <Button as={Floating.Close} variant="ghost">취소</Button>
        <Button type="submit" loading={busy} loadingLabel="확인하는 중">카드 추가</Button>
      </DialogFooter>
    </Stack>
  );
};

type Category = { name: string; amount: number; change: number };
type Share = { id: string; name: string; amount: number; count: number; top: string };

export const BillingScreen = () => {
  const { budget, plan, cards, setCards, resources, notify, record } = useStore();
  const nameOf = useProjectName();
  const navigate = useNavigate();
  const [tab, setTab] = useParam("tab", "usage", ["usage", "invoices", "payment"]);
  const [invoices, setInvoices] = useState<readonly Invoice[]>(makeInvoices);
  const [looking, setLooking] = useParam("invoice", "");
  const [editing, setEditing] = useState<"budget" | "plan" | "card" | null>(null);
  const [removing, setRemoving] = useState<Card | null>(null);
  const at = clock();

  const mine = resources;
  const forecast = monthlyOf(mine) + NETWORK_COST + planPrice(plan);
  const spent = forecast * monthShare(at);
  const share = (forecast / budget) * 100;
  const history = costHistory(forecast);
  const last = history[history.length - 1]!.amount;

  const categories: Category[] = [
    ...KINDS.map((kind) => ({ name: kind, amount: monthlyOf(mine.filter((resource) => resource.kind === kind)) })),
    { name: "네트워크 전송", amount: NETWORK_COST },
    { name: `지원 플랜 (${PLANS.find((entry) => entry.id === plan)?.name})`, amount: planPrice(plan) },
  ].filter((entry) => entry.amount > 0).map((entry) => ({ ...entry, change: ((entry.name.length * 7) % 19) - 6 }));
  const biggest = [...categories].sort((a, b) => b.amount - a.amount)[0];

  const shares: Share[] = [...new Set(mine.map((resource) => resource.projectId))].map((id) => {
    const own = mine.filter((resource) => resource.projectId === id);
    const top = [...own].sort((a, b) => b.cost - a.cost)[0];
    return { id, name: nameOf(id), amount: monthlyOf(own), count: own.length, top: top?.id ?? "" };
  });

  const categoryColumns: readonly Column<Category>[] = [
    { id: "name", header: "종류", track: "minmax(10rem, 1.6fr)", compare: (a, b) => a.name.localeCompare(b.name, "ko"), render: (row) => <Text as="span" strong>{row.name}</Text> },
    { id: "share", header: "비중", track: "minmax(8rem, 2fr)", render: (row) => <Meter value={(row.amount / forecast) * 100} label={`${row.name} ${Math.round((row.amount / forecast) * 100)}%`} /> },
    { id: "percent", header: "", track: "3.5rem", end: true, render: (row) => <Text as="span" numeric ink="tertiary">{Math.round((row.amount / forecast) * 100)}%</Text> },
    { id: "amount", header: "이번 달 예상", track: "8rem", end: true, largestFirst: true, compare: (a, b) => a.amount - b.amount, render: (row) => <Text as="span" numeric>{formatWon(row.amount)}</Text> },
    { id: "change", header: "지난달 대비", track: "6.5rem", end: true, compare: (a, b) => a.change - b.change, render: (row) => <Text as="span" numeric ink={row.change > 8 ? "warning" : "tertiary"}>{row.change >= 0 ? "+" : ""}{row.change}%</Text> },
  ];
  const categoryTable = useTable(categories, { columns: categoryColumns, sort: { id: "amount", dir: "desc" }, size: 12 });

  const shareColumns: readonly Column<Share>[] = [
    { id: "name", header: "프로젝트", track: "minmax(10rem, 1.6fr)", opens: true, compare: (a, b) => a.name.localeCompare(b.name, "ko"), render: (row) => <Two title top={row.name} sub={row.id} mono /> },
    { id: "share", header: "비중", track: "minmax(8rem, 2fr)", render: (row) => <Meter value={(row.amount / monthlyOf(mine)) * 100} label={`${row.name} ${Math.round((row.amount / monthlyOf(mine)) * 100)}%`} /> },
    { id: "count", header: "자원", track: "5rem", end: true, compare: (a, b) => a.count - b.count, render: (row) => <Text as="span" numeric ink="secondary">{row.count}개</Text> },
    { id: "top", header: "가장 큰 자원", track: "minmax(10rem, 1.4fr)", render: (row) => <Text as="span" ink="secondary" truncate>{row.top}</Text> },
    { id: "amount", header: "월 비용", track: "8rem", end: true, largestFirst: true, compare: (a, b) => a.amount - b.amount, render: (row) => <Text as="span" numeric>{formatWon(row.amount)}</Text> },
  ];
  const shareTable = useTable(shares, { columns: shareColumns, sort: { id: "amount", dir: "desc" }, size: 12 });

  const invoiceColumns: readonly Column<Invoice>[] = [
    { id: "id", header: "청구서", track: "minmax(10rem, 1.6fr)", opens: true, compare: (a, b) => a.at - b.at, largestFirst: true, render: (row) => <Two title top={formatMonth(row.at)} sub={row.id} mono /> },
    { id: "status", header: "상태", track: "7rem", render: (row) => <StatusTag status={row.status} /> },
    { id: "method", header: "결제 수단", track: "minmax(9rem, 1.2fr)", render: (row) => <Text as="span" ink="secondary" truncate>{row.method}</Text> },
    { id: "issued", header: "발행일", track: "7rem", render: (row) => <Text as="span" ink="tertiary">{row.status === "집계 중" ? "—" : formatLongDate(Date.UTC(new Date(row.at).getUTCFullYear(), new Date(row.at).getUTCMonth() + 1, 1))}</Text> },
    { id: "amount", header: "금액 (VAT 포함)", track: "9rem", end: true, largestFirst: true, compare: (a, b) => a.amount - b.amount, render: (row) => <Text as="span" numeric>{formatWon(row.amount)}</Text> },
  ];
  const invoiceTable = useTable(invoices, {
    columns: invoiceColumns, sort: { id: "id", dir: "desc" }, size: 10,
    match: (row, words) => `${row.id} ${formatMonth(row.at)}`.toLowerCase().includes(words),
    filters: { status: (row) => row.status, year: (row) => String(new Date(row.at).getUTCFullYear()) },
  });
  const looked = invoices.find((entry) => entry.id === looking);
  const failed = invoices.filter((entry) => entry.status === "결제 실패");

  const primary = cards.find((card) => card.primary);
  const removeCard = (card: Card) => {
    setCards(cards.filter((entry) => entry.id !== card.id));
    record({ code: "billing.card", action: "결제 수단을 삭제했습니다", target: `${card.brand} •••• ${card.last4}` });
    notify("success", "카드를 삭제했습니다", `${card.brand} •••• ${card.last4}`);
  };
  const makePrimary = (card: Card) => {
    setCards(cards.map((entry) => ({ ...entry, primary: entry.id === card.id })));
    record({ code: "billing.card", action: "기본 결제 수단을 바꿨습니다", target: `${card.brand} •••• ${card.last4}` });
    notify("success", "기본 결제 수단을 바꿨습니다", `${card.brand} •••• ${card.last4}`);
  };
  const current = PLANS.find((entry) => entry.id === plan)!;

  return (
    <Stack gap="xl">
      <PageTitle title="비용과 결제" description="이번 달 비용과 청구서, 결제 수단을 관리합니다." aside={<Button variant="hairline" onClick={() => setEditing("budget")}>예산 설정</Button>} />
      {failed.length > 0 ? (
        <Notice accent="error" title="결제하지 못한 청구서가 있습니다">
          {failed[0]!.id}({formatMonth(failed[0]!.at)}) 청구서를 결제하지 못했습니다.{" "}
          <Button size="xs" variant="hairline" onClick={() => navigate(`/demo/arcfield/billing?tab=invoices&invoice=${failed[0]!.id}`)}>확인하기</Button>
        </Notice>
      ) : null}
      <StatStrip stats={[
        { label: "이번 달 누적", value: formatWonShort(spent), note: `${Math.round(monthShare(at) * 30)}일째` },
        { label: "이번 달 예상", value: formatWonShort(forecast), note: `예산의 ${Math.round(share)}%`, tone: share >= 100 ? "error" : share >= 85 ? "warning" : undefined },
        { label: "월 예산", value: formatWonShort(budget), note: "80%와 100%에 알림" },
        { label: "지난달", value: formatWonShort(last), note: `${forecast >= last ? "+" : ""}${formatPercent(((forecast - last) / last) * 100, 0)}로 예상` },
        { label: "가장 큰 항목", value: biggest ? formatWonShort(biggest.amount) : "—", note: biggest ? `${biggest.name} · ${Math.round((biggest.amount / forecast) * 100)}%` : "" },
      ]} />
      <Tabs
        label="비용과 결제"
        value={tab}
        onValueChange={setTab}
        tabs={[
          {
            id: "usage", label: "사용량", panel: (
              <Stack gap="xl">
                <Panel title="월별 비용" description={`최근 12개월과 이번 달 예상입니다. 예산은 ${formatWon(budget)}입니다.`}>
                  <Stack gap="lg" padding="xl">
                    <Inline justify="between" gap="md" wrap>
                      <Text as="span" ink="secondary" numeric>예상 {formatWon(forecast)}</Text>
                      <Text as="span" ink={share >= 85 ? "warning" : "tertiary"} numeric>예산의 {formatPercent(share, 0)}</Text>
                    </Inline>
                    <Meter value={share} label={`예상 비용이 예산의 ${Math.round(share)}%`} accent={budgetAccent(share)} />
                    <Bars label="월별 비용" values={[...history.map((entry) => entry.amount), forecast]} ends={[formatMonth(history[0]!.at), "이번 달(예상)"]} />
                  </Stack>
                </Panel>
                <Panel title="종류별 비용" description="자원 종류와 네트워크, 지원 플랜으로 나눈 이번 달 예상입니다.">
                  <DataTable label="종류별 비용" columns={categoryColumns} rows={categoryTable.slice} rowKey={(row) => row.name} sort={categoryTable.sort} onSort={categoryTable.toggleSort}
                    empty={<EmptyState title="비용이 없습니다">자원을 만들면 여기에 나타납니다.</EmptyState>} />
                </Panel>
                <Panel title="프로젝트별 비용" description="한 행을 누르면 그 프로젝트로 갑니다.">
                  <DataTable label="프로젝트별 비용" columns={shareColumns} rows={shareTable.slice} rowKey={(row) => row.id} sort={shareTable.sort} onSort={shareTable.toggleSort} onOpen={(row) => navigate(`/demo/arcfield/projects/${row.id}`)}
                    empty={<EmptyState title="비용이 없습니다">자원을 만들면 여기에 나타납니다.</EmptyState>} />
                </Panel>
              </Stack>
            ),
          },
          {
            id: "invoices", label: <TabCount label="청구서" count={invoices.length} />, panel: (
              <Panel>
                <TableBar summary={summarize(invoiceTable, invoiceColumns)} onReset={invoiceTable.active ? invoiceTable.reset : undefined}>
                  <SearchField label="청구서 번호나 월로 찾기" value={invoiceTable.query} onChange={invoiceTable.setQuery} />
                  <FilterChip label="상태" selected={invoiceTable.picked.status ?? []} onChange={(next) => invoiceTable.pick("status", next)} options={(["결제 완료", "결제 실패", "집계 중"] as const).map((status) => ({ value: status, label: status, count: invoices.filter((entry) => entry.status === status).length }))} />
                  <FilterChip label="연도" selected={invoiceTable.picked.year ?? []} onChange={(next) => invoiceTable.pick("year", next)} options={["2026", "2025", "2024"].map((year) => ({ value: year, label: `${year}년`, count: invoices.filter((entry) => String(new Date(entry.at).getUTCFullYear()) === year).length }))} />
                </TableBar>
                <DataTable label="청구서" columns={invoiceColumns} rows={invoiceTable.slice} rowKey={(row) => row.id} sort={invoiceTable.sort} onSort={invoiceTable.toggleSort} onOpen={(row) => setLooking(row.id)}
                  empty={<EmptyState title="조건에 맞는 청구서가 없습니다" action={<Button size="sm" variant="hairline" onClick={invoiceTable.reset}>필터 초기화</Button>}>검색어나 필터를 바꿔보세요.</EmptyState>} />
                <Pager table={invoiceTable} />
              </Panel>
            ),
          },
          {
            id: "payment", label: "결제 수단", panel: (
              <Stack gap="xl">
                <Panel title="플랜" actions={<Button size="sm" variant="hairline" onClick={() => setEditing("plan")}>플랜 변경</Button>}>
                  <Stack gap="xs" padding="xl">
                    <Inline gap="sm" align="baseline" wrap>
                      <Text as="span" variant="title">{current.name}</Text>
                      <Text as="span" ink="secondary" numeric>월 {formatWon(current.price)}</Text>
                    </Inline>
                    <Text as="p" ink="tertiary">{current.summary}</Text>
                  </Stack>
                </Panel>
                <Panel title="결제 수단" description="다음 결제는 기본 결제 수단으로 나갑니다." actions={<Button size="sm" onClick={() => setEditing("card")}><PlusIcon />카드 추가</Button>}>
                  <Stack as="ul" paddingX="xl" paddingY="sm">
                    {cards.map((card, index) => (
                      <Box as="li" key={card.id}>
                        {index > 0 ? <Divider aria-hidden /> : null}
                        <Inline justify="between" gap="md" paddingY="md" wrap>
                          <Stack>
                            <Inline gap="sm"><Text as="span" strong>{card.brand} •••• {card.last4}</Text>{card.primary ? <Badge size="sm" variant="soft">기본</Badge> : null}</Inline>
                            <Text as="span" variant="label" strong={false} ink="tertiary">{card.holder} · 만료 {card.expires}</Text>
                          </Stack>
                          <Inline gap="xs">
                            {card.primary ? null : <Button size="sm" variant="hairline" onClick={() => makePrimary(card)}>기본으로</Button>}
                            <Button size="sm" variant="ghost" accent="error" disabled={card.primary} onClick={() => setRemoving(card)}>삭제</Button>
                          </Inline>
                        </Inline>
                      </Box>
                    ))}
                  </Stack>
                </Panel>
                <Panel title="청구 정보">
                  <Inline justify="between" gap="md" wrap padding="xl">
                    <Text as="p" ink="secondary">청구 이메일과 사업자 정보는 설정에서 바꿉니다. 기본 결제 수단은 {primary ? `${primary.brand} •••• ${primary.last4}` : "없음"}입니다.</Text>
                    <Button as={RouterLink} to="/demo/arcfield/settings#billing" variant="hairline" size="sm">설정으로 가기</Button>
                  </Inline>
                </Panel>
              </Stack>
            ),
          },
        ]}
      />
      <Dialog open={editing === "budget"} onOpenChange={(open) => { if (!open) setEditing(null); }} title="월 예산" description="예산에 가까워지면 메일로 알려드립니다."><BudgetForm onDone={() => setEditing(null)} /></Dialog>
      <Dialog open={editing === "plan"} onOpenChange={(open) => { if (!open) setEditing(null); }} title="플랜 변경" description="바꾼 요금은 다음 청구서부터 적용됩니다." size="md"><PlanForm onDone={() => setEditing(null)} /></Dialog>
      <Dialog open={editing === "card"} onOpenChange={(open) => { if (!open) setEditing(null); }} title="카드 추가" description="새 카드는 기본 결제 수단이 아닌 채로 추가됩니다."><CardForm onDone={() => setEditing(null)} /></Dialog>
      <Dialog open={looked !== undefined} onOpenChange={(open) => { if (!open) setLooking(""); }} title={looked ? `${formatMonth(looked.at)} 청구서` : "청구서"} description={looked?.id} size="md">
        {looked ? <InvoiceBody invoice={looked} onPaid={(id) => setInvoices((list) => list.map((entry) => (entry.id === id ? { ...entry, status: "결제 완료" } : entry)))} /> : null}
      </Dialog>
      <ConfirmDialog open={removing !== null} onOpenChange={(open) => { if (!open) setRemoving(null); }} title="카드를 삭제할까요?" description={removing ? `${removing.brand} •••• ${removing.last4}을(를) 삭제합니다.` : ""} confirmLabel="삭제" tone="error" onConfirm={() => { if (removing) removeCard(removing); }} />
    </Stack>
  );
};
