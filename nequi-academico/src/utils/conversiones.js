// Utilidades para conversiones de tiempo y formateo
// Configuración global de decimales
export const DECIMALES_CONFIG = {
  MONEDA: 2, // Para montos en pesos
  PORCENTAJE: 2, // Para tasas de interés
  TIEMPO: 2, // Para cálculos de tiempo
  RESULTADOS: 2, // Para resultados generales
}

export const calcularTiempoEnMeses = (años = 0, meses = 0, días = 0) => {
  const añosEnMeses = Number.parseFloat(años) * 12 || 0
  const mesesDirectos = Number.parseFloat(meses) || 0
  const díasEnMeses = (Number.parseFloat(días) || 0) / 30

  return añosEnMeses + mesesDirectos + díasEnMeses
}

export const formatearTiempo = (años = 0, meses = 0, días = 0) => {
  const partes = []

  if (años && Number.parseFloat(años) > 0) {
    partes.push(`${años} año${años > 1 ? "s" : ""}`)
  }

  if (meses && Number.parseFloat(meses) > 0) {
    partes.push(`${meses} mes${meses > 1 ? "es" : ""}`)
  }

  if (días && Number.parseFloat(días) > 0) {
    partes.push(`${días} día${días > 1 ? "s" : ""}`)
  }

  return partes.length > 0 ? partes.join(", ") : "0 días"
}

export const formatearMoneda = (valor) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: DECIMALES_CONFIG.MONEDA,
  }).format(valor)
}

export const formatearPorcentaje = (valor, decimales = DECIMALES_CONFIG.PORCENTAJE) => {
  return `${valor.toFixed(decimales)}%`
}

export const formatearNumero = (valor, tipo = "RESULTADOS") => {
  const decimales = DECIMALES_CONFIG[tipo] || DECIMALES_CONFIG.RESULTADOS
  return Number(valor).toFixed(decimales)
}
