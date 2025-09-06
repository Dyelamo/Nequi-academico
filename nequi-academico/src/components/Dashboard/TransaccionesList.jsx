// src/components/dashboard/TransaccionesList.jsx
import React from "react";

const TransaccionesList = ({ transacciones }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow mt-6">
      <h3 className="text-lg font-semibold mb-3">Últimas transacciones</h3>
      <ul className="divide-y divide-gray-200">
        {transacciones.map((tx, i) => (
          <li key={i} className="flex justify-between py-2">
            <span>{tx.descripcion}</span>
            <span
              className={`font-bold ${
                tx.monto < 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              {tx.monto < 0 ? "-" : "+"}${Math.abs(tx.monto).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransaccionesList;
