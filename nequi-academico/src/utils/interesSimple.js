// src/utils/interesSimple.js
import { tasaPorPeriodo } from "./amortizacion";

export const calcularInteresSimple = (capital, tasa, unidad, periodos) => {
  const i = tasaPorPeriodo(tasa, unidad, unidad);
  const I = capital * i * periodos;
  const M = capital + I;

  return { I, M, i, n: periodos };
};
