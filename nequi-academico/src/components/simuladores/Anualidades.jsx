"use client";

import React, { useState } from "react";

const formatCOP = (valor) => {
  if (valor === null || typeof valor === "undefined" || Number.isNaN(valor)) return "COP 0,00";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(valor));
};

const Anualidades = () => {
  const [A, setA] = useState("");
  const [tasa, setTasa] = useState(""); // porcentaje ej. 12 => 12%
  const [N, setN] = useState("");
  const [modo, setModo] = useState("VF"); // "VF" o "VA"
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setResultado(null);

    const aNum = Number.parseFloat(A);
    const tasaNum = Number.parseFloat(tasa);
    const nNum = Number.parseInt(N, 10);

    if (!isFinite(aNum) || aNum <= 0) return setError("Ingresa una anualidad (A) válida y mayor que 0.");
    if (!isFinite(tasaNum)) return setError("Ingresa una tasa válida (puede ser 0).");
    if (!Number.isInteger(nNum) || nNum <= 0) return setError("Ingresa un número de periodos (N) entero y mayor que 0.");

    // convertir a decimal
    const i = tasaNum / 100;

    // caso límite i ~ 0
    let valor = 0;
    let paso = {};

    if (Math.abs(i) < 1e-12) {
      // límite: tanto VF como VA -> A * N
      valor = aNum * nNum;
      paso = {
        formulaAplicada: modo === "VF"
          ? "Caso límite i = 0 → VF = A × N"
          : "Caso límite i = 0 → VA = A × N",
        i,
        numerador: nNum,
        denominador: 1,
      };
    } else {
      if (modo === "VF") {
        // VF = A * ((1 + i)^N - 1) / i
        const pow = Math.pow(1 + i, nNum);
        const numerador = pow - 1;
        const denominador = i;
        valor = aNum * (numerador / denominador);
        paso = {
          formulaAplicada: "VF = A * ((1 + i)^N - 1) / i",
          pow,
          numerador,
          denominador,
          factor: numerador / denominador,
        };
      } else {
        // VA = A * (1 - (1 + i)^-N) / i
        const powInv = Math.pow(1 + i, -nNum); // (1+i)^-N
        const numerador = 1 - powInv;
        const denominador = i;
        valor = aNum * (numerador / denominador);
        paso = {
          formulaAplicada: "VA = A * (1 - (1 + i)^-N) / i",
          powInv,
          numerador,
          denominador,
          factor: numerador / denominador,
        };
      }
    }

    setResultado({
      modo,
      A: aNum,
      tasaPercent: tasaNum,
      i,
      N: nNum,
      valor,
      paso,
    });
  };

  const handleReset = () => {
    setA("");
    setTasa("");
    setN("");
    setModo("VF");
    setError("");
    setResultado(null);
  };

  return (

    <div style={{ maxWidth: 780, margin: "0 auto", padding: 16 }} className="input-group">
      <h2>Anualidades — VF / VA</h2>
      <p>Elige la operación y completa Anualidad (A), Tasa (%) y N (periodos).</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }} className="formulario">
        <label className="row">
          Modo
          <select value={modo} onChange={(e) => setModo(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 6 }}>
            <option value="VF">Valor Futuro (VF)</option>
            <option value="VA">Valor Actual / Presente (VA)</option>
          </select>
        </label>

        <label className="row">
          Anualidad (A)
          <input
            type="number"
            step="0.01"
            value={A}
            onChange={(e) => setA(e.target.value)}
            placeholder="Ej: 100000"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label className="row">
          Tasa (%) — i en %
          <input
            type="number"
            step="0.0001"
            value={tasa}
            onChange={(e) => setTasa(e.target.value)}
            placeholder="Ej: 12  (que significa 12%)"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        <label className="row">
          Número de periodos de capitalización (N)
          <input
            type="number"
            step="1"
            min="1"
            value={N}
            onChange={(e) => setN(e.target.value)}
            placeholder="Ej: 12"
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </label>

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={{ padding: "8px 12px" }}>Calcular</button>
          <button type="button" onClick={handleReset} style={{ padding: "8px 12px" }}>Limpiar</button>
        </div>
      </form>

      {resultado && (
        <div style={{ marginTop: 20, padding: 14, border: "1px solid #e0e0e0", borderRadius: 8 }}>
          <h3>{resultado.modo === "VF" ? "Valor Futuro (VF)" : "Valor Actual (VA)"}</h3>

          <p><strong>Anualidad (A):</strong> {formatCOP(resultado.A)}</p>
          <p><strong>Tasa (%):</strong> {resultado.tasaPercent}% → <code>i = {resultado.i.toFixed(8)}</code></p>
          <p><strong>N (periodos):</strong> {resultado.N}</p>

          <hr />

          <h4>Desglose</h4>
          <p><em>{resultado.paso.formulaAplicada}</em></p>

          {Math.abs(resultado.i) < 1e-12 ? (
            <>
              <p>Caso límite i = 0 (evita división por 0):</p>
              <p>
                Resultado = A × N = {formatCOP(resultado.A)} × {resultado.N} = <strong>{formatCOP(resultado.valor)}</strong>
              </p>
            </>
          ) : (
            <>
              {resultado.modo === "VF" ? (
                <>
                  <p>(1 + i)^N = {resultado.paso.pow?.toFixed(8)}</p>
                  <p>Numerador = (1 + i)^N - 1 = {resultado.paso.numerador?.toFixed(8)}</p>
                  <p>Denominador = i = {resultado.paso.denominador?.toFixed(8)}</p>
                  <p>Factor = ( (1+i)^N - 1 ) / i = {resultado.paso.factor?.toFixed(8)}</p>
                  <p>VF = A × factor = {formatCOP(resultado.A)} × {resultado.paso.factor?.toFixed(8)} = <strong>{formatCOP(resultado.valor)}</strong></p>
                </>
              ) : (
                <>
                  <p>(1 + i)^-N = {resultado.paso.powInv?.toFixed(8)}</p>
                  <p>Numerador = 1 - (1 + i)^-N = {resultado.paso.numerador?.toFixed(8)}</p>
                  <p>Denominador = i = {resultado.paso.denominador?.toFixed(8)}</p>
                  <p>Factor = (1 - (1+i)^-N) / i = {resultado.paso.factor?.toFixed(8)}</p>
                  <p>VA = A × factor = {formatCOP(resultado.A)} × {resultado.paso.factor?.toFixed(8)} = <strong>{formatCOP(resultado.valor)}</strong></p>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Anualidades;
