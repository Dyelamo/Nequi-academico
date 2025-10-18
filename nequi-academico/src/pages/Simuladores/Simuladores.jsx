"use client"

import { useState } from "react"
import "../../styles/simuladores.css"
import InteresSimple from '../../components/simuladores/IntresSimple'
import HistorialCalculos from "../../components/simuladores/HistorialCalculos"
import InteresCompuesto from '../../components/simuladores/InteresCompuestos'
import SeriesVar from "../../components/simuladores/series_variables"
import SistemaAmortizacion  from "../../components/simuladores/sistema_amortizacion";
import Capitalizacion from "../../components/simuladores/capitalizacion"
import TIR from "../../components/simuladores/tir"
import Anualidades from "../../components/simuladores/Anualidades"
import TasaInteres from "../../components/simuladores/TasaInteres"
import { useNavigate } from "react-router-dom"

const Simuladores = () => {
  const [tab, setTab] = useState("simple")
  const [historial, setHistorial] = useState([])

  // función para agregar resultados al historial
  const agregarAlHistorial = (registro) => {
    setHistorial([registro, ...historial])
    // También guardar en localStorage
    const historialActual = JSON.parse(localStorage.getItem("historial_calculos_financieros") || "[]")
    const nuevoHistorial = [registro, ...historialActual]
    localStorage.setItem("historial_calculos_financieros", JSON.stringify(nuevoHistorial))
  }

  const navigate = useNavigate();

  return (
    <div className="simuladores-container">
      <div className="simuladores-header">

        <button
                className="btn-volver"
                onClick={() => navigate("/dashboard")}
            >
                ←
        </button>

        <h1>Simuladores Financieros</h1>
        <p>Herramientas para cálculos de interés, anualidades y tasas</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={tab === "simple" ? "tab active" : "tab"} onClick={() => setTab("simple")}>
          Interés Simple
        </button>
        <button className={tab === "compuesto" ? "tab active" : "tab"} onClick={() => setTab("compuesto")}>
          Interés Compuesto
        </button>
        <button className={tab === "anualidades" ? "tab active" : "tab"} onClick={() => setTab("anualidades")}>
          Anualidades
        </button>
        <button className={tab === "tasas" ? "tab active" : "tab"} onClick={() => setTab("tasas")}>
          Tasas de Interés
        </button>
        <button className={tab === "series_var" ? "tab active" : "tab"} onClick={() => setTab("series_var")}>
          Series Variables Y Gradientes
        </button>
        <button className={tab === "amortizacion" ? "tab active" : "tab"} onClick={() => setTab("amortizacion")}>
          Sistemas de Amortización
        </button>
        <button className={tab === "capitalizacion" ? "tab active" : "tab"} onClick={() => setTab("capitalizacion")}>
          Capitalización
        </button>
        <button className={tab === "tasa_retorno" ? "tab active" : "tab"} onClick={() => setTab("tasa_retorno")}>
          Tasa de interés de Retorno
        </button>
        <button className={tab === "historial" ? "tab active" : "tab"} onClick={() => setTab("historial")}>
          Historial
        </button>
      </div>

      {/* Contenido dinámico */}
      <div className="tab-content">
        {tab === "simple" && <InteresSimple agregarAlHistorial={agregarAlHistorial} />}
        {tab === "compuesto" && <InteresCompuesto agregarAlHistorial={agregarAlHistorial} />}
        {tab === "anualidades" && <Anualidades agregarAlHistorial={agregarAlHistorial} />}
        {tab === "tasas" && <TasaInteres agregarAlHistorial={agregarAlHistorial} />}
        {tab === "historial" && <HistorialCalculos historial={historial} />}
        {tab === "series_var" && <SeriesVar/>}
        {tab === "amortizacion" && <SistemaAmortizacion agregarAlHistorial={agregarAlHistorial}/>}
        {tab === "capitalizacion" && <Capitalizacion agregarAlHistorial={agregarAlHistorial}/>}
        {tab === "tasa_retorno" && <TIR/>}
      </div>
    </div>
  )
}

export default Simuladores
