/**
 * Dados mock determinísticos.
 * Toda a app lê daqui através de src/lib/store.tsx — para ligar a um backend
 * real basta substituir estas funções por chamadas à API.
 */

export type EstadoImovel = "Arrendado" | "Disponível" | "Em obras";
export type EstadoRenda = "Pago" | "Parcial" | "Em atraso" | "Por pagar" | "Não vencido";
export type MetodoPagamento = "Transferência" | "Dinheiro" | "Débito direto" | "MB Way" | "Outro";
export type EstadoContrato = "Ativo" | "A terminar" | "Terminado" | "Renovação pendente";

export interface Property {
  id: string;
  ref: string;
  morada: string;
  codigoPostal: string;
  localidade: string;
  tipo: string;
  tipologia: string;
  area: number;
  anoAquisicao: number;
  valorAquisicao: number;
  custosAquisicao: number;
  valorObras: number;
  valorEstimado: number;
  rendaMensal: number;
  estado: EstadoImovel;
  observacoes: string;
}

export interface Tenant {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  propertyId: string | null;
  desde: string;
  pontualidade: number;
}

export interface RentChange {
  ano: number;
  valor: number;
  motivo: string;
}

export interface Contract {
  id: string;
  propertyId: string;
  tenantId: string;
  inicio: string;
  fim: string;
  tipo: string;
  renovacaoAutomatica: boolean;
  rendaInicial: number;
  rendaAtual: number;
  caucao: number;
  rendasAntecipadas: number;
  fiador: string;
  estado: EstadoContrato;
  observacoes: string;
  historico: RentChange[];
}

export interface Payment {
  id: string;
  propertyId: string;
  tenantId: string;
  ano: number;
  mes: number;
  previsto: number;
  recebido: number;
  estado: EstadoRenda;
  dataPagamento: string | null;
  metodo: MetodoPagamento | null;
  notas: string;
  comprovativo: string | null;
}

export interface Expense {
  id: string;
  propertyId: string | null;
  data: string;
  categoria: string;
  descricao: string;
  fornecedor: string;
  valor: number;
  recorrente: boolean;
}

export interface WorkOrder {
  id: string;
  propertyId: string;
  titulo: string;
  categoria: string;
  prioridade: "Baixa" | "Média" | "Alta";
  estado: "Aberto" | "Em curso" | "Concluído";
  custoPrevisto: number;
  custoReal: number;
  abertura: string;
  fecho: string | null;
  responsavel: string;
}

export interface DocumentItem {
  id: string;
  propertyId: string | null;
  nome: string;
  tipo: string;
  dataUpload: string;
  validade: string | null;
  tamanho: string;
}

export interface NotificationItem {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "renda" | "contrato" | "documento" | "manutencao" | "ia";
  data: string;
  lida: boolean;
}

export const CATEGORIAS_DESPESA = [
  "Condomínio",
  "IMI",
  "Seguro",
  "Manutenção",
  "Obras",
  "Água",
  "Eletricidade",
  "Serviços",
  "Impostos",
  "Outros",
];

export const TIPOS_DOCUMENTO = [
  "Contrato",
  "Recibo de renda",
  "Seguro",
  "Certificado energético",
  "Caderneta predial",
  "Licença",
  "Fatura",
  "Outro",
];

export const METODOS: MetodoPagamento[] = [
  "Transferência",
  "Dinheiro",
  "Débito direto",
  "MB Way",
  "Outro",
];

/* ---------------- gerador determinístico ---------------- */

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const RUAS = [
  "Rua das Flores",
  "Avenida da Liberdade",
  "Rua do Comércio",
  "Travessa do Carmo",
  "Rua de Santa Catarina",
  "Rua Nova do Almada",
  "Avenida Central",
  "Rua da Boavista",
  "Rua Direita",
  "Praceta das Acácias",
  "Rua do Sol",
  "Rua Cândido dos Reis",
  "Avenida Marginal",
  "Rua da Alegria",
  "Rua do Loureiro",
  "Rua Serpa Pinto",
  "Rua José Falcão",
  "Rua da Fábrica",
  "Rua Miguel Bombarda",
  "Rua do Bonjardim",
];

const LOCALIDADES = [
  { nome: "Porto", cp: "4000" },
  { nome: "Lisboa", cp: "1200" },
  { nome: "Braga", cp: "4700" },
  { nome: "Gaia", cp: "4400" },
  { nome: "Matosinhos", cp: "4450" },
  { nome: "Coimbra", cp: "3000" },
  { nome: "Aveiro", cp: "3800" },
];

const TIPOLOGIAS = ["T0", "T1", "T2", "T3", "T4"];
const TIPOS = ["Apartamento", "Moradia", "Loja", "Escritório"];

