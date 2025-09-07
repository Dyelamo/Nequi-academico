// src/components/simuladores/Anualidades.jsx
import React, { useState } from "react";
import { normalizarTasaYTiempo } from "../../utils/Conversiones";

const Anualidades = ({ agregarAlHistorial }) => {
  const [modo, setModo] = useState("valor_futuro");
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

    const { tasaMensual, tiempoMeses } = normalizarTasaYTiempo(
      inputs.tasa,
      inputs.unidadTasa,
      inputs.tiempo,
      inputs.unidadTiempo
    );

    const i = tasaMensual / 100;

    switch (modo) {
      case "valor_futuro":
        // VF = A * [(1+i)^n - 1] / i
        res = inputs.cuota * ((Math.pow(1 + i, tiempoMeses) - 1) / i);
        unidad = "COP";
        break;
      case "valor_presente":
        // VP = A * [1 - (1+i)^-n] / i
        res = inputs.cuota * ((1 - Math.pow(1 + i, -tiempoMeses)) / i);
        unidad = "COP";
        break;
      default:
        res = "Modo no definido";
    }

    const registro = {
      categoria: "Anualidades",
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
      <h2>Anualidades</h2>

      <label>¿Qué deseas calcular?</label>
      <select value={modo} onChange={(e) => setModo(e.target.value)}>
        <option value="valor_futuro">Valor Futuro (VF)</option>
        <option value="valor_presente">Valor Presente (VP)</option>
      </select>

      <form onSubmit={calcular} className="formulario">
        <input name="cuota" type="number" placeholder="Cuota (A)" onChange={handleChange} />
        <input name="tasa" type="number" placeholder="Tasa" onChange={handleChange} />
        <select name="unidadTasa" onChange={handleChange}>
          <option value="anual">Anual</option>
          <option value="mensual">Mensual</option>
          <option value="trimestral">Trimestral</option>
          <option value="diaria">Diaria</option>
        </select>
        <input name="tiempo" type="number" placeholder="Número de periodos (n)" onChange={handleChange} />
        <select name="unidadTiempo" onChange={handleChange}>
          <option value="años">Años</option>
          <option value="meses">Meses</option>
          <option value="días">Días</option>
        </select>
        <button type="submit">Calcular</button>
      </form>

      {resultado && (
        <div className="resultado">
          <h3>Resultado: {resultado.toFixed(2)} {unidadResultado}</h3>
        </div>
      )}
    </div>
  );
};

export default Anualidades;
