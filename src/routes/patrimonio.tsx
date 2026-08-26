import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCard, PageHeader } from "@/components/ui-kit/MetricCard";
import { useStore, usePortfolioPerformance } from "@/lib/store";
import { money, compactMoney, pct } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/patrimonio")({
  head: () => ({
    meta: [
      { title: "Património · Património" },
      {
        name: "description",
        content: "Valor total do portefólio, mais-valias, yields e distribuição geográfica.",
      },
      { property: "og:title", content: "Análise de património" },
      { property: "og:description", content: "Valorização, rentabilidade e concentração do portefólio." },
    ],
  }),
  component: PatrimonioPage,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function PatrimonioPage() {
  const { properties } = useStore();
  const perf = usePortfolioPerformance();
  const [ordem, setOrdem] = useState<"yield" | "valor" | "liquido">("yield");

  const totais = useMemo(() => {
    const investido = properties.reduce(
      (s, p) => s + p.valorAquisicao + p.custosAquisicao + p.valorObras,
      0,
    );
    const atual = properties.reduce((s, p) => s + p.valorEstimado, 0);
    const rendaAnual = properties.reduce((s, p) => s + p.rendaMensal * 12, 0);
    return { investido, atual, maisValia: atual - investido, rendaAnual };
  }, [properties]);

  const porLocalidade = useMemo(() => {
    const map = new Map<string, number>();
    properties.forEach((p) => map.set(p.localidade, (map.get(p.localidade) ?? 0) + p.valorEstimado));
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [properties]);

  const porTipologia = useMemo(() => {
    const map = new Map<string, number>();
    properties.forEach((p) => map.set(p.tipologia, (map.get(p.tipologia) ?? 0) + 1));
    return [...map.entries()].map(([label, valor]) => ({ label, valor })).sort((a, b) => b.valor - a.valor);
  }, [properties]);

  const ordenado = [...perf].sort((a, b) =>
    ordem === "yield"
      ? b.yieldLiquida - a.yieldLiquida
      : ordem === "valor"
        ? b.valorAtual - a.valorAtual
        : b.liquido - a.liquido,
  );

  return (
    <div>
      <PageHeader title="Património" subtitle="Valorização e rentabilidade do portefólio" />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Valor estimado" value={money(totais.atual)} />
        <MetricCard label="Investimento total" value={money(totais.investido)} />
        <MetricCard
          label="Mais-valia potencial"
          value={money(totais.maisValia)}
          hint={pct((totais.maisValia / totais.investido) * 100)}
          tone={totais.maisValia >= 0 ? "success" : "danger"}
        />
        <MetricCard
          label="Yield bruta média"
          value={pct((totais.rendaAnual / totais.atual) * 100)}
          hint={`Renda anual ${compactMoney(totais.rendaAnual)}`}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <section className="surface p-5">
          <h2 className="text-sm font-semibold">Distribuição por localidade</h2>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={porLocalidade} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {porLocalidade.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => money(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {porLocalidade.map((l, i) => (
              <li key={l.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  {l.name}
                </span>
                <span className="num font-medium">{compactMoney(l.value)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold">Imóveis por tipologia</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porTipologia}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="valor" name="Imóveis" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="surface mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 p-4">
          <h2 className="text-sm font-semibold">Rentabilidade por imóvel</h2>
          <div className="flex gap-1.5">
            {(
              [
                ["yield", "Yield"],
                ["valor", "Valor"],
                ["liquido", "Líquido"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setOrdem(k)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  ordem === k
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Imóvel</th>
                <th className="px-4 py-3 text-right font-medium">Valor estimado</th>
                <th className="px-4 py-3 text-right font-medium">Renda anual</th>
                <th className="px-4 py-3 text-right font-medium">Despesas</th>
                <th className="px-4 py-3 text-right font-medium">Líquido</th>
                <th className="px-4 py-3 text-right font-medium">Yield líquida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ordenado.slice(0, 25).map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link to="/imoveis/$id" params={{ id: p.id }} className="font-medium hover:text-primary">
                      {p.morada}
                    </Link>
                    <p className="text-xs text-muted-foreground">{p.localidade}</p>
                  </td>
                  <td className="num px-4 py-3 text-right">{money(p.valorAtual)}</td>
                  <td className="num px-4 py-3 text-right">{money(p.rendaAnual)}</td>
                  <td className="num px-4 py-3 text-right">{money(p.despesasAnuais)}</td>
                  <td className="num px-4 py-3 text-right">{money(p.liquido)}</td>
                  <td
                    className={cn(
                      "num px-4 py-3 text-right font-semibold",
                      p.yieldLiquida >= 4 ? "text-success" : "text-warning",
                    )}
                  >
                    {pct(p.yieldLiquida)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
