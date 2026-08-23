import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { MetricCard } from "@/components/ui-kit/MetricCard";
import {
  PropertyStatusBadge,
  RentStatusBadge,
  ContractStatusBadge,
  Tone,
} from "@/components/ui-kit/badges";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/PaymentModal";
import { useStore } from "@/lib/store";
import { money, pct, dateLabel, MESES } from "@/lib/format";
import { ANO_ATUAL, MES_ATUAL, type Payment } from "@/lib/mock-data";

export const Route = createFileRoute("/imoveis/$id")({
  head: () => ({
    meta: [
      { title: "Detalhe do imóvel · Património" },
      {
        name: "description",
        content: "Ficha completa do imóvel: rendas, contrato, inquilino, despesas, obras e documentos.",
      },
      { property: "og:title", content: "Detalhe do imóvel · Património" },
      { property: "og:description", content: "Ficha completa do imóvel e respetiva rentabilidade." },
    ],
  }),
  component: PropertyDetail,
});

function PropertyDetail() {
  const { id } = Route.useParams();
  const store = useStore();
  const [selected, setSelected] = useState<Payment | null>(null);

  const prop = store.propertyById(id);
  const tenant = store.tenantByProperty(id);
  const contract = store.contractByProperty(id);

  const dados = useMemo(() => {
    const desde = new Date(ANO_ATUAL, MES_ATUAL - 11, 1);
    const pays = store.payments
      .filter((p) => p.propertyId === id)
      .sort((a, b) => b.ano - a.ano || b.mes - a.mes);
    const receita = pays
      .filter((p) => new Date(p.ano, p.mes, 1) >= desde)
      .reduce((s, p) => s + p.recebido, 0);
    const desp = store.expenses.filter((e) => e.propertyId === id);
    const despesas12 = desp.filter((e) => new Date(e.data) >= desde).reduce((s, e) => s + e.valor, 0);
    return {
      pays,
      receita,
      despesas12,
      desp: desp.sort((a, b) => b.data.localeCompare(a.data)),
      obras: store.works.filter((w) => w.propertyId === id),
      docs: store.documents.filter((d) => d.propertyId === id),
    };
  }, [store, id]);

  if (!prop) throw notFound();

  const investimento = prop.valorAquisicao + prop.custosAquisicao + prop.valorObras;
  const yieldBruta = investimento ? (dados.receita / investimento) * 100 : 0;
  const liquido = dados.receita - dados.despesas12;

  return (
    <div>
      <Link
        to="/imoveis"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Imóveis
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold md:text-3xl">{prop.morada}</h1>
            <PropertyStatusBadge estado={prop.estado} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {prop.ref} · {prop.codigoPostal} {prop.localidade} · {prop.tipo} {prop.tipologia} ·{" "}
            {prop.area} m²
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard label="Renda mensal" value={prop.rendaMensal ? money(prop.rendaMensal) : "—"} />
        <MetricCard label="Valor estimado" value={money(prop.valorEstimado)} />
        <MetricCard label="Yield bruta" value={pct(yieldBruta)} tone="success" />
        <MetricCard label="Resultado anual" value={money(liquido)} tone={liquido >= 0 ? "success" : "danger"} />
      </div>

      <Tabs defaultValue="geral" className="mt-5">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="rendas">Rendas</TabsTrigger>
          <TabsTrigger value="contrato">Contrato</TabsTrigger>
          <TabsTrigger value="inquilino">Inquilino</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="obras">Obras</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="surface p-5">
            <h2 className="text-sm font-semibold">Financeiro (últimos 12 meses)</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Renda mensal", prop.rendaMensal ? money(prop.rendaMensal) : "—"],
                ["Receita anual", money(dados.receita)],
                ["Despesas 12 meses", money(dados.despesas12)],
                ["Resultado líquido", money(liquido)],
                ["Yield bruta", pct(yieldBruta)],
                [
                  "Yield líquida",
                  pct(investimento ? (liquido / investimento) * 100 : 0),
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="num font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="surface p-5">
            <h2 className="text-sm font-semibold">Aquisição e valorização</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {[
                ["Ano de aquisição", String(prop.anoAquisicao)],
                ["Valor de aquisição", money(prop.valorAquisicao)],
                ["Custos de aquisição", money(prop.custosAquisicao)],
                ["Valor de obras", money(prop.valorObras)],
                ["Investimento total", money(investimento)],
                [
                  "Valorização",
                  pct(investimento ? ((prop.valorEstimado - investimento) / investimento) * 100 : 0),
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="num font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </TabsContent>

        <TabsContent value="rendas" className="mt-4">
          <div className="surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Mês</th>
                  <th className="px-4 py-3 text-right font-medium">Previsto</th>
                  <th className="px-4 py-3 text-right font-medium">Recebido</th>
                  <th className="px-4 py-3 text-left font-medium">Estado</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dados.pays.slice(0, 18).map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5">
                      {MESES[p.mes]} {p.ano}
                    </td>
                    <td className="num px-4 py-2.5 text-right">{money(p.previsto)}</td>
                    <td className="num px-4 py-2.5 text-right">{money(p.recebido)}</td>
                    <td className="px-4 py-2.5">
                      <RentStatusBadge estado={p.estado} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelected(p)}>
                        Registar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="contrato" className="mt-4">
          {contract ? (
            <section className="surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Contrato de arrendamento</h2>
                <ContractStatusBadge estado={contract.estado} />
              </div>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {[
                  ["Início", dateLabel(contract.inicio)],
                  ["Fim", dateLabel(contract.fim)],
                  ["Tipo", contract.tipo],
                  ["Renovação automática", contract.renovacaoAutomatica ? "Sim" : "Não"],
                  ["Renda inicial", money(contract.rendaInicial)],
                  ["Renda atual", money(contract.rendaAtual)],
                  ["Caução", money(contract.caucao)],
                  ["Rendas antecipadas", String(contract.rendasAntecipadas)],
                  ["Fiador", contract.fiador],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="num font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Histórico de rendas
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {contract.historico.map((h) => (
                    <li key={`${h.ano}-${h.valor}`} className="flex justify-between">
                      <span className="text-muted-foreground">
                        {h.ano} · {h.motivo}
                      </span>
                      <span className="num font-medium">{money(h.valor)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted-foreground">
                  Variação desde o início:{" "}
                  {pct(
                    contract.rendaInicial
                      ? ((contract.rendaAtual - contract.rendaInicial) / contract.rendaInicial) * 100
                      : 0,
                  )}
                </p>
              </div>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/contratos">Gerir contratos</Link>
              </Button>
            </section>
          ) : (
            <p className="text-sm text-muted-foreground">Este imóvel não tem contrato ativo.</p>
          )}
        </TabsContent>

        <TabsContent value="inquilino" className="mt-4">
          {tenant ? (
            <section className="surface max-w-md p-5">
              <h2 className="text-sm font-semibold">{tenant.nome}</h2>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ["Email", tenant.email],
                  ["Telefone", tenant.telefone],
                  ["NIF", tenant.nif],
                  ["Inquilino desde", dateLabel(tenant.desde)],
                  ["Pontualidade", pct(tenant.pontualidade, 0)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : (
            <p className="text-sm text-muted-foreground">Sem inquilino associado.</p>
          )}
        </TabsContent>

        <TabsContent value="despesas" className="mt-4">
          <div className="surface overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                  <th className="px-4 py-3 text-left font-medium">Categoria</th>
                  <th className="px-4 py-3 text-left font-medium">Fornecedor</th>
                  <th className="px-4 py-3 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dados.desp.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2.5">{dateLabel(e.data)}</td>
                    <td className="px-4 py-2.5">{e.categoria}</td>
                    <td className="px-4 py-2.5">{e.fornecedor}</td>
                    <td className="num px-4 py-2.5 text-right">{money(e.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="obras" className="mt-4 space-y-3">
          {dados.obras.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem obras ou manutenções registadas.</p>
          ) : (
            dados.obras.map((w) => (
              <div key={w.id} className="surface flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-medium">{w.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {w.categoria} · {dateLabel(w.abertura)} · {w.responsavel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Tone tone={w.estado === "Concluído" ? "success" : w.estado === "Em curso" ? "warning" : "info"}>
                    {w.estado}
                  </Tone>
                  <span className="num text-sm font-semibold">
                    {money(w.custoReal || w.custoPrevisto)}
                  </span>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="documentos" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dados.docs.map((d) => (
            <div key={d.id} className="surface p-4">
              <p className="truncate text-sm font-medium">{d.nome}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {d.tipo} · {d.tamanho} · {dateLabel(d.dataUpload)}
              </p>
              {d.validade ? (
                <p className="mt-2 text-xs text-warning">Válido até {dateLabel(d.validade)}</p>
              ) : null}
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <PaymentModal payment={selected} open={!!selected} onOpenChange={(v) => !v && setSelected(null)} />
    </div>
  );
}
