"use client"

// src/pages/Prestamos/Prestamos.jsx
import { useEffect, useState } from "react"
import PrestamoForm from "../../components/prestamos/PrestamosForm"
import "../../styles/prestamos.css"
import { useNavigate } from "react-router-dom"

const STORAGE_KEY = "nequi_academico_prestamos"

const Prestamos = () => {
  const [prestamos, setPrestamos] = useState([])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setPrestamos(JSON.parse(raw))
  }, [])

  const guardarPrestamo = (p) => {
    const nuevo = [p, ...prestamos]
    setPrestamos(nuevo)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevo))
  }

  const aprobar = (id) => {
    const updated = prestamos.map((p) => (p.id === id ? { ...p, estado: "APROBADO" } : p))
    setPrestamos(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const rechazar = (id) => {
    const updated = prestamos.map((p) => (p.id === id ? { ...p, estado: "RECHAZADO" } : p))
    setPrestamos(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const navigate = useNavigate()

  return (
    <div className="prestamos-page">

      <button
                className="btn-volver"
                onClick={() => navigate("/dashboard")}
            >
                ←
      </button>
      
      <h1>Préstamos</h1>
      <div className="grid">
        <div className="left">
          <PrestamoForm onSave={guardarPrestamo} />
        </div>
        <div className="right">
          <h2>Solicitudes</h2>
          {prestamos.length === 0 ? (
            <p>No hay solicitudes</p>
          ) : (
            prestamos.map((p) => (
              <div className="prestamo-card" key={p.id}>
                <div className="head">
                  <strong>{p.tipo}</strong>
                  <span>{p.estado}</span>
                </div>
                <p>Monto: {p.monto.toFixed(2)}</p>
                <p>
                  Tasa: {p.tasa}% ({p.unidadTasa})
                </p>
                <p>
                  Plazo: {p.tiempo.años}a {p.tiempo.meses}m {p.tiempo.días}d
                </p>
                <div className="card-actions">
                  <button onClick={() => aprobar(p.id)}>Aprobar</button>
                  <button onClick={() => rechazar(p.id)} className="danger">
                    Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Prestamos
