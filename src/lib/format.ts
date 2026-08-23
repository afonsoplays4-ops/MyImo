export const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export const MESES_CURTOS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const eur = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eur2 = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(value: number, decimals = false) {
  return decimals ? eur2.format(value) : eur.format(Math.round(value));
}

export function compactMoney(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} M €`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toLocaleString("pt-PT", { maximumFractionDigits: 1 })} mil €`;
  }
  return money(value);
}

export function pct(value: number, digits = 1) {
  return `${value.toLocaleString("pt-PT", { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`;
}

export function dateLabel(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function monthLabel(ano: number, mes: number) {
  return `${MESES[mes]} ${ano}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
