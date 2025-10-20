import React, { useState } from "react";
import "../../../src/styles/simuladores.css";

const SeriesVar = () => {
  const [R, setR] = useState("");
  const [g, setG] = useState("");
  const [i, setI] = useState("");
  const [n, setN] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [formula, setFormula] = useState("");
  const [paVal, setPaVal] = useState(null);
  const [pgVal, setPgVal] = useState(null);

  const calcularVP = () => {
    if (!R || !g || !i || !n) {
      setError("Por favor complete todos los campos antes de calcular.");
      setResultado(null);
      setFormula("");
      setPaVal(null);
      setPgVal(null);
      return;
    }

    const Rnum = parseFloat(R);
    const gnum = parseFloat(g);
    let inum = parseFloat(i);
    const nnum = parseInt(n, 10);

    if (isNaN(inum) || isNaN(nnum) || isNaN(Rnum) || isNaN(gnum)) {
      setError("Valores numéricos inválidos.");
      return;
    }
    if (Math.abs(inum) > 1) inum = inum / 100; // Si ingreso 8 -> 0.08

    // Calcular factores
    const factorPA = (Math.pow(1 + inum, nnum) - 1) / (inum * Math.pow(1 + inum, nnum));
    const factorPG = (factorPA - nnum / Math.pow(1 + inum, nnum)) / inum;
    const VP = Rnum * factorPA + gnum * factorPG;

    // Construir la fórmula numérica paso a paso
    const formulaTexto = `
VP = R * (P/A, i, n) + g * (P/G, i, n)
VP = ${Rnum} * ${factorPA.toFixed(6)} + ${gnum} * ${factorPG.toFixed(6)}
VP = ${(Rnum * factorPA).toFixed(2)} + ${(gnum * factorPG).toFixed(2)}
VP = ${VP.toFixed(2)}

Donde:
P/A = ((1 + ${inum.toFixed(6)})^${nnum} - 1) / (${inum.toFixed(6)} * (1 + ${inum.toFixed(6)})^${nnum}) = ${factorPA.toFixed(6)}
P/G = ((P/A) - ${nnum}/(1 + ${inum.toFixed(6)})^${nnum}) / ${inum.toFixed(6)} = ${factorPG.toFixed(6)}
    `;

    setResultado(VP.toFixed(2));
    setFormula(formulaTexto);
    setPaVal(factorPA);
    setPgVal(factorPG);
    setError("");
  };

  return (
    <div className="calculadora-container simulador-gradiente">
      <h2>Simulador de Series Variables (Gradiente Aritmético)</h2>

      <div className="formulario">
        <div className="input-group">
          <label>R (Pago inicial)</label>
          <input type="number" value={R} onChange={(e) => setR(e.target.value)} placeholder="Ej: 8000" />
        </div>

        <div className="input-group">
          <label>g (Incremento por período)</label>
          <input type="number" value={g} onChange={(e) => setG(e.target.value)} placeholder="Ej: 1200" />
        </div>

        <div className="input-group">
          <label>i (Tasa de interés, 12 ó 0.12)</label>
          <input type="number" step="any" value={i} onChange={(e) => setI(e.target.value)} placeholder="Ej: 12 o 0.12" />
        </div>

        <div className="input-group">
          <label>n (Número de períodos)</label>
          <input type="number" value={n} onChange={(e) => setN(e.target.value)} placeholder="Ej: 5" />
        </div>

        <button className="btn-calcular" onClick={calcularVP}>
          Calcular Valor Presente (VP)
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {resultado && (
        <div className="resultado">
          <div className="valor-resultado">${resultado}</div>
          <p>Valor Presente de la Serie Variable</p>

          <div className="detalles-calculo">
            <p><strong>P/A:</strong> {paVal !== null ? paVal.toFixed(6) : "-"}</p>
            <p><strong>P/G:</strong> {pgVal !== null ? pgVal.toFixed(6) : "-"}</p>
            <div className="formula">
              <strong>Desarrollo paso a paso:</strong>
              <pre style={{ whiteSpace: "pre-wrap" }}>{formula}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesVar;