const NOMES = [
  "Ana Ferreira",
  "João Silva",
  "Maria Costa",
  "Pedro Santos",
  "Rita Moreira",
  "Carlos Pinto",
  "Sofia Marques",
  "Tiago Lopes",
  "Inês Rodrigues",
  "Bruno Carvalho",
  "Helena Dias",
  "Miguel Antunes",
  "Beatriz Nunes",
  "Nuno Teixeira",
  "Catarina Reis",
  "Ricardo Sousa",
  "Marta Cunha",
  "André Gomes",
  "Patrícia Ramos",
  "Luís Machado",
  "Cláudia Rocha",
  "Hugo Freitas",
  "Sara Barbosa",
  "Vítor Amaral",
  "Diana Castro",
  "Paulo Faria",
  "Teresa Melo",
  "Filipe Correia",
  "Joana Pires",
  "Alberto Neves",
];

const FORNECEDORES = [
  "Condomínio Central",
  "Autoridade Tributária",
  "Seguradora Fidelis",
  "Canalizações Norte",
  "Eletro Silva",
  "Obras & Cia",
  "Águas do Município",
  "Limpezas Rápidas",
];

export const HOJE = new Date(2026, 7, 23);
export const ANO_ATUAL = HOJE.getFullYear();
export const MES_ATUAL = HOJE.getMonth();

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export interface Dataset {
  properties: Property[];
  tenants: Tenant[];
  contracts: Contract[];
  payments: Payment[];
  expenses: Expense[];
  works: WorkOrder[];
  documents: DocumentItem[];
  notifications: NotificationItem[];
}

