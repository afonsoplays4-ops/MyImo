import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useStore } from "@/lib/store";
import { MAIN_NAV } from "./nav";
import { Search } from "lucide-react";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { properties, tenants } = useStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-muted/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted"
      >
        <Search className="size-4" />
        <span className="truncate">Pesquisar imóveis, inquilinos, contratos…</span>
        <kbd className="ml-auto hidden rounded border border-border px-1.5 text-[10px] md:inline">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Pesquisar…" />
        <CommandList>
          <CommandEmpty>Sem resultados.</CommandEmpty>
          <CommandGroup heading="Navegação">
            {MAIN_NAV.map((n) => (
              <CommandItem
                key={n.to}
                value={n.label}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: n.to });
                }}
              >
                <n.icon className="size-4 text-muted-foreground" />
                {n.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Imóveis">
            {properties.slice(0, 40).map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.ref} ${p.morada} ${p.localidade}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/imoveis/$id", params: { id: p.id } });
                }}
              >
                <span className="num text-xs text-muted-foreground">{p.ref}</span>
                {p.morada} · {p.localidade}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Inquilinos">
            {tenants.slice(0, 30).map((t) => (
              <CommandItem
                key={t.id}
                value={t.nome}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/inquilinos" });
                }}
              >
                {t.nome}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
