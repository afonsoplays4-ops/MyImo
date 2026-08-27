import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Banknote, Building2, FileSpreadsheet, Landmark, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/MetricCard";
import { Tone } from "@/components/ui-kit/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/definicoes")({
  head: () => ({
    meta: [
      { title: "Definições · Património" },
      {
        name: "description",
        content: "Perfil do proprietário, integrações bancárias, AT, importações e plano SaaS.",
      },
      { property: "og:title", content: "Definições · Património" },
      { property: "og:description", content: "Configuração da conta, integrações e plano." },
    ],
  }),
  component: DefinicoesPage,
});

const INTEGRACOES = [
  {
    nome: "Banco (Open Banking)",
    icon: Banknote,
    estado: "Em breve",
    tone: "muted" as const,
    desc: "Sincroniza movimentos bancários e sugere a reconciliação automática das rendas recebidas.",
  },
  {
    nome: "Autoridade Tributária",
    icon: Landmark,
    estado: "Em breve",
    tone: "muted" as const,
    desc: "Emissão de recibos de renda eletrónicos e apoio ao IRS. Simulado — nunca são pedidas credenciais reais.",
  },
  {
    nome: "Importação Excel",
    icon: FileSpreadsheet,
    estado: "Disponível",
    tone: "success" as const,
    desc: "Importa imóveis, rendas e despesas a partir de folhas de cálculo com deteção inteligente de colunas.",
  },
  {
    nome: "Documentos & Cadernetas",
    icon: Building2,
    estado: "Disponível",
    tone: "success" as const,
    desc: "Leitura de cadernetas prediais e associação automática por artigo matricial e freguesia.",
  },
  {
    nome: "Assistente IA",
    icon: Sparkles,
    estado: "Ativa (mock)",
    tone: "info" as const,
    desc: "Respostas em linguagem natural sobre rendas, despesas, contratos e rentabilidade.",
  },
];

const PLANOS = [
  { nome: "Essencial", preco: "9 €/mês", limite: "Até 5 imóveis", atual: false },
  { nome: "Profissional", preco: "29 €/mês", limite: "Até 50 imóveis · IA incluída", atual: true },
  { nome: "Portefólio", preco: "79 €/mês", limite: "Imóveis ilimitados · Banco & AT", atual: false },
];

function DefinicoesPage() {
  const [perfil, setPerfil] = useState({
    nome: "Afonso Ribeiro",
    email: "afonso@exemplo.pt",
    nif: "123456789",
    telefone: "912 345 678",
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Definições" subtitle="Conta, integrações e plano" />

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="plano">Plano</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="mt-4">
          <section className="surface p-5">
            <h2 className="text-sm font-semibold">Proprietário</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Esta conta corresponde a um proprietário e a um NIF.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["nome", "Nome"],
                  ["email", "Email"],
                  ["nif", "NIF"],
                  ["telefone", "Telefone"],
                ] as const
              ).map(([k, label]) => (
                <div key={k} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input
                    value={perfil[k]}
                    onChange={(e) => setPerfil((p) => ({ ...p, [k]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <Button className="mt-4" onClick={() => toast.success("Perfil guardado")}>
              Guardar alterações
            </Button>
          </section>
        </TabsContent>

        <TabsContent value="integracoes" className="mt-4">
          <ul className="grid gap-3 md:grid-cols-2">
            {INTEGRACOES.map((i) => (
              <li key={i.nome} className="surface p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center rounded-lg bg-accent text-primary">
                      <i.icon className="size-4" />
                    </div>
                    <p className="text-sm font-semibold">{i.nome}</p>
                  </div>
                  <Tone tone={i.tone}>{i.estado}</Tone>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{i.desc}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => toast.info(`${i.nome}: configuração simulada`)}
                >
                  Configurar
                </Button>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="plano" className="mt-4">
          <ul className="grid gap-3 md:grid-cols-3">
            {PLANOS.map((p) => (
              <li
                key={p.nome}
                className={cn("surface p-5", p.atual && "border-primary ring-1 ring-primary")}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{p.nome}</p>
                  {p.atual && <Tone tone="success">Atual</Tone>}
                </div>
                <p className="num mt-3 font-display text-2xl font-semibold">{p.preco}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.limite}</p>
                <Button
                  variant={p.atual ? "outline" : "default"}
                  className="mt-4 w-full"
                  disabled={p.atual}
                  onClick={() => toast.info("Pagamentos ainda não disponíveis nesta fase")}
                >
                  {p.atual ? "Plano ativo" : "Mudar de plano"}
                </Button>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
}
