// src/pages/Auth/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../../styles/Login.css';
import { useStoreUsuarios } from '../../supabase/storeUsuarios.jsx';

const Login = () => {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { autenticarUsuario, loading, error } = useStoreUsuarios();

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!cedula || !password){
      alert("Por favor, completa todos los campos");
      return;
    }

    try{
      await autenticarUsuario(cedula, password);
      alert("Inicio de sesión exitoso");
      navigate("/dashboard");
    }catch(error){
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-icon">🔒</div>
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Accede a tu cuenta EduBank</p>

        <label>Cédula</label>
        <input
          type="text"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          placeholder="Ingresa tu cédula"
        />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa tu contraseña"
        />

        <button type="submit">Ingresar</button>

        <div className="login-links">
          <a href="#">¿Olvidaste tu contraseña?</a>
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
