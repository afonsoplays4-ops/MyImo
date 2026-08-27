import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, LogOut, UserRound } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/MetricCard";
import { MAIN_NAV, SETTINGS_NAV } from "@/components/layout/nav";
import { toast } from "sonner";

export const Route = createFileRoute("/mais")({
  head: () => ({
    meta: [
      { title: "Mais · Património" },
      {
        name: "description",
        content: "Aceda a inquilinos, contratos, despesas, obras, documentos, relatórios e definições.",
      },
      { property: "og:title", content: "Mais · Património" },
      { property: "og:description", content: "Menu completo da aplicação em mobile." },
    ],
  }),
  component: MaisPage,
});

const ESCONDIDOS = ["/", "/rendas", "/imoveis", "/ia"];

function MaisPage() {
  const itens = MAIN_NAV.filter((i) => !ESCONDIDOS.includes(i.to));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Mais" subtitle="Todas as áreas da aplicação" />

      <ul className="surface divide-y divide-border overflow-hidden">
        {[...itens, ...SETTINGS_NAV].map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted">
              <i.icon className="size-5 text-muted-foreground" />
              <span className="flex-1 text-sm font-medium">{i.label}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
        <li>
          <Link to="/definicoes" className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-muted">
            <UserRound className="size-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">Perfil</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </li>
        <li>
          <button
            onClick={() => toast.info("Sessão terminada (simulado)")}
            className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted"
          >
            <LogOut className="size-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">Terminar sessão</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
