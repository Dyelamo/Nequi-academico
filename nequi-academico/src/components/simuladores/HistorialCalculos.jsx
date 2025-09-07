// src/components/simuladores/HistorialCalculos.jsx
import React from "react";

const HistorialCalculos = ({ historial }) => {
  return (
    <div>
      <h2>Historial de cálculos</h2>
      {historial.length === 0 ? (
        <p>No hay cálculos registrados.</p>
      ) : (
        historial.map((item, idx) => (
          <div key={idx} className="historial-item">
            <h4>{item.categoria} - {item.modo}</h4>
            <p>Variables: {JSON.stringify(item.variables)}</p>
            <p>Resultado: <strong>{Number(item.resultado).toFixed(2)}</strong></p>
            <span>{item.fecha}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default HistorialCalculos;
