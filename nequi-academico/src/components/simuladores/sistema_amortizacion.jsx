// src/components/simuladores/SistemasAmortizacion.jsx
import React, { useState } from "react";
import {
  calcularFrances,
  calcularAleman,
  calcularAmericano,
  tasaPorPeriodo,
} from "../../utils/amortizacion";
import "../../styles/amortizacion.css";

const formatCurrency = (v) =>
  Number(v).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formatNumber = (v) =>
  Number(v).toLocaleString(undefined, { maximumFractionDigits: 8 });

const SistemasAmortizacion = ({ agregarAlHistorial }) => {
  const [sistema, setSistema] = useState("frances");
  const [unidad, setUnidad] = useState("mensual");
  const [resultado, setResultado] = useState(null);
  const [formula, setFormula] = useState("");
  const [sustitucion, setSustitucion] = useState("");

  const handleCalcular = (e) => {
    e.preventDefault();
    const fm = new FormData(e.target);
    const data = Object.fromEntries(fm.entries());

    const capital = parseFloat(data.capital) || 0;
    const tasaValor = parseFloat(data.tasa) || 0;
    const periodos = Math.max(1, Math.round(parseFloat(data.periodos) || 0));
    const unidadSeleccionada = unidad;

    const i = tasaPorPeriodo(tasaValor, unidadSeleccionada, unidadSeleccionada);
    let calculo = null;

    // Asignar fórmulas y sustituciones
    if (sistema === "frances") {
      setFormula("Cuota = (P × i) / (1 - (1 + i)^-n)");
      setSustitucion(
        `Sustitución: (${capital} × ${i.toFixed(6)}) / (1 - (1 + ${i.toFixed(
          6
        )})^-${periodos})`
      );
      calculo = calcularFrances(
        capital,
        tasaValor,
        unidadSeleccionada,
        periodos,
        unidadSeleccionada
      );
    } else if (sistema === "aleman") {
      setFormula("Capital = Deuda / Tiempo\nIntereses = Saldo × i\nCuota = Interés + Capital");
      setSustitucion(
        `Sustitución: Amortización (constante) = ${capital} / ${periodos} = ${formatNumber(
          capital / periodos
        )}`
      );
      calculo = calcularAleman(
        capital,
        tasaValor,
        unidadSeleccionada,
        periodos,
        unidadSeleccionada
      );
    } else {
      setFormula("I = P × i\nCuota_k = I (cada periodo), amortización = P al final");
      setSustitucion(
        `Sustitución: I = ${capital} × ${i.toFixed(6)} = ${formatNumber(
          capital * i
        )}`
      );
      calculo = calcularAmericano(
        capital,
        tasaValor,
        unidadSeleccionada,
        periodos,
        unidadSeleccionada
      );
    }

    const registro = {
      categoria: "Amortización",
      sistema,
      variables: { capital, tasaValor, unidad, periodos },
      resultado: calculo,
      formula,
      sustitucion,
      fecha: new Date().toLocaleString(),
    };

    if (typeof agregarAlHistorial === "function") agregarAlHistorial(registro);
    setResultado(registro);
    e.target.reset();
  };

  // Helper para leer campo capital/amortizacion en las filas (compatibilidad)
  const filaCapital = (r) => {
    // priorizamos 'capital', luego 'amortizacion', luego 'abono'
    return r.capital ?? r.amortizacion ?? r.abono ?? 0;
  };

  return (
    <div className="amortizacion">
      <h2>Sistemas de Amortización</h2>

      <div className="controls-row">
        <label>Sistema</label>
        <select
          value={sistema}
          onChange={(e) => setSistema(e.target.value)}
        >
          <option value="frances">Francés (cuota constante)</option>
          <option value="aleman">Alemán (amortización constante)</option>
          <option value="americano">Americano (pago final)</option>
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
          <label> Capital (P)</label>
          <input
            name="capital"
            type="number"
            step="0.01"
            placeholder="Ej: 100000"
            required
          />
          <small>Monto total del préstamo o deuda.</small>
        </div>

        <div className="row">
          <label> Tasa de Interés ({unidad})</label>
          <input
            name="tasa"
            type="number"
            step="0.0001"
            placeholder="Ej: 1.5 (para 1.5%)"
            required
          />
          <small>La tasa debe coincidir con la unidad de tiempo seleccionada.</small>
        </div>

        <div className="row">
          <label> Plazo (n) [{unidad}]</label>
          <input
            name="periodos"
            type="number"
            min="1"
            step="1"
            placeholder="Ej: 12"
            required
          />
          <small>Número total de periodos de pago.</small>
        </div>

        <div className="actions">
          <button type="submit" className="btn-primary">
            Calcular
          </button>
        </div>
      </form>

      {formula && (
        <div className="formula-box">
          <h4> Fórmula utilizada</h4>
          <pre>{formula}</pre>
          <h4> Sustitución</h4>
          <pre>{sustitucion}</pre>
        </div>
      )}

      {resultado && resultado.resultado && (
        <div className="resultado-amortizacion">
          <h3>
            Resultado —{" "}
            {resultado.sistema.charAt(0).toUpperCase() +
              resultado.sistema.slice(1)}
          </h3>

          <div className="resumen-general">
            <p>
              <strong>Capital Inicial:</strong>{" "}
              {formatCurrency(resultado.variables.capital)} COP
            </p>
            <p>
              <strong>Tasa:</strong> {resultado.variables.tasaValor}% {unidad}
            </p>
            <p>
              <strong>Periodos:</strong> {resultado.variables.periodos} {unidad}
            </p>

            {resultado.resultado.resumen && (
              <>
                <p>
                  <strong>Total Intereses:</strong>{" "}
                  {formatCurrency(resultado.resultado.resumen.totalInteres)} COP
                </p>
                <p>
                  <strong>Total Pagado:</strong>{" "}
                  {formatCurrency(resultado.resultado.resumen.totalPagado)} COP
                </p>
                <p>
                  <strong>Saldo Final:</strong>{" "}
                  {formatCurrency(resultado.resultado.resumen.saldoFinal)} COP
                </p>
              </>
            )}
          </div>

          <div className="tabla">
            <table>
              <thead>
                <tr>
                  <th>N° Periodo</th>
                  <th>Cuota</th>
                  <th>Interés</th>
                  <th>Capital</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {resultado.resultado.tabla.map((r) => (
                  <tr key={r.periodo}>
                    <td style={{ textAlign: "center" }}>{r.periodo}</td>
                    <td>{formatCurrency(r.cuota ?? 0)}</td>
                    <td>{formatCurrency(r.interes ?? 0)}</td>
                    <td>{formatCurrency(filaCapital(r))}</td>
                    <td>{formatCurrency(r.saldo ?? 0)}</td>
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