export function buildDataset(): Dataset {
  const rand = rng(20260823);
  const properties: Property[] = [];
  const tenants: Tenant[] = [];
  const contracts: Contract[] = [];
  const payments: Payment[] = [];
  const expenses: Expense[] = [];
  const works: WorkOrder[] = [];
  const documents: DocumentItem[] = [];

  const TOTAL = 60;
  for (let i = 0; i < TOTAL; i++) {
    const loc = LOCALIDADES[Math.floor(rand() * LOCALIDADES.length)]!;
    const rua = RUAS[i % RUAS.length]!;
    const numero = 2 + Math.floor(rand() * 180);
    const anoAquisicao = 2005 + Math.floor(rand() * 19);
    const renda = 250 + Math.round((rand() * 500) / 25) * 25;
    const area = 40 + Math.floor(rand() * 120);
    const valorAquisicao = Math.round((renda * 12 * (11 + rand() * 6)) / 1000) * 1000;
    const valorObras = Math.round((rand() * 40000) / 500) * 500;
    const valorEstimado = Math.round((valorAquisicao * (1.3 + rand() * 0.7)) / 1000) * 1000;
    // 57 arrendados, 3 não arrendados (2 disponíveis, 1 em obras)
    let estado: EstadoImovel = "Arrendado";
    if (i === 12 || i === 41) estado = "Disponível";
    if (i === 27) estado = "Em obras";

    properties.push({
      id: `p${i + 1}`,
      ref: `IM-${pad(i + 1)}`,
      morada: `${rua} ${numero}${rand() > 0.5 ? `, ${1 + Math.floor(rand() * 4)}º Dto` : ""}`,
      codigoPostal: `${loc.cp}-${pad(Math.floor(rand() * 99))}${Math.floor(rand() * 9)}`,
      localidade: loc.nome,
      tipo: TIPOS[rand() > 0.85 ? 1 + Math.floor(rand() * 3) : 0]!,
      tipologia: TIPOLOGIAS[Math.floor(rand() * TIPOLOGIAS.length)]!,
      area,
      anoAquisicao,
      valorAquisicao,
      custosAquisicao: Math.round((valorAquisicao * 0.07) / 100) * 100,
      valorObras,
      valorEstimado,
      rendaMensal: estado === "Arrendado" ? renda : 0,
      estado,
      observacoes: "",
    });
  }

  let tenantIdx = 0;
  properties.forEach((p, i) => {
    if (p.estado !== "Arrendado") return;
    const nome = `${NOMES[tenantIdx % NOMES.length]!}${tenantIdx >= NOMES.length ? " Jr." : ""}`;
    const tenantId = `t${tenantIdx + 1}`;
    const anoInicio = Math.max(p.anoAquisicao, 2018 + Math.floor(rand() * 7));
    const mesInicio = Math.floor(rand() * 12);
    const duracaoAnos = 2 + Math.floor(rand() * 4);
    const inicio = `${anoInicio}-${pad(mesInicio + 1)}-01`;
    const fim = `${anoInicio + duracaoAnos}-${pad(mesInicio + 1)}-01`;
    const rendaInicial = Math.round((p.rendaMensal * (0.82 + rand() * 0.12)) / 5) * 5;

    tenants.push({
      id: tenantId,
      nome,
      email: `${nome.toLowerCase().replace(/[^a-z ]/g, "").split(" ").slice(0, 2).join(".")}@email.pt`,
      telefone: `9${Math.floor(rand() * 3) + 1}${Math.floor(1000000 + rand() * 8999999)}`,
      nif: `2${Math.floor(10000000 + rand() * 89999999)}`,
      propertyId: p.id,
      desde: inicio,
      pontualidade: 80 + Math.floor(rand() * 21),
    });

    const historico: RentChange[] = [{ ano: anoInicio, valor: rendaInicial, motivo: "Renda inicial" }];
    if (p.rendaMensal !== rendaInicial) {
      historico.push({
        ano: anoInicio + Math.max(1, Math.floor(duracaoAnos / 2)),
        valor: p.rendaMensal,
        motivo: "Atualização anual (coeficiente)",
      });
    }

    const fimDate = new Date(fim);
    const diasParaFim = Math.round((fimDate.getTime() - HOJE.getTime()) / 86400000);
    let estadoContrato: EstadoContrato = "Ativo";
    if (diasParaFim < 0) estadoContrato = "Renovação pendente";
    else if (diasParaFim <= 90) estadoContrato = "A terminar";

    contracts.push({
      id: `c${tenantIdx + 1}`,
      propertyId: p.id,
      tenantId,
      inicio,
      fim,
      tipo: rand() > 0.2 ? "Habitação permanente" : "Comercial",
      renovacaoAutomatica: rand() > 0.25,
      rendaInicial,
      rendaAtual: p.rendaMensal,
      caucao: p.rendaMensal * (rand() > 0.5 ? 2 : 1),
      rendasAntecipadas: rand() > 0.6 ? 1 : 0,
      fiador: rand() > 0.7 ? NOMES[(tenantIdx + 7) % NOMES.length]! : "—",
      estado: estadoContrato,
      observacoes: "",
      historico,
    });
    tenantIdx++;

    // Pagamentos: 2024, 2025, 2026
    for (let ano = ANO_ATUAL - 2; ano <= ANO_ATUAL; ano++) {
      for (let mes = 0; mes < 12; mes++) {
        if (ano < anoInicio || (ano === anoInicio && mes < mesInicio)) continue;
        const futuro = ano > ANO_ATUAL || (ano === ANO_ATUAL && mes > MES_ATUAL);
        const previsto =
          ano < historico[historico.length - 1]!.ano ? rendaInicial : p.rendaMensal;
        if (futuro) {
          payments.push({
            id: `pay-${p.id}-${ano}-${mes}`,
            propertyId: p.id,
            tenantId,
            ano,
            mes,
            previsto,
            recebido: 0,
            estado: "Não vencido",
            dataPagamento: null,
            metodo: null,
            notas: "",
            comprovativo: null,
          });
          continue;
        }
        const atual = ano === ANO_ATUAL && mes === MES_ATUAL;
        const r = rand();
        let estado: EstadoRenda = "Pago";
        let recebido = previsto;
        if (atual) {
          if (i % 19 === 3) {
            estado = "Por pagar";
            recebido = 0;
          } else if (i % 23 === 5) {
            estado = "Parcial";
            recebido = Math.round(previsto * 0.5);
          } else if (i % 29 === 7) {
            estado = "Em atraso";
            recebido = 0;
          }
        } else if (r < 0.03) {
          estado = "Em atraso";
          recebido = 0;
        } else if (r < 0.05) {
          estado = "Parcial";
          recebido = Math.round(previsto * 0.6);
        }
        const dia = 1 + Math.floor(rand() * 10);
        payments.push({
          id: `pay-${p.id}-${ano}-${mes}`,
          propertyId: p.id,
          tenantId,
          ano,
          mes,
          previsto,
          recebido,
          estado,
          dataPagamento: recebido > 0 ? `${ano}-${pad(mes + 1)}-${pad(dia)}` : null,
          metodo: recebido > 0 ? METODOS[Math.floor(rand() * 4)]! : null,
          notas: "",
          comprovativo: null,
        });
      }
    }
  });

  // Despesas — 3 anos
  properties.forEach((p, i) => {
    const nDesp = 6 + Math.floor(rand() * 8);
    for (let k = 0; k < nDesp; k++) {
      const ano = ANO_ATUAL - Math.floor(rand() * 2.5);
      const mes = Math.floor(rand() * (ano === ANO_ATUAL ? MES_ATUAL + 1 : 12));
      const categoria = CATEGORIAS_DESPESA[Math.floor(rand() * CATEGORIAS_DESPESA.length)]!;
      const base =
        categoria === "IMI" ? 120 + rand() * 400 : categoria === "Obras" ? 400 + rand() * 3000 : 30 + rand() * 320;
      expenses.push({
        id: `e${i}-${k}`,
        propertyId: p.id,
        data: `${ano}-${pad(mes + 1)}-${pad(1 + Math.floor(rand() * 27))}`,
        categoria,
        descricao: `${categoria} — ${p.ref}`,
        fornecedor: FORNECEDORES[Math.floor(rand() * FORNECEDORES.length)]!,
        valor: Math.round(base),
        recorrente: categoria === "Condomínio" || categoria === "Seguro",
      });
    }
  });

  // Obras
  const TITULOS = [
    "Substituição de esquentador",
    "Pintura interior",
    "Reparação de infiltração",
    "Troca de janelas",
    "Remodelação de cozinha",
    "Reparação elétrica",
    "Substituição de fechadura",
    "Impermeabilização de terraço",
  ];
  for (let k = 0; k < 26; k++) {
    const p = properties[Math.floor(rand() * properties.length)]!;
    const estados = ["Aberto", "Em curso", "Concluído"] as const;
    const estado = estados[k % 3 === 0 ? Math.floor(rand() * 2) : 2]!;
    const custoPrevisto = Math.round((200 + rand() * 4000) / 10) * 10;
    const ano = ANO_ATUAL - (rand() > 0.6 ? 1 : 0);
    const mes = Math.floor(rand() * 12);
    works.push({
      id: `w${k + 1}`,
      propertyId: p.id,
      titulo: TITULOS[Math.floor(rand() * TITULOS.length)]!,
      categoria: rand() > 0.5 ? "Manutenção" : "Obra",
      prioridade: (["Baixa", "Média", "Alta"] as const)[Math.floor(rand() * 3)]!,
      estado,
      custoPrevisto,
      custoReal: estado === "Concluído" ? Math.round(custoPrevisto * (0.85 + rand() * 0.4)) : 0,
      abertura: `${ano}-${pad(mes + 1)}-${pad(1 + Math.floor(rand() * 27))}`,
      fecho: estado === "Concluído" ? `${ano}-${pad(Math.min(12, mes + 2))}-15` : null,
      responsavel: FORNECEDORES[Math.floor(rand() * FORNECEDORES.length)]!,
    });
  }

  // Documentos
  properties.forEach((p, i) => {
    const n = 2 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const tipo = TIPOS_DOCUMENTO[Math.floor(rand() * TIPOS_DOCUMENTO.length)]!;
      const temValidade = tipo === "Seguro" || tipo === "Certificado energético" || tipo === "Licença";
      documents.push({
        id: `d${i}-${k}`,
        propertyId: p.id,
        nome: `${tipo} ${p.ref}.pdf`,
        tipo,
        dataUpload: `${ANO_ATUAL - Math.floor(rand() * 3)}-${pad(1 + Math.floor(rand() * 12))}-${pad(1 + Math.floor(rand() * 27))}`,
        validade: temValidade
          ? `${ANO_ATUAL + (rand() > 0.65 ? 0 : 1)}-${pad(1 + Math.floor(rand() * 12))}-01`
          : null,
        tamanho: `${(0.2 + rand() * 4).toFixed(1)} MB`,
      });
    }
  });

  const notifications: NotificationItem[] = [
    {
      id: "n1",
      titulo: "3 rendas ainda não recebidas",
      descricao: "Agosto 2026 tem 3 rendas por regularizar, num total de 1.350 €.",
      tipo: "renda",
      data: "2026-08-23",
      lida: false,
    },
    {
      id: "n2",
      titulo: "2 contratos terminam nos próximos 90 dias",
      descricao: "Reveja as condições e prepare a renovação.",
      tipo: "contrato",
      data: "2026-08-21",
      lida: false,
    },
    {
      id: "n3",
      titulo: "Seguro termina em setembro",
      descricao: "O seguro multirriscos de um imóvel expira a 30/09/2026.",
      tipo: "documento",
      data: "2026-08-18",
      lida: false,
    },
    {
      id: "n4",
      titulo: "Manutenção acima do normal",
      descricao: "Um imóvel acumulou 2.300 € de manutenção nos últimos 12 meses.",
      tipo: "manutencao",
      data: "2026-08-12",
      lida: true,
    },
    {
      id: "n5",
      titulo: "Insight IA disponível",
      descricao: "12 rendas estão abaixo da média de mercado da zona.",
      tipo: "ia",
      data: "2026-08-05",
      lida: true,
    },
  ];

  return { properties, tenants, contracts, payments, expenses, works, documents, notifications };
}
