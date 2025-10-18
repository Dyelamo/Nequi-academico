// src/components/simuladores/SistemasAmortizacion.jsx
import React, { useState } from "react";
import {
  calcularFrances,
  calcularAleman,
  calcularAmericano,
  tasaPorPeriodo,
  //periodsPerYearFromUnit,
} from "../../utils/amortizacion";
import "../../styles/amortizacion.css";

const formatCurrency = (v) => Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatNumber = (v) => Number(v).toLocaleString(undefined, { maximumFractionDigits: 8 });

const SistemasAmortizacion = ({ agregarAlHistorial }) => {
  const [sistema, setSistema] = useState("frances");
  const [unidad, setUnidad] = useState("mensual"); // this single unit applies to both tasa and periodos
  const [resultado, setResultado] = useState(null);
  const [formula, setFormula] = useState("");
  const [sustitucion, setSustitucion] = useState("");

  const handleCalcular = (e) => {
    e.preventDefault();
    const fm = new FormData(e.target);
    const data = Object.fromEntries(fm.entries());

    const capital = parseFloat(data.capital) || 0;
    const tasaValor = parseFloat(data.tasa) || 0;
    const periodos = Math.max(1, Math.round(parseFloat(data.periodos) || 0)); // n
    const unidadSeleccionada = unidad; // single unidad

    // tasa por periodo decimal (respeta la unidad escogida)
    const i = tasaPorPeriodo(tasaValor, unidadSeleccionada, unidadSeleccionada);

    // preparar fórmula y sustitución textual
    if (sistema === "frances") {
      setFormula("Cuota = (P × i) / (1 - (1 + i)^-n)");
      setSustitucion(`Sustitución: ( ${capital} × ${i.toFixed(8)} ) / ( 1 - (1 + ${i.toFixed(8)})^-${periodos} )`);
    } else if (sistema === "aleman") {
      setFormula("A = P / n  ; cuota_k = A + (Saldo_{k-1} × i)");
      setSustitucion(`Sustitución: A = ${capital} / ${periodos} = ${formatNumber(capital / periodos)}`);
    } else {
      setFormula("I = P × i  ; cuota_k = I (cada periodo), amortización = P al final");
      setSustitucion(`Sustitución: I = ${capital} × ${i.toFixed(8)} = ${formatNumber(capital * i)}`);
    }

    // calcular
    let calculo;
    if (sistema === "frances") calculo = calcularFrances(capital, tasaValor, unidadSeleccionada, periodos, unidadSeleccionada);
    else if (sistema === "aleman") calculo = calcularAleman(capital, tasaValor, unidadSeleccionada, periodos, unidadSeleccionada);
    else calculo = calcularAmericano(capital, tasaValor, unidadSeleccionada, periodos, unidadSeleccionada);

    // construir registro (para historial)
    const registro = {
      categoria: "Amortizacion",
      sistema,
      variables: {
        capital,
        tasaValor,
        unidad,
        periodos,
      },
      resultado: {
        tabla: calculo.tabla,
        totalPago: calculo.totalPago,
        totalInteres: calculo.totalInteres,
        cuota: calculo.cuota || null,
        n: calculo.n,
        i: calculo.i,
      },
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
      <h2>Sistemas de Amortización</h2>

      <div className="controls-row">
        <label>Sistema</label>
        <select value={sistema} onChange={(e) => setSistema(e.target.value)}>
          <option value="frances">Francés (cuota constante)</option>
          <option value="aleman">Alemán (amortización constante)</option>
          <option value="americano">Americano (bullet)</option>
        </select>

        <label>Unidad (aplica a tasa y periodo)</label>
        <select value={unidad} onChange={(e) => setUnidad(e.target.value)}>
          <option value="mensual">Mensual</option>
          <option value="anual">Anual</option>
          <option value="trimestral">Trimestral</option>
          <option value="diaria">Diaria</option>
        </select>
      </div>

      <form onSubmit={handleCalcular} className="form-amort">
        <div className="row">
          <label>Capital (P)</label>
          <input name="capital" type="number" step="0.01" required />
        </div>

        <div className="row">
          <label>Tasa ({unidad})</label>
          <input name="tasa" type="number" step="0.0001" required />
          <span className="hint">Ingresa la tasa en la unidad seleccionada (ej: 1.5 si es 1.5% {unidad}).</span>
        </div>

        <div className="row">
          <label>Plazo (n) [{unidad}]</label>
          <input name="periodos" type="number" min="1" step="1" required />
          <span className="hint">Número de periodos en la unidad seleccionada.</span>
        </div>

        <div className="actions">
          <button type="submit" className="btn-primary">Calcular</button>
        </div>
      </form>

      {/* Fórmula y sustitución */}
      {formula && (
        <div className="formula-box">
          <h4>Fórmula</h4>
          <pre>{formula}</pre>
          <h4>Sustitución</h4>
          <pre>{sustitucion}</pre>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="resultado-amortizacion">
          <h3>Resultado — {resultado.sistema.toUpperCase()}</h3>

          <div className="resumen-general">
            <p><strong>Capital:</strong> {formatCurrency(resultado.variables.capital)} COP</p>
            <p><strong>Tasa (por {unidad}):</strong> {resultado.variables.tasaValor} %</p>
            <p><strong>Períodos (n):</strong> {resultado.variables.periodos} {unidad}</p>
            <p><strong>Total pagado:</strong> {formatCurrency(resultado.resultado.totalPago || resultado.resultado.totalPayment || 0)} COP</p>
            <p><strong>Total intereses:</strong> {formatCurrency(resultado.resultado.totalInteres || 0)} COP</p>
            {resultado.resultado.cuota != null && (
              <p><strong>Cuota (si aplica):</strong> {formatCurrency(resultado.resultado.cuota)} COP</p>
            )}
          </div>

          <div className="tabla">
            <table>
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Saldo capital</th>
                  <th>Interés por cuota</th>
                  <th>Amortización</th>
                  <th>Cuota</th>
                </tr>
              </thead>
              <tbody>
                {resultado.resultado.tabla.map((r) => (
                  <tr key={r.periodo}>
                    <td style={{ textAlign: "center" }}>{r.periodo}</td>
                    <td>{formatCurrency(r.saldoAntesPago)}</td>
                    <td>{formatCurrency(r.interes)}</td>
                    <td>{formatCurrency(r.amortizacion)}</td>
                    <td>{formatCurrency(r.cuota)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SistemasAmortizacion;
