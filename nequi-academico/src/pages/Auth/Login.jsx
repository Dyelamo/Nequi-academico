"use client"

// src/pages/Auth/Login.jsx
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import "../../styles/Login.css"
import { useStoreUsuarios } from "../../supabase/storeUsuarios.jsx"
import Swal from "sweetalert2"

const Login = () => {
  const [cedula, setCedula] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const { autenticarUsuario, loading } = useStoreUsuarios()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!cedula || !password) {
      alert("Por favor, completa todos los campos")
      return
    }

    try {
      await autenticarUsuario(cedula, password)
      Swal.fire({
        text: "Inicio de sesión exitoso",
        icon: "success",
        confirmButtonText: "Aceptar",
      });
      navigate("/dashboard")
    } catch (error) {
      Swal.fire({
        title: "ERROR",
        text: "Error al iniciar sesión",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    }
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-icon">🔒</div>
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Accede a tu cuenta EduBank</p>

        <label>Cédula</label>
        <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="Ingresa tu cédula" />

        <label>Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa tu contraseña"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <div className="login-links">
          {/* <a href="#">¿Olvidaste tu contraseña?</a> */}
          <p>
            ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </form>
    </div>
  )
}

export default Login
