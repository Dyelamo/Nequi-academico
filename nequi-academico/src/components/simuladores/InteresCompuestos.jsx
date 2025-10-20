import React, { useState, useRef } from "react";
import { tasaPorPeriodo } from "../../utils/amortizacion";
import "../../styles/amortizacion.css";

const formatCurrency = (v) =>
  Number(v).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formatPct = (v) => (v * 100).toFixed(2) + " %";

const InteresCompuesto = ({ agregarAlHistorial }) => {
  const [unidad, setUnidad] = useState("anual");
  const [tipoCalculo, setTipoCalculo] = useState("monto");
  const [resultado, setResultado] = useState(null);
  const [formula, setFormula] = useState("");
  const [sustitucion, setSustitucion] = useState("");
  const inputPeriodos = useRef(null);

  // 🔹 Conversor de tiempo (años, meses, días) → periodos decimales
  const convertirTiempo = () => {
    const años = parseFloat(document.getElementById("anios_comp").value) || 0;
    const meses = parseFloat(document.getElementById("meses_comp").value) || 0;
    const dias = parseFloat(document.getElementById("dias_comp").value) || 0;

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

    if (inputPeriodos.current) inputPeriodos.current.value = total.toFixed(2);
  };

  const handleCalcular = (e) => {
    e.preventDefault();
    const fm = new FormData(e.target);
    const data = Object.fromEntries(fm.entries());

    const capital = parseFloat(data.capital) || 0;
    const monto = parseFloat(data.monto) || 0;
    const tasa = parseFloat(data.tasa) || 0;
    const n = parseFloat(data.periodos) || 0;

    const i = tasaPorPeriodo(tasa, unidad, unidad);
    let resultadoCalculo = {};
    let formulaUsada = "";
    let sustitucionTexto = "";

    switch (tipoCalculo) {
      case "monto": {
        const M = capital * Math.pow(1 + i, n);
        const I = M - capital;
        formulaUsada = "M = P × (1 + i)^n";
        sustitucionTexto = `${capital} × (1 + ${i.toFixed(2)})^${n} = ${M.toFixed(2)}`;
        resultadoCalculo = { M, I, i, n, P: capital };
        break;
      }

      case "capital": {
        const P = monto / Math.pow(1 + i, n);
        const I = monto - P;
        formulaUsada = "P = M / (1 + i)^n";
        sustitucionTexto = `${monto} / (1 + ${i.toFixed(2)})^${n} = ${P.toFixed(2)}`;
        resultadoCalculo = { P, I, i, n, M: monto };
        break;
      }

      case "tasa": {
        const iCalc = Math.pow(monto / capital, 1 / n) - 1;
        const tasaPorcentaje = iCalc * 100;
        formulaUsada = "i = (M / P)^(1/n) - 1";
        sustitucionTexto = `(${monto} / ${capital})^(1 / ${n}) - 1 = ${iCalc.toFixed(2)}`;
        resultadoCalculo = { i: iCalc, tasaPorcentaje, n, M: monto, P: capital };
        break;
      }

      case "tiempo": {
        const nCalc = Math.log(monto / capital) / Math.log(1 + i);
        formulaUsada = "n = ln(M / P) / ln(1 + i)";
        sustitucionTexto = `ln(${monto} / ${capital}) / ln(1 + ${i.toFixed(2)}) = ${nCalc.toFixed(2)}`;
        resultadoCalculo = { n: nCalc, i, M: monto, P: capital };
        break;
      }

      default:
        break;
    }

    const registro = {
      categoria: "Interés Compuesto",
      tipoCalculo,
      variables: { capital, monto, tasa, unidad, periodos: n },
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
      <h2>Interés Compuesto</h2>

      <div className="controls-row">
        <label>Tipo de Cálculo:</label>
        <select value={tipoCalculo} onChange={(e) => setTipoCalculo(e.target.value)}>
          <option value="monto">Monto Futuro (M)</option>
          <option value="capital">Capital Inicial (P)</option>
          <option value="tasa">Tasa de Interés (i)</option>
          <option value="tiempo">Tiempo (n)</option>
        </select>

        <label>Unidad:</label>
        <select value={unidad} onChange={(e) => setUnidad(e.target.value)}>
          <option value="anual">Anual</option>
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="diaria">Diaria</option>
        </select>
      </div>

      <form onSubmit={handleCalcular} className="form-amort">
        {tipoCalculo !== "capital" && (
          <div className="row">
            <label>Capital Inicial (P)</label>
            <input name="capital" type="number" step="0.01" placeholder="Ej: 15000" required />
          </div>
        )}

        {tipoCalculo !== "monto" && (
          <div className="row">
            <label>Monto Futuro (M)</label>
            <input name="monto" type="number" step="0.01" placeholder="Ej: 18000" required />
          </div>
        )}

        {tipoCalculo !== "tasa" && (
          <div className="row">
            <label>Tasa de Interés ({unidad})</label>
            <input name="tasa" type="number" step="0.0001" placeholder="Ej: 8 (para 8%)" required />
          </div>
        )}

        {tipoCalculo !== "tiempo" && (
          <div className="row">
            <label>Número de Periodos (n)</label>
            <input ref={inputPeriodos} name="periodos" type="number" step="0.0001" placeholder="Ej: 12 (según unidad)" required />

            <div className="sub-row">
              <input id="anios_comp" type="number" placeholder="Años" min="0" style={{ width: "80px" }} />
              <input id="meses_comp" type="number" placeholder="Meses" min="0" style={{ width: "80px" }} />
              <input id="dias_comp" type="number" placeholder="Días" min="0" style={{ width: "80px" }} />
              <button type="button" onClick={convertirTiempo} className="btn-secondary">
                Convertir tiempo a periodos
              </button>
            </div>
          </div>
        )}

        <div className="actions">
          <button type="submit" className="btn-primary">Calcular</button>
        </div>
      </form>

      {formula && (
        <div className="formula-box">
          <h4>Fórmula utilizada</h4>
          <pre>{formula}</pre>
          <h4>Sustitución</h4>
          <pre>{sustitucion}</pre>
        </div>
      )}

      {resultado && (
        <div className="resultado-amortizacion">
          <h3>Resultado — {tipoCalculo.toUpperCase()}</h3>
          <div className="resumen-general">
            {resultado.resultado.M && <p><strong>Monto (M):</strong> {formatCurrency(resultado.resultado.M)} COP</p>}
            {resultado.resultado.P && <p><strong>Capital (P):</strong> {formatCurrency(resultado.resultado.P)} COP</p>}
            {resultado.resultado.I && <p><strong>Interés (I):</strong> {formatCurrency(resultado.resultado.I)} COP</p>}
            {resultado.resultado.i && <p><strong>Tasa (i):</strong> {formatPct(resultado.resultado.i)}</p>}
            {resultado.resultado.n && <p><strong>Tiempo (n):</strong> {resultado.resultado.n.toFixed(4)} {unidad}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default InteresCompuesto;
