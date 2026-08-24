import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { MetricCard, PageHeader } from "@/components/ui-kit/MetricCard";
import { Tone } from "@/components/ui-kit/badges";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { money, dateLabel } from "@/lib/format";
import { ANO_ATUAL } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/obras")({
  head: () => ({
    meta: [
      { title: "Obras & Manutenção · Património" },
      {
        name: "description",
        content: "Pedidos de manutenção, obras em curso, orçamentos e custos por imóvel.",
      },
      { property: "og:title", content: "Obras & Manutenção · Património" },
      { property: "og:description", content: "Kanban operacional de obras e manutenções." },
    ],
  }),
  component: ObrasPage,
});

const COLUNAS = ["Aberto", "Em curso", "Concluído"] as const;

function ObrasPage() {
  const { works, properties } = useStore();
  const [vista, setVista] = useState<"kanban" | "lista">("kanban");

  const propMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const doAno = works.filter((w) => w.abertura.startsWith(String(ANO_ATUAL)));
  const custoAno = doAno.reduce((s, w) => s + (w.custoReal || w.custoPrevisto), 0);

  return (
    <div>
      <PageHeader
        title="Obras & Manutenção"
        subtitle={`${works.length} intervenções registadas`}
        actions={<AddWorkDialog />}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Em aberto" value={String(works.filter((w) => w.estado === "Aberto").length)} tone="warning" />
        <MetricCard label="Em curso" value={String(works.filter((w) => w.estado === "Em curso").length)} />
        <MetricCard label="Concluídas" value={String(works.filter((w) => w.estado === "Concluído").length)} tone="success" />
        <MetricCard label={`Custo ${ANO_ATUAL}`} value={money(custoAno)} />
      </div>

      <div className="mt-4 mb-3 flex gap-1.5">
        {(["kanban", "lista"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVista(v)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              vista === v
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {v}
          </button>
        ))}
      </div>

      {vista === "kanban" ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUNAS.map((col) => {
            const itens = works.filter((w) => w.estado === col).slice(0, 8);
            return (
              <section key={col} className="surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">{col}</h2>
                  <span className="num text-xs text-muted-foreground">{itens.length}</span>
                </div>
                <ul className="space-y-2">
                  {itens.map((w) => (
                    <li key={w.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{w.titulo}</p>
                        <Tone
                          tone={
                            w.prioridade === "Alta" ? "danger" : w.prioridade === "Média" ? "warning" : "muted"
                          }
                        >
                          {w.prioridade}
                        </Tone>
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {propMap.get(w.propertyId)?.morada}
                      </p>
                      <p className="num mt-2 text-xs">
                        {money(w.custoReal || w.custoPrevisto)} · {dateLabel(w.abertura)}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Intervenção</th>
                <th className="px-4 py-3 text-left font-medium">Imóvel</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Abertura</th>
                <th className="px-4 py-3 text-right font-medium">Previsto</th>
                <th className="px-4 py-3 text-right font-medium">Real</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {works.slice(0, 40).map((w) => (
                <tr key={w.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{w.titulo}</td>
                  <td className="px-4 py-3">{propMap.get(w.propertyId)?.morada}</td>
                  <td className="px-4 py-3">
                    <Tone tone={w.estado === "Concluído" ? "success" : w.estado === "Em curso" ? "info" : "warning"}>
                      {w.estado}
                    </Tone>
                  </td>
                  <td className="px-4 py-3">{dateLabel(w.abertura)}</td>
                  <td className="num px-4 py-3 text-right">{money(w.custoPrevisto)}</td>
                  <td className="num px-4 py-3 text-right">{w.custoReal ? money(w.custoReal) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddWorkDialog() {
  const { addWork, properties } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    propertyId: properties[0]?.id ?? "",
    prioridade: "Média" as "Baixa" | "Média" | "Alta",
    custoPrevisto: "",
    responsavel: "",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Nova intervenção
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova obra ou manutenção</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={form.titulo} onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Imóvel</Label>
            <Select value={form.propertyId} onValueChange={(v) => setForm((f) => ({ ...f, propertyId: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {properties.slice(0, 40).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.morada}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select
                value={form.prioridade}
                onValueChange={(v) => setForm((f) => ({ ...f, prioridade: v as typeof f.prioridade }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Baixa", "Média", "Alta"] as const).map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Custo previsto (€)</Label>
              <Input
                inputMode="decimal"
                value={form.custoPrevisto}
                onChange={(e) => setForm((f) => ({ ...f, custoPrevisto: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Responsável</Label>
            <Input
              value={form.responsavel}
              onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              addWork({
                titulo: form.titulo || "Intervenção",
                propertyId: form.propertyId,
                categoria: "Manutenção",
                prioridade: form.prioridade,
                estado: "Aberto",
                custoPrevisto: Number(form.custoPrevisto) || 0,
                custoReal: 0,
                abertura: new Date().toISOString().slice(0, 10),
                fecho: null,
                responsavel: form.responsavel || "—",
              });
              toast.success("Intervenção criada");
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
