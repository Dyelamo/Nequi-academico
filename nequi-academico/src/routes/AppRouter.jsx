import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import Simuladores from "../pages/Simuladores/Simuladores";
import  Prestamos  from "../pages/Prestamos/Prestamos";
import PrivateRoutes from "../utils/PrivateToutes";
import HistorialPrestamos from "../pages/Historial/HistorialPrestamos";
import Recargar_cuenta from "../pages/Recargar/Recargar_cuenta";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Página de inicio (login por defecto) */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard principal */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoutes>
              <Dashboard />
            </PrivateRoutes>
          }
        />

        <Route path="/simuladores" element={<Simuladores />} />
        <Route path="/prestamos" element={<Prestamos />} />
        <Route path="/historial-prestamos" element={<HistorialPrestamos />} />
        <Route path="/recargar-saldo" element={<Recargar_cuenta />} />


      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
