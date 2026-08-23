import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { MetricCard, PageHeader } from "@/components/ui-kit/MetricCard";
import { RentStatusBadge } from "@/components/ui-kit/badges";
import { PaymentModal } from "@/components/PaymentModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { money, pct, dateLabel, MESES, MESES_CURTOS } from "@/lib/format";
import { ANO_ATUAL, MES_ATUAL, type Payment, type EstadoRenda } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rendas")({
  head: () => ({
    meta: [
      { title: "Rendas · Património" },
      {
        name: "description",
        content: "Controlo mensal e anual das rendas: pagas, parciais, em atraso e por pagar.",
      },
      { property: "og:title", content: "Rendas · Património" },
      { property: "og:description", content: "Controlo mensal e anual das rendas do portefólio." },
    ],
  }),
  component: RendasPage,
});

const FILTROS: (EstadoRenda | "Todos")[] = ["Todos", "Pago", "Parcial", "Em atraso", "Por pagar"];

function RendasPage() {
  const { payments, properties, tenants } = useStore();
  const [ano, setAno] = useState(ANO_ATUAL);
  const [mes, setMes] = useState(MES_ATUAL);
  const [filtro, setFiltro] = useState<EstadoRenda | "Todos">("Todos");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Payment | null>(null);
  const [anoMatriz, setAnoMatriz] = useState(ANO_ATUAL);

  const propMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const tenantMap = useMemo(() => new Map(tenants.map((t) => [t.propertyId, t])), [tenants]);

  const doMes = useMemo(
    () => payments.filter((p) => p.ano === ano && p.mes === mes),
    [payments, ano, mes],
  );

  const lista = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return doMes.filter((p) => {
      if (filtro !== "Todos" && p.estado !== filtro) return false;
      if (!termo) return true;
      const prop = propMap.get(p.propertyId);
      const t = tenantMap.get(p.propertyId);
      return (
        (prop?.morada.toLowerCase().includes(termo) ?? false) ||
        (prop?.ref.toLowerCase().includes(termo) ?? false) ||
        (t?.nome.toLowerCase().includes(termo) ?? false)
      );
    });
  }, [doMes, filtro, q, propMap, tenantMap]);

  const previsto = doMes.reduce((s, p) => s + p.previsto, 0);
  const recebido = doMes.reduce((s, p) => s + p.recebido, 0);

  const shiftMonth = (delta: number) => {
    const d = new Date(ano, mes + delta, 1);
    setAno(d.getFullYear());
    setMes(d.getMonth());
  };

  return (
    <div>
      <PageHeader
        title={`Rendas — ${MESES[mes]} ${ano}`}
        subtitle="Acompanhe a cobrança mensal e o histórico anual."
        actions={
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => shiftMonth(-1)} aria-label="Mês anterior">
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => shiftMonth(1)} aria-label="Mês seguinte">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="mensal">
        <TabsList className="mb-4">
          <TabsTrigger value="mensal">Vista mensal</TabsTrigger>
          <TabsTrigger value="anual">Vista anual</TabsTrigger>
        </TabsList>

        <TabsContent value="mensal" className="space-y-4">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <MetricCard label="Previsto" value={money(previsto)} />
            <MetricCard label="Recebido" value={money(recebido)} tone="success" />
            <MetricCard
              label="Por receber"
              value={money(previsto - recebido)}
              tone={previsto - recebido > 0 ? "danger" : "success"}
            />
            <MetricCard
              label="Taxa de cobrança"
              value={pct(previsto ? (recebido / previsto) * 100 : 0)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-1.5">
              {FILTROS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    filtro === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-muted",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar imóvel ou inquilino"
              className="h-9 w-full sm:max-w-xs"
            />
          </div>

          {/* Tabela desktop */}
          <div className="surface hidden overflow-hidden lg:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Imóvel</th>
                  <th className="px-4 py-3 text-left font-medium">Inquilino</th>
                  <th className="px-4 py-3 text-right font-medium">Renda</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Recebido</th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Método</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lista.slice(0, 40).map((p) => {
                  const prop = propMap.get(p.propertyId);
                  const t = tenantMap.get(p.propertyId);
                  return (
                    <tr key={p.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3">
                        <p className="font-medium">{prop?.morada}</p>
                        <p className="text-xs text-muted-foreground">
                          {prop?.ref} · {prop?.localidade}
                        </p>
                      </td>
                      <td className="px-4 py-3">{t?.nome ?? "—"}</td>
                      <td className="num px-4 py-3 text-right">{money(p.previsto)}</td>
                      <td className="px-4 py-3">
                        <RentStatusBadge estado={p.estado} />
                      </td>
                      <td className="num px-4 py-3 text-right">{money(p.recebido)}</td>
                      <td className="px-4 py-3">{dateLabel(p.dataPagamento)}</td>
                      <td className="px-4 py-3">{p.metodo ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelected(p)}>
                          {p.estado === "Pago" ? "Detalhe" : "Registar"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {lista.length > 40 ? (
              <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                A mostrar 40 de {lista.length} registos.
              </p>
            ) : null}
          </div>

          {/* Cards mobile */}
          <ul className="space-y-3 lg:hidden">
            {lista.slice(0, 25).map((p) => {
              const prop = propMap.get(p.propertyId);
              const t = tenantMap.get(p.propertyId);
              return (
                <li key={p.id} className="surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{prop?.morada}</p>
                      <p className="truncate text-xs text-muted-foreground">{t?.nome}</p>
                    </div>
                    <RentStatusBadge estado={p.estado} />
                  </div>
                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <p className="num font-display text-xl font-semibold">{money(p.previsto)}</p>
                      {p.recebido > 0 && p.recebido < p.previsto ? (
                        <p className="text-xs text-warning">Recebido {money(p.recebido)}</p>
                      ) : null}
                    </div>
                    <Button size="sm" className="h-10 gap-1.5" onClick={() => setSelected(p)}>
                      <Check className="size-4" />
                      {p.estado === "Pago" ? "Detalhe" : "Registar"}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </TabsContent>

        <TabsContent value="anual" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={String(anoMatriz)} onValueChange={(v) => setAnoMatriz(Number(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[ANO_ATUAL, ANO_ATUAL - 1, ANO_ATUAL - 2].map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Clique numa célula para ver o detalhe do pagamento.
            </p>
          </div>

          <div className="surface overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="sticky left-0 bg-muted/60 px-4 py-3 text-left font-medium">Imóvel</th>
                  {MESES_CURTOS.map((mm) => (
                    <th key={mm} className="px-1 py-3 text-center font-medium">
                      {mm}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {properties.slice(0, 25).map((prop) => {
                  const linha = payments.filter(
                    (p) => p.propertyId === prop.id && p.ano === anoMatriz,
                  );
                  const total = linha.reduce((s, p) => s + p.recebido, 0);
                  return (
                    <tr key={prop.id}>
                      <td className="sticky left-0 bg-card px-4 py-2">
                        <p className="max-w-45 truncate text-xs font-medium">{prop.morada}</p>
                        <p className="text-[11px] text-muted-foreground">{prop.ref}</p>
                      </td>
                      {MESES_CURTOS.map((_, i) => {
                        const cell = linha.find((p) => p.mes === i);
                        const tone = !cell
                          ? "bg-muted"
                          : cell.estado === "Pago"
                            ? "bg-success/80"
                            : cell.estado === "Parcial"
                              ? "bg-warning/80"
                              : cell.estado === "Não vencido"
                                ? "bg-muted"
                                : "bg-destructive/80";
                        return (
                          <td key={i} className="px-1 py-2 text-center">
                            <button
                              disabled={!cell}
                              onClick={() => cell && setSelected(cell)}
                              title={cell ? `${MESES[i]}: ${cell.estado}` : "Sem registo"}
                              className={cn("size-6 rounded-md transition-transform hover:scale-110", tone)}
                            />
                          </td>
                        );
                      })}
                      <td className="num px-4 py-2 text-right font-semibold">{money(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-success/80" /> Pago
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-warning/80" /> Parcial
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-destructive/80" /> Em atraso / por pagar
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded bg-muted" /> Ainda não vencido
            </span>
          </div>
        </TabsContent>
      </Tabs>

      <PaymentModal
        payment={selected}
        open={!!selected}
        onOpenChange={(v) => !v && setSelected(null)}
      />
    </div>
  );
}
