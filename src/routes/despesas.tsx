import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { MetricCard, PageHeader } from "@/components/ui-kit/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { money, compactMoney, dateLabel, MESES } from "@/lib/format";
import { ANO_ATUAL, CATEGORIAS_DESPESA } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/despesas")({
  head: () => ({
    meta: [
      { title: "Despesas · Património" },
      {
        name: "description",
        content: "Registo e análise de despesas por categoria, imóvel e período.",
      },
      { property: "og:title", content: "Despesas · Património" },
      { property: "og:description", content: "Controlo de custos do portefólio imobiliário." },
    ],
  }),
  component: DespesasPage,
});

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function DespesasPage() {
  const { expenses, properties } = useStore();
  const [categoria, setCategoria] = useState("Todas");
  const [q, setQ] = useState("");

  const propMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const doAno = useMemo(
    () => expenses.filter((e) => e.data.startsWith(String(ANO_ATUAL))),
    [expenses],
  );

  const porCategoria = useMemo(() => {
    const map = new Map<string, number>();
    doAno.forEach((e) => map.set(e.categoria, (map.get(e.categoria) ?? 0) + e.valor));
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [doAno]);

  const porMes = useMemo(
    () =>
      MESES.map((label, i) => ({
        label: label.slice(0, 3),
        valor: doAno
          .filter((e) => Number(e.data.slice(5, 7)) - 1 === i)
          .reduce((s, e) => s + e.valor, 0),
      })),
    [doAno],
  );

  const total = doAno.reduce((s, e) => s + e.valor, 0);
  const recorrentes = doAno.filter((e) => e.recorrente).reduce((s, e) => s + e.valor, 0);

  const lista = expenses
    .filter((e) => categoria === "Todas" || e.categoria === categoria)
    .filter((e) => {
      const term = q.trim().toLowerCase();
      if (!term) return true;
      const morada = e.propertyId ? (propMap.get(e.propertyId)?.morada ?? "") : "";
      return (
        e.descricao.toLowerCase().includes(term) ||
        e.fornecedor.toLowerCase().includes(term) ||
        morada.toLowerCase().includes(term)
      );
    })
    .slice(0, 40);

  return (
    <div>
      <PageHeader
        title="Despesas"
        subtitle={`${ANO_ATUAL} · ${doAno.length} lançamentos`}
        actions={<AddExpenseDialog />}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Total do ano" value={money(total)} />
        <MetricCard label="Média mensal" value={money(total / 12)} />
        <MetricCard label="Recorrentes" value={money(recorrentes)} />
        <MetricCard label="Categoria principal" value={porCategoria[0]?.name ?? "—"} hint={money(porCategoria[0]?.value ?? 0)} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <section className="surface p-5">
          <h2 className="text-sm font-semibold">Despesas por categoria</h2>
          <div className="mt-3 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={porCategoria} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {porCategoria.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => money(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 text-xs">
            {porCategoria.slice(0, 5).map((c, i) => (
              <li key={c.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  {c.name}
                </span>
                <span className="num font-medium">{money(c.value)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold">Despesas por mês</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porMes}>
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
                <Bar dataKey="valor" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar despesa, fornecedor ou imóvel"
          className="h-9 sm:max-w-xs"
        />
        <Select value={categoria} onValueChange={setCategoria}>
          <SelectTrigger className="h-9 sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todas">Todas as categorias</SelectItem>
            {CATEGORIAS_DESPESA.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="surface mt-3 hidden overflow-hidden lg:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Data</th>
              <th className="px-4 py-3 text-left font-medium">Imóvel</th>
              <th className="px-4 py-3 text-left font-medium">Categoria</th>
              <th className="px-4 py-3 text-left font-medium">Descrição</th>
              <th className="px-4 py-3 text-left font-medium">Fornecedor</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lista.map((e) => (
              <tr key={e.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">{dateLabel(e.data)}</td>
                <td className="px-4 py-3">
                  {e.propertyId ? (propMap.get(e.propertyId)?.morada ?? "—") : "Geral"}
                </td>
                <td className="px-4 py-3">{e.categoria}</td>
                <td className="px-4 py-3">{e.descricao}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.fornecedor}</td>
                <td className="num px-4 py-3 text-right font-medium">{money(e.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-3 space-y-2 lg:hidden">
        {lista.map((e) => (
          <li key={e.id} className="surface flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{e.descricao}</p>
              <p className="truncate text-xs text-muted-foreground">
                {dateLabel(e.data)} · {e.categoria}
              </p>
            </div>
            <span className="num font-semibold">{money(e.valor)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AddExpenseDialog() {
  const { addExpense, properties } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    propertyId: "geral",
    categoria: "Manutenção",
    descricao: "",
    fornecedor: "",
    valor: "",
    data: new Date().toISOString().slice(0, 10),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Adicionar despesa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova despesa</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Imóvel</Label>
            <Select
              value={form.propertyId}
              onValueChange={(v) => setForm((f) => ({ ...f, propertyId: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Despesa geral</SelectItem>
                {properties.slice(0, 40).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.morada}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(v) => setForm((f) => ({ ...f, categoria: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_DESPESA.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor (€)</Label>
              <Input
                inputMode="decimal"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data</Label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Fornecedor</Label>
            <Input
              value={form.fornecedor}
              onChange={(e) => setForm((f) => ({ ...f, fornecedor: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              const valor = Number(form.valor);
              if (!valor) {
                toast.error("Indique o valor da despesa");
                return;
              }
              addExpense({
                propertyId: form.propertyId === "geral" ? null : form.propertyId,
                data: form.data,
                categoria: form.categoria,
                descricao: form.descricao || form.categoria,
                fornecedor: form.fornecedor || "—",
                valor,
                recorrente: false,
              });
              toast.success("Despesa registada");
              setOpen(false);
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
