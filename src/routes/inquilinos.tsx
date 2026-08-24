import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Mail, Phone, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/MetricCard";
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
import { useStore } from "@/lib/store";
import { money, dateLabel, pct } from "@/lib/format";
import { ANO_ATUAL, MES_ATUAL } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/inquilinos")({
  head: () => ({
    meta: [
      { title: "Inquilinos · Património" },
      {
        name: "description",
        content: "Todos os inquilinos, contactos, imóvel associado e estado dos pagamentos.",
      },
      { property: "og:title", content: "Inquilinos · Património" },
      { property: "og:description", content: "Gestão de inquilinos e estado dos pagamentos." },
    ],
  }),
  component: InquilinosPage,
});

function InquilinosPage() {
  const { tenants, properties, payments } = useStore();
  const [q, setQ] = useState("");

  const propMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const estadoMes = useMemo(() => {
    const map = new Map<string, string>();
    payments
      .filter((p) => p.ano === ANO_ATUAL && p.mes === MES_ATUAL)
      .forEach((p) => map.set(p.propertyId, p.estado));
    return map;
  }, [payments]);

  const lista = tenants.filter((t) => t.nome.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Inquilinos"
        subtitle={`${tenants.length} inquilinos ativos`}
        actions={<AddTenantDialog />}
      />

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Pesquisar inquilino"
        className="mb-4 h-9 w-full sm:max-w-xs"
      />

      <div className="surface hidden overflow-hidden lg:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-left font-medium">Imóvel</th>
              <th className="px-4 py-3 text-right font-medium">Renda atual</th>
              <th className="px-4 py-3 text-left font-medium">Desde</th>
              <th className="px-4 py-3 text-left font-medium">Pagamentos</th>
              <th className="px-4 py-3 text-left font-medium">Contacto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lista.slice(0, 30).map((t) => {
              const prop = t.propertyId ? propMap.get(t.propertyId) : undefined;
              const est = t.propertyId ? estadoMes.get(t.propertyId) : undefined;
              return (
                <tr key={t.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{t.nome}</td>
                  <td className="px-4 py-3">
                    {prop ? (
                      <Link to="/imoveis/$id" params={{ id: prop.id }} className="hover:text-primary">
                        {prop.morada}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="num px-4 py-3 text-right">{money(prop?.rendaMensal ?? 0)}</td>
                  <td className="px-4 py-3">{dateLabel(t.desde)}</td>
                  <td className="px-4 py-3">
                    <Tone tone={est === "Pago" ? "success" : est === "Parcial" ? "warning" : "danger"}>
                      {est ?? "—"}
                    </Tone>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <p>{t.email}</p>
                    <p>{t.telefone}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {lista.slice(0, 20).map((t) => {
          const prop = t.propertyId ? propMap.get(t.propertyId) : undefined;
          const est = t.propertyId ? estadoMes.get(t.propertyId) : undefined;
          return (
            <li key={t.id} className="surface p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{t.nome}</p>
                  <p className="truncate text-xs text-muted-foreground">{prop?.morada}</p>
                </div>
                <Tone tone={est === "Pago" ? "success" : est === "Parcial" ? "warning" : "danger"}>
                  {est ?? "—"}
                </Tone>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="num text-sm font-semibold">{money(prop?.rendaMensal ?? 0)}</p>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="size-10" asChild>
                    <a href={`tel:${t.telefone}`} aria-label="Telefonar">
                      <Phone className="size-4" />
                    </a>
                  </Button>
                  <Button size="icon" variant="outline" className="size-10" asChild>
                    <a href={`mailto:${t.email}`} aria-label="Enviar email">
                      <Mail className="size-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Pontualidade {pct(t.pontualidade, 0)} · desde {dateLabel(t.desde)}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AddTenantDialog() {
  const { addTenant, properties } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", nif: "" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Adicionar inquilino
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo inquilino</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {(
            [
              ["nome", "Nome"],
              ["email", "Email"],
              ["telefone", "Telefone"],
              ["nif", "NIF"],
            ] as const
          ).map(([k, label]) => (
            <div key={k} className="space-y-1.5">
              <Label>{label}</Label>
              <Input
                value={form[k]}
                onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              addTenant({
                nome: form.nome || "Novo inquilino",
                email: form.email,
                telefone: form.telefone,
                nif: form.nif,
                propertyId: properties.find((p) => p.estado === "Disponível")?.id ?? null,
                desde: new Date().toISOString().slice(0, 10),
                pontualidade: 100,
              });
              toast.success("Inquilino adicionado");
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
