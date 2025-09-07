import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import PrivateRoutes from "../utils/PrivateToutes";

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



      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
