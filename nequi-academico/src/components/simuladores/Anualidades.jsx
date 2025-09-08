"use client"

import { useState } from "react"

const Anualidades = ({ agregarAlHistorial }) => {
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState("")

  const convertirTiempoAPeriodos = (años, meses, dias, frecuenciaPago) => {
    const añosTotal = (años || 0) + (meses || 0) / 12 + (dias || 0) / 365

    switch (frecuenciaPago) {
      case "mensual":
        return añosTotal * 12
      case "trimestral":
        return añosTotal * 4
      case "semestral":
        return añosTotal * 2
      case "bimestral":
        return añosTotal * 6
      default:
        return añosTotal // anual
    }
  }

  const convertirTasaAPeriodo = (tasa, unidadTasa, frecuenciaPago) => {
    // Convertir a tasa anual
    let tasaAnual = tasa
    switch (unidadTasa) {
      case "mensual":
        tasaAnual = tasa * 12
        break
      case "trimestral":
        tasaAnual = tasa * 4
        break
      case "diaria":
        tasaAnual = tasa * 365
        break
    }

    // Convertir a tasa por período de pago
    switch (frecuenciaPago) {
      case "mensual":
        return tasaAnual / 12
      case "bimestral":
        return tasaAnual / 6
      case "trimestral":
        return tasaAnual / 4
      case "semestral":
        return tasaAnual / 2
      default:
        return tasaAnual // anual
    }
  }

  const calcular = (e) => {
    e.preventDefault()
    setError("")

    const form = new FormData(e.target)
    const data = Object.fromEntries(form.entries())

    const cuota = Number.parseFloat(data.cuota) || null
    const valorPresente = Number.parseFloat(data.valorPresente) || null
    const valorFuturo = Number.parseFloat(data.valorFuturo) || null
    const tasa = Number.parseFloat(data.tasa) || null
    const años = Number.parseFloat(data.años) || 0
    const meses = Number.parseFloat(data.meses) || 0
    const dias = Number.parseFloat(data.dias) || 0

    const camposVacios = []
    if (!cuota) camposVacios.push("cuota")
    if (!valorPresente) camposVacios.push("valorPresente")
    if (!valorFuturo) camposVacios.push("valorFuturo")
    if (!tasa) camposVacios.push("tasa")

    // Verificar si hay tiempo ingresado
    const tiempoIngresado = años > 0 || meses > 0 || dias > 0
    if (!tiempoIngresado) camposVacios.push("tiempo")

    // Para anualidades necesitamos exactamente 4 campos llenos y 1 vacío
    if (camposVacios.length !== 1) {
      setError("Debes llenar exactamente 4 campos y dejar 1 vacío para calcular")
      return
    }

    // Validaciones adicionales
    if (cuota !== null && cuota <= 0) {
      setError("La cuota debe ser mayor a 0")
      return
    }
    if (valorPresente !== null && valorPresente <= 0) {
      setError("El valor presente debe ser mayor a 0")
      return
    }
    if (valorFuturo !== null && valorFuturo <= 0) {
      setError("El valor futuro debe ser mayor a 0")
      return
    }
    if (tasa !== null && tasa <= 0) {
      setError("La tasa debe ser mayor a 0")
      return
    }

    // Validar que no se llenen ambos VP y VF (son mutuamente excluyentes en muchos casos)
    if (valorPresente && valorFuturo && camposVacios[0] !== "valorPresente" && camposVacios[0] !== "valorFuturo") {
      setError("Para anualidades simples, usa solo Valor Presente O Valor Futuro, no ambos")
      return
    }

    const periodos = convertirTiempoAPeriodos(años, meses, dias, data.frecuenciaPago)

    let res = null
    let unidad = ""
    let modo = ""

    try {
      if (camposVacios[0] === "valorFuturo") {
        if (!tasa) {
          setError("Se necesita la tasa para calcular el valor futuro")
          return
        }
        const tasaPorPeriodo = convertirTasaAPeriodo(tasa, data.unidadTasa, data.frecuenciaPago) / 100
        if (tasaPorPeriodo <= 0) {
          setError("La tasa debe ser mayor a 0")
          return
        }
        // VF = A * [((1 + i)^n - 1) / i]
        res = cuota * ((Math.pow(1 + tasaPorPeriodo, periodos) - 1) / tasaPorPeriodo)
        unidad = "COP"
        modo = "Valor Futuro"
      } else if (camposVacios[0] === "valorPresente") {
        if (!tasa) {
          setError("Se necesita la tasa para calcular el valor presente")
          return
        }
        const tasaPorPeriodo = convertirTasaAPeriodo(tasa, data.unidadTasa, data.frecuenciaPago) / 100
        if (tasaPorPeriodo <= 0) {
          setError("La tasa debe ser mayor a 0")
          return
        }
        // VP = A * [(1 - (1 + i)^-n) / i]
        res = cuota * ((1 - Math.pow(1 + tasaPorPeriodo, -periodos)) / tasaPorPeriodo)
        unidad = "COP"
        modo = "Valor Presente"
      } else if (camposVacios[0] === "cuota") {
        if (!tasa) {
          setError("Se necesita la tasa para calcular la cuota")
          return
        }
        const tasaPorPeriodo = convertirTasaAPeriodo(tasa, data.unidadTasa, data.frecuenciaPago) / 100
        if (tasaPorPeriodo <= 0) {
          setError("La tasa debe ser mayor a 0")
          return
        }

        // Calcular cuota desde VP o VF
        if (valorPresente) {
          // A = VP * [i / (1 - (1 + i)^-n)]
          const denominador = 1 - Math.pow(1 + tasaPorPeriodo, -periodos)
          if (denominador <= 0) {
            setError("Error en el cálculo: parámetros inválidos")
            return
          }
          res = valorPresente * (tasaPorPeriodo / denominador)
        } else if (valorFuturo) {
          // A = VF * [i / ((1 + i)^n - 1)]
          const denominador = Math.pow(1 + tasaPorPeriodo, periodos) - 1
          if (denominador <= 0) {
            setError("Error en el cálculo: parámetros inválidos")
            return
          }
          res = valorFuturo * (tasaPorPeriodo / denominador)
        } else {
          setError("Se necesita el Valor Presente o Valor Futuro para calcular la cuota")
          return
        }
        unidad = "COP"
        modo = "Cuota"
      } else if (camposVacios[0] === "tasa") {
        if (periodos <= 0) {
          setError("El tiempo debe ser mayor a 0")
          return
        }

        // Método de Newton-Raphson para encontrar la tasa
        let tasaAprox = 0.01 // Empezar con 1% mensual
        let iteraciones = 0
        const maxIteraciones = 100
        const precision = 0.000001

        while (iteraciones < maxIteraciones) {
          let f, df // función y su derivada

          if (valorPresente) {
            // f(i) = VP - A * [(1 - (1 + i)^-n) / i] = 0
            const factor = Math.pow(1 + tasaAprox, -periodos)
            f = valorPresente - cuota * ((1 - factor) / tasaAprox)
            df = cuota * ((1 - factor) / (tasaAprox * tasaAprox) - (periodos * factor) / (tasaAprox * (1 + tasaAprox)))
          } else if (valorFuturo) {
            // f(i) = VF - A * [((1 + i)^n - 1) / i] = 0
            const factor = Math.pow(1 + tasaAprox, periodos)
            f = valorFuturo - cuota * ((factor - 1) / tasaAprox)
            df = cuota * ((factor - 1) / (tasaAprox * tasaAprox) - (periodos * factor) / (tasaAprox * (1 + tasaAprox)))
          } else {
            setError("Se necesita el Valor Presente o Valor Futuro para calcular la tasa")
            return
          }

          if (Math.abs(f) < precision) break
          if (Math.abs(df) < precision) {
            setError("No se pudo calcular la tasa con los valores dados")
            return
          }

          tasaAprox = tasaAprox - f / df

          if (tasaAprox <= 0) tasaAprox = 0.001 // Evitar tasas negativas

          iteraciones++
        }

        if (iteraciones >= maxIteraciones) {
          setError("No se pudo calcular la tasa. Verifica los valores ingresados.")
          return
        }

        // Convertir tasa por período a la unidad solicitada
        res = tasaAprox * 100 // Convertir a porcentaje

        // Convertir de tasa por período de pago a la unidad solicitada
        if (data.unidadTasa === "anual") {
          if (data.frecuenciaPago === "mensual") res *= 12
          else if (data.frecuenciaPago === "bimestral") res *= 6
          else if (data.frecuenciaPago === "trimestral") res *= 4
          else if (data.frecuenciaPago === "semestral") res *= 2
        } else if (data.unidadTasa === "mensual") {
          if (data.frecuenciaPago === "anual") res /= 12
          else if (data.frecuenciaPago === "bimestral") res *= 2
          else if (data.frecuenciaPago === "trimestral") res *= 3
          else if (data.frecuenciaPago === "semestral") res *= 6
        } else if (data.unidadTasa === "trimestral") {
          if (data.frecuenciaPago === "anual") res /= 4
          else if (data.frecuenciaPago === "mensual") res /= 3
          else if (data.frecuenciaPago === "bimestral") res /= 1.5
          else if (data.frecuenciaPago === "semestral") res *= 2
        }

        unidad = `% ${data.unidadTasa}`
        modo = "Tasa de Interés"
      } else if (camposVacios[0] === "tiempo") {
        if (!tasa) {
          setError("Se necesita la tasa para calcular el tiempo")
          return
        }
        const tasaPorPeriodo = convertirTasaAPeriodo(tasa, data.unidadTasa, data.frecuenciaPago) / 100
        if (tasaPorPeriodo <= 0) {
          setError("La tasa debe ser mayor a 0")
          return
        }

        // Calcular tiempo
        if (valorPresente) {
          // n = -ln(1 - (VP * i / A)) / ln(1 + i)
          const factor = (valorPresente * tasaPorPeriodo) / cuota
          if (factor >= 1) {
            setError("La cuota es muy pequeña para el valor presente y tasa dados")
            return
          }
          res = -Math.log(1 - factor) / Math.log(1 + tasaPorPeriodo)
        } else if (valorFuturo) {
          // n = ln(1 + (VF * i / A)) / ln(1 + i)
          const factor = (valorFuturo * tasaPorPeriodo) / cuota
          res = Math.log(1 + factor) / Math.log(1 + tasaPorPeriodo)
        } else {
          setError("Se necesita el Valor Presente o Valor Futuro para calcular el tiempo")
          return
        }

        // Convertir períodos de vuelta a años
        if (data.frecuenciaPago === "mensual") res /= 12
        else if (data.frecuenciaPago === "bimestral") res /= 6
        else if (data.frecuenciaPago === "trimestral") res /= 4
        else if (data.frecuenciaPago === "semestral") res /= 2

        unidad = "años"
        modo = "Tiempo"
      }

      if (res === null || !isFinite(res) || isNaN(res)) {
        setError("Error en el cálculo. Verifica que los valores sean válidos.")
        return
      }

      const registro = {
        categoria: "Anualidades",
        modo,
        variables: {
          cuota: cuota || res,
          valorPresente: valorPresente || "N/A",
          valorFuturo: valorFuturo || "N/A",
          tasa: `${tasa || res} % ${data.unidadTasa}`,
          tiempo: `${años || 0}a ${meses || 0}m ${dias || 0}d`,
          frecuenciaPago: data.frecuenciaPago,
        },
        resultado: res,
        unidad,
        fecha: new Date().toLocaleString(),
      }

      setResultado({
        valor: res,
        unidad,
        modo,
        cuota: cuota || res,
        valorPresente: valorPresente || "N/A",
        valorFuturo: valorFuturo || "N/A",
        tasa: tasa || res,
        tiempo: (años || 0) + (meses || 0) / 12 + (dias || 0) / 365,
        frecuenciaPago: data.frecuenciaPago,
      })

      agregarAlHistorial(registro)
    } catch (error) {
      setError("Error en el cálculo. Verifica los valores ingresados." + error.message)
    }
  }

  return (
    <div>
      <h2>Anualidades</h2>
      <p className="descripcion">
        Completa 4 campos y deja 1 vacío. El sistema calculará automáticamente el valor faltante.
      </p>

      <form onSubmit={calcular} className="formulario">
        <div className="input-group">
          <label>Cuota o Pago (A)</label>
          <input name="cuota" type="number" placeholder="Ej: 100000" step="0.01" />
        </div>

        <div className="input-group">
          <label>Valor Presente (VP)</label>
          <input name="valorPresente" type="number" placeholder="Ej: 1000000" step="0.01" />
        </div>

        <div className="input-group">
          <label>Valor Futuro (VF)</label>
          <input name="valorFuturo" type="number" placeholder="Ej: 2000000" step="0.01" />
        </div>

        <div className="input-group">
          <label>Tasa de Interés</label>
          <div className="input-with-select">
            <input name="tasa" type="number" placeholder="Ej: 12" step="0.01" />
            <select name="unidadTasa">
              <option value="anual">% Anual</option>
              <option value="mensual">% Mensual</option>
              <option value="trimestral">% Trimestral</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label>Frecuencia de Pago</label>
          <select name="frecuenciaPago">
            <option value="mensual">Mensual</option>
            <option value="bimestral">Bimestral</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>
        </div>

        <div className="input-group">
          <label>Tiempo</label>
          <div className="tiempo-group">
            <input name="años" type="number" placeholder="Años" min="0" />
            <input name="meses" type="number" placeholder="Meses" min="0" max="11" />
            <input name="dias" type="number" placeholder="Días" min="0" max="30" />
          </div>
        </div>

        <button type="submit">Calcular Automáticamente</button>
      </form>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {resultado && (
        <div className="resultado">
          <h3>
            {resultado.modo}: {resultado.valor.toFixed(2)} {resultado.unidad}
          </h3>
          <div className="detalles">
            <p>
              <strong>Cuota:</strong> ${resultado.cuota.toFixed(2)} COP
            </p>
            <p>
              <strong>Valor Presente:</strong>{" "}
              {resultado.valorPresente !== "N/A" ? `$${resultado.valorPresente.toFixed(2)} COP` : "N/A"}
            </p>
            <p>
              <strong>Valor Futuro:</strong>{" "}
              {resultado.valorFuturo !== "N/A" ? `$${resultado.valorFuturo.toFixed(2)} COP` : "N/A"}
            </p>
            <p>
              <strong>Tasa:</strong> {resultado.tasa.toFixed(2)}%
            </p>
            <p>
              <strong>Tiempo:</strong> {resultado.tiempo.toFixed(2)} años
            </p>
            <p>
              <strong>Frecuencia:</strong> {resultado.frecuenciaPago}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Anualidades
