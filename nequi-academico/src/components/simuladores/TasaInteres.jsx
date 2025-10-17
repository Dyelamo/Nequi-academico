"use client";

import { useState } from "react";

const TasaInteres = ({ agregarAlHistorial }) => {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  const calcular = (e) => {
    e.preventDefault();
    setError("");

    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());

    const tasaNominal = data.tasaNominal
      ? Number.parseFloat(data.tasaNominal)
      : null;
    const tasaEfectiva = data.tasaEfectiva
      ? Number.parseFloat(data.tasaEfectiva)
      : null;
    const periodos = data.periodos ? Number.parseFloat(data.periodos) : null;

    // Contar campos vacíos
    const camposVacios = [];
    if (!tasaNominal) camposVacios.push("tasaNominal");
    if (!tasaEfectiva) camposVacios.push("tasaEfectiva");
    if (!periodos) camposVacios.push("periodos");

    // Validar que exactamente un campo esté vacío
    if (camposVacios.length === 0) {
      setError("Deja vacío el campo que deseas calcular");
      return;
    }
    if (camposVacios.length > 1) {
      setError("Completa más campos. Solo deja vacío el que deseas calcular");
      return;
    }

    // Validar valores positivos para campos completados
    if (tasaNominal !== null && tasaNominal <= 0) {
      setError("La tasa nominal debe ser mayor a 0");
      return;
    }
    if (tasaEfectiva !== null && tasaEfectiva <= 0) {
      setError("La tasa efectiva debe ser mayor a 0");
      return;
    }
    if (periodos !== null && periodos <= 0) {
      setError("Los períodos deben ser mayor a 0");
      return;
    }

    let res = null;
    const unidad = "%";
    let descripcion = "";
    let formula = "";
    let tipoCalculo = "";

    try {
      const campoACalcular = camposVacios[0];

      switch (campoACalcular) {
        case "tasaEfectiva":
          // Calcular Tasa Efectiva desde Nominal
          // Tasa Efectiva = (1 + i/n)^n - 1
          res =
            (Math.pow(1 + tasaNominal / 100 / periodos, periodos) - 1) * 100;
          descripcion = "Tasa Efectiva Anual";
          formula = `(1 + ${tasaNominal}%/${periodos})^${periodos} - 1`;
          tipoCalculo = "nominal_efectiva";
          break;

        case "tasaNominal":
          // Calcular Tasa Nominal desde Efectiva
          // Tasa Nominal = n * ((1 + i_efectiva)^(1/n) - 1)
          res =
            periodos *
            (Math.pow(1 + tasaEfectiva / 100, 1 / periodos) - 1) *
            100;
          descripcion = "Tasa Nominal Anual";
          formula = `${periodos} × ((1 + ${tasaEfectiva}%)^(1/${periodos}) - 1)`;
          tipoCalculo = "efectiva_nominal";
          break;

        case "periodos": // Calcular Períodos desde tasas conocidas
        // n = ln(1 + i_efectiva) / ln(1 + i_nominal/100)
        {
          if (tasaNominal <= 0) {
            setError(
              "La tasa nominal debe ser mayor a 0 para calcular períodos"
            );
            return;
          }
          const tasaNominalDecimal = tasaNominal / 100;
          const tasaEfectivaDecimal = tasaEfectiva / 100;

          if (tasaEfectivaDecimal <= tasaNominalDecimal) {
            setError(
              "La tasa efectiva debe ser mayor que la nominal para calcular períodos"
            );
            return;
          }

          res =
            Math.log(1 + tasaEfectivaDecimal) /
            Math.log(1 + tasaNominalDecimal);
          descripcion = "Períodos de Capitalización";
          formula = `ln(1 + ${tasaEfectiva}%) / ln(1 + ${tasaNominal}%)`;
          tipoCalculo = "calcular_periodos";
          break;
        }

        default:
          setError("Campo a calcular no reconocido");
          return;
      }

      if (res === null || !isFinite(res) || isNaN(res)) {
        setError("Error en el cálculo. Verifica que los valores sean válidos.");
        return;
      }

      const registro = {
        categoria: "Tasas de Interés",
        modo: descripcion,
        variables: {
          tipoCalculo,
          tasaNominal: tasaNominal || res.toFixed(6),
          tasaEfectiva: tasaEfectiva || res.toFixed(6),
          periodos: periodos || res.toFixed(2),
        },
        resultado: res,
        unidad: campoACalcular === "periodos" ? "períodos" : unidad,
        fecha: new Date().toLocaleString(),
      };

      setResultado({
        valor: res,
        unidad: campoACalcular === "periodos" ? "períodos" : unidad,
        descripcion,
        formula,
        tasaNominal: tasaNominal || res,
        tasaEfectiva: tasaEfectiva || res,
        periodos: periodos || res,
        tipoCalculo,
        campoCalculado: campoACalcular,
      });

      agregarAlHistorial(registro);
    } catch (error) {
      setError(
        "Error en el cálculo. Verifica los valores ingresados." + error.message
      );
    }
  };

  const getPeriodicidadNombre = (valor) => {
    const num = Number(valor);
    switch (num) {
      case 365:
        return "diaria";
      case 12:
        return "mensual";
      case 4:
        return "trimestral";
      case 2:
        return "semestral";
      case 1:
        return "anual";
      default:
        return `cada ${valor} períodos`;
    }
  };

  return (
    <div className="calculadora-container">
      <h2>Tasas de Interés</h2>

      <div className="instrucciones">
        <p>
          Completa los campos que conoces y deja vacío el que deseas calcular
        </p>
      </div>

      <form onSubmit={calcular} className="formulario">
        <div className="input-group">
          <label>Tasa Nominal Anual (%)</label>
          <input
            name="tasaNominal"
            type="number"
            placeholder="Deja vacío para calcular"
            step="0.000001"
          />
        </div>

        <div className="input-group">
          <label>Tasa Efectiva Anual (%)</label>
          <input
            name="tasaEfectiva"
            type="number"
            placeholder="Deja vacío para calcular"
            step="0.000001"
          />
        </div>

        <div className="input-group">
          <label>Períodos de Capitalización por Año</label>
          <input
            name="periodos"
            type="number"
            placeholder="Deja vacío para calcular"
            step="0.01"
            min="0.01"
          />
          <small>
            Ejemplos: 1 (anual), 2 (semestral), 4 (trimestral), 12 (mensual),
            365 (diario)
          </small>
        </div>

        <button type="submit" className="btn-calcular">
          Calcular
        </button>
      </form>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {resultado && (
        <div className="resultado-container">
          <div className="resultado-principal">
            <h3>{resultado.descripcion}</h3>
            <div className="valor-resultado">
              {resultado.valor.toFixed(2)} {resultado.unidad}
            </div>
          </div>

          <div className="detalles-calculo">
            <h4>Detalles del Cálculo:</h4>
            {resultado.tipoCalculo === "nominal_efectiva" && (
              <>
                <p>
                  <strong>Tasa Nominal:</strong> {resultado.tasaNominal}% anual
                </p>
                <p>
                  <strong>Períodos:</strong> {resultado.periodos} por año
                </p>
                <p>
                  <strong>Fórmula:</strong> {resultado.formula}
                </p>
                <p>
                  <strong>Interpretación:</strong> Una tasa nominal de{" "}
                  {resultado.tasaNominal}% capitalizada{" "}
                  {getPeriodicidadNombre(resultado.periodos)}mente equivale a
                  una tasa efectiva anual de {resultado.valor.toFixed(2)}%
                </p>
              </>
            )}
            {resultado.tipoCalculo === "efectiva_nominal" && (
              <>
                <p>
                  <strong>Tasa Efectiva:</strong> {resultado.tasaEfectiva}%
                  anual
                </p>
                <p>
                  <strong>Períodos:</strong> {resultado.periodos} por año
                </p>
                <p>
                  <strong>Fórmula:</strong> {resultado.formula}
                </p>
                <p>
                  <strong>Interpretación:</strong> Para obtener una tasa
                  efectiva de {resultado.tasaEfectiva}% anual, se necesita una
                  tasa nominal de {resultado.valor.toFixed(2)}% capitalizada{" "}
                  {getPeriodicidadNombre(resultado.periodos)}mente
                </p>
              </>
            )}
            {resultado.tipoCalculo === "calcular_periodos" && (
              <>
                <p>
                  <strong>Tasa Nominal:</strong> {resultado.tasaNominal}%
                </p>
                <p>
                  <strong>Tasa Efectiva:</strong> {resultado.tasaEfectiva}%
                </p>
                <p>
                  <strong>Fórmula:</strong> {resultado.formula}
                </p>
                <p>
                  <strong>Interpretación:</strong> Para convertir una tasa
                  nominal de {resultado.tasaNominal}% a una tasa efectiva de{" "}
                  {resultado.tasaEfectiva}%, se necesitan{" "}
                  {resultado.valor.toFixed(2)} períodos de capitalización por
                  año
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TasaInteres;
