"use client"

// src/components/prestamos/PrestamoForm.jsx
import { useState } from "react"
import {
  scheduleSimple,
  scheduleFrances,
  scheduleAlemana,
  scheduleAmericana,
  //tiempoEnPeriodos,
  // tasaPorPeriodo,
} from "../../utils/prestamos"

const PrestamoForm = ({ onSave }) => {
  const [tipo, setTipo] = useState("FRANCESA") // FRANCESA, ALEMANA, AMERICANA, SIMPLE
  const [formValues, setFormValues] = useState({})
  const [resultado, setResultado] = useState(null)
  const [tabla, setTabla] = useState([])

  const pagosPorAñoOptions = [
    { value: 12, label: "Mensual" },
    { value: 1, label: "Anual" },
  ]

  const handleChange = (e) => {
    setFormValues((s) => ({ ...s, [e.target.name]: e.target.value }))
  }

  const calcular = (e) => {
    e?.preventDefault()
    const monto = Number.parseFloat(formValues.monto) || 0
    const tasa = Number.parseFloat(formValues.tasa) || 0
    const pagosPorAño = Number.parseInt(formValues.pagosPorAño || 12)
    const años = Number.parseFloat(formValues.años) || 0
    const meses = Number.parseFloat(formValues.meses) || 0
    const dias = Number.parseFloat(formValues.dias) || 0

    const tiempoObj = { años, meses, días: dias }
    let result
    let schedule

    switch (tipo) {
      case "SIMPLE":
        result = scheduleSimple(monto, tasa, formValues.unidadTasa || "anual", tiempoObj, pagosPorAño)
        schedule = result.rows
        break
      case "FRANCESA":
        result = scheduleFrances(monto, tasa, formValues.unidadTasa || "anual", tiempoObj, pagosPorAño)
        schedule = result.rows
        break
      case "ALEMANA":
        result = scheduleAlemana(monto, tasa, formValues.unidadTasa || "anual", tiempoObj, pagosPorAño)
        schedule = result.rows
        break
      case "AMERICANA":
        result = scheduleAmericana(monto, tasa, formValues.unidadTasa || "anual", tiempoObj, pagosPorAño)
        schedule = result.rows
        break
      default:
        return
    }

    setResultado(result)
    setTabla(schedule)
  }

  const solicitar = () => {
    if (!resultado) return alert("Primero calcula la tabla.")
    // Construir objeto de préstamo
    const prestamo = {
      id: "P-" + Date.now(),
      tipo,
      monto: Number.parseFloat(formValues.monto) || 0,
      tasa: Number.parseFloat(formValues.tasa) || 0,
      unidadTasa: formValues.unidadTasa || "anual",
      pagosPorAño: Number.parseInt(formValues.pagosPorAño || 12),
      tiempo: {
        años: Number.parseFloat(formValues.años) || 0,
        meses: Number.parseFloat(formValues.meses) || 0,
        días: Number.parseFloat(formValues.dias) || 0,
      },
      tabla,
      resumen: {
        totalPayment: resultado.totalPayment || null,
        totalInterest: resultado.totalInterest || null,
        pagoPeriodico: resultado.pagoPeriodico || resultado.pagoPeriodicoFirst || null,
        n: resultado.n || null,
      },
      estado: "PENDIENTE",
      fechaSolicitud: new Date().toLocaleString(),
    }

    // enviar al handler padre (que guarda en localStorage)
    onSave(prestamo)

    // limpiar UI
    setFormValues({})
    setResultado(null)
    setTabla([])
    alert("Solicitud creada (simulada) ✅")
  }

  return (
    <div className="prestamo-form">
      <h2>Solicitar Préstamo</h2>

      <div className="row">
        <label>Tipo de amortización</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="FRANCESA">Francesa (cuota constante)</option>
          <option value="ALEMANA">Alemana (capital constante)</option>
          <option value="AMERICANA">Americana (bullet)</option>
          <option value="SIMPLE">Interés Simple</option>
        </select>
      </div>

      <form onSubmit={calcular}>
        <div className="row">
          <label>Monto (capital)</label>
          <input name="monto" type="number" step="0.01" onChange={handleChange} value={formValues.monto || ""} />
        </div>

        <div className="row">
          <label>Tasa</label>
          <input name="tasa" type="number" step="0.0001" onChange={handleChange} value={formValues.tasa || ""} />
          <select name="unidadTasa" onChange={handleChange} value={formValues.unidadTasa || "anual"}>
            <option value="anual">Anual</option>
            <option value="mensual">Mensual</option>
            <option value="trimestral">Trimestral</option>
            <option value="diaria">Diaria</option>
          </select>
        </div>

        <div className="row">
          <label>Plazo (años / meses / días)</label>
          <div className="tiempo-inline">
            <input name="años" type="number" placeholder="Años" onChange={handleChange} value={formValues.años || ""} />
            <input
              name="meses"
              type="number"
              placeholder="Meses"
              onChange={handleChange}
              value={formValues.meses || ""}
            />
            <input name="dias" type="number" placeholder="Días" onChange={handleChange} value={formValues.dias || ""} />
          </div>
        </div>

        <div className="row">
          <label>Frecuencia de pago</label>
          <select name="pagosPorAño" onChange={handleChange} value={formValues.pagosPorAño || 12}>
            {pagosPorAñoOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="actions">
          <button type="submit">Calcular tabla</button>
          <button type="button" onClick={solicitar} className="primary">
            Solicitar préstamo
          </button>
        </div>
      </form>

      {/* Resumen */}
      {resultado && (
        <div className="resumen">
          <h3>Resumen</h3>
          <p>Total intereses: {Number(resultado.totalInterest || 0).toFixed(2)}</p>
          <p>Total a pagar: {Number(resultado.totalPayment || 0).toFixed(2)}</p>
          <p>Pagos (n): {resultado.n}</p>
          <p>Pago periódico aprox: {Number(resultado.pagoPeriodico || resultado.pagoPeriodicoFirst || 0).toFixed(2)}</p>
        </div>
      )}

      {/* Tabla */}
      {tabla.length > 0 && (
        <div className="tabla">
          <h4>Tabla de amortización</h4>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Pago</th>
                <th>Interés</th>
                <th>Capital</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((r) => (
                <tr key={r.periodo}>
                  <td>{r.periodo}</td>
                  <td>{Number(r.pago).toFixed(2)}</td>
                  <td>{Number(r.interest).toFixed(2)}</td>
                  <td>{Number(r.principal).toFixed(2)}</td>
                  <td>{Number(r.balance).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PrestamoForm
