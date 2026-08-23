import { Link } from "@tanstack/react-router";
import { Bell, Building, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GlobalSearch } from "./GlobalSearch";
import { QuickActions } from "./QuickActions";
import { useStore } from "@/lib/store";
import { dateLabel } from "@/lib/format";

export function Topbar() {
  const { notifications, markAllRead } = useStore();
  const naoLidas = notifications.filter((n) => !n.lida).length;
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 lg:hidden">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Building className="size-4" />
          </span>
          <span className="font-display text-sm font-semibold">Património</span>
        </Link>

        <div className="hidden flex-1 md:flex">
          <GlobalSearch />
        </div>
        <div className="flex-1 md:hidden" />

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Alternar tema"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
                <Bell className="size-4" />
                {naoLidas > 0 ? (
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <p className="text-sm font-semibold">Notificações</p>
                <button className="text-xs text-primary" onClick={markAllRead}>
                  Marcar como lidas
                </button>
              </div>
              <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className="px-4 py-3">
                    <p className="text-sm font-medium">{n.titulo}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.descricao}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{dateLabel(n.data)}</p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border p-2">
                <Link
                  to="/notificacoes"
                  className="block rounded-md px-3 py-2 text-center text-sm text-primary hover:bg-muted"
                >
                  Ver todas
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          <QuickActions />

          <Link to="/definicoes" aria-label="Perfil">
            <Avatar className="size-8">
              <AvatarFallback className="bg-secondary text-xs font-semibold">AG</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <GlobalSearch />
      </div>
    </header>
  );
}
