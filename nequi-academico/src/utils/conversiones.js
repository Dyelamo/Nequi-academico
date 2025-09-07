// src/utils/conversiones.js

// 🔹 Convierte tasas y tiempos a base mensual para consistencia
export const normalizarTasaYTiempo = (tasa, unidadTasa, tiempo, unidadTiempo) => {
  let tasaMensual = parseFloat(tasa) || 0;
  let tiempoMeses = parseFloat(tiempo) || 0;

  // Convertir tasa a mensual
  switch (unidadTasa) {
    case "anual":
      tasaMensual = tasaMensual / 12;
      break;
    case "trimestral":
      tasaMensual = tasaMensual / 3;
      break;
    case "mensual":
      break;
    case "diaria":
      tasaMensual = tasaMensual * 30; // aprox
      break;
    default:
  }

  // Convertir tiempo a meses
  switch (unidadTiempo) {
    case "años":
      tiempoMeses = tiempoMeses * 12;
      break;
    case "meses":
      break;
    case "días":
      tiempoMeses = tiempoMeses / 30;
      break;
    default:
  }

  return { tasaMensual, tiempoMeses };
};
