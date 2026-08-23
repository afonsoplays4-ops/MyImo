import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/MetricCard";
import { PropertyStatusBadge } from "@/components/ui-kit/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { EstadoImovel } from "@/lib/mock-data";

export const Route = createFileRoute("/imoveis/")({
  head: () => ({
    meta: [
      { title: "Imóveis · Património" },
      {
        name: "description",
        content: "Lista completa de imóveis com estado, renda, tipologia e valor estimado.",
      },
      { property: "og:title", content: "Imóveis · Património" },
      { property: "og:description", content: "Todos os imóveis do portefólio num só sítio." },
    ],
  }),
  component: ImoveisPage,
});

const ESTADOS: (EstadoImovel | "Todos")[] = ["Todos", "Arrendado", "Disponível", "Em obras"];

function ImoveisPage() {
  const { properties, tenants } = useStore();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState<EstadoImovel | "Todos">("Todos");
  const [vista, setVista] = useState<"grelha" | "tabela">("grelha");
  const [pagina, setPagina] = useState(1);
  const porPagina = 12;

  const tenantMap = useMemo(() => new Map(tenants.map((t) => [t.propertyId, t])), [tenants]);

  const filtrados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    return properties.filter(
      (p) =>
        (estado === "Todos" || p.estado === estado) &&
        (!termo ||
          p.morada.toLowerCase().includes(termo) ||
          p.localidade.toLowerCase().includes(termo) ||
          p.ref.toLowerCase().includes(termo)),
    );
  }, [properties, q, estado]);

  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));

  return (
    <div>
      <PageHeader
        title="Imóveis"
        subtitle={`${filtrados.length} imóveis no portefólio`}
        actions={<AddPropertyDialog />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPagina(1);
          }}
          placeholder="Pesquisar morada, localidade ou referência"
          className="h-9 w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {ESTADOS.map((e) => (
            <button
              key={e}
              onClick={() => {
                setEstado(e);
                setPagina(1);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                estado === e
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              {e}
            </button>
          ))}
        </div>
        <div className="ml-auto hidden gap-1 lg:flex">
          <Button
            variant={vista === "grelha" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setVista("grelha")}
            aria-label="Vista em grelha"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={vista === "tabela" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setVista("tabela")}
            aria-label="Vista em tabela"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>

      {vista === "tabela" ? (
        <div className="surface hidden overflow-hidden lg:block">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Imóvel</th>
                <th className="px-4 py-3 text-left font-medium">Tipologia</th>
                <th className="px-4 py-3 text-left font-medium">Inquilino</th>
                <th className="px-4 py-3 text-right font-medium">Renda</th>
                <th className="px-4 py-3 text-right font-medium">Valor estimado</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginados.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <Link to="/imoveis/$id" params={{ id: p.id }} className="font-medium hover:text-primary">
                      {p.morada}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {p.ref} · {p.localidade}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {p.tipologia} · {p.area} m²
                  </td>
                  <td className="px-4 py-3">{tenantMap.get(p.id)?.nome ?? "—"}</td>
                  <td className="num px-4 py-3 text-right">{p.rendaMensal ? money(p.rendaMensal) : "—"}</td>
                  <td className="num px-4 py-3 text-right">{money(p.valorEstimado)}</td>
                  <td className="px-4 py-3">
                    <PropertyStatusBadge estado={p.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
          vista === "tabela" && "lg:hidden",
        )}
      >
        {paginados.map((p) => (
          <Link
            key={p.id}
            to="/imoveis/$id"
            params={{ id: p.id }}
            className="surface p-4 transition-shadow hover:shadow-[var(--shadow-pop)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold">{p.morada}</p>
                <p className="text-xs text-muted-foreground">
                  {p.ref} · {p.localidade}
                </p>
              </div>
              <PropertyStatusBadge estado={p.estado} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="num text-sm font-semibold">{p.tipologia}</p>
                <p className="text-[11px] text-muted-foreground">{p.area} m²</p>
              </div>
              <div>
                <p className="num text-sm font-semibold">
                  {p.rendaMensal ? money(p.rendaMensal) : "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">Renda</p>
              </div>
              <div>
                <p className="num text-sm font-semibold">{money(p.valorEstimado)}</p>
                <p className="text-[11px] text-muted-foreground">Valor</p>
              </div>
            </div>
            <p className="mt-3 truncate text-xs text-muted-foreground">
              {tenantMap.get(p.id)?.nome ?? "Sem inquilino"}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Página {pagina} de {totalPaginas}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagina === totalPaginas}
            onClick={() => setPagina((p) => p + 1)}
          >
            Seguinte
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddPropertyDialog() {
  const { addProperty } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    morada: "",
    codigoPostal: "",
    localidade: "",
    tipo: "Apartamento",
    tipologia: "T2",
    area: "80",
    anoAquisicao: "2024",
    valorAquisicao: "120000",
    custosAquisicao: "8000",
    valorObras: "0",
    valorEstimado: "150000",
    observacoes: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Adicionar imóvel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo imóvel</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Morada</Label>
            <Input value={form.morada} onChange={(e) => set("morada", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Código postal</Label>
            <Input value={form.codigoPostal} onChange={(e) => set("codigoPostal", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Localidade</Label>
            <Input value={form.localidade} onChange={(e) => set("localidade", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Apartamento", "Moradia", "Loja", "Escritório"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tipologia</Label>
            <Select value={form.tipologia} onValueChange={(v) => set("tipologia", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["T0", "T1", "T2", "T3", "T4"].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(
            [
              ["area", "Área (m²)"],
              ["anoAquisicao", "Ano de aquisição"],
              ["valorAquisicao", "Valor de aquisição (€)"],
              ["custosAquisicao", "Custos de aquisição (€)"],
              ["valorObras", "Valor de obras (€)"],
              ["valorEstimado", "Valor estimado atual (€)"],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="space-y-1.5">
              <Label>{label}</Label>
              <Input inputMode="numeric" value={form[k]} onChange={(e) => set(k, e.target.value)} />
            </div>
          ))}
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Observações</Label>
            <Textarea value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              addProperty({
                morada: form.morada || "Novo imóvel",
                codigoPostal: form.codigoPostal,
                localidade: form.localidade || "Porto",
                tipo: form.tipo,
                tipologia: form.tipologia,
                area: Number(form.area) || 0,
                anoAquisicao: Number(form.anoAquisicao) || 2026,
                valorAquisicao: Number(form.valorAquisicao) || 0,
                custosAquisicao: Number(form.custosAquisicao) || 0,
                valorObras: Number(form.valorObras) || 0,
                valorEstimado: Number(form.valorEstimado) || 0,
                rendaMensal: 0,
                estado: "Disponível",
                observacoes: form.observacoes,
              });
              toast.success("Imóvel adicionado");
              setOpen(false);
            }}
          >
            Guardar imóvel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
