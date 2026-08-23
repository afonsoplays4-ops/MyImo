import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Wallet, Building2, UserPlus, FileText, Receipt, Hammer, Upload } from "lucide-react";

const ACTIONS = [
  { label: "Registar pagamento", icon: Wallet, to: "/rendas" },
  { label: "Adicionar imóvel", icon: Building2, to: "/imoveis" },
  { label: "Adicionar inquilino", icon: UserPlus, to: "/inquilinos" },
  { label: "Criar contrato", icon: FileText, to: "/contratos" },
  { label: "Adicionar despesa", icon: Receipt, to: "/despesas" },
  { label: "Criar manutenção", icon: Hammer, to: "/obras" },
  { label: "Upload documento", icon: Upload, to: "/documentos" },
] as const;

export function QuickActions({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={compact ? "icon" : "sm"} className="gap-1.5">
          <Plus className="size-4" />
          {compact ? null : "Novo"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {ACTIONS.map((a) => (
          <DropdownMenuItem key={a.label} onSelect={() => navigate({ to: a.to })}>
            <a.icon className="size-4 text-muted-foreground" />
            {a.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
