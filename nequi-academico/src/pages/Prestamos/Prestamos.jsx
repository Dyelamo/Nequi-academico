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
      </div>
    </div>
  )
}

export default Prestamos
