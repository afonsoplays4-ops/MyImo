import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wallet, Building2, Sparkles, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Início", to: "/", icon: Home },
  { label: "Rendas", to: "/rendas", icon: Wallet },
  { label: "Imóveis", to: "/imoveis", icon: Building2 },
  { label: "IA", to: "/ia", icon: Sparkles },
  { label: "Mais", to: "/mais", icon: Menu },
] as const;

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
