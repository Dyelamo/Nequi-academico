// src/components/dashboard/SaldoCard.jsx
import React from "react";

const SaldoCard = ({ saldo }) => {
  return (
    <div className="bg-teal-600 text-white p-6 rounded-xl shadow-lg mb-6">
      <p className="text-lg">Saldo disponible</p>
      <h2 className="text-3xl font-bold">${saldo.toLocaleString()}</h2>
    </div>
  );
};

export default SaldoCard;
