import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCard, PageHeader } from "@/components/ui-kit/MetricCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { money, compactMoney, MESES } from "@/lib/format";
import { ANO_ATUAL } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios · Património" },
      {
        name: "description",
        content: "Relatórios anuais de rendas, despesas, resultado líquido e apoio ao IRS.",
      },
      { property: "og:title", content: "Relatórios · Património" },
      { property: "og:description", content: "Mapas anuais e exportações para contabilidade e IRS." },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { payments, expenses, properties } = useStore();
  const [ano, setAno] = useState(String(ANO_ATUAL));

  const anos = useMemo(
    () => [...new Set(payments.map((p) => p.ano))].sort((a, b) => b - a).slice(0, 6),
    [payments],
  );

  const dados = useMemo(() => {
    const a = Number(ano);
    return MESES.map((label, i) => {
      const recebido = payments
        .filter((p) => p.ano === a && p.mes === i)
        .reduce((s, p) => s + p.recebido, 0);
      const despesas = expenses
        .filter((e) => e.data.startsWith(String(a)) && Number(e.data.slice(5, 7)) - 1 === i)
        .reduce((s, e) => s + e.valor, 0);
      return { label: label.slice(0, 3), recebido, despesas, liquido: recebido - despesas };
    });
  }, [ano, payments, expenses]);

  const totalRec = dados.reduce((s, d) => s + d.recebido, 0);
  const totalDesp = dados.reduce((s, d) => s + d.despesas, 0);

  const porImovel = useMemo(() => {
    const a = Number(ano);
    return properties
      .map((p) => {
        const rec = payments
          .filter((x) => x.propertyId === p.id && x.ano === a)
          .reduce((s, x) => s + x.recebido, 0);
        const desp = expenses
          .filter((e) => e.propertyId === p.id && e.data.startsWith(String(a)))
          .reduce((s, e) => s + e.valor, 0);
        return { id: p.id, morada: p.morada, rec, desp, liquido: rec - desp };
      })
      .sort((x, y) => y.liquido - x.liquido);
  }, [ano, properties, payments, expenses]);

  const exportar = (formato: string) => toast.success(`Exportação ${formato} simulada`);

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Mapas financeiros anuais e apoio ao IRS"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportar("PDF")}>
              <FileText className="size-4" />
              PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportar("Excel")}>
              <FileSpreadsheet className="size-4" />
              Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
              <Printer className="size-4" />
              Imprimir
            </Button>
          </div>
        }
      />

      <div className="mb-4 w-full sm:max-w-[180px]">
        <Select value={ano} onValueChange={setAno}>
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anos.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Rendas recebidas" value={money(totalRec)} tone="success" />
        <MetricCard label="Despesas" value={money(totalDesp)} />
        <MetricCard label="Resultado líquido" value={money(totalRec - totalDesp)} tone="success" />
        <MetricCard
          label="Margem líquida"
          value={totalRec ? `${(((totalRec - totalDesp) / totalRec) * 100).toFixed(1)} %` : "—"}
        />
      </div>

      <section className="surface mt-4 p-5">
        <h2 className="text-sm font-semibold">Evolução mensal — {ano}</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dados}>
              <defs>
                <linearGradient id="gLiq" x1="0" y1="0" x2="0" y2="1">
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
              <Tooltip formatter={(v) => money(Number(v))} />
              <Area
                type="monotone"
                dataKey="liquido"
                name="Líquido"
                stroke="var(--color-chart-2)"
                fill="url(#gLiq)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="surface mt-4 overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm font-semibold">Mapa por imóvel — {ano}</h2>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => exportar("CSV")}>
            <Download className="size-4" />
            CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Imóvel</th>
                <th className="px-4 py-3 text-right font-medium">Rendas</th>
                <th className="px-4 py-3 text-right font-medium">Despesas</th>
                <th className="px-4 py-3 text-right font-medium">Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {porImovel.slice(0, 25).map((r) => (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{r.morada}</td>
                  <td className="num px-4 py-3 text-right">{money(r.rec)}</td>
                  <td className="num px-4 py-3 text-right">{money(r.desp)}</td>
                  <td className="num px-4 py-3 text-right font-semibold">{money(r.liquido)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/60 text-sm font-semibold">
                <td className="px-4 py-3">Total</td>
                <td className="num px-4 py-3 text-right">{money(totalRec)}</td>
                <td className="num px-4 py-3 text-right">{money(totalDesp)}</td>
                <td className="num px-4 py-3 text-right">{money(totalRec - totalDesp)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}
