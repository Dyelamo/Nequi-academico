"use client"

import { useState } from "react"

const InteresCompuesto = ({ agregarAlHistorial }) => {
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState("")

  const convertirTiempoAPeriodos = (años, meses, dias, capitalizacion) => {
    const añosTotal = (años || 0) + (meses || 0) / 12 + (dias || 0) / 365

    switch (capitalizacion) {
      case "mensual":
        return añosTotal * 12
      case "trimestral":
        return añosTotal * 4
      case "semestral":
        return añosTotal * 2
      case "diaria":
        return añosTotal * 365
      default:
        return añosTotal // anual
    }
  }

  const convertirTasaAPeriodo = (tasa, unidadTasa, capitalizacion) => {
    // Primero convertir a tasa anual
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

    // Luego convertir a tasa por período de capitalización
    switch (capitalizacion) {
      case "mensual":
        return tasaAnual / 12
      case "trimestral":
        return tasaAnual / 4
      case "semestral":
        return tasaAnual / 2
      case "diaria":
        return tasaAnual / 365
      default:
        return tasaAnual // anual
    }
  }

  const calcular = (e) => {
    e.preventDefault()
    setError("")

    const form = new FormData(e.target)
    const data = Object.fromEntries(form.entries())

    const capital = Number.parseFloat(data.capital) || null
    const monto = Number.parseFloat(data.monto) || null
    const tasa = Number.parseFloat(data.tasa) || null
    const años = Number.parseFloat(data.años) || 0
    const meses = Number.parseFloat(data.meses) || 0
    const dias = Number.parseFloat(data.dias) || 0

    const camposVacios = []
    if (!capital) camposVacios.push("capital")
    if (!monto) camposVacios.push("monto")
    if (!tasa) camposVacios.push("tasa")

    // Verificar si hay tiempo ingresado
    const tiempoIngresado = años > 0 || meses > 0 || dias > 0
    if (!tiempoIngresado) camposVacios.push("tiempo")

    if (camposVacios.length !== 1) {
      setError("Debes llenar exactamente 3 campos y dejar 1 vacío para calcular")
      return
    }

    if (capital !== null && capital <= 0) {
      setError("El capital debe ser mayor a 0")
      return
    }
    if (monto !== null && monto <= 0) {
      setError("El monto debe ser mayor a 0")
      return
    }
    if (tasa !== null && tasa <= 0) {
      setError("La tasa debe ser mayor a 0")
      return
    }

    const periodos = convertirTiempoAPeriodos(años, meses, dias, data.capitalizacion)

    let res = null
    let unidad = ""
    let modo = ""

    try {
      if (camposVacios[0] === "monto") {
        if (!tasa) {
          setError("Se necesita la tasa para calcular el monto futuro")
          return
        }
        const tasaPorPeriodo = convertirTasaAPeriodo(tasa, data.unidadTasa, data.capitalizacion) / 100
        res = capital * Math.pow(1 + tasaPorPeriodo, periodos)
        unidad = "COP"
        modo = "Monto Futuro"
      } else if (camposVacios[0] === "capital") {
        if (!tasa) {
          setError("Se necesita la tasa para calcular el capital inicial")
          return
        }
        const tasaPorPeriodo = convertirTasaAPeriodo(tasa, data.unidadTasa, data.capitalizacion) / 100
        res = monto / Math.pow(1 + tasaPorPeriodo, periodos)
        unidad = "COP"
        modo = "Capital Inicial"
      } else if (camposVacios[0] === "tasa") {
        if (monto <= capital) {
          setError("El monto futuro debe ser mayor al capital inicial")
          return
        }
        if (periodos <= 0) {
          setError("El tiempo debe ser mayor a 0")
          return
        }

        // Calcular tasa por período
        const tasaPeriodo = Math.pow(monto / capital, 1 / periodos) - 1

        // Convertir a tasa anual
        let tasaAnual = tasaPeriodo
        if (data.capitalizacion === "mensual") tasaAnual *= 12
        else if (data.capitalizacion === "trimestral") tasaAnual *= 4
        else if (data.capitalizacion === "semestral") tasaAnual *= 2
        else if (data.capitalizacion === "diaria") tasaAnual *= 365

        // Convertir a la unidad solicitada
        res = tasaAnual * 100 // Convertir a porcentaje
        if (data.unidadTasa === "mensual") res /= 12
        else if (data.unidadTasa === "trimestral") res /= 4
        else if (data.unidadTasa === "diaria") res /= 365

        unidad = `% ${data.unidadTasa}`
        modo = "Tasa de Interés"
      } else if (camposVacios[0] === "tiempo") {
        if (!tasa) {
          setError("Se necesita la tasa para calcular el tiempo")
          return
        }
        if (monto <= capital) {
          setError("El monto futuro debe ser mayor al capital inicial")
          return
        }

        const tasaPorPeriodo = convertirTasaAPeriodo(tasa, data.unidadTasa, data.capitalizacion) / 100
        if (tasaPorPeriodo <= 0) {
          setError("La tasa debe ser mayor a 0")
          return
        }

        const periodosCalculados = Math.log(monto / capital) / Math.log(1 + tasaPorPeriodo)

        // Convertir períodos de vuelta a años
        res = periodosCalculados
        if (data.capitalizacion === "mensual") res /= 12
        else if (data.capitalizacion === "trimestral") res /= 4
        else if (data.capitalizacion === "semestral") res /= 2
        else if (data.capitalizacion === "diaria") res /= 365

        unidad = "años"
        modo = "Tiempo"
      }

      if (res === null || !isFinite(res) || isNaN(res)) {
        setError("Error en el cálculo. Verifica que los valores sean válidos.")
        return
      }

      const registro = {
        categoria: "Interés Compuesto",
        modo,
        variables: {
          capital: capital || (camposVacios[0] === "capital" ? res : capital),
          monto: monto || (camposVacios[0] === "monto" ? res : monto),
          tasa: `${tasa || (camposVacios[0] === "tasa" ? res : tasa)} % ${data.unidadTasa}`,
          tiempo: `${años || 0}a ${meses || 0}m ${dias || 0}d`,
          capitalizacion: data.capitalizacion,
        },
        resultado: res,
        unidad,
        fecha: new Date().toLocaleString(),
      }

      setResultado({
        valor: res,
        unidad,
        modo,
        capital: capital || (camposVacios[0] === "capital" ? res : capital),
        monto: monto || (camposVacios[0] === "monto" ? res : monto),
        tasa: tasa || (camposVacios[0] === "tasa" ? res : tasa),
        tiempo: (años || 0) + (meses || 0) / 12 + (dias || 0) / 365,
        capitalizacion: data.capitalizacion,
      })

      agregarAlHistorial(registro)
    } catch (error) {
      setError("Error en el cálculo. Verifica los valores ingresados." + error.message)
    }
  }

  return (
    <div>
      <h2>Interés Compuesto</h2>
      <p className="descripcion">
        Completa 3 campos y deja 1 vacío. El sistema calculará automáticamente el valor faltante.
      </p>

      <form onSubmit={calcular} className="formulario">
        <div className="input-group">
          <label>Capital Inicial (C)</label>
          <input name="capital" type="number" placeholder="Ej: 1000000" step="0.01" />
        </div>

        <div className="input-group">
          <label>Monto Futuro (VF)</label>
          <input name="monto" type="number" placeholder="Ej: 1500000" step="0.01" />
        </div>

        <div className="input-group">
          <label>Tasa de Interés</label>
          <div className="input-with-select">
            <input name="tasa" type="number" placeholder="Ej: 12" step="0.01" />
            <select name="unidadTasa">
              <option value="anual">% Anual</option>
              <option value="mensual">% Mensual</option>
              <option value="trimestral">% Trimestral</option>
              <option value="diaria">% Diaria</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label>Capitalización</label>
          <select name="capitalizacion">
            <option value="anual">Anual</option>
            <option value="semestral">Semestral</option>
            <option value="trimestral">Trimestral</option>
            <option value="mensual">Mensual</option>
            <option value="diaria">Diaria</option>
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
              <strong>Capital:</strong> ${resultado.capital.toFixed(2)} COP
            </p>
            <p>
              <strong>Monto Futuro:</strong> ${resultado.monto.toFixed(2)} COP
            </p>
            <p>
              <strong>Tasa:</strong> {resultado.tasa.toFixed(2)}% {resultado.capitalizacion}
            </p>
            <p>
              <strong>Tiempo:</strong> {resultado.tiempo.toFixed(2)} años
            </p>
            <p>
              <strong>Capitalización:</strong> {resultado.capitalizacion}
            </p>
            <p>
              <strong>Interés Ganado:</strong> ${(resultado.monto - resultado.capital).toFixed(2)} COP
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteresCompuesto
