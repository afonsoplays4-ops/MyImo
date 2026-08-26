import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore, usePeriodMetrics, usePortfolioPerformance } from "@/lib/store";
import { money, pct, dateLabel } from "@/lib/format";
import { ANO_ATUAL, MES_ATUAL } from "@/lib/mock-data";

export const Route = createFileRoute("/ia")({
  head: () => ({
    meta: [
      { title: "Assistente IA · Património" },
      {
        name: "description",
        content: "Faça perguntas sobre rendas, despesas, rentabilidade e contratos do seu património.",
      },
      { property: "og:title", content: "Assistente IA · Património" },
      { property: "og:description", content: "Respostas imediatas sobre o seu portefólio imobiliário." },
    ],
  }),
  component: IaPage,
});

interface Linha {
  label: string;
  valor: string;
  propertyId?: string;
}

interface Resposta {
  texto: string;
  linhas?: Linha[];
}

const SUGESTOES = [
  "Quem ainda não pagou este mês?",
  "Qual é o imóvel mais rentável?",
  "Quanto gastei em obras este ano?",
  "Que contratos terminam nos próximos 6 meses?",
  "Quais os imóveis com renda abaixo de 400 €?",
  "Qual é a minha taxa de ocupação?",
];

function IaPage() {
  const store = useStore();
  const metrics = usePeriodMetrics();
  const perf = usePortfolioPerformance();
  const [input, setInput] = useState("");
  const [historico, setHistorico] = useState<{ pergunta: string; resposta: Resposta }[]>([]);

  const propMap = useMemo(
    () => new Map(store.properties.map((p) => [p.id, p])),
    [store.properties],
  );

  function responder(pergunta: string): Resposta {
    const q = pergunta.toLowerCase();

    if (q.includes("não pagou") || q.includes("falta") || q.includes("atraso")) {
      const emFalta = store.payments.filter(
        (p) => p.ano === ANO_ATUAL && p.mes === MES_ATUAL && p.estado !== "Pago",
      );
      return {
        texto: `Existem ${emFalta.length} rendas por regularizar este mês, num total de ${money(metrics.emFalta)}.`,
        linhas: emFalta.slice(0, 6).map((p) => ({
          label: propMap.get(p.propertyId)?.morada ?? "—",
          valor: `${money(p.previsto - p.recebido)} · ${p.estado}`,
          propertyId: p.propertyId,
        })),
      };
    }

    if (q.includes("rentáv") || q.includes("yield")) {
      return {
        texto: "Os imóveis com melhor yield líquida nos últimos 12 meses:",
        linhas: perf.slice(0, 5).map((p) => ({
          label: p.morada,
          valor: `${pct(p.yieldLiquida)} · líquido ${money(p.liquido)}`,
          propertyId: p.id,
        })),
      };
    }

    if (q.includes("obra")) {
      const total = store.works
        .filter((w) => w.abertura.startsWith(String(ANO_ATUAL)))
        .reduce((s, w) => s + (w.custoReal || w.custoPrevisto), 0);
      return { texto: `Em ${ANO_ATUAL} as obras e manutenções somam ${money(total)}.` };
    }

    if (q.includes("contrato")) {
      const limite = new Date(ANO_ATUAL, MES_ATUAL + 6, 1);
      const fim = store.contracts.filter((c) => new Date(c.fim) <= limite && c.estado !== "Terminado");
      return {
        texto: `${fim.length} contratos terminam nos próximos 6 meses.`,
        linhas: fim.slice(0, 6).map((c) => ({
          label: propMap.get(c.propertyId)?.morada ?? "—",
          valor: `${dateLabel(c.fim)} · ${money(c.rendaAtual)}`,
          propertyId: c.propertyId,
        })),
      };
    }

    if (q.includes("400") || q.includes("abaixo")) {
      const baixas = store.properties.filter((p) => p.rendaMensal > 0 && p.rendaMensal < 400);
      const potencial = baixas.reduce((s, p) => s + (400 - p.rendaMensal), 0);
      return {
        texto: `${baixas.length} imóveis têm renda abaixo de 400 €. Atualizá-los para 400 € representaria +${money(potencial)}/mês.`,
        linhas: baixas.slice(0, 6).map((p) => ({
          label: p.morada,
          valor: money(p.rendaMensal),
          propertyId: p.id,
        })),
      };
    }

    if (q.includes("ocupa")) {
      return {
        texto: `A taxa de ocupação atual é de ${pct(metrics.ocupacao, 1)} — ${metrics.arrendados} arrendados, ${metrics.disponiveis} disponíveis e ${metrics.emObras} em obras.`,
      };
    }

    if (q.includes("despesa") || q.includes("gastei")) {
      return { texto: `As despesas deste mês somam ${money(metrics.despesas)}.` };
    }

    return {
      texto: `Este mês tem ${money(metrics.previsto)} previstos, ${money(metrics.recebido)} recebidos (${pct(metrics.taxaCobranca, 1)} de cobrança) e um resultado líquido de ${money(metrics.liquido)}.`,
    };
  }

  const enviar = (pergunta: string) => {
    if (!pergunta.trim()) return;
    setHistorico((h) => [...h, { pergunta, resposta: responder(pergunta) }]);
    setInput("");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Assistente IA" subtitle="Perguntas em linguagem natural sobre o seu património" />

      {historico.length === 0 && (
        <section className="surface p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm font-semibold">Experimente perguntar</p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {SUGESTOES.map((s) => (
              <button
                key={s}
                onClick={() => enviar(s)}
                className="rounded-lg border border-border p-3 text-left text-sm transition-colors hover:bg-muted"
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-4">
        {historico.map((h, i) => (
          <div key={i} className="space-y-2">
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
              {h.pergunta}
            </p>
            <div className="surface max-w-[95%] p-4">
              <p className="text-sm">{h.resposta.texto}</p>
              {h.resposta.linhas && (
                <ul className="mt-3 divide-y divide-border">
                  {h.resposta.linhas.map((l, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-3 py-2 text-sm">
                      {l.propertyId ? (
                        <Link
                          to="/imoveis/$id"
                          params={{ id: l.propertyId }}
                          className="truncate font-medium hover:text-primary"
                        >
                          {l.label}
                        </Link>
                      ) : (
                        <span className="truncate font-medium">{l.label}</span>
                      )}
                      <span className="num shrink-0 text-muted-foreground">{l.valor}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(input);
        }}
        className="sticky bottom-20 mt-4 flex gap-2 lg:bottom-4"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre rendas, despesas ou rentabilidade…"
          className="h-12"
        />
        <Button type="submit" size="icon" className="size-12 shrink-0" aria-label="Enviar">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
