import React, { useState } from "react";
import "../../../src/styles/simuladores.css"

const TIR = () => {
  const [inversion, setInversion] = useState("");
  const [periodos, setPeriodos] = useState("");
  const [unidad, setUnidad] = useState("años");
  const [flujos, setFlujos] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  // Genera los campos dinámicos para los flujos
  const generarFlujos = () => {
    if (!inversion || !periodos) {
      setError("Por favor ingrese la inversión inicial y la cantidad de períodos.");
      return;
    }
    setError("");
    setFlujos(Array.from({ length: parseInt(periodos) }, () => ""));
  };

  const actualizarFlujo = (index, valor) => {
    const nuevos = [...flujos];
    nuevos[index] = valor;
    setFlujos(nuevos);
  };

  // Cálculo de la TIR mediante método iterativo
  const calcularTIR = () => {
    if (flujos.some(f => f === "") || inversion === "") {
      setError("Todos los campos deben estar completos.");
      return;
    }

    const inversionInicial = parseFloat(inversion);
    const flujosNum = flujos.map(f => parseFloat(f));

    const VAN = (tasa) =>
      -inversionInicial + flujosNum.reduce((acc, f, i) => acc + f / Math.pow(1 + tasa, i + 1), 0);

    let tir = 0.1;
    let iter = 0;
    while (iter < 1000) {
      const f = VAN(tir);
      const df = (VAN(tir + 0.00001) - f) / 0.00001;
      const nuevoTir = tir - f / df;
      if (Math.abs(nuevoTir - tir) < 1e-7) break;
      tir = nuevoTir;
      iter++;
    }

    setResultado((tir * 100).toFixed(4));
    setError("");
  };

  return (
    <div className="calculadora-container simulador-tir">
      <h2>Simulador de Tasa Interna de Retorno (TIR)</h2>

      <div className="formulario">
        <div className="input-group">
          <label>Inversión Inicial</label>
          <input
            type="number"
            value={inversion}
            onChange={(e) => setInversion(e.target.value)}
            placeholder="Ejemplo: 10000"
          />
        </div>

        <div className="input-group">
          <label>Cantidad de períodos</label>
          <input
            type="number"
            value={periodos}
            onChange={(e) => setPeriodos(e.target.value)}
            placeholder="Ejemplo: 5"
          />
        </div>

        <div className="input-group">
          <label>Tipo de período</label>
          <select value={unidad} onChange={(e) => setUnidad(e.target.value)}>
            <option value="años">Años</option>
            <option value="meses">Meses</option>
          </select>
        </div>

        <button className="btn-calcular" onClick={generarFlujos}>
          Generar Flujos
        </button>
      </div>

      {flujos.length > 0 && (
        <div className="formulario flujos-container">
          <h3>Flujos de {unidad}</h3>

          {flujos.map((f, i) => (
            <div key={i} className="input-group">
              <label>Flujo {i + 1}</label>
              <input
                type="number"
                value={f}
                onChange={(e) => actualizarFlujo(i, e.target.value)}
                placeholder={`Valor del flujo ${i + 1}`}
              />
            </div>
          ))}

          <button className="btn-calcular" onClick={calcularTIR}>
            Calcular TIR
          </button>
        </div>
      )}

      {error && <p className="error" style={{ color: "var(--danger-color)", fontWeight: "600" }}>{error}</p>}

      {resultado && (
        <div className="resultado">
          <div className="valor-resultado">{resultado}%</div>
          <p>TIR {unidad === "años" ? "anual" : "mensual"} estimada</p>
        </div>
      )}
    </div>
  );
};

export default TIR;