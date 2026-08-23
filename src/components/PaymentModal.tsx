import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { METODOS, type MetodoPagamento, type Payment } from "@/lib/mock-data";
import { money, monthLabel, todayISO } from "@/lib/format";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function PaymentModal({
  payment,
  open,
  onOpenChange,
}: {
  payment: Payment | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { registerPayment, propertyById, tenantByProperty } = useStore();
  const [total, setTotal] = useState(true);
  const [valor, setValor] = useState("0");
  const [data, setData] = useState(todayISO());
  const [metodo, setMetodo] = useState<MetodoPagamento>("Transferência");
  const [notas, setNotas] = useState("");
  const [ficheiro, setFicheiro] = useState<string | null>(null);

  useEffect(() => {
    if (payment) {
      setTotal(true);
      setValor(String(payment.previsto));
      setData(todayISO());
      setMetodo(payment.metodo ?? "Transferência");
      setNotas(payment.notas ?? "");
      setFicheiro(payment.comprovativo);
    }
  }, [payment]);

  if (!payment) return null;
  const prop = propertyById(payment.propertyId);
  const tenant = tenantByProperty(payment.propertyId);
  const valorNum = Number(valor) || 0;
  const parcial = valorNum > 0 && valorNum < payment.previsto;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registar pagamento</DialogTitle>
          <DialogDescription>
            {prop?.morada} · {tenant?.nome ?? "Sem inquilino"} · {monthLabel(payment.ano, payment.mes)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
            <div>
              <p className="text-sm font-medium">Pago na totalidade</p>
              <p className="text-xs text-muted-foreground">
                Renda prevista: {money(payment.previsto)}
              </p>
            </div>
            <Switch
              checked={total}
              onCheckedChange={(v) => {
                setTotal(v);
                if (v) setValor(String(payment.previsto));
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor recebido</Label>
              <Input
                id="valor"
                inputMode="decimal"
                value={valor}
                onChange={(e) => {
                  setValor(e.target.value);
                  setTotal(Number(e.target.value) >= payment.previsto);
                }}
              />
              {parcial ? (
                <p className="text-xs text-warning">
                  Inferior ao previsto — será classificado como Parcial.
                </p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Método de pagamento</Label>
            <Select value={metodo} onValueChange={(v) => setMetodo(v as MetodoPagamento)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METODOS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} />
          </div>

          <button
            type="button"
            onClick={() => {
              setFicheiro(`comprovativo-${payment.ano}-${payment.mes + 1}.pdf`);
              toast.success("Comprovativo anexado (simulado)");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            <Upload className="size-4" />
            {ficheiro ?? "Carregar comprovativo"}
          </button>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => {
              registerPayment({
                paymentId: payment.id,
                valor: valorNum,
                data,
                metodo,
                notas,
                comprovativo: ficheiro,
              });
              toast.success(
                `Pagamento de ${money(valorNum)} registado${parcial ? " (parcial)" : ""}`,
              );
              onOpenChange(false);
            }}
          >
            Registar pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
