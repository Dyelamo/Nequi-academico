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

    // Normalizar la tasa: aceptar 12 o 0.12
    if (isNaN(inum) || isNaN(nnum) || isNaN(Rnum) || isNaN(gnum)) {
      setError("Valores numéricos inválidos.");
      return;
    }
    if (Math.abs(inum) > 1) inum = inum / 100; // si ingreso 8 -> 0.08

    // calcular P/A
    const factorPA = (Math.pow(1 + inum, nnum) - 1) / (inum * Math.pow(1 + inum, nnum));

    // calcular P/G correctamente: (P/A - n/(1+i)^n) / i
    const factorPG = (factorPA - nnum / Math.pow(1 + inum, nnum)) / inum;

    const VP = Rnum * factorPA + gnum * factorPG;

    // construir la formula para mostrar
    const formulaTexto = `VP = ${Rnum} * ( (1+${inum.toFixed(6)})^${nnum} - 1 ) / ( ${inum.toFixed(6)} * (1+${inum.toFixed(6)})^${nnum} )
+ ${gnum} * ( ( (1+${inum.toFixed(6)})^${nnum} - 1 ) / ( ${inum.toFixed(6)} * (1+${inum.toFixed(6)})^${nnum} ) - ${nnum} / (1+${inum.toFixed(6)})^${nnum} ) / ${inum.toFixed(6)}
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

        <button className="btn-calcular" onClick={calcularVP}>Calcular Valor Presente (VP)</button>
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
              <strong>Fórmula con valores:</strong>
              <pre style={{ whiteSpace: "pre-wrap" }}>{formula}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesVar;
