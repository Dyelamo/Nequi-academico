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

// 📘 Amortización Francesa — Cuotas Constantes
export const calcularFrances = (capital, tasaValor, unidadTasa, n, unidadPeriodo) => {
  // 1️⃣ Tasa de interés efectiva por periodo
  const i = tasaPorPeriodo(tasaValor, unidadTasa, unidadPeriodo); // Decimal por periodo

  // 2️⃣ Cálculo de cuota fija
  const cuota = i === 0 
    ? capital / (n || 1)
    : (capital * i) / (1 - Math.pow(1 + i, -n));

  // 3️⃣ Variables de control
  let saldo = capital;
  let totalInteres = 0;
  let totalPago = 0;

  const tabla = [];

  // 4️⃣ Generación de la tabla de amortización
  for (let k = 1; k <= n; k++) {
    const interes = saldo * i;                    // Interés del periodo
    const amortizacion = cuota - interes;         // Abono a capital
    const saldoFinal = saldo - amortizacion;      // Nuevo saldo

    totalInteres += interes;
    totalPago += cuota;

    tabla.push({
      periodo: k,
      cuota: +cuota.toFixed(2),
      interes: +interes.toFixed(2),
      capital: +amortizacion.toFixed(2),
      saldo: +Math.max(0, saldoFinal).toFixed(2),
    });

    saldo = saldoFinal;
  }

  // 5️⃣ Resultados globales
  const resumen = {
    capitalInicial: +capital.toFixed(2),
    cuota: +cuota.toFixed(2),
    totalInteres: +totalInteres.toFixed(2),
    totalPagado: +totalPago.toFixed(2),
    saldoFinal: +saldo.toFixed(2),
    tasaPorPeriodo: +(i * 100).toFixed(6) + " %",
    periodos: n,
  };

  return { tabla, resumen };
};


// Alemán (amortizacion constante)
export const calcularAleman = (capital, tasaValor, unidadTasa, n, unidadPeriodo) => {
  const i = tasaPorPeriodo(tasaValor, unidadTasa, unidadPeriodo); // tasa decimal
  const amortizacion = capital / (n || 1); // abono constante a capital

  let saldo = capital;
  const tabla = [];
  let totalInteres = 0;
  let totalPago = 0;

  for (let k = 1; k <= n; k++) {
    const saldoAntes = saldo;
    const interes = saldoAntes * i; // interés decreciente
    const cuota = amortizacion + interes; // cuota variable
    saldo = Math.max(0, saldo - amortizacion); // saldo después del pago

    totalInteres += interes;
    totalPago += cuota;

    tabla.push({
      periodo: k,
      saldoAntesPago: +Number(saldoAntes.toFixed(8)), // saldo antes del pago
      interes: +interes.toFixed(2),
      capital: +amortizacion.toFixed(2),
      cuota: +cuota.toFixed(2),
      saldo: +saldo.toFixed(2),
    });
  }

  const resumen = {
    capitalInicial: capital,
    amortizacionConstante: amortizacion,
    totalInteres: totalInteres,
    totalPagado: totalPago,
    saldoFinal: saldo,
    tasaPorPeriodo: `${(i * 100).toFixed(4)}%`,
  };

  return { tabla, resumen, n, i };
};


// Americano (bullet) - intereses periódicos y capital al final

export const calcularAmericano = (capital, tasaValor, unidadTasa, n, unidadPeriodo) => {
  const i = tasaPorPeriodo(tasaValor, unidadTasa, unidadPeriodo); 
  const tabla = [];
  let totalInteres = 0;
  let totalPago = 0;

  for (let k = 1; k <= n; k++) {
    //const saldoAntes = capital;
    const interes = capital * i; 
    const capitalPago = k === n ? capital : 0; 
    const cuota = interes + capitalPago;
    const saldo = k === n ? 0 : capital; 

    totalInteres += interes;
    totalPago += cuota;

    tabla.push({
      periodo: k,
      interes: +interes.toFixed(2),
      capital: +capitalPago.toFixed(2),
      cuota: +cuota.toFixed(2),
      saldo: +saldo.toFixed(2),
    });
  }

  const resumen = {
    capitalInicial: +capital.toFixed(2),
    tasaPorPeriodo: `${(i * 100).toFixed(4)}%`,
    totalInteres: +totalInteres.toFixed(2),
    totalPagado: +totalPago.toFixed(2),
    saldoFinal: 0,
    periodos: n,
  };

  return { tabla, resumen, n, i };
};

