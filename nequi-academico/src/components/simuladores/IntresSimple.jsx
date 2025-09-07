// src/components/simuladores/InteresSimple.jsx
import React, { useState } from "react";
import { normalizarTasaYTiempo } from "../../utils/Conversiones";


const InteresSimple = ({ agregarAlHistorial }) => {
  const [modo, setModo] = useState("monto_futuro");
  const [inputs, setInputs] = useState({});
  const [resultado, setResultado] = useState(null);
  const [unidadResultado, setUnidadResultado] = useState("");

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const calcular = (e) => {
    e.preventDefault();
    let res = null;
    let unidad = "";

    switch (modo) {
      case "monto_futuro": {
        const { tasaMensual, tiempoMeses } = normalizarTasaYTiempo(
          inputs.tasa,
          inputs.unidadTasa,
          inputs.tiempo,
          inputs.unidadTiempo
        );
        res = inputs.capital * (1 + (tasaMensual / 100) * tiempoMeses);
        unidad = "COP";
        break;
      }
      case "tasa": {
        const { tiempoMeses } = normalizarTasaYTiempo(
          0,
          "mensual",
          inputs.tiempo,
          inputs.unidadTiempo
        );
        res =
          ((inputs.monto - inputs.capital) / (inputs.capital * tiempoMeses)) *
          100;
        unidad = " % mensual";
        break;
      }
      case "tiempo": {
        const { tasaMensual } = normalizarTasaYTiempo(
          inputs.tasa,
          inputs.unidadTasa,
          0,
          "meses"
        );
        res =
          (inputs.monto - inputs.capital) /
          (inputs.capital * (tasaMensual / 100));
        unidad = " meses";
        break;
      }
      default:
        res = "Modo no definido";
    }

    const registro = {
      categoria: "Interés Simple",
      modo,
      variables: { ...inputs },
      resultado: res,
      unidad,
      fecha: new Date().toLocaleString(),
    };

    setResultado(res);
    setUnidadResultado(unidad);
    agregarAlHistorial(registro);
  };

  return (
    <div>
      <h2>Interés Simple</h2>

      <label>¿Qué deseas calcular?</label>
      <select value={modo} onChange={(e) => setModo(e.target.value)}>
        <option value="monto_futuro">Monto Futuro (VF)</option>
        <option value="tasa">Tasa de Interés (i)</option>
        <option value="tiempo">Tiempo (t)</option>
      </select>

      <form onSubmit={calcular} className="formulario">
        {modo === "monto_futuro" && (
          <>
            <input
              name="capital"
              type="number"
              placeholder="Capital (C)"
              onChange={handleChange}
            />
            <input
              name="tasa"
              type="number"
              placeholder="Tasa"
              onChange={handleChange}
            />
            <select name="unidadTasa" onChange={handleChange}>
              <option value="anual">Anual</option>
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="diaria">Diaria</option>
            </select>
            <input
              name="tiempo"
              type="number"
              placeholder="Tiempo"
              onChange={handleChange}
            />
            <select name="unidadTiempo" onChange={handleChange}>
              <option value="años">Años</option>
              <option value="meses">Meses</option>
              <option value="días">Días</option>
            </select>
          </>
        )}

        {modo === "tasa" && (
          <>
            <input
              name="monto"
              type="number"
              placeholder="Monto Futuro (VF)"
              onChange={handleChange}
            />
            <input
              name="capital"
              type="number"
              placeholder="Capital (C)"
              onChange={handleChange}
            />
            <input
              name="tiempo"
              type="number"
              placeholder="Tiempo"
              onChange={handleChange}
            />
            <select name="unidadTiempo" onChange={handleChange}>
              <option value="años">Años</option>
              <option value="meses">Meses</option>
              <option value="días">Días</option>
            </select>
          </>
        )}

        {modo === "tiempo" && (
          <>
            <input
              name="monto"
              type="number"
              placeholder="Monto Futuro (VF)"
              onChange={handleChange}
            />
            <input
              name="capital"
              type="number"
              placeholder="Capital (C)"
              onChange={handleChange}
            />
            <input
              name="tasa"
              type="number"
              placeholder="Tasa"
              onChange={handleChange}
            />
            <select name="unidadTasa" onChange={handleChange}>
              <option value="anual">Anual</option>
              <option value="mensual">Mensual</option>
              <option value="trimestral">Trimestral</option>
              <option value="diaria">Diaria</option>
            </select>
          </>
        )}
        <button type="submit">Calcular</button>
      </form>

      {resultado && (
        <div className="resultado">
          <h3>
            Resultado: {resultado.toFixed(2)} {unidadResultado}
          </h3>
        </div>
      )}
    </div>
  );
};

export default InteresSimple;
