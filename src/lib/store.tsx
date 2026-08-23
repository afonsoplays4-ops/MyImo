import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  buildDataset,
  ANO_ATUAL,
  MES_ATUAL,
  type Dataset,
  type Expense,
  type MetodoPagamento,
  type Payment,
  type Property,
  type Tenant,
  type WorkOrder,
  type DocumentItem,
} from "./mock-data";

interface RegisterPaymentInput {
  paymentId: string;
  valor: number;
  data: string;
  metodo: MetodoPagamento;
  notas?: string;
  comprovativo?: string | null;
}

interface Store extends Dataset {
  registerPayment: (input: RegisterPaymentInput) => void;
  addProperty: (p: Omit<Property, "id" | "ref">) => void;
  addTenant: (t: Omit<Tenant, "id">) => void;
  addExpense: (e: Omit<Expense, "id">) => void;
  addWork: (w: Omit<WorkOrder, "id">) => void;
  addDocument: (d: Omit<DocumentItem, "id">) => void;
  updateRent: (propertyId: string, novaRenda: number, motivo: string, ano: number) => void;
  markAllRead: () => void;
  propertyById: (id: string) => Property | undefined;
  tenantByProperty: (id: string) => Tenant | undefined;
  contractByProperty: (id: string) => Dataset["contracts"][number] | undefined;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset>(() => buildDataset());

