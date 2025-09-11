// src/utils/utilsFinancieros.js

/**
 * Convierte tiempo (años, meses, días) a número de períodos según frecuencia/capitalización
 */
export const convertirTiempoAPeriodos = (años = 0, meses = 0, dias = 0, frecuencia = "anual") => {
  const añosTotal = (años || 0) + (meses || 0) / 12 + (dias || 0) / 365;

  switch (frecuencia) {
    case "mensual": return añosTotal * 12;
    case "bimestral": return añosTotal * 6;
    case "trimestral": return añosTotal * 4;
    case "semestral": return añosTotal * 2;
    case "diaria": return añosTotal * 365;
    default: return añosTotal; // anual
  }
};

/**
 * Convierte tasa ingresada en cualquier unidad a tasa efectiva por período
 */
export const convertirTasaAPeriodo = (tasa, unidadTasa = "anual", frecuencia = "anual") => {
  if (!tasa || tasa <= 0) return 0;

  let tasaAnual;
  switch (unidadTasa) {
    case "mensual": tasaAnual = Math.pow(1 + tasa / 100, 12) - 1; break;
    case "bimestral": tasaAnual = Math.pow(1 + tasa / 100, 6) - 1; break;
    case "trimestral": tasaAnual = Math.pow(1 + tasa / 100, 4) - 1; break;
    case "semestral": tasaAnual = Math.pow(1 + tasa / 100, 2) - 1; break;
    case "diaria": tasaAnual = Math.pow(1 + tasa / 100, 365) - 1; break;
    default: tasaAnual = tasa / 100; // anual
  }

  switch (frecuencia) {
    case "mensual": return Math.pow(1 + tasaAnual, 1 / 12) - 1;
    case "bimestral": return Math.pow(1 + tasaAnual, 1 / 6) - 1;
    case "trimestral": return Math.pow(1 + tasaAnual, 1 / 4) - 1;
    case "semestral": return Math.pow(1 + tasaAnual, 1 / 2) - 1;
    case "diaria": return Math.pow(1 + tasaAnual, 1 / 365) - 1;
    default: return tasaAnual;
  }
};

/**
 * Convierte períodos de vuelta a años y los desglosa
 */
export const convertirPeriodosAAnios = (periodos, frecuencia = "anual") => {
  let años = periodos;
  switch (frecuencia) {
    case "mensual": años = periodos / 12; break;
    case "bimestral": años = periodos / 6; break;
    case "trimestral": años = periodos / 4; break;
    case "semestral": años = periodos / 2; break;
    case "diaria": años = periodos / 365; break;
    default: break;
  }

  const totalMeses = Math.floor(años * 12);
  const añosEnteros = Math.floor(totalMeses / 12);
  const mesesRestantes = totalMeses % 12;
  const dias = Math.round((años - añosEnteros - mesesRestantes / 12) * 365);

  return { años: añosEnteros, meses: mesesRestantes, dias, añosDecimales: años };
};