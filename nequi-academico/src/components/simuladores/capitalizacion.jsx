// src/components/simuladores/Capitalizacion.jsx
import React, { useState } from "react";
import {
  calcularCapitalizacionSimple,
  calcularCapitalizacionCompuesta,
} from "../../utils/capitalizacion";
import "../../styles/amortizacion.css"; // usamos los mismos estilos del módulo anterior

const formatCurrency = (v) =>
  Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPct = (v) => (v * 100).toFixed(2) + " %";

const Capitalizacion = ({ agregarAlHistorial }) => {
  const [tipo, setTipo] = useState("simple");
  const [unidad, setUnidad] = useState("mensual");
  const [resultado, setResultado] = useState(null);
  const [formula, setFormula] = useState("");
  const [sustitucion, setSustitucion] = useState("");

  const handleCalcular = (e) => {
    e.preventDefault();
    const fm = new FormData(e.target);
    const data = Object.fromEntries(fm.entries());

    const capital = parseFloat(data.capital) || 0;
    const tasa = parseFloat(data.tasa) || 0;
    const n = Math.round(parseFloat(data.periodos) || 0);
    const unidadSeleccionada = unidad;

    let res, M, interes, i;
    if (tipo === "simple") {
      res = calcularCapitalizacionSimple(capital, tasa, unidadSeleccionada, n);
      M = res.M;
      interes = res.interes;
      i = res.i;
      setFormula("M = P × (1 + i × n)");
      setSustitucion(
        `Sustitución: ${capital} × (1 + ${i.toFixed(2)} × ${n}) = ${M.toFixed(2)}`
      );
    } else {
      res = calcularCapitalizacionCompuesta(capital, tasa, unidadSeleccionada, n);
      M = res.M;
      interes = res.interes;
      i = res.i;
      setFormula("M = P × (1 + i)^n");
      setSustitucion(
        `Sustitución: ${capital} × (1 + ${i.toFixed(2)})^${n} = ${M.toFixed(2)}`
      );
    }

    const registro = {
      categoria: "Capitalización",
      tipo,
      variables: { capital, tasa, unidad, periodos: n },
      resultado: { M, interes, i, n },
      formula,
      sustitucion,
      fecha: new Date().toLocaleString(),
    };

    if (typeof agregarAlHistorial === "function") agregarAlHistorial(registro);
    setResultado(registro);
    e.target.reset();
  };

  return (
    <div className="amortizacion">
      <h2>Sistema de Capitalización</h2>

      <div className="controls-row">
        <label>Tipo de Capitalización</label>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="simple">Simple</option>
          <option value="compuesta">Compuesta</option>
        </select>

        <label>Unidad (aplica a tasa y periodos)</label>
        <select value={unidad} onChange={(e) => setUnidad(e.target.value)}>
          <option value="mensual">Mensual</option>
          <option value="anual">Anual</option>
          <option value="trimestral">Trimestral</option>
          <option value="diaria">Diaria</option>
        </select>
      </div>

      <form onSubmit={handleCalcular} className="form-amort">
        <div className="row">
          <label> Capital Inicial (P)</label>
          <input
            name="capital"
            type="number"
            step="0.01"
            placeholder="Ej: 10000 (sin comas ni símbolos)"
            required
          />
          <small>
            Monto invertido o depositado inicialmente. <br />
            Ejemplo: 10000 = 10 mil pesos.
          </small>
        </div>

        <div className="row">
          <label> Tasa de Interés ({unidad})</label>
          <input
            name="tasa"
            type="number"
            step="0.0001"
            placeholder="Ej: 3.5 (para 3.5%)"
            required
          />
          <small>
            Porcentaje por cada periodo. <br />
            Ejemplo: 3.5 equivale al 3.5% {unidad}.
          </small>
        </div>

        <div className="row">
          <label> Número de Periodos (n)</label>
          <input
            name="periodos"
            type="number"
            step="1"
            min="1"
            placeholder="Ej: 12 (meses, años o días según unidad)"
            required
          />
          <small>
            Cantidad de periodos en los que se aplica la tasa. <br />
            Ejemplo: 12 meses, 2 años, etc.
          </small>
        </div>

        <div className="actions">
          <button type="submit" className="btn-primary">
            Calcular Capitalización
          </button>
        </div>
      </form>

      {/* Fórmulas */}
      {formula && (
        <div className="formula-box">
          <h4> Fórmula utilizada</h4>
          <pre>{formula}</pre>
          <h4> Sustitución</h4>
          <pre>{sustitucion}</pre>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="resultado-amortizacion">
          <h3>Resultado — {resultado.tipo.toUpperCase()}</h3>
          <div className="resumen-general">
            <p>
              <strong>Capital (P):</strong> {formatCurrency(resultado.variables.capital)} COP
            </p>
            <p>
              <strong>Tasa ({unidad}):</strong> {resultado.variables.tasa} %
            </p>
            <p>
              <strong>Periodos (n):</strong> {resultado.variables.periodos} {unidad}
            </p>
            <p>
              <strong>Tasa por periodo (i):</strong> {formatPct(resultado.resultado.i)}
            </p>
            <p>
              <strong>Interés generado:</strong> {formatCurrency(resultado.resultado.interes)} COP
            </p>
            <p>
              <strong>Monto final (M):</strong> {formatCurrency(resultado.resultado.M)} COP
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Capitalizacion;