  const value = useMemo<Store>(() => {
    const update = (patch: Partial<Dataset>) => setData((d) => ({ ...d, ...patch }));

    return {
      ...data,
      registerPayment: ({ paymentId, valor, data: dataPag, metodo, notas, comprovativo }) => {
        setData((d) => ({
          ...d,
          payments: d.payments.map((p): Payment => {
            if (p.id !== paymentId) return p;
            const estado = valor >= p.previsto ? "Pago" : valor > 0 ? "Parcial" : p.estado;
            return {
              ...p,
              recebido: valor,
              estado,
              dataPagamento: dataPag,
              metodo,
              notas: notas ?? "",
              comprovativo: comprovativo ?? null,
            };
          }),
        }));
      },
      addProperty: (p) => {
        setData((d) => {
          const id = `p${d.properties.length + 1}-n`;
          return {
            ...d,
            properties: [
              { ...p, id, ref: `IM-${String(d.properties.length + 1).padStart(2, "0")}` },
              ...d.properties,
            ],
          };
        });
      },
      addTenant: (t) =>
        setData((d) => ({ ...d, tenants: [{ ...t, id: `t${d.tenants.length + 1}-n` }, ...d.tenants] })),
      addExpense: (e) =>
        setData((d) => ({ ...d, expenses: [{ ...e, id: `e-n${d.expenses.length + 1}` }, ...d.expenses] })),
      addWork: (w) =>
        setData((d) => ({ ...d, works: [{ ...w, id: `w-n${d.works.length + 1}` }, ...d.works] })),
      addDocument: (doc) =>
        setData((d) => ({
          ...d,
          documents: [{ ...doc, id: `d-n${d.documents.length + 1}` }, ...d.documents],
        })),
      updateRent: (propertyId, novaRenda, motivo, ano) => {
        setData((d) => ({
          ...d,
          properties: d.properties.map((p) =>
            p.id === propertyId ? { ...p, rendaMensal: novaRenda } : p,
          ),
          contracts: d.contracts.map((c) =>
            c.propertyId === propertyId
              ? { ...c, rendaAtual: novaRenda, historico: [...c.historico, { ano, valor: novaRenda, motivo }] }
              : c,
          ),
          payments: d.payments.map((p) =>
            p.propertyId === propertyId && p.estado === "Não vencido"
              ? { ...p, previsto: novaRenda }
              : p,
          ),
        }));
      },
      markAllRead: () =>
        update({ notifications: data.notifications.map((n) => ({ ...n, lida: true })) }),
      propertyById: (id) => data.properties.find((p) => p.id === id),
      tenantByProperty: (id) => data.tenants.find((t) => t.propertyId === id),
      contractByProperty: (id) => data.contracts.find((c) => c.propertyId === id),
    };
  }, [data]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore tem de ser usado dentro de StoreProvider");
  return ctx;
}

/* --------- seletores / métricas derivadas --------- */

export function usePeriodMetrics(ano = ANO_ATUAL, mes = MES_ATUAL) {
  const { properties, payments, expenses } = useStore();
  return useMemo(() => {
    const doMes = payments.filter((p) => p.ano === ano && p.mes === mes);
    const previsto = doMes.reduce((s, p) => s + p.previsto, 0);
    const recebido = doMes.reduce((s, p) => s + p.recebido, 0);
    const despesasMes = expenses
      .filter((e) => {
        const d = new Date(e.data);
        return d.getFullYear() === ano && d.getMonth() === mes;
      })
      .reduce((s, e) => s + e.valor, 0);
    const arrendados = properties.filter((p) => p.estado === "Arrendado").length;
    const disponiveis = properties.filter((p) => p.estado === "Disponível").length;
    return {
      totalImoveis: properties.length,
      arrendados,
      disponiveis,
      emObras: properties.filter((p) => p.estado === "Em obras").length,
      ocupacao: properties.length ? (arrendados / properties.length) * 100 : 0,
      previsto,
      recebido,
      emFalta: previsto - recebido,
      despesas: despesasMes,
      liquido: recebido - despesasMes,
      pagos: doMes.filter((p) => p.estado === "Pago").length,
      parciais: doMes.filter((p) => p.estado === "Parcial").length,
      atraso: doMes.filter((p) => p.estado === "Em atraso").length,
      porPagar: doMes.filter((p) => p.estado === "Por pagar").length,
      taxaCobranca: previsto ? (recebido / previsto) * 100 : 0,
    };
  }, [properties, payments, expenses, ano, mes]);
}

export function useLast12Months() {
  const { payments, expenses } = useStore();
  return useMemo(() => {
    const out: { label: string; previsto: number; recebido: number; despesas: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(ANO_ATUAL, MES_ATUAL - i, 1);
      const ano = d.getFullYear();
      const mes = d.getMonth();
      const doMes = payments.filter((p) => p.ano === ano && p.mes === mes);
      const desp = expenses
        .filter((e) => {
          const ed = new Date(e.data);
          return ed.getFullYear() === ano && ed.getMonth() === mes;
        })
        .reduce((s, e) => s + e.valor, 0);
      out.push({
        label: d.toLocaleDateString("pt-PT", { month: "short" }).replace(".", ""),
        previsto: doMes.reduce((s, p) => s + p.previsto, 0),
        recebido: doMes.reduce((s, p) => s + p.recebido, 0),
        despesas: Math.round(desp),
      });
    }
    return out;
  }, [payments, expenses]);
}

export interface PropertyPerformance {
  id: string;
  ref: string;
  morada: string;
  localidade: string;
  investimento: number;
  valorAtual: number;
  rendaAnual: number;
  despesasAnuais: number;
  liquido: number;
  yieldBruta: number;
  yieldLiquida: number;
}

export function usePortfolioPerformance(): PropertyPerformance[] {
  const { properties, payments, expenses } = useStore();
  return useMemo(() => {
    const desde = new Date(ANO_ATUAL, MES_ATUAL - 11, 1);
    return properties
      .map((p) => {
        const investimento = p.valorAquisicao + p.custosAquisicao + p.valorObras;
        const rendaAnual = payments
          .filter((x) => {
            const d = new Date(x.ano, x.mes, 1);
            return x.propertyId === p.id && d >= desde;
          })
          .reduce((s, x) => s + x.recebido, 0);
        const despesasAnuais = expenses
          .filter((e) => e.propertyId === p.id && new Date(e.data) >= desde)
          .reduce((s, e) => s + e.valor, 0);
        return {
          id: p.id,
          ref: p.ref,
          morada: p.morada,
          localidade: p.localidade,
          investimento,
          valorAtual: p.valorEstimado,
          rendaAnual,
          despesasAnuais,
          liquido: rendaAnual - despesasAnuais,
          yieldBruta: investimento ? (rendaAnual / investimento) * 100 : 0,
          yieldLiquida: investimento ? ((rendaAnual - despesasAnuais) / investimento) * 100 : 0,
        };
      })
      .sort((a, b) => b.yieldLiquida - a.yieldLiquida);
  }, [properties, payments, expenses]);
}
