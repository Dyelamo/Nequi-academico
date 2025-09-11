// src/utils/prestamos.js
// Utilidades para cálculos de préstamos y amortización

/**
 * Convierte tiempo en diferentes unidades a períodos totales
 */
export function tiempoEnPeriodos(tiempo, pagosPorAño) {
  const { años = 0, meses = 0, días = 0 } = tiempo

  // Convertir todo a años decimales
  const añosDecimales = años + meses / 12 + días / 365

  // Convertir a períodos según la frecuencia de pago
  return Math.round(añosDecimales * pagosPorAño)
}

/**
 * Convierte tasa de diferentes unidades a tasa por período
 */
export function tasaPorPeriodo(tasa, unidadTasa, pagosPorAño) {
  let tasaAnual = tasa / 100 // Convertir porcentaje a decimal

  // Convertir a tasa anual si no lo es
  switch (unidadTasa) {
    case "mensual":
      tasaAnual = tasaAnual * 12
      break
    case "trimestral":
      tasaAnual = tasaAnual * 4
      break
    case "diaria":
      tasaAnual = tasaAnual * 365
      break
    case "anual":
    default:
      // Ya está en anual
      break
  }

  // Convertir a tasa por período
  return tasaAnual / pagosPorAño
}

/**
 * Amortización con interés simple
 */
export function scheduleSimple(monto, tasa, unidadTasa, tiempo, pagosPorAño) {
  const n = tiempoEnPeriodos(tiempo, pagosPorAño)
  const tasaPeriodo = tasaPorPeriodo(tasa, unidadTasa, pagosPorAño)

  const interesTotal = monto * tasaPeriodo * n
  const totalPagar = monto + interesTotal
  const pagoPeriodico = totalPagar / n

  const rows = []
  let balance = monto

  for (let i = 1; i <= n; i++) {
    const interesPeriodo = monto * tasaPeriodo
    const capitalPeriodo = pagoPeriodico - interesPeriodo
    balance -= capitalPeriodo

    rows.push({
      periodo: i,
      pago: pagoPeriodico,
      interest: interesPeriodo,
      principal: capitalPeriodo,
      balance: Math.max(0, balance),
    })
  }

  return {
    rows,
    n,
    pagoPeriodico,
    totalPayment: totalPagar,
    totalInterest: interesTotal,
  }
}

/**
 * Amortización francesa (cuota constante)
 */
export function scheduleFrances(monto, tasa, unidadTasa, tiempo, pagosPorAño) {
  const n = tiempoEnPeriodos(tiempo, pagosPorAño)
  const tasaPeriodo = tasaPorPeriodo(tasa, unidadTasa, pagosPorAño)

  if (tasaPeriodo === 0) {
    // Sin interés, solo dividir el capital
    const pagoPeriodico = monto / n
    const rows = []
    let balance = monto

    for (let i = 1; i <= n; i++) {
      balance -= pagoPeriodico
      rows.push({
        periodo: i,
        pago: pagoPeriodico,
        interest: 0,
        principal: pagoPeriodico,
        balance: Math.max(0, balance),
      })
    }

    return {
      rows,
      n,
      pagoPeriodico,
      totalPayment: monto,
      totalInterest: 0,
    }
  }

  // Fórmula de cuota constante
  const pagoPeriodico = (monto * (tasaPeriodo * Math.pow(1 + tasaPeriodo, n))) / (Math.pow(1 + tasaPeriodo, n) - 1)

  const rows = []
  let balance = monto
  let totalInterest = 0

  for (let i = 1; i <= n; i++) {
    const interesPeriodo = balance * tasaPeriodo
    const capitalPeriodo = pagoPeriodico - interesPeriodo
    balance -= capitalPeriodo
    totalInterest += interesPeriodo

    rows.push({
      periodo: i,
      pago: pagoPeriodico,
      interest: interesPeriodo,
      principal: capitalPeriodo,
      balance: Math.max(0, balance),
    })
  }

  return {
    rows,
    n,
    pagoPeriodico,
    totalPayment: pagoPeriodico * n,
    totalInterest,
  }
}

