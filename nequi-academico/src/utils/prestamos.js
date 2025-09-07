// src/utils/prestamoUtils.js
// Helpers para normalizar tasas, tiempos y generar tablas de amortización.

export const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

// convierte tiempo (años, meses, días) a número de periodos (según pagosPorAño)
export const tiempoEnPeriodos = ({ años = 0, meses = 0, días = 0 }, pagosPorAño) => {
  // transformar todo a años decimales
  const years = toNumber(años) + toNumber(meses) / 12 + toNumber(días) / 365;
  return years * pagosPorAño;
};

// convierte la tasa indicada (en su unidad) a tasa efectiva por periodo (decimal)
// ej: si tasa=12, unidadTasa='anual', pagosPorAño=12 -> devuelva 0.01 (1% por mes)
export const tasaPorPeriodo = (tasa, unidadTasa, pagosPorAño) => {
  const t = toNumber(tasa);
  // aproximación: llevar a tasa anual equivalente (nominal simple)
  let anual = 0;
  switch (unidadTasa) {
    case "anual":
      anual = t;
      break;
    case "mensual":
      anual = t * 12;
      break;
    case "trimestral":
      anual = t * 4;
      break;
    case "diaria":
      anual = t * 365;
      break;
    default:
      anual = t;
  }
  return (anual / 100) / pagosPorAño; // decimal por periodo
};

// === CALCULADORES DE TABLAS ===

// 1) Simple interest loan -> equal installments of (capital + totalInterest)/nPeriods
export function scheduleSimple(capital, tasa, unidadTasa, añosObj, pagosPorAño) {
  const n = Math.round(tiempoEnPeriodos(añosObj, pagosPorAño));
  const i_period = tasaPorPeriodo(tasa, unidadTasa, pagosPorAño);
  // total interest using annual-equivalent approach:
  const totalInterest = capital * (i_period * n);
  const pago = (capital + totalInterest) / (n || 1);
  const rows = [];
  let balance = capital;
  for (let k = 1; k <= Math.max(1, n); k++) {
    const interest = capital * i_period; // simple interest uses original capital each period
    const principal = pago - interest;
    balance = Math.max(0, balance - principal);
    rows.push({
      periodo: k,
      pago: +pago,
      interest: +interest,
      principal: +principal,
      balance: +balance,
    });
  }
  return { rows, totalPayment: pago * n, totalInterest, pagoPeriodico: pago, n };
}

// 2) French (Anualidad) -> equal payment A = C * i / (1-(1+i)^-n)
export function scheduleFrances(capital, tasa, unidadTasa, añosObj, pagosPorAño) {
  const n = Math.round(tiempoEnPeriodos(añosObj, pagosPorAño));
  const i = tasaPorPeriodo(tasa, unidadTasa, pagosPorAño);
  const rows = [];
  const A = i === 0 ? capital / (n || 1) : capital * (i / (1 - Math.pow(1 + i, -n || 1)));
  let balance = capital;
  let totalInterest = 0;
  for (let k = 1; k <= Math.max(1, n); k++) {
    const interest = balance * i;
    const principal = A - interest;
    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    rows.push({
      periodo: k,
      pago: +A,
      interest: +interest,
      principal: +principal,
      balance: +balance,
    });
  }
  return { rows, totalPayment: A * n, totalInterest, pagoPeriodico: A, n };
}

// 3) German (Alemana) -> principal constant, interest on remaining balance
export function scheduleAlemana(capital, tasa, unidadTasa, añosObj, pagosPorAño) {
  const n = Math.round(tiempoEnPeriodos(añosObj, pagosPorAño));
  const i = tasaPorPeriodo(tasa, unidadTasa, pagosPorAño);
  const rows = [];
  const principalConst = capital / (n || 1);
  let balance = capital;
  let totalInterest = 0;
  for (let k = 1; k <= Math.max(1, n); k++) {
    const interest = balance * i;
    const pago = principalConst + interest;
    balance = Math.max(0, balance - principalConst);
    totalInterest += interest;
    rows.push({
      periodo: k,
      pago: +pago,
      interest: +interest,
      principal: +principalConst,
      balance: +balance,
    });
  }
  return { rows, totalPayment: (capital + totalInterest), totalInterest, pagoPeriodicoFirst: rows[0]?.pago || 0, n };
}

// 4) Americana (bullet) -> interest periodic, principal al final
export function scheduleAmericana(capital, tasa, unidadTasa, añosObj, pagosPorAño) {
  const n = Math.round(tiempoEnPeriodos(añosObj, pagosPorAño));
  const i = tasaPorPeriodo(tasa, unidadTasa, pagosPorAño);
  const rows = [];
  let totalInterest = 0;
  for (let k = 1; k <= Math.max(1, n); k++) {
    const interest = capital * i;
    const principal = k === n ? capital : 0;
    const pago = interest + principal;
    totalInterest += interest;
    const balance = k === n ? 0 : capital;
    rows.push({
      periodo: k,
      pago: +pago,
      interest: +interest,
      principal: +principal,
      balance: +balance,
    });
  }
  return { rows, totalPayment: capital + totalInterest, totalInterest, n };
}
