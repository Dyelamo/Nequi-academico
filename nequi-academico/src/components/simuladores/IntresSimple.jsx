"use client"

import { useState } from "react"

const InteresSimple = ({ agregarAlHistorial }) => {
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState("")

  const convertirTiempoAAnios = (años, meses, dias) => {
    const añosTotal = (años || 0) + (meses || 0) / 12 + (dias || 0) / 365
    return añosTotal
  }

  const convertirTasaAAnual = (tasa, unidad) => {
    switch (unidad) {
      case "mensual":
        return tasa * 12
      case "trimestral":
        return tasa * 4
      case "diaria":
        return tasa * 365
      default:
        return tasa // anual
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

    const tiempoEnAnios = convertirTiempoAAnios(años, meses, dias)

    let res = null
    let unidad = ""
    let modo = ""

    try {
      if (camposVacios[0] === "monto") {
        const tasaAnual = convertirTasaAAnual(tasa, data.unidadTasa)
        res = capital * (1 + (tasaAnual / 100) * tiempoEnAnios)
        unidad = "COP"
        modo = "Monto Futuro"
      } else if (camposVacios[0] === "capital") {
        const tasaAnual = convertirTasaAAnual(tasa, data.unidadTasa)
        res = monto / (1 + (tasaAnual / 100) * tiempoEnAnios)
        unidad = "COP"
        modo = "Capital Inicial"
      } else if (camposVacios[0] === "tasa") {
        if (tiempoEnAnios === 0) {
          setError("El tiempo debe ser mayor a 0 para calcular la tasa")
          return
        }
        res = ((monto - capital) / (capital * tiempoEnAnios)) * 100

        switch (data.unidadTasa) {
          case "mensual":
            res = res / 12
            break
          case "trimestral":
            res = res / 4
            break
          case "diaria":
            res = res / 365
            break
          // anual se mantiene igual
        }

        unidad = `% ${data.unidadTasa}`
        modo = "Tasa de Interés"
      } else if (camposVacios[0] === "tiempo") {
        const tasaAnual = convertirTasaAAnual(tasa, data.unidadTasa)
        if (tasaAnual === 0) {
          setError("La tasa debe ser mayor a 0 para calcular el tiempo")
          return
        }
        res = (monto - capital) / (capital * (tasaAnual / 100))
        unidad = "años"
        modo = "Tiempo"
      }

      const registro = {
        categoria: "Interés Simple",
        modo,
        variables: {
          capital: capital || (camposVacios[0] === "capital" ? res : capital),
          monto: monto || (camposVacios[0] === "monto" ? res : monto),
          tasa: camposVacios[0] === "tasa" ? `${res.toFixed(4)} ${unidad}` : `${tasa} % ${data.unidadTasa}`,
          tiempo:
            camposVacios[0] === "tiempo" ? `${res.toFixed(4)} años` : `${años || 0}a ${meses || 0}m ${dias || 0}d`,
        },
        resultado: res,
        unidad,
        fecha: new Date().toLocaleString(),
      }

      const tasaParaMostrar = camposVacios[0] === "tasa" ? res : convertirTasaAAnual(tasa, data.unidadTasa)

      setResultado({
        valor: res,
        unidad,
        modo,
        capital: capital || res,
        monto: monto || res,
        tasa: tasaParaMostrar,
        tiempo: camposVacios[0] === "tiempo" ? res : tiempoEnAnios,
      })

      agregarAlHistorial(registro)
    } catch (error) {
      console.log("[v0] Error en cálculo:", error)
      setError("Error en el cálculo. Verifica los valores ingresados.")
    }
  }

  return (
    <div>
      <h2>Interés Simple</h2>
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
          <input name="monto" type="number" placeholder="Ej: 1200000" step="0.01" />
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
              <strong>Tasa:</strong> {resultado.tasa.toFixed(2)}% anual
            </p>
            <p>
              <strong>Tiempo:</strong> {resultado.tiempo.toFixed(2)} años
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

export default InteresSimple