/**
 * Amortización alemana (capital constante)
 */
export function scheduleAlemana(monto, tasa, unidadTasa, tiempo, pagosPorAño) {
  const n = tiempoEnPeriodos(tiempo, pagosPorAño)
  const tasaPeriodo = tasaPorPeriodo(tasa, unidadTasa, pagosPorAño)

  const capitalPeriodo = monto / n

  const rows = []
  let balance = monto
  let totalInterest = 0
  let totalPayment = 0

  for (let i = 1; i <= n; i++) {
    const interesPeriodo = balance * tasaPeriodo
    const pagoPeriodico = capitalPeriodo + interesPeriodo
    balance -= capitalPeriodo
    totalInterest += interesPeriodo
    totalPayment += pagoPeriodico

    rows.push({
      periodo: i,
      pago: pagoPeriodico,
      interest: interesPeriodo,
      principal: capitalPeriodo,
      balance: Math.max(0, balance),
    })
  }

  return {
    rows,
    n,
    pagoPeriodicoFirst: rows[0]?.pago || 0,
    totalPayment,
    totalInterest,
  }
}

/**
 * Amortización americana (bullet payment)
 */
export function scheduleAmericana(monto, tasa, unidadTasa, tiempo, pagosPorAño) {
  const n = tiempoEnPeriodos(tiempo, pagosPorAño)
  const tasaPeriodo = tasaPorPeriodo(tasa, unidadTasa, pagosPorAño)

  const interesPeriodo = monto * tasaPeriodo

  const rows = []
  let totalInterest = 0

  // Períodos 1 a n-1: solo pago de intereses
  for (let i = 1; i < n; i++) {
    totalInterest += interesPeriodo
    rows.push({
      periodo: i,
      pago: interesPeriodo,
      interest: interesPeriodo,
      principal: 0,
      balance: monto,
    })
  }

  // Último período: interés + capital completo
  const pagoFinal = interesPeriodo + monto
  totalInterest += interesPeriodo

  rows.push({
    periodo: n,
    pago: pagoFinal,
    interest: interesPeriodo,
    principal: monto,
    balance: 0,
  })

  return {
    rows,
    n,
    pagoPeriodico: interesPeriodo, // Pago regular (solo intereses)
    pagoFinal,
    totalPayment: totalInterest + monto,
    totalInterest,
  }
}


/**
 * Interés compuesto (sin amortización, solo cálculo de monto final)
 * Fórmula: M = C * (1 + i)^n
 */
/**
 * Interés compuesto con cuotas periódicas
 * M = C * (1 + i)^n
 */
export function scheduleCompuesto(monto, tasa, unidadTasa, tiempo, pagosPorAño) {
  const n = tiempoEnPeriodos(tiempo, pagosPorAño)
  const tasaPeriodo = tasaPorPeriodo(tasa, unidadTasa, pagosPorAño)

  // Monto final por interés compuesto
  const montoFinal = monto * Math.pow(1 + tasaPeriodo, n)
  const interesTotal = montoFinal - monto

  // Cuota periódica (amortización tipo "francesa" pero con interés compuesto)
  const pagoPeriodico = montoFinal / n

  const rows = []
  let balance = montoFinal

  for (let i = 1; i <= n; i++) {
    const interesPeriodo = balance * tasaPeriodo
    const capitalPeriodo = pagoPeriodico - interesPeriodo
    balance -= pagoPeriodico

    rows.push({
      periodo: i,
      pago: pagoPeriodico,
      interest: interesPeriodo,
      principal: capitalPeriodo,
      balance: Math.max(0, balance),
    })
  }

  return {
    rows,
    n,
    pagoPeriodico,
    totalPayment: montoFinal,
    totalInterest: interesTotal,
  }
}

