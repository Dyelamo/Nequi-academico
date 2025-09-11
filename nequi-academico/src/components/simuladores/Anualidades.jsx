"use client";

import { useState } from "react";
import {
  convertirTiempoAPeriodos,
  convertirTasaAPeriodo,
  convertirPeriodosAAnios,
} from "../../utils/utilsFinancieros";

const Anualidades = ({ agregarAlHistorial }) => {
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");

  const parseNum = (v) => {
    if (v === undefined || v === null || v === "") return null;
    const n = Number.parseFloat(v);
    return Number.isNaN(n) ? null : n;
  };

  const calcular = (e) => {
    e.preventDefault();
    setError("");
    setResultado(null);

    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());

    // Inputs
    const modoCalculo = data.calcular; // "valorFuturo" | "valorPresente" | "cuota" | "tasa" | "tiempo"
    const anticipada = data.anticipada === "on"; // checkbox
    const cuota = parseNum(data.cuota);
    const valorPresente = parseNum(data.valorPresente);
    const valorFuturo = parseNum(data.valorFuturo);
    const tasaInput = parseNum(data.tasa); // en %
    const unidadTasa = data.unidadTasa || "anual";
    const frecuenciaPago = data.frecuenciaPago || "anual";
    const años = parseNum(data.años) || 0;
    const meses = parseNum(data.meses) || 0;
    const dias = parseNum(data.dias) || 0;

    // Periodos (n) en número de pagos (puede ser decimal)
    const n = convertirTiempoAPeriodos(años, meses, dias, frecuenciaPago);

    // Convertir tasa a tasa por periodo (decimal)
    const tasaPorPeriodo = tasaInput
      ? convertirTasaAPeriodo(tasaInput, unidadTasa, frecuenciaPago)
      : null;
    // tasaPorPeriodo es decimal (ej. 0.01)

    // Helpers
    const isPositive = (x) => x !== null && isFinite(x) && x > 0;

    try {
      // Validaciones básicas por modo
      if (!modoCalculo) {
        setError("Selecciona qué quieres calcular.");
        return;
      }

      // Función para manejar i ~= 0 casos (límite)
      const safeDiv = (num, den) =>
        Math.abs(den) < 1e-12 ? num / (den + 1e-12) : num / den;

      let res = null;
      let unidad = "";
      let descripcion = "";

      // ***************************************
      // 1) VALOR FUTURO (anualidad)
      //    VF = A * [((1+i)^n - 1) / i] * (1+i) si es anticipada
      // ***************************************
      if (modoCalculo === "valorFuturo") {
        if (!isPositive(cuota)) {
          setError("Ingresa la cuota (A) mayor a 0.");
          return;
        }
        if (!isPositive(tasaPorPeriodo)) {
          setError("Ingresa una tasa válida mayor que 0.");
          return;
        }
        if (!(n > 0)) {
          setError("Ingresa un tiempo válido.");
          return;
        }

        const i = tasaPorPeriodo;
        let factor;
        if (Math.abs(i) < 1e-12) {
          // límite i -> 0: ((1+i)^n - 1)/i -> n
          factor = n;
        } else {
          factor = (Math.pow(1 + i, n) - 1) / i;
        }
        const ajuste = anticipada ? 1 + i : 1;
        res = cuota * factor * ajuste;
        unidad = "COP";
        descripcion = "Valor Futuro (anualidad)";
      }

      // ***************************************
      // 2) VALOR PRESENTE (anualidad)
      //    VP = A * [(1 - (1+i)^-n) / i] * (1+i) si es anticipada
      // ***************************************
      else if (modoCalculo === "valorPresente") {
        if (!isPositive(cuota)) {
          setError("Ingresa la cuota (A) mayor a 0.");
          return;
        }
        if (
          !isPositive(tasaPorPeriodo) &&
          Math.abs(tasaPorPeriodo) >= 1e-12 === false
        ) {
          setError("Ingresa una tasa válida mayor que 0.");
          return;
        }
        if (!(n > 0)) {
          setError("Ingresa un tiempo válido.");
          return;
        }

        const i = tasaPorPeriodo;
        let factor;
        if (Math.abs(i) < 1e-12) {
          // i -> 0: (1 - (1+i)^-n)/i -> n
          factor = n;
        } else {
          factor = (1 - Math.pow(1 + i, -n)) / i;
        }
        const ajuste = anticipada ? 1 + i : 1;
        res = cuota * factor * ajuste;
        unidad = "COP";
        descripcion = "Valor Presente (anualidad)";
      }

      // ***************************************
      // 3) CUOTA (A) desde VP o VF
      //    A = VP * [ i / (1 - (1+i)^-n) ]  (ordinaria)
      //    Ajuste por anticipada: dividir por (1+i)
      //    O desde VF: A = VF * [ i / ((1+i)^n - 1) ]
      // ***************************************
      else if (modoCalculo === "cuota") {
        if (!(isPositive(valorPresente) || isPositive(valorFuturo))) {
          setError(
            "Ingresa Valor Presente o Valor Futuro para calcular la cuota."
          );
          return;
        }
        if (!isPositive(tasaPorPeriodo)) {
          setError("Ingresa una tasa válida mayor que 0.");
          return;
        }
        if (!(n > 0)) {
          setError("Ingresa un tiempo válido.");
          return;
        }

        const i = tasaPorPeriodo;
        if (isPositive(valorPresente)) {
          // A = VP * i / (1 - (1+i)^-n)  (ordinaria)
          const denomBase = 1 - Math.pow(1 + i, -n);
          if (Math.abs(denomBase) < 1e-12) {
            setError("Parámetros inválidos para calcular cuota desde VP.");
            return;
          }
          if (anticipada) {
            res = valorPresente * (i / (denomBase * (1 + i)));
          } else {
            res = valorPresente * (i / denomBase);
          }
        } else {
          // desde VF: A = VF * i / ((1+i)^n - 1)
          const denomBase = Math.pow(1 + i, n) - 1;
          if (Math.abs(denomBase) < 1e-12) {
            setError("Parámetros inválidos para calcular cuota desde VF.");
            return;
          }
          if (anticipada) {
            res = valorFuturo * (i / (denomBase * (1 + i)));
          } else {
            res = valorFuturo * (i / denomBase);
          }
        }
        unidad = "COP";
        descripcion = "Cuota (A)";
      }

      // ***************************************
      // 4) TASA: hallar i tal que la ecuación de anualidad se cumpla (usa NR + bisección)
      //    Para VP: f(i) = A * ((1 - (1+i)^-n)/i) * ajuste - VP = 0
      //    Para VF: f(i) = A * (((1+i)^n - 1)/i) * ajuste - VF = 0
      // ***************************************
      else if (modoCalculo === "tasa") {
        if (!isPositive(cuota)) {
          setError("Ingresa la cuota (A) mayor a 0 para calcular la tasa.");
          return;
        }
        if (!(isPositive(valorPresente) || isPositive(valorFuturo))) {
          setError("Ingresa VP o VF para calcular la tasa.");
          return;
        }
        if (!(n > 0)) {
          setError("Ingresa un tiempo válido.");
          return;
        }

        // Definir f(i) y su derivada df(i)
        const ajusteEnFactor = (i) => (anticipada ? 1 + i : 1);

        const f_VP = (i) => {
          const factorPow = Math.pow(1 + i, -n);
          const g = safeDiv(1 - factorPow, i);
          return cuota * g * ajusteEnFactor(i) - valorPresente;
        };
        const df_VP = (i) => {
          // dg/di = (1 - factorPow)/i^2 - (n * factorPow)/(i*(1+i))
          const factorPow = Math.pow(1 + i, -n);
          const g = safeDiv(1 - factorPow, i);
          const dg =
            safeDiv(1 - factorPow, i * i) - (n * factorPow) / (i * (1 + i));
          if (anticipada) {
            // derivative of g*(1+i) = dg*(1+i) + g*1
            return cuota * (dg * (1 + i) + g);
          } else {
            return cuota * dg;
          }
        };

        const f_VF = (i) => {
          const factorPow = Math.pow(1 + i, n);
          const g = safeDiv(factorPow - 1, i);
          return cuota * g * ajusteEnFactor(i) - valorFuturo;
        };
        const df_VF = (i) => {
          const factorPow = Math.pow(1 + i, n);
          const g = safeDiv(factorPow - 1, i);
          const dg =
            safeDiv(factorPow - 1, i * i) - (n * factorPow) / (i * (1 + i));
          if (anticipada) {
            return cuota * (dg * (1 + i) + g);
          } else {
            return cuota * dg;
          }
        };

        // select correspondiente
        const f = isPositive(valorPresente) ? f_VP : f_VF;
        const df = isPositive(valorPresente) ? df_VP : df_VF;

        // Newton-Raphson con fallback a bisección
        let iGuess = 0.01; // inicio 1% por periodo
        let it = 0;
        const maxIt = 100;
        const tol = 1e-10;
        let convergio = false;

        while (it < maxIt) {
          const fi = f(iGuess);
          const dfi = df(iGuess);
          if (Math.abs(fi) < tol) {
            convergio = true;
            break;
          }
          if (Math.abs(dfi) < 1e-14) break; // derivada casi 0 -> no aplicable
          iGuess = iGuess - fi / dfi;
          if (iGuess <= -0.999999) {
            break;
          } // evita -1 o menos
          it++;
        }

        if (!convergio) {
          // bisección en [low, high]
          let low = 1e-12;
          let high = 10; // 1000% por periodo, podrías ajustar
          let fLow = f(low);
          let fHigh = f(high);
          // intenta ampliar high si no hay cambio de signo
          let tries = 0;
          while (fLow * fHigh > 0 && tries < 10) {
            high *= 2;
            fHigh = f(high);
            tries++;
          }
          if (fLow * fHigh > 0) {
            setError(
              "No se encontró una tasa que satisfaga los valores proporcionados (prueba otros datos)."
            );
            return;
          }

          let mid = null;
          for (let k = 0; k < 200; k++) {
            mid = (low + high) / 2;
            const fMid = f(mid);
            if (Math.abs(fMid) < 1e-12) {
              iGuess = mid;
              convergio = true;
              break;
            }
            if (fLow * fMid < 0) {
              high = mid;
              fHigh = fMid;
            } else {
              low = mid;
              fLow = fMid;
            }
          }
          if (!convergio) iGuess = mid;
        }

        if (!isFinite(iGuess) || iGuess <= -0.999999) {
          setError("No se pudo calcular la tasa con los parámetros dados.");
          return;
        }

        // Convertir tasa por periodo (decimal) a unidad de salida (% por unidadTasa)
        // iGuess es tasa por periodo decimal. Convertir a tasa anual efectiva, luego a la unidad pedida:
        // tasaAnualEf = (1 + iGuess)^{periodosPorAño} - 1   (periodosPorAño depende de frecuenciaPago)
        let periodosPorAño = 1;
        switch (frecuenciaPago) {
          case "mensual":
            periodosPorAño = 12;
            break;
          case "bimestral":
            periodosPorAño = 6;
            break;
          case "trimestral":
            periodosPorAño = 4;
            break;
          case "semestral":
            periodosPorAño = 2;
            break;
          case "diaria":
            periodosPorAño = 365;
            break;
          default:
            periodosPorAño = 1;
        }
        const tasaAnualEf = Math.pow(1 + iGuess, periodosPorAño) - 1;

        // ahora a la unidad pedida
        let tasaSalida = tasaAnualEf * 100; // % anual por defecto
        if (unidadTasa === "anual") {
          // ya está bien
        } else if (unidadTasa === "mensual") {
          tasaSalida = (Math.pow(1 + tasaAnualEf, 1 / 12) - 1) * 100;
        } else if (unidadTasa === "trimestral") {
          tasaSalida = (Math.pow(1 + tasaAnualEf, 1 / 4) - 1) * 100;
        } else if (unidadTasa === "semestral") {
          tasaSalida = (Math.pow(1 + tasaAnualEf, 1 / 2) - 1) * 100;
        } else if (unidadTasa === "diaria") {
          tasaSalida = (Math.pow(1 + tasaAnualEf, 1 / 365) - 1) * 100;
        }

        res = tasaSalida;
        unidad = `% ${unidadTasa}`;
        descripcion = "Tasa de interés";
      }

      // ***************************************
      // 5) TIEMPO (n): desde VP o VF
      //    VP: n = -ln(1 - VP*i/A) / ln(1+i)   (para ordinary; si anticipada usar VP/(1+i))
      //    VF: n = ln(1 + VF*i/A) / ln(1+i)    (para ordinary; si anticipada usar VF/(1+i))
      // ***************************************
      else if (modoCalculo === "tiempo") {
        if (!isPositive(cuota)) {
          setError("Ingresa la cuota (A) mayor a 0.");
          return;
        }
        if (!isPositive(tasaPorPeriodo)) {
          setError("Ingresa una tasa válida mayor que 0.");
          return;
        }
        if (!(isPositive(valorPresente) || isPositive(valorFuturo))) {
          setError("Ingresa VP o VF para calcular el tiempo.");
          return;
        }

        const i = tasaPorPeriodo;

        if (isPositive(valorPresente)) {
          // si es anticipada, usar VP_adj = VP / (1+i)
          const VP_adj = anticipada ? valorPresente / (1 + i) : valorPresente;
          const factor = (VP_adj * i) / cuota;
          if (factor >= 1) {
            setError("La cuota es muy pequeña para el VP y la tasa dados.");
            return;
          }
          res = -Math.log(1 - factor) / Math.log(1 + i);
        } else {
          // VF
          const VF_adj = anticipada ? valorFuturo / (1 + i) : valorFuturo;
          const factor = (VF_adj * i) / cuota;
          if (1 + factor <= 0) {
            setError("Parámetros inválidos para calcular el tiempo.");
            return;
          }
          res = Math.log(1 + factor) / Math.log(1 + i);
        }

        // res = número de períodos. convertimos a años
        const tiempoAnios = convertirPeriodosAAnios(res, frecuenciaPago); // { años, meses, dias, añosDecimales }
        unidad = "años";
        descripcion = "Tiempo";
        // guardamos res en años decimales para mostrar
        const tiempoDec = tiempoAnios.añosDecimales;
        // prepararemos el registro más abajo con el desglose
        const tiempoDesglose = `${tiempoAnios.años}a ${tiempoAnios.meses}m ${tiempoAnios.dias}d`;

        // registrar y mostrar
        const registroT = {
          categoria: "Anualidades",
          modo: descripcion,
          variables: {
            cuota,
            valorPresente: valorPresente || "N/A",
            valorFuturo: valorFuturo || "N/A",
            tasa: tasaInput ? `${tasaInput} % ${unidadTasa}` : "N/A",
            tiempo: tiempoDesglose,
            frecuenciaPago,
          },
          resultado: tiempoDec,
          unidad,
          fecha: new Date().toLocaleString(),
        };
        setResultado({
          valor: tiempoDec,
          unidad,
          modo: descripcion,
          cuota,
          valorPresente,
          valorFuturo,
          tasa: tasaInput,
          tiempoDesglose,
          frecuenciaPago,
          unidadTasa,
        });
        agregarAlHistorial(registroT);
        return;
      }

      // Validar resultado
      if (res === null || !isFinite(res) || Number.isNaN(res)) {
        setError("Error en el cálculo. Verifica los valores ingresados.");
        return;
      }

      // Para tasas: res puede ser porcentaje. Para montos: mostramos 2 decimales.
      const registro = {
        categoria: "Anualidades",
        modo: descripcion,
        variables: {
          cuota: cuota || "N/A",
          valorPresente: valorPresente || "N/A",
          valorFuturo: valorFuturo || "N/A",
          tasa: tasaInput ? `${tasaInput} % ${unidadTasa}` : "N/A",
          tiempo: `${años || 0}a ${meses || 0}m ${dias || 0}d`,
          frecuenciaPago,
        },
        resultado: res,
        unidad,
        fecha: new Date().toLocaleString(),
      };

      setResultado({
        valor: res,
        unidad,
        modo: descripcion,
        cuota,
        valorPresente,
        valorFuturo,
        tasa: tasaInput,
        tiempo: (años || 0) + (meses || 0) / 12 + (dias || 0) / 365,
        frecuenciaPago,
        unidadTasa,
      });

      agregarAlHistorial && agregarAlHistorial(registro);
    } catch (err) {
      console.error("[Anualidades] Error:", err);
      setError("Error en el cálculo: " + (err.message || err));
    }
  };

  return (
    <div>
      <h2>Anualidades</h2>
      <p className="descripcion">
        Elige qué deseas calcular y completa los campos necesarios. Las fórmulas
        difieren según si quieres calcular Valor Futuro, Valor Presente, Cuota,
        Tasa o Tiempo.
      </p>

      <form onSubmit={calcular} className="formulario">
        <div className="input-group">
          <label>¿Qué deseas calcular?</label>
          <select name="calcular" defaultValue="valorFuturo">
            <option value="valorFuturo">Valor Futuro (VF)</option>
            <option value="valorPresente">Valor Presente (VP)</option>
            <option value="cuota">Cuota (A)</option>
            <option value="tasa">Tasa (%)</option>
            <option value="tiempo">Tiempo (n)</option>
          </select>
        </div>

        <div className="input-group">
          <label>Tipo de Anualidad</label>
          <div>
            <label style={{ marginRight: 10 }}>
              <input name="anticipada" type="checkbox" /> Anualidad anticipada
              (pagos al inicio)
            </label>
          </div>
        </div>

        <div className="input-group">
          <label>Cuota o Pago (A)</label>
          <input name="cuota" type="number" step="0.01" />
        </div>

        <div className="input-group">
          <label>Valor Presente (VP)</label>
          <input name="valorPresente" type="number" step="0.01" />
        </div>

        <div className="input-group">
          <label>Valor Futuro (VF)</label>
          <input name="valorFuturo" type="number" step="0.01" />
        </div>

        <div className="input-group">
          <label>Tasa de Interés</label>
          <div className="input-with-select">
            <input name="tasa" type="number" step="0.000001" />
            <select name="unidadTasa">
              <option value="anual">% Anual</option>
              <option value="mensual">% Mensual</option>
              <option value="trimestral">% Trimestral</option>
              <option value="semestral">% Semestral</option>
              <option value="diaria">% Diaria</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label>Frecuencia de Pago / Periodos por año</label>
          <select name="frecuenciaPago" defaultValue="mensual">
            <option value="anual">Anual (1)</option>
            <option value="semestral">Semestral (2)</option>
            <option value="trimestral">Trimestral (4)</option>
            <option value="mensual">Mensual (12)</option>
            <option value="bimestral">Bimestral (6)</option>
            <option value="diaria">Diaria (365)</option>
          </select>
        </div>

        <div className="input-group">
          <label>Tiempo</label>
          <div className="tiempo-group">
            <input name="años" type="number" placeholder="Años" min="0" />
            <input
              name="meses"
              type="number"
              placeholder="Meses"
              min="0"
              max="11"
            />
            <input
              name="dias"
              type="number"
              placeholder="Días"
              min="0"
              max="30"
            />
          </div>
        </div>

        <button type="submit">Calcular</button>
      </form>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {resultado && (
        <div className="resultado">
          <h3>
            {resultado.modo}:{" "}
            {typeof resultado.valor === "number" &&
            resultado.unidad !== "" &&
            resultado.unidad.includes("COP")
              ? `${resultado.valor.toFixed(2)} ${resultado.unidad}`
              : `${
                  typeof resultado.valor === "number"
                    ? resultado.valor.toFixed(6)
                    : resultado.valor
                } ${resultado.unidad}`}
          </h3>

          <div className="detalles">
            {resultado.cuota != null && (
              <p>
                <strong>Cuota:</strong>{" "}
                {resultado.cuota != null
                  ? `$${Number(resultado.cuota).toFixed(2)} COP`
                  : "N/A"}
              </p>
            )}
            {resultado.valorPresente != null && (
              <p>
                <strong>Valor Presente:</strong>{" "}
                {resultado.valorPresente != null
                  ? `$${Number(resultado.valorPresente).toFixed(2)} COP`
                  : "N/A"}
              </p>
            )}
            {resultado.valorFuturo != null && (
              <p>
                <strong>Valor Futuro:</strong>{" "}
                {resultado.valorFuturo != null
                  ? `$${Number(resultado.valorFuturo).toFixed(2)} COP`
                  : "N/A"}
              </p>
            )}
            // eslint-disable-next-line no-undef, no-undef
            {resultado.tasa != null && (
              <p>
                <strong>Tasa input:</strong> {resultado.tasa} %{" "}
                {resultado.unidadTasa}
              </p>
            )}
            {resultado.tiempo != null && (
              <p>
                <strong>Tiempo:</strong> {resultado.tiempo} años
              </p>
            )}
            <p>
              <strong>Frecuencia:</strong> {resultado.frecuenciaPago}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Anualidades;