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
    // tasa: número en la unidad seleccionada (ej: 1.5 si el usuario escribe 1.5)
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

  // const parseNumberOrNull = (value) => {
  //   if (value === undefined || value === null) return null
  //   const trimmed = String(value).trim()
  //   if (trimmed === "") return null
  //   const n = Number(trimmed)
  //   return Number.isFinite(n) ? n : null
  // }


  //NUEVA 
  const parseNumberOrNull = (value) => {
    if (value === undefined || value === null) return null
    let s = String(value).trim()

    if (s === "") return null

    // quitar símbolos monetarios y espacios (ej "€", "$", "COP", " ")
    s = s.replace(/[^\d.,-]/g, "")

    // si se tiene tanto '.' como ',' -> asumimos formato europeo: puntos = miles, coma = decimal
    if (s.includes(".") && s.includes(",")) {
      s = s.replace(/\./g, "") // quitar miles
      s = s.replace(",", ".") // coma -> punto decimal
      const n = Number(s)
      return Number.isFinite(n) ? n : null
    }

    // solo contiene ',' -> asumimos coma decimal (ej "1234,56")
    if (s.includes(",") && !s.includes(".")) {
      s = s.replace(",", ".")
      const n = Number(s)
      return Number.isFinite(n) ? n : null
    }

    // solo contiene '.' -> puede ser decimal ("1234.56") o miles ("1.234")
    if (s.includes(".") && !s.includes(",")) {
      // si hay puntos seguidos de exactamente 3 dígitos (p. ej "1.234" o "12.345.678") => tratamos '.' como separador de miles
      if (/\.\d{3}(?:\.|$)/.test(s)) {
        s = s.replace(/\./g, "")
        const n = Number(s)
        return Number.isFinite(n) ? n : null
      }
      // si no, tratamos '.' como separador decimal
      const n = Number(s)
      return Number.isFinite(n) ? n : null
    }

    // solo dígitos (positivo/negativo)
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }



  const calcular = (e) => {
    e.preventDefault()
    setError("")

    const form = new FormData(e.target)
    const data = Object.fromEntries(form.entries())

    // Parse robustamente
    const capital = parseNumberOrNull(data.capital)
    const monto = parseNumberOrNull(data.monto)
    const tasaInput = parseNumberOrNull(data.tasa) // puede quedar null si el usuario no la puso
    const años = parseNumberOrNull(data.años) || 0
    const meses = parseNumberOrNull(data.meses) || 0
    const dias = parseNumberOrNull(data.dias) || 0

    // Detectar cuál(es) faltan
    const faltantes = []
    if (capital === null) faltantes.push("capital")
    if (monto === null) faltantes.push("monto")
    if (tasaInput === null) faltantes.push("tasa")

    const tiempoIngresado = años > 0 || meses > 0 || dias > 0
    if (!tiempoIngresado) faltantes.push("tiempo")

    if (faltantes.length !== 1) {
      setError("Debes llenar exactamente 3 campos y dejar 1 vacío para calcular")
      return
    }

    const tiempoEnAnios = convertirTiempoAAnios(años, meses, dias)

    let res = null
    let unidadMostrar = ""
    let modo = ""
    try {
      const unidadTasa = data.unidadTasa || "anual"

      if (faltantes[0] === "monto") {
        // monto = C * (1 + i_anual * t)
        if (capital === null || tasaInput === null) {
          setError("Faltan datos para calcular el monto")
          return
        }
        const tasaAnual = convertirTasaAAnual(tasaInput, unidadTasa) // % anual
        res = capital * (1 + (tasaAnual / 100) * tiempoEnAnios)
        unidadMostrar = "COP"
        modo = "Monto Futuro"
      } else if (faltantes[0] === "capital") {
        // C = monto / (1 + i_anual * t)
        if (monto === null || tasaInput === null) {
          setError("Faltan datos para calcular el capital")
          return
        }
        const tasaAnual = convertirTasaAAnual(tasaInput, unidadTasa) // % anual
        res = monto / (1 + (tasaAnual / 100) * tiempoEnAnios)
        unidadMostrar = "COP"
        modo = "Capital Inicial"
      } else if (faltantes[0] === "tasa") {
        // calcular tasa: i_anual = (monto - capital) / (capital * t)  -> en porcentaje
        if (capital === null || monto === null) {
          setError("Faltan datos para calcular la tasa")
          return
        }
        if (tiempoEnAnios === 0) {
          setError("El tiempo debe ser mayor a 0 para calcular la tasa")
          return
        }

        const tasaAnualPorc = ((monto - capital) / (capital * tiempoEnAnios)) * 100 // % anual
        // Convertir a la unidad pedida para mostrar (ej mensual = anual/12)
        let tasaEnUnidad = tasaAnualPorc
        switch (unidadTasa) {
          case "mensual":
            tasaEnUnidad = tasaAnualPorc / 12
            break
          case "trimestral":
            tasaEnUnidad = tasaAnualPorc / 4
            break
          case "diaria":
            tasaEnUnidad = tasaAnualPorc / 365
            break
          // anual -> se mantiene
        }

        res = tasaEnUnidad // valor numérico en la unidad elegida
        unidadMostrar = unidadTasa
        modo = "Tasa de Interés"
      } else if (faltantes[0] === "tiempo") {
        // t = (monto - capital) / (capital * i_anual)
        if (capital === null || monto === null || tasaInput === null) {
          setError("Faltan datos para calcular el tiempo")
          return
        }
        const tasaAnual = convertirTasaAAnual(tasaInput, data.unidadTasa)
        if (tasaAnual === 0) {
          setError("La tasa debe ser mayor a 0 para calcular el tiempo")
          return
        }
        res = (monto - capital) / (capital * (tasaAnual / 100))
        unidadMostrar = "años"
        modo = "Tiempo"
      }

      // Registro para historial (string friendly)
      const registro = {
        categoria: "Interés Simple",
        modo,
        variables: {
          capital: capital ?? (faltantes[0] === "capital" ? res : capital),
          monto: monto ?? (faltantes[0] === "monto" ? res : monto),
          tasa:
            faltantes[0] === "tasa"
              ? `${res.toFixed(6)} % ${unidadMostrar} (≈ ${(
                  convertirTasaAAnual(res, unidadMostrar) || 0
                ).toFixed(2)} % anual)`
              : `${tasaInput ?? 0} % ${data.unidadTasa}`,
          tiempo: faltantes[0] === "tiempo" ? `${res.toFixed(2)} años` : `${años || 0}a ${meses || 0}m ${dias || 0}d`,
        },
        resultado: res,
        unidad: unidadMostrar,
        fecha: new Date().toLocaleString(),
      }

      // Preparar el objeto resultado para la UI
      // Si calculamos tasa, 'res' está en la unidad elegida (mensual/trimestral/diaria/anual)
      let tasaParaMostrar = null
      if (faltantes[0] === "tasa") {
        tasaParaMostrar = res
      } else {
        // si no calculamos la tasa, mostramos la tasa como número en la unidad seleccionada
        tasaParaMostrar = tasaInput
      }

      setResultado({
        valor: res,
        unidad: unidadMostrar,
        modo,
        capital: capital ?? (faltantes[0] === "capital" ? res : capital),
        monto: monto ?? (faltantes[0] === "monto" ? res : monto),
        tasa: tasaParaMostrar,
        tiempo: faltantes[0] === "tiempo" ? res : tiempoEnAnios,
        unidadTasa: data.unidadTasa,
      })

      if (typeof agregarAlHistorial === "function") agregarAlHistorial(registro)
    } catch (err) {
      console.log("[v1] Error en cálculo:", err)
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
            <input name="tasa" type="number" placeholder="Ej: 12" step="0.000001" />
            <select name="unidadTasa" defaultValue="anual">
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
            {resultado.modo}: {Number(resultado.valor).toFixed(2)} {resultado.unidad === "COP" ? "COP" : resultado.unidad}
          </h3>
          <div className="detalles">
            <p>
              <strong>Capital:</strong> ${Number(resultado.capital || 0).toFixed(2)} COP
            </p>
            <p>
              <strong>Monto Futuro:</strong> ${Number(resultado.monto || 0).toFixed(2)} COP
            </p>
            <p>
              <strong>Tasa:</strong>{" "}
              {resultado.tasa !== null && resultado.tasa !== undefined
                ? `${Number(resultado.tasa).toFixed(6)} % ${resultado.unidadTasa}`
                : "—"}
              {resultado.unidadTasa !== "anual" && resultado.unidadTasa
                ? ` (≈ ${Number(convertirTasaAAnual(resultado.tasa || 0, resultado.unidadTasa)).toFixed(6)} % anual)`
                : ""}
            </p>
            <p>
              <strong>Tiempo:</strong> {Number(resultado.tiempo).toFixed(1)} años
            </p>
            <p>
              <strong>Interés Ganado:</strong> ${Number((resultado.monto || 0) - (resultado.capital || 0)).toFixed(2)} COP
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteresSimple
