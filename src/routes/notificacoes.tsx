import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, Bell, CheckCheck, FileText, Hammer, Sparkles, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/MetricCard";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { dateLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações · Património" },
      {
        name: "description",
        content: "Alertas de rendas em atraso, contratos a terminar e documentos a expirar.",
      },
      { property: "og:title", content: "Notificações · Património" },
      { property: "og:description", content: "Centro de alertas do seu património imobiliário." },
    ],
  }),
  component: NotificacoesPage,
});

const ICONS = {
  renda: Wallet,
  contrato: FileText,
  documento: AlertTriangle,
  manutencao: Hammer,
  ia: Sparkles,
} as const;

const FILTROS = ["Todas", "Não lidas", "renda", "contrato", "documento", "manutencao", "ia"] as const;

function NotificacoesPage() {
  const { notifications, markAllRead } = useStore();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todas");

  const lista = notifications.filter((n) =>
    filtro === "Todas" ? true : filtro === "Não lidas" ? !n.lida : n.tipo === filtro,
  );
  const naoLidas = notifications.filter((n) => !n.lida).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notificações"
        subtitle={`${naoLidas} por ler`}
        actions={
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              markAllRead();
              toast.success("Todas as notificações marcadas como lidas");
            }}
          >
            <CheckCheck className="size-4" />
            Marcar todas como lidas
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              filtro === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted",
            )}
          >
            {f === "manutencao" ? "manutenção" : f}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="surface grid place-items-center gap-2 p-10 text-center">
          <Bell className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Sem notificações neste filtro.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {lista.map((n) => {
            const Icon = ICONS[n.tipo];
            return (
              <li
                key={n.id}
                className={cn(
                  "surface flex gap-3 p-4",
                  !n.lida && "border-l-4 border-l-primary",
                )}
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{n.titulo}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{dateLabel(n.data)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.descricao}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
