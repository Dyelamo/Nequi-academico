import React, { useState } from "react";

import "../../../src/styles/simuladores.css";

const SeriesVar = () => {
  const [R, setR] = useState("");
  const [g, setG] = useState("");
  const [i, setI] = useState("");
  const [n, setN] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  const calcularVP = () => {
    // Validaciones
    if (!R || !g || !i || !n) {
      setError("Por favor complete todos los campos antes de calcular.");
      setResultado(null);
      return;
    }

    const Rnum = parseFloat(R);
    const gnum = parseFloat(g);
    const inum = parseFloat(i) / 100; // convertir % a decimal
    const nnum = parseInt(n);

    // Fórmula del valor presente de una serie variable (gradiente aritmético)
    const parteUniforme = ((Math.pow(1 + inum, nnum) - 1) / (inum * Math.pow(1 + inum, nnum)));
    const parteGradiente = (((Math.pow(1 + inum, nnum) - 1) / (inum * Math.pow(1 + inum, nnum))) - (nnum / Math.pow(1 + inum, nnum)));

    const VP = Rnum * parteUniforme + gnum * parteGradiente;

    setResultado(VP.toFixed(2));
    setError("");
  };

  return (
    <div className="calculadora-container simulador-gradiente">
      <h2>Simulador de Series Variables (Gradiente Aritmético)</h2>

      <div className="formulario">
        <div className="input-group">
          <label>R (Pago inicial)</label>
          <input
            type="number"
            value={R}
            onChange={(e) => setR(e.target.value)}
            placeholder="Ejemplo: 1000"
          />
        </div>

        <div className="input-group">
          <label>g (Incremento por período)</label>
          <input
            type="number"
            value={g}
            onChange={(e) => setG(e.target.value)}
            placeholder="Ejemplo: 100"
          />
        </div>

        <div className="input-group">
          <label>i (Tasa de interés %)</label>
          <input
            type="number"
            value={i}
            onChange={(e) => setI(e.target.value)}
            placeholder="Ejemplo: 10"
          />
        </div>

        <div className="input-group">
          <label>n (Número de períodos)</label>
          <input
            type="number"
            value={n}
            onChange={(e) => setN(e.target.value)}
            placeholder="Ejemplo: 5"
          />
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
        </div>
      )}
    </div>
  );
};

export default SeriesVar;
