// src/components/simuladores/Anualidades.jsx
import React, { useState, useRef } from "react";
import { tasaPorPeriodo } from "../../utils/amortizacion";
import "../../styles/amortizacion.css";

const formatCurrency = (v) =>
  Number(v).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formatPct = (v) => (v * 100).toFixed(2) + " %";

const Anualidades = ({ agregarAlHistorial }) => {
  const [unidad, setUnidad] = useState("anual");
  const [tipoCalculo, setTipoCalculo] = useState("valorFuturo");
  const [tipoAnualidad, setTipoAnualidad] = useState("ordinaria"); // "ordinaria" | "anticipada"
  const [resultado, setResultado] = useState(null);
  const [formula, setFormula] = useState("");
  const [sustitucion, setSustitucion] = useState("");
  const inputPeriodos = useRef(null);

  // Conversor de años/meses/días -> periodos decimales según unidad seleccionada
  const convertirTiempo = () => {
    const años = parseFloat(document.getElementById("anios_anual").value) || 0;
    const meses = parseFloat(document.getElementById("meses_anual").value) || 0;
    const dias = parseFloat(document.getElementById("dias_anual").value) || 0;

    let total = 0;
    switch (unidad) {
      case "anual":
        total = años + meses / 12 + dias / 360;
        break;
      case "mensual":
        total = años * 12 + meses + dias / 30;
        break;
      case "trimestral":
        total = años * 4 + meses / 3 + dias / 90;
        break;
      case "diaria":
        total = años * 360 + meses * 30 + dias;
        break;
      default:
        total = años + meses / 12 + dias / 360;
    }

    if (inputPeriodos.current) inputPeriodos.current.value = total.toFixed(4);
  };

  const handleCalcular = (e) => {
    e.preventDefault();
    const fm = new FormData(e.target);
    const data = Object.fromEntries(fm.entries());

    // Inputs
    const R_input = parseFloat(data.renta) || 0;
    const P_input = parseFloat(data.presente) || 0;
    const F_input = parseFloat(data.futuro) || 0;
    const tasa_input = parseFloat(data.tasa) || 0;
    const n_input = parseFloat(data.periodos) || 0;

    // tasa por periodo decimal (respeta unidad seleccionada)
    const i = tasaPorPeriodo(tasa_input, unidad, unidad);
    const factorAnticipada = tipoAnualidad === "anticipada" ? 1 + i : 1;

    let resultadoCalculo = {};
    let formulaUsada = "";
    let sustitucionTexto = "";

    switch (tipoCalculo) {
      case "valorFuturo": {
        // F = R * ((1+i)^n - 1) / i  ; si anticipada multiplicar por (1+i)
        const R = R_input;
        const Fcalc = i === 0 ? R * n_input : R * ((Math.pow(1 + i, n_input) - 1) / i) * factorAnticipada;
        formulaUsada =
          tipoAnualidad === "anticipada"
            ? "F = R × ((1 + i)^n - 1) / i × (1 + i)"
            : "F = R × ((1 + i)^n - 1) / i";
        sustitucionTexto = `${R} × ((1 + ${i.toFixed(6)})^${n_input} - 1) / ${i.toFixed(6)}${tipoAnualidad === "anticipada" ? ` × (1 + ${i.toFixed(2)})` : ""} = ${Fcalc.toFixed(2)}`;
        resultadoCalculo = { F: Fcalc, R, i, n: n_input };
        break;
      }

      case "valorPresente": {
        // P = R * (1 - (1+i)^-n) / i  ; si anticipada multiplicar por (1+i)
        const R = R_input;
        const Pcalc = i === 0 ? R * n_input : R * ((1 - Math.pow(1 + i, -n_input)) / i) * factorAnticipada;
        formulaUsada =
          tipoAnualidad === "anticipada"
            ? "P = R × (1 - (1 + i)^(-n)) / i × (1 + i)"
            : "P = R × (1 - (1 + i)^(-n)) / i";
        sustitucionTexto = `${R} × (1 - (1 + ${i.toFixed(2)})^(-${n_input})) / ${i.toFixed(2)}${tipoAnualidad === "anticipada" ? ` × (1 + ${i.toFixed(2)})` : ""} = ${Pcalc.toFixed(2)}`;
        resultadoCalculo = { P: Pcalc, R, i, n: n_input };
        break;
      }

      case "renta": {
        // R a partir de P o F (según cuál se pase)
        let Rcalc = 0;
        if (P_input > 0) {
          // R = P * i / (1 - (1+i)^-n) ; anticipada divide por (1+i)
          Rcalc = i === 0 ? P_input / n_input : (P_input * (i / (1 - Math.pow(1 + i, -n_input)))) / factorAnticipada;
          formulaUsada =
            tipoAnualidad === "anticipada"
              ? "R = (P × i / (1 - (1 + i)^(-n))) / (1 + i)"
              : "R = P × i / (1 - (1 + i)^(-n))";
          sustitucionTexto = `${P_input} × ${i.toFixed(2)} / (1 - (1 + ${i.toFixed(2)})^(-${n_input}))${tipoAnualidad === "anticipada" ? ` / (1 + ${i.toFixed(2)})` : ""} = ${Rcalc.toFixed(2)}`;
        } else if (F_input > 0) {
          // R = F * i / ((1+i)^n -1) ; anticipada divide por (1+i)
          Rcalc = i === 0 ? F_input / n_input : (F_input * (i / (Math.pow(1 + i, n_input) - 1))) / factorAnticipada;
          formulaUsada =
            tipoAnualidad === "anticipada"
              ? "R = (F × i / ((1 + i)^n - 1)) / (1 + i)"
              : "R = F × i / ((1 + i)^n - 1)";
          sustitucionTexto = `${F_input} × ${i.toFixed(2)} / ((1 + ${i.toFixed(2)})^${n_input} - 1)${tipoAnualidad === "anticipada" ? ` / (1 + ${i.toFixed(2)})` : ""} = ${Rcalc.toFixed(2)}`;
        } else {
          formulaUsada = "R = ? (necesita P o F como entrada)";
          sustitucionTexto = "Proporcione Valor Presente (P) o Valor Futuro (F)";
        }
        resultadoCalculo = { R: Rcalc, i, n: n_input, P: P_input, F: F_input };
        break;
      }

      case "tiempo": {
        // n = ln((F*i)/R + 1) / ln(1 + i)
        const R = R_input;
        const F = F_input;
        if (R <= 0 || F <= 0) {
          formulaUsada = "n = ln((F × i / R) + 1) / ln(1 + i)";
          sustitucionTexto = "Proporcione R > 0 y F > 0";
          resultadoCalculo = { n: NaN, i, R, F };
        } else {
          const nCalc = Math.log((F * i) / R + 1) / Math.log(1 + i);
          formulaUsada = "n = ln((F × i / R) + 1) / ln(1 + i)";
          sustitucionTexto = `ln((${F} × ${i.toFixed(2)} / ${R}) + 1) / ln(1 + ${i.toFixed(2)}) = ${nCalc.toFixed(2)}`;
          resultadoCalculo = { n: nCalc, i, R, F };
        }
        break;
      }

      default:
        break;
    }

    // registro para historial
    const registro = {
      categoria: "Anualidades",
      tipoCalculo,
      tipoAnualidad,
      variables: { R: R_input, P: P_input, F: F_input, tasa: tasa_input, unidad, periodos: n_input },
      resultado: resultadoCalculo,
      formula: formulaUsada,
      sustitucion: sustitucionTexto,
      fecha: new Date().toLocaleString(),
    };

    if (typeof agregarAlHistorial === "function") agregarAlHistorial(registro);

    setFormula(formulaUsada);
    setSustitucion(sustitucionTexto);
    setResultado(registro);
    e.target.reset();
  };

  return (
    <div className="amortizacion">
      <h2>💰 Anualidades — Ordinaria / Anticipada</h2>

      <div className="controls-row">
        <label>Tipo de Cálculo:</label>
        <select value={tipoCalculo} onChange={(e) => setTipoCalculo(e.target.value)}>
          <option value="valorFuturo">Valor Futuro (F)</option>
          <option value="valorPresente">Valor Presente (P)</option>
          <option value="renta">Pago Periódico (R)</option>
          <option value="tiempo">Tiempo (n)</option>
        </select>

        <label>Unidad:</label>
        <select value={unidad} onChange={(e) => setUnidad(e.target.value)}>
          <option value="anual">Anual</option>
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="diaria">Diaria</option>
        </select>

        <label>Tipo de Anualidad:</label>
        <select value={tipoAnualidad} onChange={(e) => setTipoAnualidad(e.target.value)}>
          <option value="ordinaria">📅 Ordinaria (vencida)</option>
          <option value="anticipada">💸 Anticipada (adelantada)</option>
        </select>
      </div>

      <form onSubmit={handleCalcular} className="form-amort">
        {/* Renta */}
        {(tipoCalculo === "valorFuturo" || tipoCalculo === "valorPresente" || tipoCalculo === "tiempo") && (
          <div className="row">
            <label>💵 Pago Periódico (R)</label>
            <input name="renta" type="number" step="0.01" placeholder="Ej: 500" required />
            <small>Pago que se repite cada periodo.</small>
          </div>
        )}

        {/* Valor Futuro */}
        {(tipoCalculo === "renta" || tipoCalculo === "tiempo") && (
          <div className="row">
            <label>🏁 Valor Futuro (F)</label>
            <input name="futuro" type="number" step="0.01" placeholder="Ej: 10000" />
            <small>Si se conoce, se puede usar para calcular R o n.</small>
          </div>
        )}

        {/* Valor Presente */}
        {(tipoCalculo === "renta" || tipoCalculo === "valorPresente") && (
          <div className="row">
            <label>🏦 Valor Presente (P)</label>
            <input name="presente" type="number" step="0.01" placeholder="Ej: 8000" />
            <small>Si se conoce, se puede usar para hallar R.</small>
          </div>
        )}

        {/* Tasa */}
        {tipoCalculo !== "tiempo" && (
          <div className="row">
            <label>📈 Tasa de Interés ({unidad})</label>
            <input name="tasa" type="number" step="0.0001" placeholder="Ej: 6 (para 6%)" required />
          </div>
        )}

        {/* Periodos con conversor */}
        {tipoCalculo !== "tiempo" && (
          <div className="row">
            <label>⏱️ Número de Periodos (n)</label>
            <input ref={inputPeriodos} name="periodos" type="number" step="0.0001" placeholder="Ej: 12 (según unidad)" required />

            <div className="sub-row">
              <input id="anios_anual" type="number" placeholder="Años" min="0" style={{ width: "80px" }} />
              <input id="meses_anual" type="number" placeholder="Meses" min="0" style={{ width: "80px" }} />
              <input id="dias_anual" type="number" placeholder="Días" min="0" style={{ width: "80px" }} />
              <button type="button" onClick={convertirTiempo} className="btn-secondary">
                Convertir tiempo a periodos
              </button>
            </div>
          </div>
        )}

        {/* En caso de calcular tiempo (n) mostramos campos R y F ya arriba; para n no pedimos tasa/periodos */}
        {tipoCalculo === "tiempo" && (
          <div className="row">
            <small>Para calcular el tiempo se necesitan R y F. La tasa se pedirá abajo si es necesaria.</small>
          </div>
        )}

        <div className="actions">
          <button type="submit" className="btn-primary">Calcular</button>
        </div>
      </form>

      {/* Fórmula y sustitución */}
      {formula && (
        <div className="formula-box">
          <h4>📘 Fórmula utilizada</h4>
          <pre>{formula}</pre>
          <h4>🧮 Sustitución</h4>
          <pre>{sustitucion}</pre>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="resultado-amortizacion">
          <h3>Resultado — {tipoCalculo.toUpperCase()}</h3>
          <div className="resumen-general">
            {resultado.resultado.R !== undefined && (
              <p><strong>Pago periódico (R):</strong> {formatCurrency(resultado.resultado.R)} COP</p>
            )}
            {resultado.resultado.P !== undefined && (
              <p><strong>Valor Presente (P):</strong> {formatCurrency(resultado.resultado.P)} COP</p>
            )}
            {resultado.resultado.F !== undefined && (
              <p><strong>Valor Futuro (F):</strong> {formatCurrency(resultado.resultado.F)} COP</p>
            )}
            {resultado.resultado.n !== undefined && (
              <p><strong>Tiempo (n):</strong> {Number(resultado.resultado.n).toFixed(4)} {unidad}</p>
            )}
            {resultado.resultado.i !== undefined && (
              <p><strong>Tasa (i):</strong> {formatPct(resultado.resultado.i)}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Anualidades;
