import { Link, useRouterState } from "@tanstack/react-router";
import { Building, LogOut, UserRound } from "lucide-react";
import { MAIN_NAV, SETTINGS_NAV } from "./nav";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="grid size-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Building className="size-5" />
        </div>
        <div>
          <p className="font-display text-base leading-tight font-semibold">Património</p>
          <p className="text-[11px] text-sidebar-foreground/60">Gestão inteligente</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {MAIN_NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("size-4", active && "text-sidebar-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-0.5 border-t border-sidebar-border px-3 py-3">
        {SETTINGS_NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
        <Link
          to="/definicoes"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <UserRound className="size-4" />
          Perfil
        </Link>
        <button
          onClick={() => toast.info("Sessão terminada (simulado)")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4" />
          Terminar sessão
        </button>
      </div>
    </aside>
  );
}
