// src/pages/Dashboard/Dashboard.jsx
import React from "react";
import '../../styles/Dashboard.css'
import { useStoreUsuarios } from "../../supabase/storeUsuarios";
import { useNavigate } from  'react-router-dom';
import Simuladores from "../Simuladores/Simuladores";

const Dashboard = () => {
  // const [saldo] = useState(1250000);
  const { currentUsuario } = useStoreUsuarios();
  const navigate = useNavigate();

  const saldo = currentUsuario ? currentUsuario.saldo : 0;
  console.log("Saldo del usuario:", saldo);

console.log("Usuario actual:", currentUsuario);

  const accesos = [
    { titulo: "Solicitar Préstamo", icon: "💰" },
    { titulo: "Calculadoras", icon: "📊", ruta: "/simuladores"},
    { titulo: "Historial", icon: "🕑" },
  ];

  const transacciones = [
    { descripcion: "Pago préstamo", monto: -300000 },
    { descripcion: "Recarga saldo", monto: 500000 },
    { descripcion: "Compra tienda", monto: -120000 },
  ];

  return (
    <div className="dashboard-container">
      <header>
        <h1>Hola, <span>{currentUsuario?.nombre || "Sin Nombre"}</span></h1>
        <p>Bienvenido a EduBank</p>
      </header>

      <div className="saldo-card">
        <p>Saldo Disponible</p>
        <h2>${saldo.toLocaleString()}</h2>
        <span>Cuenta activa</span>
      </div>

      <h3>Accesos Rápidos</h3>
      <div className="accesos-grid">
        {accesos.map((a, i) => (
          <button key={i} className="acceso-card"
          onClick={() => navigate(a.ruta)}>
            <span>{a.icon}</span>
            <p>{a.titulo}</p>
          </button>
        ))}
      </div>

      <h3>Últimas transacciones</h3>
      <div className="transacciones-card">
        {transacciones.map((tx, i) => (
          <div key={i} className="transaccion">
            <span>{tx.descripcion}</span>
            <span className={tx.monto < 0 ? "egreso" : "ingreso"}>
              {tx.monto < 0 ? "-" : "+"}${Math.abs(tx.monto).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
