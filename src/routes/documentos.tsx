import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, Eye, FileText, Trash2, Upload } from "lucide-react";
import { MetricCard, PageHeader } from "@/components/ui-kit/MetricCard";
import { Tone } from "@/components/ui-kit/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { dateLabel } from "@/lib/format";
import { HOJE, TIPOS_DOCUMENTO } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/documentos")({
  head: () => ({
    meta: [
      { title: "Documentos · Património" },
      {
        name: "description",
        content: "Gestor de documentos por imóvel: contratos, seguros, cadernetas e faturas.",
      },
      { property: "og:title", content: "Documentos · Património" },
      { property: "og:description", content: "Arquivo digital do património com alertas de validade." },
    ],
  }),
  component: DocumentosPage,
});

function DocumentosPage() {
  const { documents, properties } = useStore();
  const [tipo, setTipo] = useState("Todos");
  const [q, setQ] = useState("");

  const propMap = useMemo(() => new Map(properties.map((p) => [p.id, p])), [properties]);

  const expiraEm60 = documents.filter((d) => {
    if (!d.validade) return false;
    const dias = (new Date(d.validade).getTime() - HOJE.getTime()) / 86400000;
    return dias >= 0 && dias <= 60;
  });
  const expirados = documents.filter((d) => d.validade && new Date(d.validade) < HOJE);

  const lista = documents
    .filter((d) => tipo === "Todos" || d.tipo === tipo)
    .filter((d) => d.nome.toLowerCase().includes(q.trim().toLowerCase()))
    .slice(0, 40);

  return (
    <div>
      <PageHeader
        title="Documentos"
        subtitle={`${documents.length} ficheiros no arquivo`}
        actions={<UploadDialog />}
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Total" value={String(documents.length)} />
        <MetricCard label="A expirar (60 dias)" value={String(expiraEm60.length)} tone="warning" />
        <MetricCard label="Expirados" value={String(expirados.length)} tone={expirados.length ? "danger" : "success"} />
        <MetricCard label="Tipos" value={String(new Set(documents.map((d) => d.tipo)).size)} />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pesquisar documento"
          className="h-9 sm:max-w-xs"
        />
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="h-9 sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos os tipos</SelectItem>
            {TIPOS_DOCUMENTO.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {lista.map((d) => {
          const vencido = d.validade ? new Date(d.validade) < HOJE : false;
          return (
            <li key={d.id} className="surface flex gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{d.nome}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {d.propertyId ? (propMap.get(d.propertyId)?.morada ?? "—") : "Geral"} · {d.tamanho}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  {d.validade ? (
                    <Tone tone={vencido ? "danger" : "muted"}>Validade {dateLabel(d.validade)}</Tone>
                  ) : (
                    <span className="text-xs text-muted-foreground">{dateLabel(d.dataUpload)}</span>
                  )}
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      aria-label="Pré-visualizar"
                      onClick={() => toast.info("Pré-visualização simulada")}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      aria-label="Descarregar"
                      onClick={() => toast.success("Download simulado")}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive"
                      aria-label="Eliminar"
                      onClick={() => toast.info("Eliminação simulada")}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function UploadDialog() {
  const { addDocument, properties } = useStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", tipo: "Contrato", propertyId: "geral", validade: "" });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Upload className="size-4" />
          Carregar documento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Carregar documento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid place-items-center rounded-lg border border-dashed border-border py-8 text-center">
            <Upload className="size-6 text-muted-foreground" />
            <p className="mt-2 text-xs text-muted-foreground">Arraste um ficheiro (upload simulado)</p>
          </div>
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={form.tipo} onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_DOCUMENTO.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Imóvel</Label>
            <Select value={form.propertyId} onValueChange={(v) => setForm((f) => ({ ...f, propertyId: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                {properties.slice(0, 40).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.morada}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Validade (opcional)</Label>
            <Input
              type="date"
              value={form.validade}
              onChange={(e) => setForm((f) => ({ ...f, validade: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              addDocument({
                nome: form.nome || "Documento.pdf",
                tipo: form.tipo,
                propertyId: form.propertyId === "geral" ? null : form.propertyId,
                dataUpload: new Date().toISOString().slice(0, 10),
                validade: form.validade || null,
                tamanho: "1,2 MB",
              });
              toast.success("Documento carregado");
              setOpen(false);
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
