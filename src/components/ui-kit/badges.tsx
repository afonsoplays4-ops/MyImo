import { cn } from "@/lib/utils";
import type { EstadoImovel, EstadoRenda, EstadoContrato } from "@/lib/mock-data";

const base =
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap";

const tones = {
  success: "border-success/25 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/15 text-warning",
  danger: "border-destructive/25 bg-destructive/10 text-destructive",
  muted: "border-border bg-muted text-muted-foreground",
  info: "border-info/25 bg-info/10 text-info",
} as const;

export function StatusDot({ tone }: { tone: keyof typeof tones }) {
  const dot = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
    muted: "bg-muted-foreground",
    info: "bg-info",
  }[tone];
  return <span className={cn("size-1.5 rounded-full", dot)} />;
}

export function RentStatusBadge({ estado }: { estado: EstadoRenda }) {
  const tone: keyof typeof tones =
    estado === "Pago"
      ? "success"
      : estado === "Parcial"
        ? "warning"
        : estado === "Em atraso"
          ? "danger"
          : estado === "Por pagar"
            ? "info"
            : "muted";
  return (
    <span className={cn(base, tones[tone])}>
      <StatusDot tone={tone} />
      {estado}
    </span>
  );
}

export function PropertyStatusBadge({ estado }: { estado: EstadoImovel }) {
  const tone: keyof typeof tones =
    estado === "Arrendado" ? "success" : estado === "Disponível" ? "info" : "warning";
  return (
    <span className={cn(base, tones[tone])}>
      <StatusDot tone={tone} />
      {estado}
    </span>
  );
}

export function ContractStatusBadge({ estado }: { estado: EstadoContrato }) {
  const tone: keyof typeof tones =
    estado === "Ativo"
      ? "success"
      : estado === "A terminar"
        ? "warning"
        : estado === "Renovação pendente"
          ? "info"
          : "muted";
  return (
    <span className={cn(base, tones[tone])}>
      <StatusDot tone={tone} />
      {estado}
    </span>
  );
}

export function Tone({
  tone,
  children,
}: {
  tone: keyof typeof tones;
  children: React.ReactNode;
}) {
  return <span className={cn(base, tones[tone])}>{children}</span>;
}
