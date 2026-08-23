import {
  LayoutDashboard,
  Wallet,
  Building2,
  Users,
  FileText,
  Receipt,
  Hammer,
  FolderOpen,
  PieChart,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Rendas", to: "/rendas", icon: Wallet },
  { label: "Imóveis", to: "/imoveis", icon: Building2 },
  { label: "Inquilinos", to: "/inquilinos", icon: Users },
  { label: "Contratos", to: "/contratos", icon: FileText },
  { label: "Despesas", to: "/despesas", icon: Receipt },
  { label: "Obras & Manutenção", to: "/obras", icon: Hammer },
  { label: "Documentos", to: "/documentos", icon: FolderOpen },
  { label: "Património", to: "/patrimonio", icon: PieChart },
  { label: "Relatórios", to: "/relatorios", icon: BarChart3 },
  { label: "Assistente IA", to: "/ia", icon: Sparkles },
  { label: "Notificações", to: "/notificacoes", icon: Bell },
];

export const SETTINGS_NAV: NavItem[] = [{ label: "Definições", to: "/definicoes", icon: Settings }];
