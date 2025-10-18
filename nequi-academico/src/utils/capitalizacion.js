// src/utils/capitalizacion.js
import { tasaPorPeriodo } from "./amortizacion"; // usamos misma utilidad de tasa

// Capitalización Simple
export const calcularCapitalizacionSimple = (capital, tasaValor, unidad, periodos) => {
  const i = tasaPorPeriodo(tasaValor, unidad, unidad); // decimal por periodo
  const M = capital * (1 + i * periodos);
  const interes = M - capital;

  return { M, interes, i, n: periodos };
};

// Capitalización Compuesta
export const calcularCapitalizacionCompuesta = (capital, tasaValor, unidad, periodos) => {
  const i = tasaPorPeriodo(tasaValor, unidad, unidad);
  const M = capital * Math.pow(1 + i, periodos);
  const interes = M - capital;

  return { M, interes, i, n: periodos };
};
