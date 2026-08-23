import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  ChevronRight,
  Percent,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MetricCard } from "@/components/ui-kit/MetricCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLast12Months, usePeriodMetrics, usePortfolioPerformance, useStore } from "@/lib/store";
import { money, compactMoney, pct, MESES, dateLabel } from "@/lib/format";
import { ANO_ATUAL, MES_ATUAL } from "@/lib/mock-data";
import { QuickActions } from "@/components/layout/QuickActions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Património" },
      {
        name: "description",
        content:
          "Resumo executivo do seu património imobiliário: rendas do mês, ocupação, resultado líquido e alertas.",
      },
      { property: "og:title", content: "Dashboard · Património" },
      {
        property: "og:description",
        content: "Resumo executivo do seu património imobiliário em tempo real.",
      },
    ],
  }),
  component: Dashboard,
});

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: "12px",
    fontSize: "12px",
  },
} as const;

function Dashboard() {
  const [periodo, setPeriodo] = useState("mes");
  const m = usePeriodMetrics();
  const serie = useLast12Months();
  const top = usePortfolioPerformance().slice(0, 5);
  const { contracts, notifications } = useStore();

  const aTerminar = contracts.filter((c) => c.estado === "A terminar");
  const totalMes = m.pagos + m.parciais + m.atraso + m.porPagar;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">Bom dia, Afonso.</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aqui está o resumo do seu património — {MESES[MES_ATUAL]} {ANO_ATUAL}.
          </p>
        </div>
        <Tabs value={periodo} onValueChange={setPeriodo} className="hidden md:block">
          <TabsList>
            <TabsTrigger value="mes">Este mês</TabsTrigger>
            <TabsTrigger value="ano">Este ano</TabsTrigger>
            <TabsTrigger value="12m">Últimos 12 meses</TabsTrigger>
            <TabsTrigger value="custom">Personalizado</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ---------- MOBILE ---------- */}
      <div className="space-y-4 lg:hidden">
        <section className="surface p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold">Rendas de {MESES[MES_ATUAL]}</p>
            <p className="num text-sm text-muted-foreground">{pct(m.taxaCobranca, 0)}</p>
          </div>
          <p className="num mt-2 font-display text-2xl font-semibold">
            {money(m.recebido)}{" "}
            <span className="text-sm font-medium text-muted-foreground">/ {money(m.previsto)}</span>
          </p>
          <Progress value={m.taxaCobranca} className="mt-3" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-success/10 py-2">
              <p className="num text-lg font-semibold text-success">{m.pagos}</p>
              <p className="text-[11px] text-muted-foreground">Pagas</p>
            </div>
            <div className="rounded-lg bg-warning/15 py-2">
              <p className="num text-lg font-semibold text-warning">{m.parciais}</p>
              <p className="text-[11px] text-muted-foreground">Parciais</p>
            </div>
            <div className="rounded-lg bg-destructive/10 py-2">
              <p className="num text-lg font-semibold text-destructive">
                {m.atraso + m.porPagar}
              </p>
              <p className="text-[11px] text-muted-foreground">Em falta</p>
            </div>
          </div>
          <Button asChild className="mt-4 h-12 w-full">
            <Link to="/rendas">Ver rendas</Link>
          </Button>
        </section>

        <section className="surface p-4">
          <p className="mb-3 text-sm font-semibold">Ações rápidas</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-12 justify-start" asChild>
              <Link to="/rendas">Registar pagamento</Link>
            </Button>
            <Button variant="outline" className="h-12 justify-start" asChild>
              <Link to="/despesas">Nova despesa</Link>
            </Button>
            <Button variant="outline" className="h-12 justify-start" asChild>
              <Link to="/imoveis">Novo imóvel</Link>
            </Button>
            <Button variant="outline" className="h-12 justify-start" asChild>
              <Link to="/documentos">Adicionar documento</Link>
            </Button>
          </div>
        </section>

        <AlertsCard notifications={notifications.slice(0, 3)} />
        <AiInsights compact />
      </div>

      {/* ---------- DESKTOP ---------- */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <MetricCard
            label="Imóveis"
            value={String(m.totalImoveis)}
            hint={`${m.arrendados} arrendados · ${m.disponiveis} disponíveis`}
            icon={Building2}
          />
          <MetricCard
            label="Taxa de ocupação"
            value={pct(m.ocupacao, 0)}
            hint={`${m.emObras} em obras`}
            icon={Percent}
            tone="success"
          />
          <MetricCard
            label="Renda prevista"
            value={money(m.previsto)}
            hint={`${MESES[MES_ATUAL]} ${ANO_ATUAL}`}
            icon={Wallet}
          />
          <MetricCard
            label="Renda recebida"
            value={money(m.recebido)}
            hint={`Taxa de cobrança ${pct(m.taxaCobranca, 1)}`}
            icon={TrendingUp}
            tone="success"
          />
          <MetricCard
            label="Valor em atraso"
            value={money(m.emFalta)}
            hint={`${m.atraso + m.porPagar + m.parciais} rendas por regularizar`}
            icon={AlertTriangle}
            tone={m.emFalta > 0 ? "danger" : "success"}
          />
          <MetricCard label="Despesas do mês" value={money(m.despesas)} icon={Wallet} />
          <MetricCard
            label="Resultado líquido"
            value={money(m.liquido)}
            hint="Recebido − despesas"
            icon={TrendingUp}
            tone="success"
          />
          <MetricCard
            label="Contratos a terminar"
            value={String(aTerminar.length)}
            hint="Próximos 90 dias"
            icon={CalendarClock}
            tone={aTerminar.length ? "warning" : "default"}
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <section className="surface p-5 xl:col-span-2">
            <h2 className="text-sm font-semibold">Evolução das rendas — previsto vs recebido</h2>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={serie}>
                  <defs>
                    <linearGradient id="gRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    tickFormatter={(v: number) => compactMoney(v)}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={70}
                  />
                  <Tooltip formatter={(v) => money(Number(v))} {...tooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    name="Previsto"
                    dataKey="previsto"
                    stroke="var(--color-chart-1)"
                    fill="transparent"
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    name="Recebido"
                    dataKey="recebido"
                    stroke="var(--color-chart-2)"
                    fill="url(#gRec)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="text-sm font-semibold">Estado das rendas deste mês</h2>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Pagas", value: m.pagos, tone: "bg-success" },
                { label: "Parciais", value: m.parciais, tone: "bg-warning" },
                { label: "Em atraso", value: m.atraso, tone: "bg-destructive" },
                { label: "Por pagar", value: m.porPagar, tone: "bg-info" },
              ].map((row) => (
                <li key={row.label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="num font-semibold">{row.value}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${row.tone}`}
                      style={{ width: `${totalMes ? (row.value / totalMes) * 100 : 0}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-5 w-full">
              <Link to="/rendas">Abrir mapa de rendas</Link>
            </Button>
          </section>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <section className="surface p-5 xl:col-span-2">
            <h2 className="text-sm font-semibold">Receita vs despesas por mês</h2>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis
                    tickFormatter={(v: number) => compactMoney(v)}
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    width={70}
                  />
                  <Tooltip formatter={(v) => money(Number(v))} {...tooltipStyle} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar name="Receita" dataKey="recebido" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                  <Bar name="Despesas" dataKey="despesas" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <AlertsCard notifications={notifications.slice(0, 4)} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-3">
          <section className="surface p-5 xl:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Top imóveis por rentabilidade</h2>
              <Link to="/patrimonio" className="text-xs text-primary">
                Ver património
              </Link>
            </div>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2 font-medium">Imóvel</th>
                  <th className="py-2 text-right font-medium">Renda anual</th>
                  <th className="py-2 text-right font-medium">Líquido</th>
                  <th className="py-2 text-right font-medium">Yield líquida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {top.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5">
                      <Link
                        to="/imoveis/$id"
                        params={{ id: p.id }}
                        className="font-medium hover:text-primary"
                      >
                        {p.morada}
                      </Link>
                      <p className="text-xs text-muted-foreground">{p.localidade}</p>
                    </td>
                    <td className="num py-2.5 text-right">{money(p.rendaAnual)}</td>
                    <td className="num py-2.5 text-right">{money(p.liquido)}</td>
                    <td className="num py-2.5 text-right font-semibold text-success">
                      {pct(p.yieldLiquida)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="surface p-5">
            <h2 className="text-sm font-semibold">Próximos acontecimentos</h2>
            <ol className="mt-4 space-y-4 border-l border-border pl-4">
              {aTerminar.slice(0, 4).map((c) => (
                <li key={c.id} className="relative">
                  <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-warning" />
                  <p className="text-sm font-medium">Fim de contrato</p>
                  <p className="text-xs text-muted-foreground">
                    {dateLabel(c.fim)} · renda {money(c.rendaAtual)}
                  </p>
                </li>
              ))}
              <li className="relative">
                <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-info" />
                <p className="text-sm font-medium">Seguro multirriscos expira</p>
                <p className="text-xs text-muted-foreground">30/09/2026</p>
              </li>
              <li className="relative">
                <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-primary" />
                <p className="text-sm font-medium">Fecho do mês</p>
                <p className="text-xs text-muted-foreground">31/08/2026</p>
              </li>
            </ol>
          </section>
        </div>

        <div className="mt-4">
          <AiInsights />
        </div>
      </div>
    </div>
  );
}

function AlertsCard({ notifications }: { notifications: { id: string; titulo: string; descricao: string }[] }) {
  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Alertas importantes</h2>
        <Link to="/notificacoes" className="text-xs text-primary">
          Ver todos
        </Link>
      </div>
      <ul className="mt-3 space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="flex gap-3 rounded-lg border border-border p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div>
              <p className="text-sm font-medium">{n.titulo}</p>
              <p className="text-xs text-muted-foreground">{n.descricao}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AiInsights({ compact = false }: { compact?: boolean }) {
  const perf = usePortfolioPerformance();
  const melhor = perf[0];
  const pior = perf[perf.length - 1];

  const insights = [
    melhor && {
      titulo: "Imóvel mais rentável",
      texto: `${melhor.morada} apresenta a maior yield líquida do portefólio: ${pct(melhor.yieldLiquida)}.`,
    },
    pior && {
      titulo: "Atenção à despesa",
      texto: `${pior.morada} acumulou ${money(pior.despesasAnuais)} de despesas nos últimos 12 meses, acima da média do portefólio.`,
    },
    {
      titulo: "Oportunidade de atualização",
      texto:
        "12 rendas estão abaixo de 400 € — atualizá-las representaria cerca de +875 €/mês e +10.500 €/ano.",
    },
  ].filter(Boolean) as { titulo: string; texto: string }[];

  return (
    <section className="surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          Insights da IA
        </h2>
        <Link to="/ia" className="flex items-center text-xs text-primary">
          Ver análise <ChevronRight className="size-3" />
        </Link>
      </div>
      <div className={compact ? "mt-3 space-y-2" : "mt-3 grid gap-3 md:grid-cols-3"}>
        {insights.slice(0, compact ? 2 : 3).map((i) => (
          <div key={i.titulo} className="rounded-lg border border-border bg-accent/40 p-3">
            <p className="text-sm font-semibold">{i.titulo}</p>
            <p className="mt-1 text-xs text-muted-foreground">{i.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
