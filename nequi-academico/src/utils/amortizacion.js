// src/utils/amortizacion.js
const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

// periods per year según unidad
export const periodsPerYearFromUnit = (unidad) => {
  switch (unidad) {
    case "anual": return 1;
    case "mensual": return 12;
    case "trimestral": return 4;
    case "diaria": return 365;
    default: return 12;
  }
};

// convierte tasaValor (en la unidad indicada) a tasa por periodo (decimal).
// Si unidad === unidadTasa, simple: tasaValor/100 per periodo (porque tasa dada ya es por periodo).
// Para generalidad usamos la misma aproximación nominal usada antes (revisable si quieres tasas efectivas).
export const tasaPorPeriodo = (tasaValor, unidadTasa, unidadPeriodo) => {
  const t = toNumber(tasaValor);
  // llevar a tasa anual nominal
  let tasaAnual = 0;
  switch (unidadTasa) {
    case "anual":
      tasaAnual = t;
      break;
    case "mensual":
      tasaAnual = t * 12;
      break;
    case "trimestral":
      tasaAnual = t * 4;
      break;
    case "diaria":
      tasaAnual = t * 365;
      break;
    default:
      tasaAnual = t;
  }
  const periodsPerYear = periodsPerYearFromUnit(unidadPeriodo);
  return (tasaAnual / 100) / periodsPerYear; // decimal por periodo
};

// === Amortizaciones (reciben: capital, tasaValor, unidadTasa, n (periodos), unidadPeriodo) ===

// Francés (cuotas constantes) -- se usa tu fórmula: (P * i) / (1 - (1 + i)^-n)
export const calcularFrances = (capital, tasaValor, unidadTasa, n, unidadPeriodo) => {
  const i = tasaPorPeriodo(tasaValor, unidadTasa, unidadPeriodo); // decimal por periodo
  const cuota = i === 0 ? (capital / (n || 1)) : (capital * i) / (1 - Math.pow(1 + i, -n));

  let saldo = capital;
  const tabla = [];
  let totalInteres = 0;
  let totalPago = 0;

  for (let k = 1; k <= n; k++) {
    const interes = saldo * i;
    const amortizacion = cuota - interes;
    saldo = Math.max(0, saldo - amortizacion);

    totalInteres += interes;
    totalPago += cuota;

    tabla.push({
      periodo: k,
      saldoAntesPago: +Number((saldo + amortizacion).toFixed(8)), // saldo before amortization
      interes: +interes,
      amortizacion: +amortizacion,
      cuota: +cuota,
      saldo: +saldo,
    });
  }

  return { tabla, cuota, totalInteres, totalPago, n, i };
};

// Alemán (amortizacion constante)
export const calcularAleman = (capital, tasaValor, unidadTasa, n, unidadPeriodo) => {
  const i = tasaPorPeriodo(tasaValor, unidadTasa, unidadPeriodo);
  const amortizacion = capital / (n || 1);

  let saldo = capital;
  const tabla = [];
  let totalInteres = 0;
  let totalPago = 0;

  for (let k = 1; k <= n; k++) {
    const saldoAntes = saldo;
    const interes = saldoAntes * i;
    const cuota = amortizacion + interes;
    saldo = Math.max(0, saldo - amortizacion);

    totalInteres += interes;
    totalPago += cuota;

    tabla.push({
      periodo: k,
      saldoAntesPago: +Number(saldoAntes.toFixed(8)),
      interes: +interes,
      amortizacion: +amortizacion,
      cuota: +cuota,
      saldo: +saldo,
    });
  }

  return { tabla, amortizacion, totalInteres, totalPago, n, i };
};

// Americano (bullet) - intereses periódicos y capital al final
export const calcularAmericano = (capital, tasaValor, unidadTasa, n, unidadPeriodo) => {
  const i = tasaPorPeriodo(tasaValor, unidadTasa, unidadPeriodo);
  const tabla = [];
  let totalInteres = 0;
  let totalPago = 0;

  for (let k = 1; k <= n; k++) {
    const saldoAntes = capital;
    const interes = capital * i;
    const amortizacion = (k === n) ? capital : 0;
    const cuota = interes + amortizacion;
    const saldo = (k === n) ? 0 : capital;

    totalInteres += interes;
    totalPago += cuota;

    tabla.push({
      periodo: k,
      saldoAntesPago: +Number(saldoAntes.toFixed(8)),
      interes: +interes,
      amortizacion: +amortizacion,
      cuota: +cuota,
      saldo: +saldo,
    });
  }

  return { tabla, totalInteres, totalPago, n, i };
};
