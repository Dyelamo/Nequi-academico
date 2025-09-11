"use client"

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
  const [tasa, setTasa] = useState(""); // en porcentaje (ej: 12)
  const [N, setN] = useState("");
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

    // tasa por periodo en decimal
    const i = tasaNum / 100;

    // Si i === 0 -> VF = A * N (caso límite)
    let VF;
    let paso = null;

    if (Math.abs(i) < 1e-12) {
      VF = aNum * nNum;
      paso = {
        i,
        pow: 1,
        numerador: nNum,
        denominador: 1,
        formulaAplicada: "Caso límite i = 0 → VF = A * N",
      };
    } else {
      const pow = Math.pow(1 + i, nNum);
      const numerador = pow - 1;
      const denominador = i;
      VF = aNum * (numerador / denominador);
      paso = {
        i,
        pow,
        numerador,
        denominador,
        formulaAplicada: "VF = A * ((1 + i)^N - 1) / i",
      };
    }

    setResultado({
      A: aNum,
      tasaPercent: tasaNum,
      i,
      N: nNum,
      VF,
      paso,
    });
  };

  const handleReset = () => {
    setA("");
    setTasa("");
    setN("");
    setError("");
    setResultado(null);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h2>Anualidades — Calcular Valor Futuro (VF)</h2>
      {/* <p>Fórmula usada: <code>VF = A * ((1 + i)^N - 1) / i</code></p> */}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
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

        <label>
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

        <label>
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
        <div style={{ marginTop: 20, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <h3>Resultado</h3>
          <p><strong>Anualidad (A):</strong> {formatCOP(resultado.A)}</p>
          <p><strong>Tasa (i):</strong> {resultado.tasaPercent}% → <code>i = {resultado.i.toFixed(6)}</code> (decimal por periodo)</p>
          <p><strong>N (periodos):</strong> {resultado.N}</p>

          <hr />

          <h4>Desglose del cálculo</h4>
          {resultado.paso.formulaAplicada && (
            <p><em>{resultado.paso.formulaAplicada}</em></p>
          )}

          {Math.abs(resultado.i) < 1e-12 ? (
            <>
              <p>Caso límite i = 0:</p>
              <p>VF = A × N = {formatCOP(resultado.A)} × {resultado.N} = <strong>{formatCOP(resultado.VF)}</strong></p>
            </>
          ) : (
            <>
              <p>(1 + i)^N = <code>{(1 + resultado.i).toFixed(8)}^{resultado.N} = {resultado.paso.pow.toFixed(8)}</code></p>
              <p>Numerador = (1 + i)^N - 1 = {resultado.paso.numerador.toFixed(8)}</p>
              <p>Denominador = i = {resultado.paso.denominador.toFixed(8)}</p>
              <p>
                Factor acumulado = <code>((1+i)^N - 1) / i</code> = { (resultado.paso.numerador / resultado.paso.denominador).toFixed(8) }
              </p>
              <p>
                VF = A × factor = {formatCOP(resultado.A)} × { (resultado.paso.numerador / resultado.paso.denominador).toFixed(8) } = <strong>{formatCOP(resultado.VF)}</strong>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Anualidades;
