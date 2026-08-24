import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui-kit/MetricCard";
import { ContractStatusBadge } from "@/components/ui-kit/badges";
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
} from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { money, dateLabel, pct } from "@/lib/format";
import { ANO_ATUAL, type Contract, type EstadoContrato } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/contratos")({
  head: () => ({
    meta: [
      { title: "Contratos · Património" },
      {
        name: "description",
        content: "Contratos de arrendamento, renovações, cauções e atualizações de renda.",
      },
      { property: "og:title", content: "Contratos · Património" },
      { property: "og:description", content: "Contratos ativos, a terminar e renovações pendentes." },
    ],
  }),
  component: ContratosPage,
});

const FILTROS = ["Todos", "Ativo", "A terminar", "Renovação pendente", "Terminado"] as const;

function ContratosPage() {
  const { contracts, properties, tenants } = useStore();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todos");
  const [detalhe, setDetalhe] = useState<Contract | null>(null);

  const propMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);
  const tenantMap = useMemo(() => new Map(tenants.map((t) => [t.id, t])), [tenants]);

  const lista = contracts.filter((c) => filtro === "Todos" || c.estado === (filtro as EstadoContrato));

  return (
    <div>
      <PageHeader title="Contratos" subtitle={`${contracts.length} contratos registados`} />

      <div className="mb-4 flex flex-wrap gap-1.5">
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

      <div className="surface hidden overflow-hidden lg:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Imóvel</th>
              <th className="px-4 py-3 text-left font-medium">Inquilino</th>
              <th className="px-4 py-3 text-left font-medium">Início</th>
              <th className="px-4 py-3 text-left font-medium">Fim</th>
              <th className="px-4 py-3 text-right font-medium">Renda</th>
              <th className="px-4 py-3 text-right font-medium">Caução</th>
              <th className="px-4 py-3 text-left font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lista.slice(0, 30).map((c) => (
              <tr key={c.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link to="/imoveis/$id" params={{ id: c.propertyId }} className="font-medium hover:text-primary">
                    {propMap.get(c.propertyId)?.morada}
                  </Link>
                </td>
                <td className="px-4 py-3">{tenantMap.get(c.tenantId)?.nome}</td>
                <td className="px-4 py-3">{dateLabel(c.inicio)}</td>
                <td className="px-4 py-3">{dateLabel(c.fim)}</td>
                <td className="num px-4 py-3 text-right">{money(c.rendaAtual)}</td>
                <td className="num px-4 py-3 text-right">{money(c.caucao)}</td>
                <td className="px-4 py-3">
                  <ContractStatusBadge estado={c.estado} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setDetalhe(c)}>
                    Detalhe
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {lista.slice(0, 20).map((c) => (
          <li key={c.id} className="surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold">{propMap.get(c.propertyId)?.morada}</p>
                <p className="truncate text-xs text-muted-foreground">{tenantMap.get(c.tenantId)?.nome}</p>
              </div>
              <ContractStatusBadge estado={c.estado} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {dateLabel(c.inicio)} → {dateLabel(c.fim)}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="num font-semibold">{money(c.rendaAtual)}</span>
              <Button size="sm" variant="outline" className="h-10" onClick={() => setDetalhe(c)}>
                Detalhe
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ContractDetailDialog contract={detalhe} onClose={() => setDetalhe(null)} />
    </div>
  );
}

function ContractDetailDialog({ contract, onClose }: { contract: Contract | null; onClose: () => void }) {
  const { propertyById, tenantByProperty, updateRent } = useStore();
  const [novaRenda, setNovaRenda] = useState("");
  const [motivo, setMotivo] = useState("Atualização anual");

  if (!contract) return null;
  const prop = propertyById(contract.propertyId);
  const tenant = tenantByProperty(contract.propertyId);

  return (
    <Dialog open={!!contract} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{prop?.morada}</DialogTitle>
        </DialogHeader>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {[
            ["Inquilino", tenant?.nome ?? "—"],
            ["Data de início", dateLabel(contract.inicio)],
            ["Data de fim", dateLabel(contract.fim)],
            ["Tipo de contrato", contract.tipo],
            ["Renovação automática", contract.renovacaoAutomatica ? "Sim" : "Não"],
            ["Renda inicial", money(contract.rendaInicial)],
            ["Renda atual", money(contract.rendaAtual)],
            ["Caução", money(contract.caucao)],
            ["Rendas antecipadas", String(contract.rendasAntecipadas)],
            ["Fiador", contract.fiador],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-border pb-1.5">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="num font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase">Histórico de renda</p>
          <ul className="mt-2 space-y-1 text-sm">
            {contract.historico.map((h, idx) => (
              <li key={idx} className="flex justify-between">
                <span className="text-muted-foreground">
                  {h.ano} · {h.motivo}
                </span>
                <span className="num font-medium">{money(h.valor)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Variação desde o início:{" "}
            {pct(((contract.rendaAtual - contract.rendaInicial) / contract.rendaInicial) * 100)}
          </p>
        </div>

        <div className="space-y-2 rounded-lg border border-border p-3">
          <p className="text-sm font-semibold">Atualizar renda</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Nova renda (€)</Label>
              <Input inputMode="numeric" value={novaRenda} onChange={(e) => setNovaRenda(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Motivo</Label>
              <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            </div>
          </div>
          <Textarea placeholder="Observações" rows={2} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button
            onClick={() => {
              const valor = Number(novaRenda);
              if (!valor) return toast.error("Indique a nova renda");
              updateRent(contract.propertyId, valor, motivo, ANO_ATUAL);
              toast.success(`Renda atualizada para ${money(valor)}`);
              onClose();
            }}
          >
            Atualizar renda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
