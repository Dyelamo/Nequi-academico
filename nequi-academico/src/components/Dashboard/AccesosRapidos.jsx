// src/components/dashboard/AccesoRapido.jsx
import React from "react";

const AccesoRapido = ({ icon, titulo, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center bg-white p-4 rounded-xl shadow hover:shadow-md transition"
    >
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 text-sm font-medium">{titulo}</p>
    </button>
  );
};

export default AccesoRapido;
