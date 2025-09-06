// src/pages/Auth/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../../styles/Register.css';
import { useStoreUsuarios } from "../../supabase/storeUsuarios";


const Register = () => {
  const [form, setForm] = useState({
    cedula: "",
    nombre: "",
    correo: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });

  const { crearUsuario, loading, error } = useStoreUsuarios();

  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }


    try{
      await crearUsuario({
        cedula: form.cedula,
        nombre: form.nombre,
        correo: form.correo,
        telefono: form.telefono,
        password: form.password
      });
      alert("Usuario creado exitosamente");
      navigate("/");
    }catch(error){
      alert("Error al crear usuario: " + error.message);
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleRegister}>
        <div className="register-icon">👤</div>
        <h2>Crear Cuenta</h2>
        <p className="register-subtitle">Únete a EduBank</p>

        <input
          name="cedula"
          placeholder="Número de Cédula"
          value={form.cedula}
          onChange={handleChange}
        />
        <input
          name="nombre"
          placeholder="Nombre Completo"
          value={form.nombre}
          onChange={handleChange}
        />
        <input
          name="correo"
          placeholder="Correo Electrónico"
          type="email"
          value={form.correo}
          onChange={handleChange}
        />
        <input
          name="telefono"
          placeholder="telefono"
          value={form.telefono}
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmar Contraseña"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <button type="submit">Crear Cuenta</button>

        <p className="register-links">
          ¿Ya tienes cuenta? <Link to="/">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
