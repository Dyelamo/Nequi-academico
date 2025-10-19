import React, { useState } from "react";
import "../../styles/amortizacion.css";

// Función para formatear porcentaje
const formatPct = (v) => (v * 100).toFixed(4) + " %";

// Conversión entre periodos (frecuencias)
const periodosPorUnidad = {
  anual: 1,
  semestral: 2,
  trimestral: 4,
  bimestral: 6,
  mensual: 12,
  diaria: 360,
};

// Conversión de tasas nominal ↔ efectiva
const convertirTasa = (valor, tipo, origen, destino) => {
  const nOrigen = periodosPorUnidad[origen];
  const nDestino = periodosPorUnidad[destino];
  const i = valor / 100;

  let resultado = 0;

  if (tipo === "nominal_a_efectiva") {
    // Efectiva = (1 + i/n)^n - 1
    resultado = Math.pow(1 + i / nOrigen, nOrigen / nDestino) - 1;
  } else if (tipo === "efectiva_a_nominal") {
    // Nominal = n * ((1 + i)^(1/n) - 1)
    resultado = nDestino * (Math.pow(1 + i, 1 / (nDestino / nOrigen)) - 1);
  } else if (tipo === "efectiva_a_efectiva") {
    // Cambiar de una efectiva a otra (e.g., anual a mensual)
    resultado = Math.pow(1 + i, nOrigen / nDestino) - 1;
  } else if (tipo === "nominal_a_nominal") {
    // Cambiar entre nominales (manteniendo base efectiva)
    const iEfectiva = Math.pow(1 + i / nOrigen, nOrigen) - 1;
    resultado = nDestino * (Math.pow(1 + iEfectiva, 1 / nDestino) - 1);
  }

  return resultado;
};

const TasaInteres = ({ agregarAlHistorial }) => {
  const [tipoConversion, setTipoConversion] = useState("nominal_a_efectiva");
  const [unidadOrigen, setUnidadOrigen] = useState("anual");
  const [unidadDestino, setUnidadDestino] = useState("mensual");
  const [resultado, setResultado] = useState(null);
  const [formula, setFormula] = useState("");
  const [sustitucion, setSustitucion] = useState("");

  const handleCalcular = (e) => {
    e.preventDefault();
    const fm = new FormData(e.target);
    const data = Object.fromEntries(fm.entries());
    const tasa = parseFloat(data.tasa) || 0;

    const iConvertida = convertirTasa(
      tasa,
      tipoConversion,
      unidadOrigen,
      unidadDestino
    );

    let formulaUsada = "";
    let sustitucionTexto = "";

    switch (tipoConversion) {
      case "nominal_a_efectiva":
        formulaUsada = "i_e = (1 + i_nom / m)^m - 1";
        sustitucionTexto = `(1 + ${tasa / 100} / ${
          periodosPorUnidad[unidadOrigen]
        })^${periodosPorUnidad[unidadOrigen]} - 1 = ${iConvertida.toFixed(2)}`;
        break;

      case "efectiva_a_nominal":
        formulaUsada = "i_nom = m × ((1 + i_e)^(1/m) - 1)";
        sustitucionTexto = `${periodosPorUnidad[unidadDestino]} × ((1 + ${
          tasa / 100
        })^(1/${periodosPorUnidad[unidadDestino]}) - 1) = ${iConvertida.toFixed(
          2
        )}`;
        break;

      case "efectiva_a_efectiva":
        formulaUsada = "i_destino = (1 + i_origen)^(m_origen / m_destino) - 1";
        sustitucionTexto = `(1 + ${tasa / 100})^(${
          periodosPorUnidad[unidadOrigen]
        } / ${periodosPorUnidad[unidadDestino]}) - 1 = ${iConvertida.toFixed(
          2
        )}`;
        break;

      case "nominal_a_nominal":
        formulaUsada =
          "i_destino = m_destino × ((1 + i_nom/m_origen)^(m_origen/m_destino) - 1)";
        sustitucionTexto = `${periodosPorUnidad[unidadDestino]} × ((1 + ${
          tasa / 100
        } / ${periodosPorUnidad[unidadOrigen]})^(${
          periodosPorUnidad[unidadOrigen]
        }/${periodosPorUnidad[unidadDestino]}) - 1) = ${iConvertida.toFixed(2)}`;
        break;

      default:
        formulaUsada = "No se reconoce el tipo de conversión.";
    }

    const registro = {
      categoria: "Tasa de Interés",
      tipoConversion,
      variables: {
        tasa,
        unidadOrigen,
        unidadDestino,
      },
      resultado: { iConvertida },
      formula: formulaUsada,
      sustitucion: sustitucionTexto,
      fecha: new Date().toLocaleString(),
    };

    if (typeof agregarAlHistorial === "function") agregarAlHistorial(registro);

    setFormula(formulaUsada);
    setSustitucion(sustitucionTexto);
    setResultado({
      valor: iConvertida,
      unidadDestino,
    });

    e.target.reset();
  };

  return (
    <div className="amortizacion">
      <h2>Conversión de Tasas de Interés</h2>

      <div className="controls-row">
        <label>Tipo de Conversión</label>
        <select
          value={tipoConversion}
          onChange={(e) => setTipoConversion(e.target.value)}
        >
          <option value="nominal_a_efectiva">
            Nominal → Efectiva
          </option>
          <option value="efectiva_a_nominal">
            Efectiva → Nominal
          </option>
          <option value="efectiva_a_efectiva">
            Efectiva → Efectiva
          </option>
          <option value="nominal_a_nominal">
            Nominal → Nominal
          </option>
        </select>

        <label>Unidad Origen</label>
        <select
          value={unidadOrigen}
          onChange={(e) => setUnidadOrigen(e.target.value)}
        >
          {Object.keys(periodosPorUnidad).map((u) => (
            <option key={u} value={u}>
              {u.charAt(0).toUpperCase() + u.slice(1)}
            </option>
          ))}
        </select>

        <label>Unidad Destino</label>
        <select
          value={unidadDestino}
          onChange={(e) => setUnidadDestino(e.target.value)}
        >
          {Object.keys(periodosPorUnidad).map((u) => (
            <option key={u} value={u}>
              {u.charAt(0).toUpperCase() + u.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleCalcular} className="form-amort">
        <div className="row">
          <label>Tasa de interés ({unidadOrigen})</label>
          <input
            name="tasa"
            type="number"
            step="0.0001"
            placeholder="Ej: 12 (para 12%)"
            required
          />
          <small>
            Ingresa la tasa base (nominal o efectiva) que deseas convertir.
          </small>
        </div>

        <div className="actions">
          <button type="submit" className="btn-primary">
            Calcular
          </button>
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
          <h3>Resultado</h3>
          <p>
            <strong>Tasa convertida:</strong>{" "}
            {formatPct(resultado.valor)} {resultado.unidadDestino}
          </p>
        </div>
      )}
    </div>
  );
};

export default TasaInteres;
