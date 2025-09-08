"use client"

// src/components/simuladores/HistorialCalculos.jsx
import { useEffect, useState } from "react"
import { formatearTiempo } from "../../utils/conversiones"
import "../../styles/historial.css"

const STORAGE_KEY = "historial_calculos_financieros"

const HistorialCalculos = () => {
  const [historial, setHistorial] = useState([])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setHistorial(JSON.parse(raw))
  }, [])

  const limpiarHistorial = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHistorial([])
  }

  const formatearNumero = (numero) => {
    return Number(numero).toLocaleString("es-CO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const obtenerIcono = (categoria) => {
    const iconos = {
      "Interés Simple": "📈",
      "Interés Compuesto": "📊",
      Anualidades: "💰",
      "Tasa de Interés": "🔢",
    }
    return iconos[categoria] || "🧮"
  }

  return (
    <div className="historial">
      <div className="historial-header">
        <h2>📊 Historial de Cálculos Financieros</h2>
        {historial.length > 0 && (
          <div className="historial-stats">
            <span className="total-calculos">Total: {historial.length} cálculos</span>
          </div>
        )}
      </div>

      {historial.length === 0 ? (
        <div className="estado-vacio">
          <div className="icono-vacio">📋</div>
          <h3>No hay cálculos registrados</h3>
          <p>Los cálculos que realices aparecerán aquí para que puedas consultarlos más tarde.</p>
        </div>
      ) : (
        <>
          <div className="acciones-historial">
            <button className="clear-btn" onClick={limpiarHistorial}>
              🗑️ Limpiar historial
            </button>
          </div>

          <div className="historial-grid">
            {historial.map((item, idx) => {
              // variables
              const v = item.variables || {}
              const tasa = v.tasa ? `${Number(v.tasa).toFixed(4)}% ${v.unidadTasa || "anual"}` : "No especificada"
              const tiempo = formatearTiempo(v.años, v.meses, v.días)

              // resultado y ganancia
              const resultado = Number.parseFloat(item.resultado) || 0
              const capital = Number.parseFloat(v.capital) || Number.parseFloat(v.cuota) || 0
              const ganancia = capital > 0 ? resultado - capital : null
              const total = ganancia !== null ? capital + ganancia : null

              return (
                <div key={idx} className="historial-card">
                  <div className="card-header">
                    <div className="tipo-calculo">
                      <span className="icono">{obtenerIcono(item.categoria)}</span>
                      <div className="info-tipo">
                        <h3>{item.categoria}</h3>
                        <span className="modo">{item.modo}</span>
                      </div>
                    </div>
                    <div className="fecha-calculo">
                      <span className="fecha">{item.fecha}</span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="datos-entrada">
                      <h4>📋 Datos de entrada</h4>
                      <div className="datos-grid">
                        {v.capital && (
                          <div className="dato-item">
                            <span className="etiqueta">Capital inicial:</span>
                            <span className="valor">${formatearNumero(v.capital)}</span>
                          </div>
                        )}
                        {v.cuota && (
                          <div className="dato-item">
                            <span className="etiqueta">Cuota:</span>
                            <span className="valor">${formatearNumero(v.cuota)}</span>
                          </div>
                        )}
                        {v.monto && (
                          <div className="dato-item">
                            <span className="etiqueta">Monto futuro:</span>
                            <span className="valor">${formatearNumero(v.monto)}</span>
                          </div>
                        )}
                        <div className="dato-item">
                          <span className="etiqueta">Tasa de interés:</span>
                          <span className="valor">{tasa}</span>
                        </div>
                        <div className="dato-item">
                          <span className="etiqueta">Tiempo:</span>
                          <span className="valor">{tiempo}</span>
                        </div>
                      </div>
                    </div>

                    <div className="resultado-section">
                      <h4>🎯 Resultado del cálculo</h4>
                      <div className="resultado-principal">
                        <span className="resultado-label">Resultado:</span>
                        <span className="resultado-valor">
                          {item.unidad === "%" ? `${resultado.toFixed(4)}%` : `$${formatearNumero(resultado)}`}
                        </span>
                      </div>

                      {ganancia !== null && ganancia !== 0 && (
                        <div className="analisis-financiero">
                          <div className="ganancia-item">
                            <span className="ganancia-label">💹 Ganancia obtenida:</span>
                            <span className={`ganancia-valor ${ganancia >= 0 ? "positivo" : "negativo"}`}>
                              {ganancia >= 0 ? "+" : ""}${formatearNumero(ganancia)}
                            </span>
                          </div>
                          <div className="total-item">
                            <span className="total-label">💰 Total final:</span>
                            <span className="total-valor">${formatearNumero(total)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default HistorialCalculos
